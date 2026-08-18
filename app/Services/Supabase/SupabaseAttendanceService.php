<?php

namespace App\Services\Supabase;

use App\Models\AttendanceLog;
use App\Models\SystemSetting;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;

class SupabaseAttendanceService
{
    /**
     * Get decrypted Supabase settings.
     */
    public function getSettings(): array
    {
        $enabled = SystemSetting::get('attendance_sync_enabled', false);
        $url = SystemSetting::get('supabase_url', config('services.supabase.url', ''));
        $key = SystemSetting::get('supabase_key', config('services.supabase.key', ''));
        $table = SystemSetting::get('supabase_attendance_table', 'student_attendance');

        return [
            'enabled' => filter_var($enabled, FILTER_VALIDATE_BOOLEAN),
            'url' => rtrim((string) $url, '/'),
            'key' => (string) $key,
            'table' => (string) $table ?: 'student_attendance',
        ];
    }

    /**
     * Test connection to Supabase REST endpoint.
     */
    public function testConnection(): array
    {
        $settings = $this->getSettings();

        if (empty($settings['url']) || empty($settings['key'])) {
            return [
                'success' => false,
                'message' => 'Supabase URL atau API Key belum dikonfigurasi.',
            ];
        }

        try {
            $endpoint = "{$settings['url']}/rest/v1/{$settings['table']}?select=count&limit=1";

            $response = Http::withHeaders([
                'apikey' => $settings['key'],
                'Authorization' => "Bearer {$settings['key']}",
                'Range' => '0-0',
                'Prefer' => 'count=exact',
            ])->timeout(5)->get($endpoint);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'Koneksi ke Supabase berhasil dan tabel presensi terhubung.',
                    'status_code' => $response->status(),
                ];
            }

            return [
                'success' => false,
                'message' => 'Koneksi ke Supabase gagal (HTTP '.$response->status().'). Periksa URL, Key, atau nama tabel.',
                'status_code' => $response->status(),
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => 'Tidak dapat menghubungi Supabase (Timeout atau Jaringan Offline).',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Push a single AttendanceLog record to Supabase.
     */
    public function postAttendance(AttendanceLog $log): array
    {
        $settings = $this->getSettings();

        if (! $settings['enabled'] || empty($settings['url']) || empty($settings['key'])) {
            // Keep status pending for later sync when enabled
            return [
                'success' => false,
                'sync_status' => 'pending',
                'message' => 'Supabase sync belum diaktifkan.',
            ];
        }

        $payload = [
            'school_student_id' => (int) $log->school_student_id,
            'nis' => (string) ($log->nis ?? ''),
            'student_name' => (string) $log->student_name,
            'class_id' => $log->class_id ? (int) $log->class_id : null,
            'class_name' => (string) ($log->class_name ?? ''),
            'rfid_uid' => (string) ($log->rfid_uid ?? ''),
            'attendance_date' => Carbon::parse($log->attendance_date)->format('Y-m-d'),
            'attendance_time' => (string) $log->attendance_time,
            'status' => (string) $log->status,
            'device_id' => (string) ($log->device_id ?? 'KIOSK-001'),
            'device_name' => (string) ($log->device_name ?? 'Gerbang Utama'),
            'source' => (string) ($log->source ?? 'rfid'),
            'created_at' => Carbon::now('Asia/Jakarta')->toIso8601String(),
        ];

        try {
            $endpoint = "{$settings['url']}/rest/v1/{$settings['table']}";

            $response = Http::withHeaders([
                'apikey' => $settings['key'],
                'Authorization' => "Bearer {$settings['key']}",
                'Content-Type' => 'application/json',
                'Prefer' => 'return=representation',
            ])->timeout(6)->post($endpoint, $payload);

            if ($response->successful()) {
                $responseData = $response->json();
                $supabaseId = is_array($responseData) && isset($responseData[0]['id'])
                    ? (string) $responseData[0]['id']
                    : null;

                $log->update([
                    'sync_status' => 'synced',
                    'supabase_id' => $supabaseId,
                    'last_attempt_at' => Carbon::now(),
                    'error_message' => null,
                ]);

                return [
                    'success' => true,
                    'sync_status' => 'synced',
                    'supabase_id' => $supabaseId,
                ];
            }

            // HTTP error from Supabase
            $errorMsg = 'HTTP '.$response->status().': '.substr($response->body(), 0, 200);
            $log->update([
                'sync_status' => 'pending',
                'attempts' => $log->attempts + 1,
                'error_message' => $errorMsg,
                'last_attempt_at' => Carbon::now(),
            ]);

            return [
                'success' => false,
                'sync_status' => 'pending',
                'message' => $errorMsg,
            ];
        } catch (\Throwable $e) {
            // Network / Timeout offline error
            $log->update([
                'sync_status' => 'pending',
                'attempts' => $log->attempts + 1,
                'error_message' => 'Network/Timeout: '.$e->getMessage(),
                'last_attempt_at' => Carbon::now(),
            ]);

            return [
                'success' => false,
                'sync_status' => 'pending',
                'message' => 'Offline / Network error: '.$e->getMessage(),
            ];
        }
    }

    /**
     * Retry sending pending or failed logs to Supabase.
     */
    public function retryPendingLogs(int $limit = 50): array
    {
        $pendingLogs = AttendanceLog::where('sync_status', 'pending')
            ->orderBy('id', 'asc')
            ->limit($limit)
            ->get();

        $syncedCount = 0;
        $failedCount = 0;

        foreach ($pendingLogs as $log) {
            $result = $this->postAttendance($log);
            if (! empty($result['success'])) {
                $syncedCount++;
            } else {
                $failedCount++;
            }
        }

        return [
            'total' => $pendingLogs->count(),
            'synced' => $syncedCount,
            'failed' => $failedCount,
        ];
    }
}
