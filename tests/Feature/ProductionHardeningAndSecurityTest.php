<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\ClassModel;
use App\Models\News;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\User;
use App\Services\Excel\AttendanceExcelExportService;
use App\Services\Excel\StudentExcelExportService;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PhpOffice\PhpSpreadsheet\Reader\Xlsx as XlsxReader;
use Tests\TestCase;

class ProductionHardeningAndSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;

    protected User $teacherUser;

    protected User $studentUser;

    protected User $parentUser;

    protected ClassModel $class10;

    protected AcademicYear $academicYear;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleAndPermissionSeeder::class);

        // 1. Admin
        $this->adminUser = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@schid.test',
            'password' => Hash::make('password'),
        ]);
        $this->adminUser->assignRole('admin');

        // 2. Teacher
        $this->teacherUser = User::create([
            'name' => 'Guru Pengajar',
            'email' => 'guru@schid.test',
            'password' => Hash::make('password'),
        ]);
        $this->teacherUser->assignRole('teacher');

        // 3. Student
        $this->studentUser = User::create([
            'name' => 'Siswa Belajar',
            'email' => 'siswa@schid.test',
            'password' => Hash::make('password'),
        ]);
        $this->studentUser->assignRole('student');

        // 4. Parent
        $this->parentUser = User::create([
            'name' => 'Orang Tua Murid',
            'email' => 'parent@schid.test',
            'password' => Hash::make('password'),
        ]);
        $this->parentUser->assignRole('parent');

        // Academic Year & Class
        $this->academicYear = AcademicYear::create([
            'name' => '2026/2027',
            'semester' => 'Ganjil',
            'start_date' => '2026-07-15',
            'end_date' => '2026-12-20',
            'is_active' => true,
        ]);

        $this->class10 = ClassModel::create([
            'academic_year_id' => $this->academicYear->id,
            'name' => 'X MIPA 1',
            'grade_level' => '10',
        ]);
    }

    public function test_security_headers_are_present_on_web_requests(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('X-Frame-Options', 'SAMEORIGIN');
        $response->assertHeader('X-XSS-Protection', '1; mode=block');
        $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->assertHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    }

    public function test_sitemap_xml_returns_valid_xml_with_public_urls(): void
    {
        News::create([
            'title' => 'Prestasi Juara Olimpiade Sains 2026',
            'slug' => 'prestasi-juara-olimpiade-sains-2026',
            'content' => 'Siswa berhasil meraih medali emas...',
            'author_id' => $this->adminUser->id,
            'status' => 'published',
            'published_at' => now(),
        ]);

        $response = $this->get('/sitemap.xml');

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/xml; charset=UTF-8');

        $content = $response->getContent();
        $this->assertStringContainsString('<?xml version="1.0" encoding="UTF-8"?>', $content);
        $this->assertStringContainsString('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', $content);
        $this->assertStringContainsString('/berita/prestasi-juara-olimpiade-sains-2026', $content);
        $this->assertStringContainsString('/profil', $content);
        $this->assertStringContainsString('/pendaftaran', $content);
    }

    public function test_formula_injection_is_sanitized_during_student_excel_export(): void
    {
        // Malicious student with formula injection strings
        $maliciousStudent = Student::create([
            'user_id' => $this->studentUser->id,
            'nis' => '=cmd|"/C calc"!A0',
            'nisn' => '+1234567890',
            'gender' => 'L',
            'birth_place' => '@SUM(1,2)',
            'grade_level' => 'X MIPA 1',
        ]);

        $exportService = new StudentExcelExportService;
        $binary = $exportService->export([]);

        $tempFile = tempnam(sys_get_temp_dir(), 'export_sec_').'.xlsx';
        file_put_contents($tempFile, $binary);

        $reader = new XlsxReader;
        $spreadsheet = $reader->load($tempFile);
        $sheet = $spreadsheet->getActiveSheet();

        // NIS in column B, row 5
        $nisVal = $sheet->getCell('B5')->getValue();
        $this->assertStringStartsWith("'", $nisVal, 'Leading = formula should be escaped with single quote');

        // NISN in column C, row 5
        $nisnVal = $sheet->getCell('C5')->getValue();
        $this->assertStringStartsWith("'", $nisnVal, 'Leading + formula should be escaped with single quote');

        // Birth place in column F, row 5
        $birthPlaceVal = $sheet->getCell('F5')->getValue();
        $this->assertStringStartsWith("'", $birthPlaceVal, 'Leading @ formula should be escaped with single quote');

        $spreadsheet->disconnectWorksheets();
        @unlink($tempFile);
    }

    public function test_formula_injection_is_sanitized_during_attendance_excel_export(): void
    {
        $student = Student::create([
            'user_id' => $this->studentUser->id,
            'nis' => '20261099',
            'nisn' => '0051234899',
            'gender' => 'L',
            'grade_level' => 'X MIPA 1',
        ]);

        StudentAttendance::create([
            'student_id' => $student->id,
            'class_id' => $this->class10->id,
            'date' => now()->toDateString(),
            'status' => 'present',
            'check_in' => '=NOW()',
            'check_out' => '+15:30',
            'notes' => '@IMPORTXML("http://evil.test")',
            'source' => 'manual',
            'recorded_by' => $this->adminUser->id,
        ]);

        $exportService = new AttendanceExcelExportService;
        $result = $exportService->export(['class_id' => $this->class10->id]);

        $tempFile = tempnam(sys_get_temp_dir(), 'att_sec_').'.xlsx';
        file_put_contents($tempFile, $result['binary']);

        $reader = new XlsxReader;
        $spreadsheet = $reader->load($tempFile);
        $sheet = $spreadsheet->getSheetByName('Presensi');

        // Check in column H, row 2
        $checkInVal = $sheet->getCell('H2')->getValue();
        $this->assertStringStartsWith("'", $checkInVal);

        // Notes in column M, row 2
        $notesVal = $sheet->getCell('M2')->getValue();
        $this->assertStringStartsWith("'", $notesVal);

        $spreadsheet->disconnectWorksheets();
        @unlink($tempFile);
    }

    public function test_student_cannot_access_admin_dashboard_or_settings(): void
    {
        $this->actingAs($this->studentUser)->get('/admin')->assertForbidden();
        $this->actingAs($this->studentUser)->get('/admin/students')->assertForbidden();
        $this->actingAs($this->studentUser)->get('/admin/settings')->assertForbidden();
        $this->actingAs($this->studentUser)->get('/admin/attendances')->assertForbidden();
    }

    public function test_parent_cannot_view_or_modify_other_students_classes(): void
    {
        $this->actingAs($this->parentUser)->get('/admin/students')->assertForbidden();
        $this->actingAs($this->parentUser)->post('/admin/students/batch-promote', [])->assertForbidden();
        $this->actingAs($this->parentUser)->post('/admin/settings/attendance', [])->assertForbidden();
    }

    public function test_teacher_cannot_access_attendance_api_settings(): void
    {
        $this->actingAs($this->teacherUser)->get('/admin/settings')->assertForbidden();
        $this->actingAs($this->teacherUser)->post('/admin/settings/attendance', [])->assertForbidden();
        $this->actingAs($this->teacherUser)->post('/admin/students/batch-promote', [])->assertForbidden();
    }

    public function test_guest_cannot_access_protected_virtual_classrooms(): void
    {
        $this->get('/kelas')->assertRedirect('/login');
        $this->get('/materi')->assertRedirect('/login');
        $this->get('/tugas')->assertRedirect('/login');
        $this->get('/dashboard')->assertRedirect('/login');
        $this->get('/parent/dashboard')->assertRedirect('/login');
        $this->get('/guru/dashboard')->assertRedirect('/login');
    }

    public function test_route_redirects_work_correctly_for_clean_route_caching(): void
    {
        $this->actingAs($this->studentUser)->get('/student')->assertRedirect('/dashboard');
        $this->actingAs($this->teacherUser)->get('/teacher')->assertRedirect('/guru/dashboard');
        $this->actingAs($this->parentUser)->get('/parent')->assertRedirect('/parent/dashboard');
        $this->actingAs($this->adminUser)->get('/admin/siswa')->assertRedirect('/admin/students');
        $this->actingAs($this->adminUser)->get('/admin/guru')->assertRedirect('/admin/guru-staff');
        $this->actingAs($this->adminUser)->get('/admin/presensi')->assertRedirect('/admin/attendances');
        $this->actingAs($this->adminUser)->get('/admin/orang-tua')->assertRedirect('/admin/parents');
    }
}
