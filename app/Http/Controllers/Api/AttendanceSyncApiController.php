<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceSyncApiController extends Controller
{
    /**
     * Provide active student roster for Attendance Kiosks / Consumers.
     */
    public function students(Request $request): JsonResponse
    {
        $students = Student::with(['user', 'classes', 'activeEnrollment.classRoom', 'activeEnrollment.academicYear'])
            ->get()
            ->map(function ($student) {
                $activeClass = $student->activeEnrollment?->classRoom ?? $student->classes->first();
                $activeYear = $student->activeEnrollment?->academicYear ?? $activeClass?->academicYear;

                return [
                    'id' => $student->id,
                    'student_id' => $student->id,
                    'nis' => $student->nis,
                    'nisn' => $student->nisn,
                    'name' => $student->user?->name ?? 'Siswa',
                    'class_id' => $activeClass?->id,
                    'class_name' => $activeClass?->name ?? $student->grade_level ?? 'Kelas',
                    'academic_year_id' => $activeYear?->id,
                    'rfid_uid' => $student->rfid_uid,
                    'status' => 'active',
                ];
            });

        return response()->json([
            'success' => true,
            'total' => $students->count(),
            'data' => $students,
        ]);
    }
}
