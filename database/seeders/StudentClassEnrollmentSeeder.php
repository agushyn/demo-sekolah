<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\ClassModel;
use App\Models\Student;
use App\Models\StudentClassAuditLog;
use App\Models\StudentClassEnrollment;
use App\Models\User;
use Illuminate\Database\Seeder;

class StudentClassEnrollmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminUser = User::role('super_admin')->first() ?? User::first();

        // 1. Ensure Past & Current Academic Years exist
        $pastYear = AcademicYear::firstOrCreate(
            ['name' => '2025/2026', 'semester' => 'Genap'],
            [
                'start_date' => '2026-01-05',
                'end_date' => '2026-06-20',
                'is_active' => false,
            ]
        );

        $currentYear = AcademicYear::firstOrCreate(
            ['name' => '2026/2027', 'semester' => 'Ganjil'],
            [
                'start_date' => '2026-07-15',
                'end_date' => '2026-12-20',
                'is_active' => true,
            ]
        );

        // 2. Ensure Classes exist
        $class10 = ClassModel::firstOrCreate(
            ['name' => 'X MIPA 1'],
            [
                'academic_year_id' => $pastYear->id,
                'grade_level' => '10',
                'section' => 'MIPA 1',
            ]
        );

        $class11 = ClassModel::firstOrCreate(
            ['name' => 'XI MIPA 1'],
            [
                'academic_year_id' => $currentYear->id,
                'grade_level' => '11',
                'section' => 'MIPA 1',
            ]
        );

        // 3. Populate Enrollment & History for Students
        $students = Student::all();

        foreach ($students as $student) {
            // Past Enrollment (Completed / Promoted)
            StudentClassEnrollment::updateOrCreate(
                [
                    'student_id' => $student->id,
                    'academic_year_id' => $pastYear->id,
                    'class_id' => $class10->id,
                ],
                [
                    'status' => 'completed',
                    'start_date' => '2025-07-15',
                    'end_date' => '2026-06-20',
                    'notes' => 'Menyelesaikan tingkat kelas X dengan predikat Baik.',
                    'created_by' => $adminUser?->id,
                ]
            );

            // Current Active Enrollment
            StudentClassEnrollment::updateOrCreate(
                [
                    'student_id' => $student->id,
                    'academic_year_id' => $currentYear->id,
                    'class_id' => $class11->id,
                ],
                [
                    'status' => 'active',
                    'start_date' => '2026-07-15',
                    'end_date' => null,
                    'notes' => 'Kenaikan kelas ke XI MIPA 1 tahun ajaran 2026/2027.',
                    'created_by' => $adminUser?->id,
                ]
            );

            // Sync pivot for virtual classroom & relations
            $student->classes()->syncWithoutDetaching([$class11->id]);
            $student->update(['grade_level' => 'XI MIPA 1']);

            // Sample Audit Log
            StudentClassAuditLog::firstOrCreate(
                [
                    'student_id' => $student->id,
                    'from_class_id' => $class10->id,
                    'to_class_id' => $class11->id,
                    'action' => 'promoted',
                ],
                [
                    'from_academic_year_id' => $pastYear->id,
                    'to_academic_year_id' => $currentYear->id,
                    'performed_by' => $adminUser?->id,
                    'notes' => 'Kenaikan jenjang kelas tahun ajaran baru 2026/2027.',
                ]
            );
        }
    }
}
