<?php

namespace App\Services\Sync;

use App\Models\Student;
use App\Models\StudentCache;
use App\Models\SystemSetting;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;

class StudentSyncService
{
    /**
     * Synchronize students from School Management API or local Master DB into StudentCache.
     */
    public function sync(): array
    {
        $apiUrl = SystemSetting::get('school_api_url');
        $apiToken = SystemSetting::get('school_api_token');

        $studentsData = [];

        if (! empty($apiUrl)) {
            // Option A: Fetch from School Management API
            try {
                $endpoint = rtrim($apiUrl, '/').'/api/attendance/students';
                $response = Http::withToken($apiToken)
                    ->timeout(10)
                    ->get($endpoint);

                if ($response->successful()) {
                    $json = $response->json();
                    $studentsData = is_array($json) && isset($json['data']) ? $json['data'] : $json;
                } else {
                    return [
                        'success' => false,
                        'message' => 'Gagal menghubungi School API (HTTP '.$response->status().'). Menggunakan cache lokal existing.',
                    ];
                }
            } catch (\Throwable $e) {
                return [
                    'success' => false,
                    'message' => 'School API tidak dapat dihubungi: '.$e->getMessage().'. Cache lokal tetap aktif.',
                ];
            }
        } else {
            // Option B: Sync directly from local Master Student records
            $masterStudents = Student::with(['user', 'classes', 'activeEnrollment.classRoom', 'activeEnrollment.academicYear'])
                ->get();

            foreach ($masterStudents as $student) {
                $activeClass = $student->activeEnrollment?->classRoom ?? $student->classes->first();
                $activeYear = $student->activeEnrollment?->academicYear ?? $activeClass?->academicYear;

                $studentsData[] = [
                    'student_id' => $student->id,
                    'nis' => $student->nis,
                    'nisn' => $student->nisn,
                    'name' => $student->user?->name ?? 'Siswa',
                    'class_id' => $activeClass?->id,
                    'class_name' => $activeClass?->name ?? $student->grade_level ?? 'Kelas',
                    'academic_year_id' => $activeYear?->id,
                    'rfid_uid' => $student->rfid_uid,
                    'photo_url' => null,
                    'status' => 'active',
                ];
            }
        }

        $syncedCount = 0;
        $now = Carbon::now();

        foreach ($studentsData as $item) {
            $studentId = $item['student_id'] ?? $item['id'] ?? null;
            if (! $studentId) {
                continue;
            }

            StudentCache::updateOrCreate(
                ['school_student_id' => $studentId],
                [
                    'nis' => $item['nis'] ?? null,
                    'nisn' => $item['nisn'] ?? null,
                    'name' => $item['name'] ?? 'Siswa',
                    'class_id' => $item['class_id'] ?? null,
                    'class_name' => $item['class_name'] ?? '-',
                    'academic_year_id' => $item['academic_year_id'] ?? null,
                    'rfid_uid' => ! empty($item['rfid_uid']) ? strtoupper(trim($item['rfid_uid'])) : null,
                    'photo_url' => $item['photo_url'] ?? null,
                    'status' => $item['status'] ?? 'active',
                    'synced_at' => $now,
                ]
            );

            $syncedCount++;
        }

        SystemSetting::set('last_student_sync_at', $now->toDateTimeString());

        return [
            'success' => true,
            'total_synced' => $syncedCount,
            'last_sync_at' => $now->translatedFormat('d F Y, H:i:s'),
            'message' => "{$syncedCount} data siswa berhasil disinkronkan ke cache lokal.",
        ];
    }
}
