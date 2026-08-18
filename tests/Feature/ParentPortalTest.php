<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\ClassModel;
use App\Models\ClassTeacher;
use App\Models\ParentProfile;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ParentPortalTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $teacherUser;

    protected User $parentUser;

    protected User $studentUser;

    protected ParentProfile $parentProfile;

    protected Student $student;

    protected ClassModel $class;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleAndPermissionSeeder::class);

        // 1. Admin
        $this->admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'password' => Hash::make('password'),
        ]);
        $this->admin->assignRole('admin');

        // 2. Teacher
        $this->teacherUser = User::create([
            'name' => 'Guru Pengampu',
            'email' => 'teacher@test.com',
            'password' => Hash::make('password'),
        ]);
        $this->teacherUser->assignRole('teacher');
        $teacher = Teacher::create([
            'user_id' => $this->teacherUser->id,
            'nip' => '198501012010011001',
            'title' => 'Guru Informatika',
        ]);

        // 3. Parent
        $this->parentUser = User::create([
            'name' => 'Hendra Wijaya',
            'email' => 'parent@test.com',
            'password' => Hash::make('password'),
        ]);
        $this->parentUser->assignRole('parent');
        $this->parentProfile = ParentProfile::create([
            'user_id' => $this->parentUser->id,
            'relationship_type' => 'Ayah',
            'phone' => '08123456789',
        ]);

        // 4. Student
        $this->studentUser = User::create([
            'name' => 'Aditya Pratama',
            'email' => 'aditya@test.com',
            'password' => Hash::make('password'),
        ]);
        $this->studentUser->assignRole('student');
        $this->student = Student::create([
            'user_id' => $this->studentUser->id,
            'parent_id' => $this->parentProfile->id,
            'nisn' => '0051234567',
            'nis' => '20261001',
            'grade_level' => 'XI-IPA 1',
        ]);

        // 5. Class & Subject
        $academicYear = AcademicYear::create([
            'name' => '2026/2027',
            'semester' => 'Ganjil',
            'start_date' => '2026-07-15',
            'end_date' => '2026-12-20',
            'is_active' => true,
        ]);

        $this->class = ClassModel::create([
            'academic_year_id' => $academicYear->id,
            'name' => 'XI MIPA 1',
            'grade_level' => '11',
            'homeroom_teacher_id' => $teacher->id,
        ]);

        $this->class->students()->attach($this->student->id);

        $subject = Subject::create([
            'code' => 'INF-11',
            'name' => 'Informatika',
        ]);

        $classTeacher = ClassTeacher::create([
            'class_id' => $this->class->id,
            'teacher_id' => $teacher->id,
            'subject_id' => $subject->id,
        ]);

        // 6. Assignment & Graded Submission
        $assignment = Assignment::create([
            'class_teacher_id' => $classTeacher->id,
            'title' => 'Tugas Algoritma',
            'deadline' => now()->addDays(5),
            'max_score' => 100,
            'status' => 'published',
        ]);

        AssignmentSubmission::create([
            'assignment_id' => $assignment->id,
            'student_id' => $this->student->id,
            'status' => 'graded',
            'score' => 95.0,
            'feedback' => 'Hasil pengerjaan sangat memuaskan.',
            'graded_by' => $this->teacherUser->id,
            'graded_at' => now(),
            'submitted_at' => now()->subDay(),
        ]);

        // 7. Attendance
        StudentAttendance::create([
            'student_id' => $this->student->id,
            'class_id' => $this->class->id,
            'date' => now()->format('Y-m-d'),
            'status' => 'present',
            'recorded_by' => $this->admin->id,
        ]);
    }

    public function test_admin_can_view_students_list_with_parent_status(): void
    {
        $response = $this->actingAs($this->admin)->get('/admin/students');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Students/Index')
            ->has('students.data', 1)
            ->where('students.data.0.nisn', '0051234567')
            ->where('students.data.0.parent.user.name', 'Hendra Wijaya')
            ->where('stats.linked', 1)
            ->where('stats.unlinked', 0)
        );
    }

    public function test_admin_can_link_and_unlink_parent_to_student(): void
    {
        // Unlink parent
        $response = $this->actingAs($this->admin)
            ->post("/admin/students/{$this->student->id}/link-parent", [
                'parent_id' => null,
            ]);

        $response->assertRedirect();
        $this->assertNull($this->student->fresh()->parent_id);

        // Link back to parent
        $response = $this->actingAs($this->admin)
            ->post("/admin/students/{$this->student->id}/link-parent", [
                'parent_id' => $this->parentProfile->id,
            ]);

        $response->assertRedirect();
        $this->assertEquals($this->parentProfile->id, $this->student->fresh()->parent_id);
    }

    public function test_admin_can_record_student_attendance(): void
    {
        $response = $this->actingAs($this->admin)
            ->post("/admin/students/{$this->student->id}/attendance", [
                'date' => now()->subDays(2)->format('Y-m-d'),
                'status' => 'permission',
                'notes' => 'Izin lomba sains',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('student_attendances', [
            'student_id' => $this->student->id,
            'status' => 'permission',
            'notes' => 'Izin lomba sains',
        ]);
    }

    public function test_admin_can_create_parent_account_and_link_to_students(): void
    {
        $student2User = User::create([
            'name' => 'Citra Lestari',
            'email' => 'citra@test.com',
            'password' => Hash::make('password'),
        ]);
        $student2 = Student::create([
            'user_id' => $student2User->id,
            'nisn' => '0051234568',
            'nis' => '20261002',
        ]);

        $response = $this->actingAs($this->admin)->post('/admin/parents', [
            'name' => 'Dewi Lestari',
            'email' => 'dewi.lestari@test.com',
            'password' => 'password123',
            'relationship_type' => 'Ibu',
            'phone' => '081298765432',
            'nik' => '3171098765430001',
            'occupation' => 'Arsitek',
            'student_ids' => [$student2->id],
        ]);

        $response->assertRedirect('/admin/parents');

        $this->assertDatabaseHas('users', [
            'email' => 'dewi.lestari@test.com',
            'name' => 'Dewi Lestari',
        ]);

        $newParent = ParentProfile::where('phone', '081298765432')->first();
        $this->assertNotNull($newParent);
        $this->assertEquals($newParent->id, $student2->fresh()->parent_id);
    }

    public function test_admin_can_edit_parent_account_and_sync_students(): void
    {
        $response = $this->actingAs($this->admin)->put("/admin/parents/{$this->parentProfile->id}", [
            'name' => 'Hendra Wijaya, S.E., M.M.',
            'email' => 'parent@test.com',
            'relationship_type' => 'Ayah',
            'phone' => '081233334444',
            'student_ids' => [$this->student->id],
        ]);

        $response->assertRedirect('/admin/parents');
        $this->assertEquals('Hendra Wijaya, S.E., M.M.', $this->parentUser->fresh()->name);
        $this->assertEquals('081233334444', $this->parentProfile->fresh()->phone);
    }

    public function test_admin_can_delete_parent_account(): void
    {
        $response = $this->actingAs($this->admin)->delete("/admin/parents/{$this->parentProfile->id}");

        $response->assertRedirect('/admin/parents');
        $this->assertDatabaseMissing('parents', ['id' => $this->parentProfile->id]);
        $this->assertDatabaseMissing('users', ['id' => $this->parentUser->id]);
        $this->assertNull($this->student->fresh()->parent_id);
    }

    public function test_parent_can_view_dashboard_with_all_child_modules(): void
    {
        $response = $this->actingAs($this->parentUser)->get('/parent/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Parent/index')
            ->has('childrenList', 1)
            ->where('selectedChild.name', 'Aditya Pratama')
            ->where('selectedChild.nisn', '0051234567')
            ->where('selectedChild.stats.average_score', 95)
            ->has('selectedChild.grades', 1)
            ->has('selectedChild.assignments', 1)
            ->has('selectedChild.recent_attendances', 1)
            ->has('schoolInfo.name')
        );
    }

    public function test_parent_can_switch_between_multiple_children(): void
    {
        $child2User = User::create([
            'name' => 'Nabila Putri Wijaya',
            'email' => 'nabila@test.com',
            'password' => Hash::make('password'),
        ]);
        $child2 = Student::create([
            'user_id' => $child2User->id,
            'parent_id' => $this->parentProfile->id,
            'nisn' => '0051234570',
            'nis' => '20261004',
        ]);

        $response = $this->actingAs($this->parentUser)->get("/parent/dashboard?child_id={$child2->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Parent/index')
            ->has('childrenList', 2)
            ->where('selectedChild.id', $child2->id)
            ->where('selectedChild.name', 'Nabila Putri Wijaya')
        );
    }

    public function test_parent_without_children_sees_empty_notice(): void
    {
        $newParentUser = User::create([
            'name' => 'Parent Tanpa Anak',
            'email' => 'empty.parent@test.com',
            'password' => Hash::make('password'),
        ]);
        $newParentUser->assignRole('parent');
        ParentProfile::create([
            'user_id' => $newParentUser->id,
            'relationship_type' => 'Wali',
        ]);

        $response = $this->actingAs($newParentUser)->get('/parent/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Parent/index')
            ->has('childrenList', 0)
            ->where('selectedChild', null)
        );
    }

    public function test_unauthorized_users_cannot_access_parent_dashboard_or_admin_crud(): void
    {
        // Student cannot access parent dashboard
        $this->actingAs($this->studentUser)->get('/parent/dashboard')->assertForbidden();

        // Parent cannot access admin student/parent management
        $this->actingAs($this->parentUser)->get('/admin/students')->assertForbidden();
        $this->actingAs($this->parentUser)->get('/admin/parents')->assertForbidden();
        $this->actingAs($this->parentUser)->post('/admin/parents', [])->assertForbidden();
    }
}
