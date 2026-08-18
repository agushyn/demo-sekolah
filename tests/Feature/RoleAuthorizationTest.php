<?php

namespace Tests\Feature;

use App\Models\ParentProfile;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RoleAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    public function test_guest_is_redirected_to_login_from_protected_areas(): void
    {
        $this->get('/admin')->assertRedirect('/login');
        $this->get('/guru/dashboard')->assertRedirect('/login');
        $this->get('/dashboard')->assertRedirect('/login');
        $this->get('/parent/dashboard')->assertRedirect('/login');
    }

    public function test_student_cannot_access_admin_dashboard(): void
    {
        $student = User::create([
            'name' => 'Siswa Test',
            'email' => 'siswa.auth@schid.test',
            'password' => Hash::make('password'),
        ]);
        $student->assignRole('student');

        $this->actingAs($student)
            ->get('/admin')
            ->assertStatus(403);
    }

    public function test_student_cannot_access_teacher_dashboard(): void
    {
        $student = User::create([
            'name' => 'Siswa Test',
            'email' => 'siswa.auth2@schid.test',
            'password' => Hash::make('password'),
        ]);
        $student->assignRole('student');

        $this->actingAs($student)
            ->get('/guru/dashboard')
            ->assertStatus(403);
    }

    public function test_teacher_cannot_access_admin_dashboard(): void
    {
        $teacher = User::create([
            'name' => 'Guru Test',
            'email' => 'guru.auth@schid.test',
            'password' => Hash::make('password'),
        ]);
        $teacher->assignRole('teacher');

        $this->actingAs($teacher)
            ->get('/admin')
            ->assertStatus(403);
    }

    public function test_teacher_cannot_access_admin_settings(): void
    {
        $teacher = User::create([
            'name' => 'Guru Test',
            'email' => 'guru.settings@schid.test',
            'password' => Hash::make('password'),
        ]);
        $teacher->assignRole('teacher');

        $this->actingAs($teacher)
            ->get('/admin/settings')
            ->assertStatus(403);
    }

    public function test_parent_cannot_access_admin_dashboard(): void
    {
        $parent = User::create([
            'name' => 'Parent Test',
            'email' => 'parent.auth@schid.test',
            'password' => Hash::make('password'),
        ]);
        $parent->assignRole('parent');

        $this->actingAs($parent)
            ->get('/admin')
            ->assertStatus(403);
    }

    public function test_admin_can_access_admin_dashboard(): void
    {
        $admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin.auth@schid.test',
            'password' => Hash::make('password'),
        ]);
        $admin->assignRole('admin');

        $this->actingAs($admin)
            ->get('/admin')
            ->assertStatus(200);
    }

    public function test_super_admin_can_access_admin_and_settings(): void
    {
        $superAdmin = User::create([
            'name' => 'Super Admin Test',
            'email' => 'superadmin.auth@schid.test',
            'password' => Hash::make('password'),
        ]);
        $superAdmin->assignRole('super_admin');

        $this->actingAs($superAdmin)
            ->get('/admin')
            ->assertStatus(200);

        $this->actingAs($superAdmin)
            ->get('/admin/settings')
            ->assertStatus(200);
    }

    public function test_teacher_can_access_teacher_dashboard(): void
    {
        $teacher = User::create([
            'name' => 'Guru Test',
            'email' => 'guru.access@schid.test',
            'password' => Hash::make('password'),
        ]);
        $teacher->assignRole('teacher');
        Teacher::create([
            'user_id' => $teacher->id,
            'nip' => '198801012010011005',
        ]);

        $this->actingAs($teacher)
            ->get('/guru/dashboard')
            ->assertStatus(200);
    }

    public function test_student_can_access_student_dashboard(): void
    {
        $student = User::create([
            'name' => 'Siswa Test',
            'email' => 'siswa.access@schid.test',
            'password' => Hash::make('password'),
        ]);
        $student->assignRole('student');
        Student::create([
            'user_id' => $student->id,
            'nisn' => '0051239999',
        ]);

        $this->actingAs($student)
            ->get('/dashboard')
            ->assertStatus(200);
    }

    public function test_parent_can_access_parent_dashboard(): void
    {
        $parent = User::create([
            'name' => 'Parent Test',
            'email' => 'parent.access@schid.test',
            'password' => Hash::make('password'),
        ]);
        $parent->assignRole('parent');
        ParentProfile::create([
            'user_id' => $parent->id,
            'nik' => '3171019999990001',
        ]);

        $this->actingAs($parent)
            ->get('/parent/dashboard')
            ->assertStatus(200);
    }
}
