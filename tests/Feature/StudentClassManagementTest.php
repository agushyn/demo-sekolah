<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\ClassModel;
use App\Models\ParentProfile;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\StudentClassEnrollment;
use App\Models\Teacher;
use App\Models\User;
use App\Services\Attendance\AttendanceSyncService;
use App\Services\Attendance\ExternalAttendanceProvider;
use App\Services\Attendance\InternalAttendanceProvider;
use App\Services\StudentClassService;
use Carbon\Carbon;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class StudentClassManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $teacherUser;

    protected User $parentUser;

    protected User $studentUser;

    protected ParentProfile $parentProfile;

    protected Student $student;

    protected AcademicYear $year2025;

    protected AcademicYear $year2026;

    protected ClassModel $class10;

    protected ClassModel $class11;

    protected ClassModel $class10B;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleAndPermissionSeeder::class);

        // 1. Admin
        $this->admin = User::create([
            'name' => 'Admin Super',
            'email' => 'admin@schid.test',
            'password' => Hash::make('password'),
        ]);
        $this->admin->assignRole('admin');

        // 2. Teacher
        $this->teacherUser = User::create([
            'name' => 'Budi Santoso, M.Pd.',
            'email' => 'teacher@schid.test',
            'password' => Hash::make('password'),
        ]);
        $this->teacherUser->assignRole('teacher');
        $teacher = Teacher::create([
            'user_id' => $this->teacherUser->id,
            'nip' => '198001012005011001',
        ]);

        // 3. Parent
        $this->parentUser = User::create([
            'name' => 'Hendra Wijaya',
            'email' => 'parent@schid.test',
            'password' => Hash::make('password'),
        ]);
        $this->parentUser->assignRole('parent');
        $this->parentProfile = ParentProfile::create([
            'user_id' => $this->parentUser->id,
            'relationship_type' => 'Ayah',
            'phone' => '081234567890',
        ]);

        // 4. Academic Years
        $this->year2025 = AcademicYear::create([
            'name' => '2025/2026',
            'semester' => 'Genap',
            'start_date' => '2026-01-05',
            'end_date' => '2026-06-20',
            'is_active' => false,
        ]);

        $this->year2026 = AcademicYear::create([
            'name' => '2026/2027',
            'semester' => 'Ganjil',
            'start_date' => '2026-07-15',
            'end_date' => '2026-12-20',
            'is_active' => true,
        ]);

        // 5. Classes
        $this->class10 = ClassModel::create([
            'academic_year_id' => $this->year2025->id,
            'name' => 'X MIPA 1',
            'grade_level' => '10',
            'homeroom_teacher_id' => $teacher->id,
        ]);

        $this->class10B = ClassModel::create([
            'academic_year_id' => $this->year2025->id,
            'name' => 'X MIPA 2',
            'grade_level' => '10',
            'homeroom_teacher_id' => $teacher->id,
        ]);

        $this->class11 = ClassModel::create([
            'academic_year_id' => $this->year2026->id,
            'name' => 'XI MIPA 1',
            'grade_level' => '11',
            'homeroom_teacher_id' => $teacher->id,
        ]);

        // 6. Student
        $this->studentUser = User::create([
            'name' => 'Aditya Pratama',
            'email' => 'aditya@schid.test',
            'password' => Hash::make('password'),
        ]);
        $this->studentUser->assignRole('student');

        $this->student = Student::create([
            'user_id' => $this->studentUser->id,
            'parent_id' => $this->parentProfile->id,
            'nisn' => '0051234567',
            'nis' => '20261001',
            'grade_level' => 'X MIPA 1',
        ]);

        // Initial Enrollment
        StudentClassEnrollment::create([
            'student_id' => $this->student->id,
            'academic_year_id' => $this->year2025->id,
            'class_id' => $this->class10->id,
            'status' => 'active',
            'start_date' => '2025-07-15',
        ]);

        $this->class10->students()->attach($this->student->id);
    }

    public function test_admin_can_view_student_detail_page_with_class_history(): void
    {
        $response = $this->actingAs($this->admin)->get("/admin/students/{$this->student->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Students/Show')
            ->where('student.id', $this->student->id)
            ->where('student.nisn', '0051234567')
            ->has('student.class_history', 1)
            ->has('classes')
            ->has('academicYears')
        );
    }

    public function test_admin_can_update_individual_student_class_and_create_audit_log(): void
    {
        $response = $this->actingAs($this->admin)->put("/admin/students/{$this->student->id}/class", [
            'to_class_id' => $this->class10B->id,
            'academic_year_id' => $this->year2025->id,
            'notes' => 'Pindah rombel karena penyesuaian peminatan.',
        ]);

        $response->assertRedirect();

        // Previous enrollment marked as transferred
        $this->assertDatabaseHas('student_class_enrollments', [
            'student_id' => $this->student->id,
            'class_id' => $this->class10->id,
            'status' => 'transferred',
        ]);

        // New active enrollment created
        $this->assertDatabaseHas('student_class_enrollments', [
            'student_id' => $this->student->id,
            'class_id' => $this->class10B->id,
            'status' => 'active',
        ]);

        // Audit log created
        $this->assertDatabaseHas('student_class_audit_logs', [
            'student_id' => $this->student->id,
            'from_class_id' => $this->class10->id,
            'to_class_id' => $this->class10B->id,
            'action' => 'individual_edit',
        ]);

        // Student grade_level updated
        $this->assertEquals('X MIPA 2', $this->student->fresh()->grade_level);
    }

    public function test_admin_can_preview_batch_promotion_with_readiness_checks(): void
    {
        $response = $this->actingAs($this->admin)->postJson('/admin/students/batch-promote/preview', [
            'from_class_id' => $this->class10->id,
            'to_class_id' => $this->class11->id,
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'total_found' => 1,
            'ready_count' => 1,
            'skip_count' => 0,
        ]);
    }

    public function test_admin_can_execute_batch_promotion_atomically(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/students/batch-promote', [
            'from_class_id' => $this->class10->id,
            'to_class_id' => $this->class11->id,
            'student_ids' => [$this->student->id],
            'notes' => 'Kenaikan kelas tahun ajaran 2026/2027.',
        ]);

        $response->assertRedirect('/admin/students');

        // Check old enrollment marked completed
        $this->assertDatabaseHas('student_class_enrollments', [
            'student_id' => $this->student->id,
            'class_id' => $this->class10->id,
            'status' => 'completed',
        ]);

        // Check new active enrollment
        $this->assertDatabaseHas('student_class_enrollments', [
            'student_id' => $this->student->id,
            'class_id' => $this->class11->id,
            'status' => 'active',
        ]);

        // Audit log created
        $this->assertDatabaseHas('student_class_audit_logs', [
            'student_id' => $this->student->id,
            'from_class_id' => $this->class10->id,
            'to_class_id' => $this->class11->id,
            'action' => 'promoted',
        ]);

        // Pivot updated
        $this->assertTrue($this->class11->students()->where('students.id', $this->student->id)->exists());
    }

    public function test_admin_can_execute_batch_transfer_atomically(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/students/batch-transfer', [
            'from_class_id' => $this->class10->id,
            'to_class_id' => $this->class10B->id,
            'student_ids' => [$this->student->id],
            'notes' => 'Pindah rombel belajar.',
        ]);

        $response->assertRedirect('/admin/students');

        $this->assertDatabaseHas('student_class_enrollments', [
            'student_id' => $this->student->id,
            'class_id' => $this->class10->id,
            'status' => 'transferred',
        ]);

        $this->assertDatabaseHas('student_class_enrollments', [
            'student_id' => $this->student->id,
            'class_id' => $this->class10B->id,
            'status' => 'active',
        ]);

        $this->assertDatabaseHas('student_class_audit_logs', [
            'student_id' => $this->student->id,
            'action' => 'transferred',
        ]);
    }

    public function test_non_admin_cannot_execute_batch_promotion_or_transfer(): void
    {
        // Teacher forbidden
        $this->actingAs($this->teacherUser)->post('/admin/students/batch-promote', [
            'from_class_id' => $this->class10->id,
            'to_class_id' => $this->class11->id,
            'student_ids' => [$this->student->id],
        ])->assertForbidden();

        // Student forbidden
        $this->actingAs($this->studentUser)->post('/admin/students/batch-promote', [
            'from_class_id' => $this->class10->id,
            'to_class_id' => $this->class11->id,
            'student_ids' => [$this->student->id],
        ])->assertForbidden();

        // Parent forbidden
        $this->actingAs($this->parentUser)->post('/admin/students/batch-transfer', [
            'from_class_id' => $this->class10->id,
            'to_class_id' => $this->class10B->id,
            'student_ids' => [$this->student->id],
        ])->assertForbidden();
    }

    public function test_parent_relation_remains_intact_after_student_promotion(): void
    {
        $service = app(StudentClassService::class);
        $service->promoteStudents(
            fromClassId: $this->class10->id,
            toClassId: $this->class11->id,
            studentIds: [$this->student->id],
            performedBy: $this->admin->id
        );

        // Parent is still connected to the same student
        $this->assertEquals($this->parentProfile->id, $this->student->fresh()->parent_id);
    }

    public function test_attendance_internal_provider_returns_summary(): void
    {
        StudentAttendance::create([
            'student_id' => $this->student->id,
            'class_id' => $this->class10->id,
            'date' => now()->toDateString(),
            'status' => 'present',
            'source' => 'manual',
            'recorded_by' => $this->admin->id,
        ]);

        $provider = new InternalAttendanceProvider;
        $summary = $provider->getAttendanceSummary(Carbon::now());

        $this->assertEquals(1, $summary['total']);
        $this->assertEquals(1, $summary['present']);
        $this->assertEquals('100%', $summary['attendance_rate']);
    }

    public function test_attendance_external_provider_handles_unconfigured_gracefully(): void
    {
        // Set empty config
        config(['services.attendance_api.base_url' => '']);
        config(['services.attendance_api.api_key' => '']);

        $provider = new ExternalAttendanceProvider;
        $this->assertFalse($provider->isConfigured());

        $result = $provider->syncAttendance(Carbon::now());
        $this->assertEquals('unconfigured', $result['status']);
    }

    public function test_attendance_sync_service_is_idempotent(): void
    {
        $syncService = app(AttendanceSyncService::class);

        $payload = [
            [
                'nisn' => '0051234567',
                'status' => 'present',
                'check_in' => '07:10',
                'check_out' => '15:20',
                'external_id' => 'EXT-1001',
                'notes' => 'Tepat waktu',
            ],
        ];

        // 1st sync
        $result1 = $syncService->processRecords($payload, Carbon::now());
        $this->assertEquals(1, $result1['synced']);
        $this->assertEquals(1, StudentAttendance::count());

        // 2nd sync on same date (Idempotent update)
        $result2 = $syncService->processRecords($payload, Carbon::now());
        $this->assertEquals(1, $result2['synced']);
        $this->assertEquals(1, StudentAttendance::count()); // Still 1 record, not duplicated!

        $att = StudentAttendance::first();
        $this->assertEquals('external_api', $att->source);
        $this->assertEquals('EXT-1001', $att->external_id);
    }

    public function test_admin_can_record_manual_attendance(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/attendances', [
            'student_id' => $this->student->id,
            'date' => now()->toDateString(),
            'status' => 'permission',
            'check_in' => '08:00',
            'check_out' => '12:00',
            'notes' => 'Dispensasi mengikuti olimpiade sains.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('student_attendances', [
            'student_id' => $this->student->id,
            'status' => 'permission',
            'notes' => 'Dispensasi mengikuti olimpiade sains.',
            'source' => 'manual',
        ]);
    }
}
