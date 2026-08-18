<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\ClassModel;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\SystemSetting;
use App\Models\User;
use App\Services\Attendance\AttendanceProviderFactory;
use App\Services\Attendance\SupabaseAttendanceProvider;
use Carbon\Carbon;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class StudentImportAndAttendanceConfigTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $studentUser;

    protected ClassModel $class10;

    protected AcademicYear $year;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleAndPermissionSeeder::class);

        // 1. Admin
        $this->admin = User::create([
            'name' => 'Admin Utama',
            'email' => 'admin@schid.test',
            'password' => Hash::make('password'),
        ]);
        $this->admin->assignRole('admin');

        // 2. Student User for permission test
        $this->studentUser = User::create([
            'name' => 'Siswa Test',
            'email' => 'siswa@schid.test',
            'password' => Hash::make('password'),
        ]);
        $this->studentUser->assignRole('student');

        // 3. Academic Year & Class
        $this->year = AcademicYear::create([
            'name' => '2026/2027',
            'semester' => 'Ganjil',
            'start_date' => '2026-07-15',
            'end_date' => '2026-12-20',
            'is_active' => true,
        ]);

        $this->class10 = ClassModel::create([
            'academic_year_id' => $this->year->id,
            'name' => 'X MIPA 1',
            'grade_level' => '10',
        ]);
    }

    public function test_admin_can_view_student_create_page(): void
    {
        $response = $this->actingAs($this->admin)->get('/admin/students/create');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Students/Create')
            ->has('classes', 1)
            ->has('academicYears', 1)
        );
    }

    public function test_admin_can_manually_create_student_account_with_enrollment(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/students', [
            'name' => 'Budi Gunawan',
            'email' => 'budi.gunawan@schid.test',
            'password' => 'secret123',
            'nisn' => '0051234599',
            'nis' => '20261020',
            'gender' => 'L',
            'birth_place' => 'Surabaya',
            'birth_date' => '2009-02-10',
            'class_id' => $this->class10->id,
            'phone' => '081234567899',
            'address' => 'Jl. Pahlawan No. 45 Surabaya',
        ]);

        $response->assertRedirect('/admin/students');

        $this->assertDatabaseHas('users', [
            'name' => 'Budi Gunawan',
            'email' => 'budi.gunawan@schid.test',
        ]);

        $this->assertDatabaseHas('students', [
            'nisn' => '0051234599',
            'nis' => '20261020',
            'gender' => 'L',
        ]);

        $this->assertDatabaseHas('student_class_enrollments', [
            'class_id' => $this->class10->id,
            'status' => 'active',
        ]);
    }

    public function test_admin_can_download_xlsx_template(): void
    {
        $response = $this->actingAs($this->admin)->get('/admin/students/template');

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }

    public function test_admin_can_execute_batch_student_import(): void
    {
        $rows = [
            [
                'name' => 'Fajar Pratama',
                'email' => 'fajar.pratama@schid.test',
                'password' => 'password123',
                'nisn' => '0051234610',
                'nis' => '20261030',
                'gender' => 'L',
                'birth_place' => 'Semarang',
                'birth_date' => '2009-03-14',
                'phone' => '081299993333',
                'address' => 'Jl. Melati 3 Semarang',
                'class_id' => $this->class10->id,
                'status' => 'active',
                'row_status' => 'valid',
            ],
        ];

        $response = $this->actingAs($this->admin)->post('/admin/students/import', [
            'rows' => $rows,
        ]);

        $response->assertRedirect('/admin/students');

        $this->assertDatabaseHas('users', ['email' => 'fajar.pratama@schid.test']);
        $this->assertDatabaseHas('students', ['nisn' => '0051234610']);
        $this->assertDatabaseHas('student_class_enrollments', ['class_id' => $this->class10->id, 'status' => 'active']);
    }

    public function test_admin_can_export_attendances_as_xlsx_with_class_filter(): void
    {
        $student = Student::create([
            'user_id' => $this->studentUser->id,
            'nisn' => '0051234699',
            'nis' => '20261099',
            'gender' => 'L',
            'grade_level' => 'X MIPA 1',
        ]);

        StudentAttendance::create([
            'student_id' => $student->id,
            'class_id' => $this->class10->id,
            'date' => now()->toDateString(),
            'status' => 'present',
            'check_in' => '07:15',
            'check_out' => '15:30',
            'source' => 'manual',
            'recorded_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)->get("/admin/attendances/export?class_id={$this->class10->id}");

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }

    public function test_admin_can_update_attendance_api_and_supabase_settings_in_database(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/settings/attendance', [
            'attendance_driver' => 'supabase',
            'supabase_url' => 'https://mockproject.supabase.co',
            'supabase_key' => 'sb_anon_key_secret_12345',
            'supabase_table' => 'school_attendances',
            'attendance_timeout' => 20,
            'sync_interval_minutes' => 60,
        ]);

        $response->assertRedirect();

        $this->assertEquals('supabase', SystemSetting::get('attendance_driver'));
        $this->assertEquals('https://mockproject.supabase.co', SystemSetting::get('supabase_url'));
        $this->assertEquals('school_attendances', SystemSetting::get('supabase_table'));

        $provider = AttendanceProviderFactory::make();
        $this->assertInstanceOf(SupabaseAttendanceProvider::class, $provider);
    }

    public function test_supabase_attendance_provider_handles_unconfigured_gracefully(): void
    {
        SystemSetting::set('supabase_url', '', 'attendance');
        SystemSetting::set('supabase_key', '', 'attendance');

        $provider = new SupabaseAttendanceProvider;
        $this->assertFalse($provider->isConfigured());

        $result = $provider->syncAttendance(Carbon::now());
        $this->assertEquals('unconfigured', $result['status']);
    }

    public function test_non_admin_cannot_create_students_or_manage_settings(): void
    {
        $this->actingAs($this->studentUser)->get('/admin/students/create')->assertForbidden();
        $this->actingAs($this->studentUser)->post('/admin/students', [])->assertForbidden();
        $this->actingAs($this->studentUser)->post('/admin/settings/attendance', [])->assertForbidden();
    }
}
