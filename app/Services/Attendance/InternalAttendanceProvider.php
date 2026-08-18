<?php

namespace App\Services\Attendance;

use App\Contracts\AttendanceProviderInterface;
use App\Models\StudentAttendance;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class InternalAttendanceProvider implements AttendanceProviderInterface
{
    public function getAttendance(Carbon $date, ?int $classId = null): Collection
    {
        $query = StudentAttendance::with(['student.user', 'classRoom', 'recorder'])
            ->whereDate('date', $date->toDateString());

        if ($classId) {
            $query->where('class_id', $classId);
        }

        return $query->orderBy('class_id')->get();
    }

    public function getStudentAttendance(int $studentId, Carbon $startDate, Carbon $endDate): Collection
    {
        return StudentAttendance::with('classRoom')
            ->where('student_id', $studentId)
            ->whereBetween('date', [$startDate->toDateString(), $endDate->toDateString()])
            ->orderBy('date', 'desc')
            ->get();
    }

    public function syncAttendance(Carbon $date): array
    {
        // Internal provider does not require remote sync
        return [
            'status' => 'success',
            'message' => 'Menggunakan basis data presensi internal sekolah.',
            'synced' => 0,
            'skipped' => 0,
            'errors' => [],
        ];
    }

    public function getAttendanceSummary(Carbon $date, ?int $classId = null): array
    {
        $query = StudentAttendance::whereDate('date', $date->toDateString());

        if ($classId) {
            $query->where('class_id', $classId);
        }

        $records = $query->get();

        $present = $records->where('status', 'present')->count();
        $permission = $records->where('status', 'permission')->count();
        $sick = $records->where('status', 'sick')->count();
        $absent = $records->where('status', 'absent')->count();
        $total = $records->count();

        $rate = $total > 0 ? round(($present / $total) * 100, 1) : 100;

        return [
            'total' => $total,
            'present' => $present,
            'permission' => $permission,
            'sick' => $sick,
            'absent' => $absent,
            'attendance_rate' => "{$rate}%",
        ];
    }

    public function isConfigured(): bool
    {
        return true;
    }

    public function getProviderName(): string
    {
        return 'Internal Database System';
    }
}
