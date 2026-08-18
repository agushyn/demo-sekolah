<?php

namespace App\Services\Attendance;

use App\Models\Student;
use App\Models\StudentAttendance;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class AttendanceSyncService
{
    /**
     * Process and upsert attendance records from external source with idempotency.
     */
    public function processRecords(array $records, Carbon $date): array
    {
        $synced = 0;
        $skipped = 0;
        $errors = [];

        foreach ($records as $item) {
            try {
                $student = $this->findLocalStudent($item);

                if (! $student) {
                    $skipped++;
                    $identifier = $item['nisn'] ?? $item['nis'] ?? $item['external_student_id'] ?? $item['student_id'] ?? 'unknown';
                    $errors[] = "Siswa dengan pengenal '{$identifier}' tidak ditemukan di database sekolah.";

                    continue;
                }

                $status = $this->normalizeStatus($item['status'] ?? 'present');
                $classId = $item['class_id'] ?? $student->classes()->first()?->id;

                $existingAttendance = StudentAttendance::where('student_id', $student->id)
                    ->whereDate('date', $date->toDateString())
                    ->first();

                $attributes = [
                    'class_id' => $classId,
                    'academic_year_id' => $student->activeEnrollment?->academic_year_id,
                    'check_in' => $item['check_in'] ?? null,
                    'check_out' => $item['check_out'] ?? null,
                    'status' => $status,
                    'source' => 'external_api',
                    'external_id' => $item['id'] ?? $item['external_id'] ?? null,
                    'notes' => $item['notes'] ?? null,
                    'raw_data' => $item,
                    'synced_at' => now(),
                ];

                if ($existingAttendance) {
                    $existingAttendance->update($attributes);
                } else {
                    $attributes['student_id'] = $student->id;
                    $attributes['date'] = $date->toDateString();
                    StudentAttendance::create($attributes);
                }

                $synced++;
            } catch (\Throwable $e) {
                $skipped++;
                $errors[] = 'Error memproses baris: '.$e->getMessage();
                Log::error('Attendance sync row error: '.$e->getMessage(), ['item' => $item]);
            }
        }

        return [
            'status' => 'success',
            'message' => "Sinkronisasi selesai: {$synced} data presensi berhasil disimpan, {$skipped} dilewati.",
            'synced' => $synced,
            'skipped' => $skipped,
            'errors' => $errors,
        ];
    }

    /**
     * Match local student by external ID, NISN, or NIS.
     */
    public function findLocalStudent(array $item): ?Student
    {
        if (! empty($item['nisn'])) {
            $student = Student::where('nisn', trim($item['nisn']))->first();
            if ($student) {
                return $student;
            }
        }

        if (! empty($item['nis'])) {
            $student = Student::where('nis', trim($item['nis']))->first();
            if ($student) {
                return $student;
            }
        }

        if (! empty($item['external_student_id'])) {
            $student = Student::where('nisn', trim($item['external_student_id']))
                ->orWhere('nis', trim($item['external_student_id']))
                ->first();
            if ($student) {
                return $student;
            }
        }

        if (! empty($item['email'])) {
            $student = Student::whereHas('user', fn ($u) => $u->where('email', trim($item['email'])))->first();
            if ($student) {
                return $student;
            }
        }

        return null;
    }

    /**
     * Map various status strings into standard enum values.
     */
    protected function normalizeStatus(string $rawStatus): string
    {
        $s = strtolower(trim($rawStatus));

        return match ($s) {
            'present', 'hadir', 'h' => 'present',
            'permission', 'izin', 'i', 'excused' => 'permission',
            'sick', 'sakit', 's' => 'sick',
            'absent', 'alpa', 'a', 'alpha' => 'absent',
            default => 'present',
        };
    }
}
