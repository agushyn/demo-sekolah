<?php

namespace Tests\Feature;

use App\Models\AcademicEvent;
use App\Models\AcademicYear;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AcademicCalendarTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;

    protected User $teacherUser;

    protected User $studentUser;

    protected AcademicYear $academicYear;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleAndPermissionSeeder::class);

        $this->adminUser = User::create([
            'name' => 'Admin Kalender',
            'email' => 'admin.kalender@schid.test',
            'password' => Hash::make('password'),
        ]);
        $this->adminUser->assignRole('admin');

        $this->teacherUser = User::create([
            'name' => 'Guru Pengampu',
            'email' => 'teacher.kalender@schid.test',
            'password' => Hash::make('password'),
        ]);
        $this->teacherUser->assignRole('teacher');

        $this->studentUser = User::create([
            'name' => 'Siswa Pelajar',
            'email' => 'student.kalender@schid.test',
            'password' => Hash::make('password'),
        ]);
        $this->studentUser->assignRole('student');

        $this->academicYear = AcademicYear::create([
            'name' => '2026/2027',
            'semester' => 'Ganjil',
            'start_date' => '2026-07-15',
            'end_date' => '2026-12-20',
            'is_active' => true,
        ]);
    }

    public function test_guest_cannot_access_admin_calendar(): void
    {
        $response = $this->get('/admin/calendar');

        $response->assertRedirect('/login');
    }

    public function test_student_and_teacher_cannot_manage_admin_calendar(): void
    {
        $responseStudent = $this->actingAs($this->studentUser)->get('/admin/calendar');
        $responseStudent->assertStatus(403);

        $responseTeacher = $this->actingAs($this->teacherUser)->get('/admin/calendar');
        $responseTeacher->assertStatus(403);
    }

    public function test_admin_can_view_calendar_index_with_bento_stats(): void
    {
        AcademicEvent::create([
            'academic_year_id' => $this->academicYear->id,
            'title' => 'Upacara Bendera',
            'start_date' => '2026-08-17',
            'category' => 'event',
            'is_public' => true,
            'created_by' => $this->adminUser->id,
        ]);

        $response = $this->actingAs($this->adminUser)->get('/admin/calendar');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Calendar/Index')
            ->has('events')
            ->has('stats.total_events')
            ->has('stats.upcoming_count')
            ->has('stats.public_count')
            ->has('stats.internal_count')
            ->has('academicYears')
            ->has('activeYear')
        );
    }

    public function test_admin_can_create_academic_event(): void
    {
        $response = $this->actingAs($this->adminUser)->post('/admin/calendar', [
            'academic_year_id' => $this->academicYear->id,
            'title' => 'Asesmen Sumatif Tengah Semester',
            'description' => 'Evaluasi capaian belajar siswa.',
            'start_date' => '2026-09-15',
            'end_date' => '2026-09-22',
            'start_time' => '07:30',
            'end_time' => '13:00',
            'category' => 'exam',
            'location' => 'Ruang CBT',
            'is_public' => true,
        ]);

        $response->assertRedirect('/admin/calendar');
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('academic_events', [
            'title' => 'Asesmen Sumatif Tengah Semester',
            'start_date' => '2026-09-15',
            'end_date' => '2026-09-22',
            'category' => 'exam',
            'is_public' => 1,
            'created_by' => $this->adminUser->id,
        ]);
    }

    public function test_admin_can_update_academic_event(): void
    {
        $event = AcademicEvent::create([
            'academic_year_id' => $this->academicYear->id,
            'title' => 'Agenda Awal',
            'start_date' => '2026-08-20',
            'category' => 'academic',
            'is_public' => true,
            'created_by' => $this->adminUser->id,
        ]);

        $response = $this->actingAs($this->adminUser)->post("/admin/calendar/{$event->id}", [
            'academic_year_id' => $this->academicYear->id,
            'title' => 'Agenda Diperbarui',
            'start_date' => '2026-08-21',
            'category' => 'meeting',
            'is_public' => false,
        ]);

        $response->assertRedirect('/admin/calendar');
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('academic_events', [
            'id' => $event->id,
            'title' => 'Agenda Diperbarui',
            'start_date' => '2026-08-21',
            'category' => 'meeting',
            'is_public' => 0,
        ]);
    }

    public function test_admin_can_delete_academic_event(): void
    {
        $event = AcademicEvent::create([
            'academic_year_id' => $this->academicYear->id,
            'title' => 'Agenda Hapus',
            'start_date' => '2026-10-01',
            'category' => 'activity',
            'is_public' => true,
            'created_by' => $this->adminUser->id,
        ]);

        $response = $this->actingAs($this->adminUser)->delete("/admin/calendar/{$event->id}");

        $response->assertRedirect('/admin/calendar');
        $this->assertDatabaseMissing('academic_events', ['id' => $event->id]);
    }

    public function test_admin_can_toggle_event_visibility(): void
    {
        $event = AcademicEvent::create([
            'academic_year_id' => $this->academicYear->id,
            'title' => 'Agenda Toggle',
            'start_date' => '2026-10-10',
            'category' => 'academic',
            'is_public' => true,
            'created_by' => $this->adminUser->id,
        ]);

        $response = $this->actingAs($this->adminUser)->post("/admin/calendar/{$event->id}/toggle-visibility");
        $response->assertRedirect();

        $event->refresh();
        $this->assertFalse($event->is_public);
    }

    public function test_date_validation_fails_when_end_date_is_before_start_date(): void
    {
        $response = $this->actingAs($this->adminUser)->post('/admin/calendar', [
            'title' => 'Kegiatan Salah Tanggal',
            'start_date' => '2026-09-10',
            'end_date' => '2026-09-05', // Earlier than start_date
            'category' => 'academic',
        ]);

        $response->assertSessionHasErrors(['end_date']);
    }

    public function test_time_validation_fails_when_end_time_is_before_start_time_on_same_day(): void
    {
        $response = $this->actingAs($this->adminUser)->post('/admin/calendar', [
            'title' => 'Kegiatan Salah Jam',
            'start_date' => '2026-09-10',
            'end_date' => '2026-09-10',
            'start_time' => '14:00',
            'end_time' => '10:00', // Earlier than start_time
            'category' => 'academic',
        ]);

        $response->assertSessionHasErrors(['end_time']);
    }

    public function test_public_only_sees_public_events(): void
    {
        AcademicEvent::create([
            'academic_year_id' => $this->academicYear->id,
            'title' => 'Pentas Seni Siswa Publik',
            'start_date' => '2026-09-01',
            'category' => 'activity',
            'is_public' => true,
            'created_by' => $this->adminUser->id,
        ]);

        AcademicEvent::create([
            'academic_year_id' => $this->academicYear->id,
            'title' => 'Rapat Rahasia Dewan Guru',
            'start_date' => '2026-09-02',
            'category' => 'meeting',
            'is_public' => false,
            'created_by' => $this->adminUser->id,
        ]);

        $response = $this->get('/kalender');

        $response->assertStatus(200);
        $response->assertInertia(function (Assert $page) {
            $page->component('Public/Calendar')
                ->has('events', 1)
                ->where('events.0.title', 'Pentas Seni Siswa Publik');
        });
    }

    public function test_teacher_can_view_teacher_calendar_including_internal_events(): void
    {
        AcademicEvent::create([
            'academic_year_id' => $this->academicYear->id,
            'title' => 'Pentas Seni Siswa',
            'start_date' => '2026-09-01',
            'category' => 'activity',
            'is_public' => true,
            'created_by' => $this->adminUser->id,
        ]);

        AcademicEvent::create([
            'academic_year_id' => $this->academicYear->id,
            'title' => 'Rapat Dinas Dewan Guru',
            'start_date' => '2026-09-02',
            'category' => 'meeting',
            'is_public' => false,
            'created_by' => $this->adminUser->id,
        ]);

        $response = $this->actingAs($this->teacherUser)->get('/guru/kalender');

        $response->assertStatus(200);
        $response->assertInertia(function (Assert $page) {
            $page->component('Teacher/Calendar')
                ->has('events', 2);
        });
    }
}
