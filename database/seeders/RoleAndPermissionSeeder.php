<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Define Roles
        $roles = [
            'super_admin' => [
                'label' => 'Super Administrator',
                'description' => 'Akses penuh ke seluruh sistem dan konfigurasi inti.',
            ],
            'admin' => [
                'label' => 'Administrator Sekolah',
                'description' => 'Pengelola operasional, konten website, guru, siswa, dan akademik.',
            ],
            'teacher' => [
                'label' => 'Guru / Pengajar',
                'description' => 'Pendidik dengan hak kelola kelas, materi, tugas, dan nilai.',
            ],
            'student' => [
                'label' => 'Siswa / Murid',
                'description' => 'Peserta didik aktif dengan hak akses kelas, materi, dan tugas.',
            ],
            'parent' => [
                'label' => 'Orang Tua / Wali',
                'description' => 'Wali murid dengan hak pemantauan kehadiran dan perkembangan akademik anak.',
            ],
        ];

        $roleModels = [];
        foreach ($roles as $name => $data) {
            $roleModels[$name] = Role::firstOrCreate(
                ['name' => $name],
                [
                    'label' => $data['label'],
                    'description' => $data['description'],
                    'guard_name' => 'web',
                ]
            );
        }

        // 2. Define Granular Permissions (PRD Section 39)
        $permissions = [
            // Dashboard & General
            ['name' => 'view_dashboard', 'label' => 'Melihat Dashboard', 'group' => 'general'],
            ['name' => 'manage_settings', 'label' => 'Mengelola Pengaturan Sistem', 'group' => 'settings'],

            // News & CMS
            ['name' => 'view_news', 'label' => 'Melihat Berita', 'group' => 'news'],
            ['name' => 'create_news', 'label' => 'Membuat Berita', 'group' => 'news'],
            ['name' => 'edit_news', 'label' => 'Mengedit Berita', 'group' => 'news'],
            ['name' => 'delete_news', 'label' => 'Menghapus Berita', 'group' => 'news'],
            ['name' => 'publish_news', 'label' => 'Mempublikasikan Berita', 'group' => 'news'],

            // Academic & Users
            ['name' => 'view_students', 'label' => 'Melihat Data Siswa', 'group' => 'students'],
            ['name' => 'create_students', 'label' => 'Menambah Data Siswa', 'group' => 'students'],
            ['name' => 'edit_students', 'label' => 'Mengedit Data Siswa', 'group' => 'students'],
            ['name' => 'delete_students', 'label' => 'Menghapus Data Siswa', 'group' => 'students'],

            ['name' => 'view_teachers', 'label' => 'Melihat Data Guru', 'group' => 'teachers'],
            ['name' => 'create_teachers', 'label' => 'Menambah Data Guru', 'group' => 'teachers'],
            ['name' => 'edit_teachers', 'label' => 'Mengedit Data Guru', 'group' => 'teachers'],

            // PPDB / Registrations
            ['name' => 'view_registrations', 'label' => 'Melihat Pendaftar PPDB', 'group' => 'registrations'],
            ['name' => 'review_registrations', 'label' => 'Review Pendaftaran PPDB', 'group' => 'registrations'],
            ['name' => 'approve_registrations', 'label' => 'Menerima Pendaftar PPDB', 'group' => 'registrations'],
            ['name' => 'reject_registrations', 'label' => 'Menolak Pendaftar PPDB', 'group' => 'registrations'],

            // Classes & Learning
            ['name' => 'manage_calendar', 'label' => 'Mengelola Kalender Akademik', 'group' => 'calendar'],
            ['name' => 'manage_classes', 'label' => 'Mengelola Rombel & Kelas', 'group' => 'academic'],
            ['name' => 'manage_subjects', 'label' => 'Mengelola Mata Pelajaran', 'group' => 'academic'],
            ['name' => 'manage_lessons', 'label' => 'Mengelola Materi Pembelajaran', 'group' => 'learning'],
            ['name' => 'manage_assignments', 'label' => 'Mengelola Tugas & Penilaian', 'group' => 'learning'],
            ['name' => 'moderate_forum', 'label' => 'Moderasi Forum Diskusi', 'group' => 'forum'],
        ];

        $allPermissionIds = [];
        foreach ($permissions as $p) {
            $perm = Permission::firstOrCreate(
                ['name' => $p['name']],
                [
                    'label' => $p['label'],
                    'group' => $p['group'],
                    'guard_name' => 'web',
                ]
            );
            $allPermissionIds[$p['name']] = $perm->id;
        }

        // 3. Assign Default Permissions to Roles
        // Admin gets all management permissions
        $adminPermissions = array_values($allPermissionIds);
        $roleModels['admin']->permissions()->sync($adminPermissions);

        // Teacher permissions
        $teacherPermNames = [
            'view_dashboard',
            'view_students',
            'manage_lessons',
            'manage_assignments',
            'moderate_forum',
        ];
        $teacherPermIds = collect($teacherPermNames)->map(fn ($name) => $allPermissionIds[$name] ?? null)->filter()->all();
        $roleModels['teacher']->permissions()->sync($teacherPermIds);

        // Student permissions
        $studentPermNames = [
            'view_dashboard',
        ];
        $studentPermIds = collect($studentPermNames)->map(fn ($name) => $allPermissionIds[$name] ?? null)->filter()->all();
        $roleModels['student']->permissions()->sync($studentPermIds);

        // Parent permissions
        $parentPermNames = [
            'view_dashboard',
        ];
        $parentPermIds = collect($parentPermNames)->map(fn ($name) => $allPermissionIds[$name] ?? null)->filter()->all();
        $roleModels['parent']->permissions()->sync($parentPermIds);
    }
}
