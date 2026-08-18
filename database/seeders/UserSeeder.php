<?php

namespace Database\Seeders;

use App\Models\ParentProfile;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $password = Hash::make('password');

        // 1. Super Admin
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@schid.test'],
            [
                'name' => 'Super Administrator',
                'password' => $password,
                'email_verified_at' => now(),
            ]
        );
        $superAdmin->assignRole('super_admin');

        // 2. Admin Sekolah
        $admin = User::firstOrCreate(
            ['email' => 'admin@schid.test'],
            [
                'name' => 'Agus Santoso, S.Kom.',
                'password' => $password,
                'email_verified_at' => now(),
            ]
        );
        $admin->assignRole('admin');

        // 3. Teachers / Guru
        $teachersData = [
            [
                'name' => 'Bambang Pratama, S.Pd., M.Kom.',
                'email' => 'teacher@schid.test',
                'nip' => '198501012010011001',
                'nuptk' => '8439201948201923',
                'title' => 'Guru Informatika & Rekayasa Perangkat Lunak',
                'gender' => 'L',
                'phone' => '+62 812-3456-7891',
                'specialization' => 'Informatika & Pemrograman Web',
                'bio' => 'Pengajar Informatika berpengalaman 10+ tahun, penggerak digitalisasi sekolah.',
            ],
            [
                'name' => 'Siti Rahmawati, M.Pd.',
                'email' => 'siti.rahma@schid.test',
                'nip' => '198803152012022002',
                'nuptk' => '7281920394810293',
                'title' => 'Guru Matematika Wajib & Peminatan',
                'gender' => 'P',
                'phone' => '+62 812-3456-7892',
                'specialization' => 'Matematika Terapan & Statistika',
                'bio' => 'Pembimbing Olimpiade Sains Nasional bidang Matematika.',
            ],
            [
                'name' => 'Ahmad Fauzi, S.Pd.',
                'email' => 'ahmad.fauzi@schid.test',
                'nip' => '199007202015031003',
                'nuptk' => '9182736450192837',
                'title' => 'Guru Bahasa Inggris & TOEFL Prep',
                'gender' => 'L',
                'phone' => '+62 812-3456-7893',
                'specialization' => 'English for Academic Purposes',
                'bio' => 'Koordinator Program International Language Club sekolah.',
            ],
        ];

        foreach ($teachersData as $tData) {
            $tUser = User::firstOrCreate(
                ['email' => $tData['email']],
                [
                    'name' => $tData['name'],
                    'password' => $password,
                    'email_verified_at' => now(),
                ]
            );
            $tUser->assignRole('teacher');

            Teacher::updateOrCreate(
                ['user_id' => $tUser->id],
                [
                    'nip' => $tData['nip'],
                    'nuptk' => $tData['nuptk'],
                    'title' => $tData['title'],
                    'gender' => $tData['gender'],
                    'phone' => $tData['phone'],
                    'specialization' => $tData['specialization'],
                    'bio' => $tData['bio'],
                ]
            );
        }

        // 4. Parents / Orang Tua
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

        // 5. Students / Siswa
        $studentsData = [
            [
                'name' => 'Aditya Pratama Wijaya',
                'email' => 'student@schid.test',
                'nisn' => '0051234567',
                'nis' => '20261001',
                'gender' => 'L',
                'birth_place' => 'Jakarta',
                'birth_date' => '2008-05-14',
                'grade_level' => 'XI-IPA 1',
                'address' => 'Jl. Tebet Barat Dalam No. 12, Jakarta Selatan',
                'phone' => '+62 857-1234-5678',
                'parent_id' => $parentProfile->id,
            ],
            [
                'name' => 'Citra Lestari',
                'email' => 'citra.lestari@schid.test',
                'nisn' => '0051234568',
                'nis' => '20261002',
                'gender' => 'P',
                'birth_place' => 'Bandung',
                'birth_date' => '2008-08-20',
                'grade_level' => 'XI-IPA 1',
                'address' => 'Jl. Gandaria No. 8, Jakarta Selatan',
                'phone' => '+62 857-1234-5679',
                'parent_id' => null,
            ],
            [
                'name' => 'Dimas Saputra',
                'email' => 'dimas.saputra@schid.test',
                'nisn' => '0051234569',
                'nis' => '20261003',
                'gender' => 'L',
                'birth_place' => 'Jakarta',
                'birth_date' => '2008-02-11',
                'grade_level' => 'XI-IPA 2',
                'address' => 'Jl. Kebayoran Lama No. 34, Jakarta Selatan',
                'phone' => '+62 857-1234-5680',
                'parent_id' => null,
            ],
            [
                'name' => 'Nabila Putri',
                'email' => 'nabila.putri@schid.test',
                'nisn' => '0051234570',
                'nis' => '20261004',
                'gender' => 'P',
                'birth_place' => 'Bogor',
                'birth_date' => '2008-11-03',
                'grade_level' => 'XI-IPS 1',
                'address' => 'Jl. Fatmawati Raya No. 90, Jakarta Selatan',
                'phone' => '+62 857-1234-5681',
                'parent_id' => null,
            ],
            [
                'name' => 'Rizky Ramadhan',
                'email' => 'rizky.ramadhan@schid.test',
                'nisn' => '0051234571',
                'nis' => '20261005',
                'gender' => 'L',
                'birth_place' => 'Jakarta',
                'birth_date' => '2008-09-17',
                'grade_level' => 'X-1',
                'address' => 'Jl. Cilandak Barat No. 22, Jakarta Selatan',
                'phone' => '+62 857-1234-5682',
                'parent_id' => null,
            ],
        ];

        foreach ($studentsData as $sData) {
            $sUser = User::firstOrCreate(
                ['email' => $sData['email']],
                [
                    'name' => $sData['name'],
                    'password' => $password,
                    'email_verified_at' => now(),
                ]
            );
            $sUser->assignRole('student');

            Student::updateOrCreate(
                ['user_id' => $sUser->id],
                [
                    'parent_id' => $sData['parent_id'],
                    'nisn' => $sData['nisn'],
                    'nis' => $sData['nis'],
                    'gender' => $sData['gender'],
                    'birth_place' => $sData['birth_place'],
                    'birth_date' => $sData['birth_date'],
                    'grade_level' => $sData['grade_level'],
                    'address' => $sData['address'],
                    'phone' => $sData['phone'],
                ]
            );
        }
    }
}
