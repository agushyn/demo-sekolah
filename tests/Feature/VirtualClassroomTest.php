<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\ClassModel;
use App\Models\ClassTeacher;
use App\Models\Lesson;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class VirtualClassroomTest extends TestCase
{
    use RefreshDatabase;

    protected User $teacherUser;

    protected Teacher $teacher;

    protected User $otherTeacherUser;

    protected Teacher $otherTeacher;

    protected User $studentUser;

    protected Student $student;

    protected User $otherStudentUser;

    protected Student $otherStudent;

    protected AcademicYear $academicYear;

    protected Subject $subject;

    protected ClassModel $class10;

    protected ClassModel $class11;

    protected ClassTeacher $course1;

    protected ClassTeacher $otherCourse;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleAndPermissionSeeder::class);

        // Academic Year
        $this->academicYear = AcademicYear::create([
            'name' => '2026/2027',
            'semester' => 'Ganjil',
            'start_date' => '2026-07-15',
            'end_date' => '2026-12-20',
            'is_active' => true,
        ]);

        // Teacher 1
        $this->teacherUser = User::create([
            'name' => 'Guru Utama',
            'email' => 'guru.utama@schid.test',
            'password' => Hash::make('password'),
        ]);
        $this->teacherUser->assignRole('teacher');
        $this->teacher = Teacher::create([
            'user_id' => $this->teacherUser->id,
            'nip' => '198501012010011001',
            'specialization' => 'Informatika',
        ]);

        // Teacher 2 (Other)
        $this->otherTeacherUser = User::create([
            'name' => 'Guru Lain',
            'email' => 'guru.lain@schid.test',
            'password' => Hash::make('password'),
        ]);
        $this->otherTeacherUser->assignRole('teacher');
        $this->otherTeacher = Teacher::create([
            'user_id' => $this->otherTeacherUser->id,
            'nip' => '198602022011022002',
            'specialization' => 'Biologi',
        ]);

        // Student 1
        $this->studentUser = User::create([
            'name' => 'Siswa Utama',
            'email' => 'siswa.utama@schid.test',
            'password' => Hash::make('password'),
        ]);
        $this->studentUser->assignRole('student');
        $this->student = Student::create([
            'user_id' => $this->studentUser->id,
            'nisn' => '0091112222',
            'grade_level' => '10',
        ]);

        // Student 2 (Other)
        $this->otherStudentUser = User::create([
            'name' => 'Siswa Lain',
            'email' => 'siswa.lain@schid.test',
            'password' => Hash::make('password'),
        ]);
        $this->otherStudentUser->assignRole('student');
        $this->otherStudent = Student::create([
            'user_id' => $this->otherStudentUser->id,
            'nisn' => '0093334444',
            'grade_level' => '11',
        ]);

        // Subject
        $this->subject = Subject::create([
            'code' => 'INF-10',
            'name' => 'Informatika Dasar',
        ]);

        // Class 10 (Teacher 1 & Student 1)
        $this->class10 = ClassModel::create([
            'academic_year_id' => $this->academicYear->id,
            'name' => 'X MIPA 1',
            'grade_level' => '10',
            'homeroom_teacher_id' => $this->teacher->id,
        ]);
        $this->class10->students()->sync([$this->student->id]);

        // Class 11 (Teacher 2 & Student 2)
        $this->class11 = ClassModel::create([
            'academic_year_id' => $this->academicYear->id,
            'name' => 'XI MIPA 1',
            'grade_level' => '11',
            'homeroom_teacher_id' => $this->otherTeacher->id,
        ]);
        $this->class11->students()->sync([$this->otherStudent->id]);

        // Course 1 (Teacher 1 teaches INF in Class 10)
        $this->course1 = ClassTeacher::create([
            'class_id' => $this->class10->id,
            'teacher_id' => $this->teacher->id,
            'subject_id' => $this->subject->id,
        ]);

        // Other Course (Teacher 2 teaches INF in Class 11)
        $this->otherCourse = ClassTeacher::create([
            'class_id' => $this->class11->id,
            'teacher_id' => $this->otherTeacher->id,
            'subject_id' => $this->subject->id,
        ]);
    }

    /**
     * 1. Teacher can view their assigned classes.
     */
    public function test_teacher_can_view_their_assigned_classes(): void
    {
        $response = $this->actingAs($this->teacherUser)->get('/guru/kelas');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Teacher/Classes/Index')
            ->has('courses', 1)
        );
    }

    /**
     * 2. Teacher cannot view or manage other teacher's class.
     */
    public function test_teacher_cannot_view_or_manage_other_teachers_class(): void
    {
        $response = $this->actingAs($this->teacherUser)->get("/guru/kelas/{$this->class11->id}");

        $response->assertStatus(403);
    }

    /**
     * 3. Teacher can create lesson and upload file.
     */
    public function test_teacher_can_create_lesson_and_upload_file(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->create('modul_algoritma.pdf', 500, 'application/pdf');

        $response = $this->actingAs($this->teacherUser)->post('/guru/materi', [
            'class_teacher_id' => $this->course1->id,
            'title' => 'Pengenalan Algoritma',
            'content' => 'Materi dasar pemrograman algoritma.',
            'video_url' => 'https://www.youtube.com/watch?v=12345678901',
            'is_published' => true,
            'file' => $file,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('lessons', [
            'class_teacher_id' => $this->course1->id,
            'title' => 'Pengenalan Algoritma',
            'is_published' => true,
        ]);

        $this->assertDatabaseHas('lesson_files', [
            'original_name' => 'modul_algoritma.pdf',
        ]);
    }

    /**
     * 4. Teacher can create assignment with deadline.
     */
    public function test_teacher_can_create_assignment(): void
    {
        $response = $this->actingAs($this->teacherUser)->post('/guru/tugas', [
            'class_teacher_id' => $this->course1->id,
            'title' => 'Tugas Flowchart 01',
            'description' => 'Kerjakan diagram alir sistem kasir.',
            'deadline' => now()->addDays(5)->format('Y-m-d H:i:s'),
            'allow_late_submission' => true,
            'max_score' => 100,
            'status' => 'published',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('assignments', [
            'class_teacher_id' => $this->course1->id,
            'title' => 'Tugas Flowchart 01',
            'allow_late_submission' => true,
        ]);
    }

    /**
     * 5. Teacher can grade student submission with score and feedback.
     */
    public function test_teacher_can_grade_student_submission_with_score_and_feedback(): void
    {
        $assignment = Assignment::create([
            'class_teacher_id' => $this->course1->id,
            'title' => 'Tugas Praktik Matriks',
            'description' => 'Hitung determinan matriks.',
            'deadline' => now()->addDays(2),
            'max_score' => 100,
            'status' => 'published',
        ]);

        $submission = AssignmentSubmission::create([
            'assignment_id' => $assignment->id,
            'student_id' => $this->student->id,
            'file_path' => 'submissions/sample.pdf',
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        $response = $this->actingAs($this->teacherUser)->post("/guru/pengumpulan/{$submission->id}/grade", [
            'score' => 95.5,
            'feedback' => 'Analisis sangat cermat dan rapi.',
        ]);

        $response->assertRedirect();

        $submission->refresh();
        $this->assertEquals(95.5, $submission->score);
        $this->assertEquals('Analisis sangat cermat dan rapi.', $submission->feedback);
        $this->assertEquals('graded', $submission->status);
        $this->assertEquals($this->teacherUser->id, $submission->graded_by);
    }

    /**
     * 6. Student can view enrolled classes.
     */
    public function test_student_can_view_enrolled_classes(): void
    {
        $response = $this->actingAs($this->studentUser)->get('/kelas');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Student/Classes/Index')
            ->has('classes', 1)
        );
    }

    /**
     * 7. Student cannot view unenrolled class.
     */
    public function test_student_cannot_view_unenrolled_class(): void
    {
        $response = $this->actingAs($this->studentUser)->get("/kelas/{$this->class11->id}");

        $response->assertStatus(403);
    }

    /**
     * 8. Student can view lesson in enrolled class.
     */
    public function test_student_can_view_lesson_in_enrolled_class(): void
    {
        $lesson = Lesson::create([
            'class_teacher_id' => $this->course1->id,
            'title' => 'Pengenalan Python',
            'content' => 'Materi sintaks python.',
            'is_published' => true,
            'published_at' => now(),
        ]);

        $response = $this->actingAs($this->studentUser)->get("/materi/{$lesson->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Student/Lessons/Show')
            ->where('lesson.title', 'Pengenalan Python')
        );
    }

    /**
     * 9. Student cannot view lesson of unenrolled class.
     */
    public function test_student_cannot_view_lesson_of_unenrolled_class(): void
    {
        $otherLesson = Lesson::create([
            'class_teacher_id' => $this->otherCourse->id,
            'title' => 'Materi Rahasia Kelas XI',
            'content' => 'Rahasia.',
            'is_published' => true,
            'published_at' => now(),
        ]);

        $response = $this->actingAs($this->studentUser)->get("/materi/{$otherLesson->id}");

        $response->assertStatus(403);
    }

    /**
     * 10. Student can submit assignment before deadline.
     */
    public function test_student_can_submit_assignment_before_deadline(): void
    {
        Storage::fake('local');

        $assignment = Assignment::create([
            'class_teacher_id' => $this->course1->id,
            'title' => 'Tugas Tepat Waktu',
            'description' => 'Kumpulkan sebelum lusa.',
            'deadline' => now()->addDays(2),
            'allow_late_submission' => false,
            'status' => 'published',
        ]);

        $file = UploadedFile::fake()->create('jawaban_siswa.pdf', 300, 'application/pdf');

        $response = $this->actingAs($this->studentUser)->post("/tugas/{$assignment->id}/submit", [
            'file' => $file,
            'notes' => 'Berikut jawaban saya.',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('assignment_submissions', [
            'assignment_id' => $assignment->id,
            'student_id' => $this->student->id,
            'status' => 'submitted',
        ]);
    }

    /**
     * 11. Student cannot submit after deadline when late submission is disabled.
     */
    public function test_student_cannot_submit_after_deadline_when_late_submission_is_disabled(): void
    {
        Storage::fake('local');

        $assignment = Assignment::create([
            'class_teacher_id' => $this->course1->id,
            'title' => 'Tugas Deadline Ketat',
            'description' => 'Tidak boleh telat.',
            'deadline' => now()->subDay(),
            'allow_late_submission' => false,
            'status' => 'published',
        ]);

        $file = UploadedFile::fake()->create('jawaban_terlambat.pdf', 300, 'application/pdf');

        $response = $this->actingAs($this->studentUser)->post("/tugas/{$assignment->id}/submit", [
            'file' => $file,
        ]);

        $response->assertSessionHasErrors(['file']);
        $this->assertDatabaseMissing('assignment_submissions', [
            'assignment_id' => $assignment->id,
            'student_id' => $this->student->id,
        ]);
    }

    /**
     * 12. Student can submit late when allowed with late status.
     */
    public function test_student_can_submit_late_when_allowed_with_late_status(): void
    {
        Storage::fake('local');

        $assignment = Assignment::create([
            'class_teacher_id' => $this->course1->id,
            'title' => 'Tugas Boleh Terlambat',
            'description' => 'Boleh terlambat.',
            'deadline' => now()->subHours(2),
            'allow_late_submission' => true,
            'status' => 'published',
        ]);

        $file = UploadedFile::fake()->create('jawaban_telat.pdf', 300, 'application/pdf');

        $response = $this->actingAs($this->studentUser)->post("/tugas/{$assignment->id}/submit", [
            'file' => $file,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('assignment_submissions', [
            'assignment_id' => $assignment->id,
            'student_id' => $this->student->id,
            'status' => 'late',
        ]);
    }

    /**
     * 13. Student cannot download other student's submission.
     */
    public function test_student_cannot_download_other_students_submission(): void
    {
        Storage::fake('local');
        $file = UploadedFile::fake()->create('jawaban_privat_siswa2.pdf', 200, 'application/pdf');
        $path = $file->store('submissions/1/2', 'local');

        $assignment = Assignment::create([
            'class_teacher_id' => $this->otherCourse->id,
            'title' => 'Tugas Kelas 11',
            'description' => 'Tugas.',
            'deadline' => now()->addDays(2),
            'status' => 'published',
        ]);

        $otherSubmission = AssignmentSubmission::create([
            'assignment_id' => $assignment->id,
            'student_id' => $this->otherStudent->id,
            'file_path' => $path,
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        // Student 1 attempts to download Student 2's submission -> 403 Forbidden!
        $response = $this->actingAs($this->studentUser)->get("/tugas/submissions/{$otherSubmission->id}/download");

        $response->assertStatus(403);
    }

    /**
     * 14. Unauthorized role access to classroom routes blocked.
     */
    public function test_unauthorized_role_access_blocked(): void
    {
        // Student tries to access Teacher classes route -> 403 Forbidden
        $response1 = $this->actingAs($this->studentUser)->get('/guru/kelas');
        $response1->assertStatus(403);

        // Teacher tries to access Student classes route -> 403 Forbidden
        $response2 = $this->actingAs($this->teacherUser)->get('/kelas');
        $response2->assertStatus(403);
    }
}
