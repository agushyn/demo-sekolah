<?php

namespace App\Services\Attendance;

use App\Contracts\AttendanceProviderInterface;
use App\Models\SystemSetting;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExternalAttendanceProvider implements AttendanceProviderInterface
{
    protected ?string $baseUrl;

    protected ?string $apiKey;

    protected int $timeout;

    public function __construct()
    {
        $this->baseUrl = SystemSetting::get('attendance_base_url', config('services.attendance_api.base_url', env('ATTENDANCE_API_BASE_URL', '')));
        $this->apiKey = SystemSetting::get('attendance_api_key', config('services.attendance_api.api_key', env('ATTENDANCE_API_KEY', '')));
        $this->timeout = (int) SystemSetting::get('attendance_timeout', config('services.attendance_api.timeout', 15));
    }

    public function isConfigured(): bool
    {
        return ! empty($this->baseUrl) && ! empty($this->apiKey);
    }

    public function getProviderName(): string
    {
        return 'External Attendance Cloud API';
    }

    public function getAttendance(Carbon $date, ?int $classId = null): Collection
    {
        // Query synced local cache of attendances
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
                'message' => 'Integrasi aplikasi presensi belum dikonfigurasi. Silakan isi ATTENDANCE_API_BASE_URL dan ATTENDANCE_API_KEY di file .env.',
                'synced' => 0,
                'skipped' => 0,
                'errors' => [],
            ];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Accept' => 'application/json',
            ])->timeout($this->timeout)->get("{$this->baseUrl}/attendance", [
                'date' => $date->toDateString(),
            ]);

            if (! $response->successful()) {
                Log::warning('External Attendance API error response', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return [
                    'status' => 'error',
                    'message' => 'Gagal mengambil data dari API eksternal: HTTP '.$response->status(),
                    'synced' => 0,
                    'skipped' => 0,
                    'errors' => [$response->body()],
                ];
            }

            $payload = $response->json();
            $records = $payload['data'] ?? $payload ?? [];

            return app(AttendanceSyncService::class)->processRecords($records, $date);
        } catch (\Throwable $e) {
            Log::error('External Attendance API connection failed: '.$e->getMessage());

            return [
                'status' => 'error',
                'message' => 'Koneksi ke API presensi eksternal gagal: '.$e->getMessage(),
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
