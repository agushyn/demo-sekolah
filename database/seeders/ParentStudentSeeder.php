<?php

namespace Database\Seeders;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\ClassModel;
use App\Models\ParentProfile;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\Teacher;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ParentStudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $password = Hash::make('password');

        // 1. Ensure Parent Hendra Wijaya exists
        $parentUser = User::firstOrCreate(
            ['email' => 'parent@schid.test'],
            [
                'name' => 'Hendra Wijaya, S.E.',
                'password' => $password,
                'email_verified_at' => now(),
            ]
        );
        $parentUser->assignRole('parent');

        $parentProfile = ParentProfile::updateOrCreate(
            ['user_id' => $parentUser->id],
            [
                'nik' => '3171012345670001',
                'relationship_type' => 'Ayah',
                'phone' => '+62 813-9876-5432',
                'occupation' => 'Wiraswasta / Manajer Keuangan',
                'address' => 'Jl. Tebet Barat Dalam No. 12, Jakarta Selatan',
            ]
        );

        // 2. Ensure Student Aditya Pratama Wijaya is linked to Hendra Wijaya
        $adityaUser = User::firstOrCreate(
            ['email' => 'student@schid.test'],
            [
                'name' => 'Aditya Pratama Wijaya',
                'password' => $password,
                'email_verified_at' => now(),
            ]
        );
        $adityaUser->assignRole('student');

        $adityaStudent = Student::updateOrCreate(
            ['user_id' => $adityaUser->id],
            [
                'nisn' => '0051234567',
                'nis' => '20261001',
                'gender' => 'L',
                'birth_place' => 'Jakarta',
                'birth_date' => '2008-05-14',
                'grade_level' => 'XI-IPA 1',
                'address' => 'Jl. Tebet Barat Dalam No. 12, Jakarta Selatan',
                'phone' => '+62 857-1234-5678',
                'parent_id' => $parentProfile->id,
            ]
        );

        // 3. Second Child: Nabila Putri Wijaya (Adik Aditya) also linked to Hendra Wijaya
        $nabilaUser = User::firstOrCreate(
            ['email' => 'nabila.putri@schid.test'],
            [
                'name' => 'Nabila Putri Wijaya',
                'password' => $password,
                'email_verified_at' => now(),
            ]
        );
        $nabilaUser->assignRole('student');

        $nabilaStudent = Student::updateOrCreate(
            ['user_id' => $nabilaUser->id],
            [
                'nisn' => '0051234570',
                'nis' => '20261004',
                'gender' => 'P',
                'birth_place' => 'Jakarta',
                'birth_date' => '2009-11-03',
                'grade_level' => 'X-1',
                'address' => 'Jl. Tebet Barat Dalam No. 12, Jakarta Selatan',
                'phone' => '+62 857-1234-5681',
                'parent_id' => $parentProfile->id,
            ]
        );

        // 4. Enroll Students to Classes
        $class10 = ClassModel::first();
        if ($class10) {
            $class10->students()->syncWithoutDetaching([$adityaStudent->id, $nabilaStudent->id]);
        }

        // 5. Seed Attendance for Aditya
        $adminUser = User::role('super_admin')->first() ?? $adityaUser;

        for ($i = 15; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);

            // Skip weekends
            if ($date->isWeekend()) {
                continue;
            }

            $status = 'present';
            $notes = null;

            if ($i === 4) {
                $status = 'permission';
                $notes = 'Izin mengikuti lomba sains daerah';
            } elseif ($i === 9) {
                $status = 'sick';
                $notes = 'Surat dokter terlampir (flu & demam)';
            }

            StudentAttendance::updateOrCreate(
                [
                    'student_id' => $adityaStudent->id,
                    'date' => $date->format('Y-m-d'),
                ],
                [
                    'class_id' => $class10?->id,
                    'status' => $status,
                    'notes' => $notes,
                    'recorded_by' => $adminUser->id,
                ]
            );
        }

        // 6. Seed Additional Graded Submission
        $teacher = Teacher::first();
        $assignment = Assignment::where('status', 'published')->first();

        if ($assignment && $teacher) {
            AssignmentSubmission::updateOrCreate(
                ['assignment_id' => $assignment->id, 'student_id' => $adityaStudent->id],
                [
                    'file_path' => 'submissions/sample_jawaban.pdf',
                    'notes' => 'Tugas sudah selesai dikerjakan sesuai modul.',
                    'status' => 'graded',
                    'score' => 96.50,
                    'feedback' => 'Penalaran analisis sangat baik dan sistematis. Terus pertahankan prestasimu!',
                    'graded_by' => $teacher->user_id,
                    'graded_at' => now()->subDays(2),
                    'submitted_at' => now()->subDays(4),
                ]
            );
        }
    }
}
