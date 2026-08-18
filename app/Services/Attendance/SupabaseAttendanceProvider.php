<?php

namespace App\Services\Attendance;

use App\Contracts\AttendanceProviderInterface;
use App\Models\StudentAttendance;
use App\Models\SystemSetting;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SupabaseAttendanceProvider implements AttendanceProviderInterface
{
    protected ?string $supabaseUrl;

    protected ?string $supabaseKey;

    protected string $tableName;

    protected int $timeout;

    public function __construct()
    {
        $this->supabaseUrl = SystemSetting::get('supabase_url', config('services.attendance_api.supabase_url', env('SUPABASE_URL', '')));
        $this->supabaseKey = SystemSetting::get('supabase_key', config('services.attendance_api.supabase_key', env('SUPABASE_KEY', '')));
        $this->tableName = SystemSetting::get('supabase_table', config('services.attendance_api.supabase_table', 'attendances'));
        $this->timeout = (int) SystemSetting::get('attendance_timeout', config('services.attendance_api.timeout', 15));
    }

    public function isConfigured(): bool
    {
        return ! empty($this->supabaseUrl) && ! empty($this->supabaseKey);
    }

    public function getProviderName(): string
    {
        return 'Supabase Cloud Database Provider';
    }

    public function getAttendance(Carbon $date, ?int $classId = null): Collection
    {
        $query = StudentAttendance::with(['student.user', 'classRoom'])
            ->whereDate('date', $date->toDateString());

        if ($classId) {
            $query->where('class_id', $classId);
        }

        return $query->get();
    }

    public function getStudentAttendance(int $studentId, Carbon $startDate, Carbon $endDate): Collection
    {
        return StudentAttendance::where('student_id', $studentId)
            ->whereBetween('date', [$startDate->toDateString(), $endDate->toDateString()])
            ->orderBy('date', 'desc')
            ->get();
    }

    public function syncAttendance(Carbon $date): array
    {
        if (! $this->isConfigured()) {
            return [
                'status' => 'unconfigured',
                'message' => 'Integrasi Supabase belum dikonfigurasi. Silakan isi Supabase URL dan API Key di Pengaturan Sistem.',
                'synced' => 0,
                'skipped' => 0,
                'errors' => [],
            ];
        }

        try {
            $cleanUrl = rtrim($this->supabaseUrl, '/');
            $endpoint = "{$cleanUrl}/rest/v1/{$this->tableName}";

            $response = Http::withHeaders([
                'apikey' => $this->supabaseKey,
                'Authorization' => "Bearer {$this->supabaseKey}",
                'Accept' => 'application/json',
            ])->timeout($this->timeout)->get($endpoint, [
                'date' => "eq.{$date->toDateString()}",
                'select' => '*',
            ]);

            if (! $response->successful()) {
                Log::warning('Supabase Attendance sync error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return [
                    'status' => 'error',
                    'message' => 'Gagal mengambil data dari Supabase: HTTP '.$response->status(),
                    'synced' => 0,
                    'skipped' => 0,
                    'errors' => [$response->body()],
                ];
            }

            $records = $response->json();
            if (! is_array($records)) {
                $records = [];
            }

            return app(AttendanceSyncService::class)->processRecords($records, $date);
        } catch (\Throwable $e) {
            Log::error('Supabase Attendance connection failed: '.$e->getMessage());

            return [
                'status' => 'error',
                'message' => 'Koneksi ke Supabase gagal: '.$e->getMessage(),
                'synced' => 0,
                'skipped' => 0,
                'errors' => [$e->getMessage()],
            ];
        }
    }

    public function getAttendanceSummary(Carbon $date, ?int $classId = null): array
    {
        return (new InternalAttendanceProvider)->getAttendanceSummary($date, $classId);
    }
}
