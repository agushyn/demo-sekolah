<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use App\Services\Attendance\AttendanceProviderFactory;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class AdminSettingController extends Controller
{
    /**
     * Display the system settings dashboard with Attendance API & Supabase configuration.
     */
    public function index(): Response
    {
        $attendanceSettings = SystemSetting::getGroup('attendance');

        $driver = $attendanceSettings['attendance_driver'] ?? config('services.attendance_api.driver', 'internal');

        $activeProvider = AttendanceProviderFactory::make($driver);

        return Inertia::render('Admin/Settings/Index', [
            'settings' => [
                'attendance_driver' => $driver,
                'attendance_base_url' => $attendanceSettings['attendance_base_url'] ?? config('services.attendance_api.base_url', ''),
                'attendance_api_key' => $attendanceSettings['attendance_api_key'] ?? config('services.attendance_api.api_key', ''),
                'supabase_url' => $attendanceSettings['supabase_url'] ?? config('services.attendance_api.supabase_url', env('SUPABASE_URL', '')),
                'supabase_key' => $attendanceSettings['supabase_key'] ?? config('services.attendance_api.supabase_key', env('SUPABASE_KEY', '')),
                'supabase_table' => $attendanceSettings['supabase_table'] ?? config('services.attendance_api.supabase_table', 'attendances'),
                'attendance_timeout' => (int) ($attendanceSettings['attendance_timeout'] ?? config('services.attendance_api.timeout', 15)),
                'sync_interval_minutes' => (int) ($attendanceSettings['sync_interval_minutes'] ?? 30),
            ],
            'providerStatus' => [
                'name' => $activeProvider->getProviderName(),
                'is_configured' => $activeProvider->isConfigured(),
                'driver' => $driver,
            ],
        ]);
    }

    /**
     * Update Attendance API & Supabase configuration in database.
     */
    public function updateAttendance(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'attendance_driver' => ['required', 'in:internal,external_api,supabase'],
            'attendance_base_url' => ['nullable', 'string', 'max:255'],
            'attendance_api_key' => ['nullable', 'string', 'max:500'],
            'supabase_url' => ['nullable', 'string', 'max:255'],
            'supabase_key' => ['nullable', 'string', 'max:500'],
            'supabase_table' => ['nullable', 'string', 'max:100'],
            'attendance_timeout' => ['nullable', 'integer', 'min:3', 'max:60'],
            'sync_interval_minutes' => ['nullable', 'integer', 'min:5', 'max:1440'],
        ]);

        foreach ($validated as $key => $value) {
            $type = is_int($value) ? 'integer' : 'string';
            SystemSetting::set($key, $value, 'attendance', $type);
        }

        return redirect()->back()->with('success', 'Konfigurasi integrasi presensi berhasil disimpan ke basis data.');
    }

    /**
     * Test connection to external attendance API or Supabase without saving.
     */
    public function testAttendanceApi(Request $request): JsonResponse
    {
        $driver = $request->input('attendance_driver', 'internal');
        $timeout = (int) $request->input('attendance_timeout', 10);

        if ($driver === 'internal') {
            return response()->json([
                'status' => 'success',
                'message' => 'Driver database internal siap dan selalu terhubung.',
                'latency_ms' => 0,
            ]);
        }

        if ($driver === 'supabase') {
            $url = $request->input('supabase_url');
            $key = $request->input('supabase_key');
            $table = $request->input('supabase_table', 'attendances');

            if (empty($url) || empty($key)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Supabase URL dan API Key wajib diisi untuk pengujian koneksi.',
                ], 422);
            }

            try {
                $startTime = microtime(true);
                $cleanUrl = rtrim($url, '/');
                $response = Http::withHeaders([
                    'apikey' => $key,
                    'Authorization' => "Bearer {$key}",
                ])->timeout($timeout)->get("{$cleanUrl}/rest/v1/{$table}", [
                    'limit' => 1,
                    'select' => 'count',
                ]);

                $latency = round((microtime(true) - $startTime) * 1000, 1);

                if ($response->successful()) {
                    return response()->json([
                        'status' => 'success',
                        'message' => "Koneksi Supabase REST API berhasil terhubung! (Tabel: {$table})",
                        'latency_ms' => $latency,
                    ]);
                }

                return response()->json([
                    'status' => 'error',
                    'message' => "Supabase merespons dengan HTTP {$response->status()}: ".$response->body(),
                    'latency_ms' => $latency,
                ], 400);
            } catch (\Throwable $e) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Koneksi ke Supabase gagal: '.$e->getMessage(),
                ], 500);
            }
        }

        if ($driver === 'external_api') {
            $baseUrl = $request->input('attendance_base_url');
            $apiKey = $request->input('attendance_api_key');

            if (empty($baseUrl) || empty($apiKey)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Base URL dan API Key wajib diisi untuk pengujian koneksi.',
                ], 422);
            }

            try {
                $startTime = microtime(true);
                $response = Http::withHeaders([
                    'Authorization' => "Bearer {$apiKey}",
                    'Accept' => 'application/json',
                ])->timeout($timeout)->get("{$baseUrl}/attendance", [
                    'date' => Carbon::today()->toDateString(),
                ]);

                $latency = round((microtime(true) - $startTime) * 1000, 1);

                if ($response->successful()) {
                    return response()->json([
                        'status' => 'success',
                        'message' => 'Koneksi ke API Presensi Eksternal berhasil terhubung!',
                        'latency_ms' => $latency,
                    ]);
                }

                return response()->json([
                    'status' => 'error',
                    'message' => "API Eksternal merespons dengan HTTP {$response->status()}",
                    'latency_ms' => $latency,
                ], 400);
            } catch (\Throwable $e) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Koneksi ke API Eksternal gagal: '.$e->getMessage(),
                ], 500);
            }
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Driver tidak valid.',
        ], 400);
    }
}
