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

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_admin_can_login_and_redirects_to_admin_dashboard(): void
    {
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@schid.test',
            'password' => Hash::make('password'),
        ]);
        $admin->assignRole('admin');

        $response = $this->post('/login', [
            'email' => 'admin@schid.test',
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($admin);
        $response->assertRedirect('/admin');
    }

    public function test_teacher_can_login_and_redirects_to_teacher_dashboard(): void
    {
        $teacherUser = User::create([
            'name' => 'Guru Matematika',
            'email' => 'guru@schid.test',
            'password' => Hash::make('password'),
        ]);
        $teacherUser->assignRole('teacher');
        Teacher::create([
            'user_id' => $teacherUser->id,
            'nip' => '198501012010011001',
        ]);

        $response = $this->post('/login', [
            'email' => 'guru@schid.test',
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($teacherUser);
        $response->assertRedirect('/guru/dashboard');
    }

    public function test_teacher_can_login_using_nip(): void
    {
        $teacherUser = User::create([
            'name' => 'Guru IPA',
            'email' => 'guruipa@schid.test',
            'password' => Hash::make('password'),
        ]);
        $teacherUser->assignRole('teacher');
        Teacher::create([
            'user_id' => $teacherUser->id,
            'nip' => '199001012015011002',
        ]);

        $response = $this->post('/login', [
            'identifier' => '199001012015011002',
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($teacherUser);
        $response->assertRedirect('/guru/dashboard');
    }

    public function test_student_can_login_and_redirects_to_student_dashboard(): void
    {
        $studentUser = User::create([
            'name' => 'Siswa Cerdas',
            'email' => 'siswa@schid.test',
            'password' => Hash::make('password'),
        ]);
        $studentUser->assignRole('student');
        Student::create([
            'user_id' => $studentUser->id,
            'nisn' => '0051234567',
        ]);

        $response = $this->post('/login', [
            'email' => 'siswa@schid.test',
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($studentUser);
        $response->assertRedirect('/dashboard');
    }

    public function test_student_can_login_using_nisn(): void
    {
        $studentUser = User::create([
            'name' => 'Siswa Baru',
            'email' => 'siswabaru@schid.test',
            'password' => Hash::make('password'),
        ]);
        $studentUser->assignRole('student');
        Student::create([
            'user_id' => $studentUser->id,
            'nisn' => '0059998887',
        ]);

        $response = $this->post('/login', [
            'identifier' => '0059998887',
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($studentUser);
        $response->assertRedirect('/dashboard');
    }

    public function test_parent_can_login_and_redirects_to_parent_dashboard(): void
    {
        $parentUser = User::create([
            'name' => 'Orang Tua Siswa',
            'email' => 'ortu@schid.test',
            'password' => Hash::make('password'),
        ]);
        $parentUser->assignRole('parent');
        ParentProfile::create([
            'user_id' => $parentUser->id,
            'nik' => '3171012345670001',
        ]);

        $response = $this->post('/login', [
            'email' => 'ortu@schid.test',
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($parentUser);
        $response->assertRedirect('/parent/dashboard');
    }

    public function test_login_validation_fails_with_invalid_credentials(): void
    {
        $user = User::create([
            'name' => 'Valid User',
            'email' => 'valid@schid.test',
            'password' => Hash::make('password'),
        ]);

        $response = $this->post('/login', [
            'email' => 'valid@schid.test',
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('email');
    }

    public function test_user_can_logout(): void
    {
        $user = User::create([
            'name' => 'Logout User',
            'email' => 'logout@schid.test',
            'password' => Hash::make('password'),
        ]);

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }

    public function test_user_can_register(): void
    {
        $response = $this->post('/register', [
            'name' => 'Pendaftar Siswa Baru',
            'email' => 'pendaftar@schid.test',
            'role' => 'student',
            'nisn' => '0061122334',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', ['email' => 'pendaftar@schid.test']);
        $this->assertDatabaseHas('students', ['nisn' => '0061122334']);

        $user = User::where('email', 'pendaftar@schid.test')->first();
        $this->assertTrue($user->hasRole('student'));
        $response->assertRedirect('/dashboard');
    }

    public function test_password_reset_screen_can_be_rendered(): void
    {
        $response = $this->get('/reset-password/fake-token?email=user@schid.test');

        $response->assertStatus(200);
    }
}
