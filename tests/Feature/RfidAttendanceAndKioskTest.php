<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\AttendanceLog;
use App\Models\ClassModel;
use App\Models\Student;
use App\Models\StudentCache;
use App\Models\SystemSetting;
use App\Models\User;
use App\Services\Rfid\UsbKeyboardRfidReader;
use App\Services\Sync\StudentSyncService;
use Carbon\Carbon;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RfidAttendanceAndKioskTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;

    protected Student $student1;

    protected Student $student2;

    protected ClassModel $class10;

    protected AcademicYear $academicYear;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleAndPermissionSeeder::class);

        $this->adminUser = User::create([
            'name' => 'Admin Kiosk',
            'email' => 'admin_kiosk@schid.test',
            'password' => Hash::make('password'),
        ]);
        $this->adminUser->assignRole('admin');

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

        // Student 1
        $user1 = User::create([
            'name' => 'Agus Heryana',
            'email' => 'agus@schid.test',
            'password' => Hash::make('password'),
        ]);
        $user1->assignRole('student');

        $this->student1 = Student::create([
            'user_id' => $user1->id,
            'nis' => '20260001',
            'nisn' => '0012345678',
            'gender' => 'L',
            'grade_level' => 'X MIPA 1',
        ]);
        $this->student1->classes()->attach($this->class10->id);

        // Student 2
        $user2 = User::create([
            'name' => 'Budi Santoso',
            'email' => 'budi@schid.test',
            'password' => Hash::make('password'),
        ]);
        $user2->assignRole('student');

        $this->student2 = Student::create([
            'user_id' => $user2->id,
            'nis' => '20260002',
            'nisn' => '0012345679',
            'gender' => 'L',
            'grade_level' => 'X MIPA 1',
        ]);
        $this->student2->classes()->attach($this->class10->id);
    }

    public function test_keyboard_wedge_rfid_reader_normalizes_uid(): void
    {
        $reader = new UsbKeyboardRfidReader;

        $this->assertEquals('04A1B2C3D4', $reader->normalizeUid('  04a1b2c3d4  '));
        $this->assertEquals('E2801160', $reader->normalizeUid("e2-80:11-60\r\n"));
        $this->assertTrue($reader->validateUid('04A1B2C3D4'));
        $this->assertFalse($reader->validateUid('12')); // Too short
    }

    public function test_admin_can_assign_rfid_to_student(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->post("/admin/students/{$this->student1->id}/assign-rfid", [
                'rfid_uid' => '04A1B2C3D4',
                'notes' => 'Kartu RFID Pembagian Pertama',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->student1->refresh();
        $this->assertEquals('04A1B2C3D4', $this->student1->rfid_uid);
        $this->assertCount(1, $this->student1->rfidCards);
        $this->assertTrue($this->student1->activeRfidCard->is_active);

        // Verify local cache is also populated
        $cached = StudentCache::where('school_student_id', $this->student1->id)->first();
        $this->assertNotNull($cached);
        $this->assertEquals('04A1B2C3D4', $cached->rfid_uid);
    }

    public function test_assign_rfid_rejects_duplicate_uid_used_by_another_student(): void
    {
        // Assign to Student 1
        $this->student1->update(['rfid_uid' => '04A1B2C3D4']);

        // Try assigning the same UID to Student 2
        $response = $this->actingAs($this->adminUser)
            ->post("/admin/students/{$this->student2->id}/assign-rfid", [
                'rfid_uid' => '04A1B2C3D4',
            ]);

        $response->assertSessionHas('error');

        $this->student2->refresh();
        $this->assertNull($this->student2->rfid_uid);
    }

    public function test_admin_can_replace_and_remove_rfid_card(): void
    {
        $this->student1->update(['rfid_uid' => '04A1B2C3D4']);
        $this->student1->rfidCards()->create([
            'rfid_uid' => '04A1B2C3D4',
            'is_active' => true,
        ]);

        // Replace card
        $replaceResponse = $this->actingAs($this->adminUser)
            ->post("/admin/students/{$this->student1->id}/replace-rfid", [
                'new_rfid_uid' => '04F5E6A7B8',
                'reason' => 'Kartu lama hilang',
            ]);

        $replaceResponse->assertSessionHas('success');
        $this->student1->refresh();
        $this->assertEquals('04F5E6A7B8', $this->student1->rfid_uid);

        // Remove card
        $removeResponse = $this->actingAs($this->adminUser)
            ->post("/admin/students/{$this->student1->id}/remove-rfid");

        $removeResponse->assertSessionHas('success');
        $this->student1->refresh();
        $this->assertNull($this->student1->rfid_uid);
    }

    public function test_kiosk_scan_recognizes_student_and_records_present_status(): void
    {
        $this->student1->update(['rfid_uid' => '04A1B2C3D4']);

        // Set attendance timing rules
        SystemSetting::set('attendance_start_time', '07:00');
        SystemSetting::set('attendance_late_threshold', '07:15');

        // Travel to 07:05 (before threshold -> Present)
        Carbon::setTestNow(Carbon::parse('2026-08-17 07:05:00', 'Asia/Jakarta'));

        $response = $this->postJson('/attendance/scan', [
            'rfid_uid' => '04a1b2c3d4',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'type' => 'success',
            'student_name' => 'Agus Heryana',
            'status' => 'present',
        ]);

        $this->assertDatabaseHas('attendance_logs', [
            'school_student_id' => $this->student1->id,
            'status' => 'present',
            'rfid_uid' => '04A1B2C3D4',
        ]);
    }

    public function test_kiosk_scan_records_late_status_after_threshold(): void
    {
        $this->student1->update(['rfid_uid' => '04A1B2C3D4']);
        SystemSetting::set('attendance_late_threshold', '07:15');

        // Travel to 07:25 (after threshold -> Late)
        Carbon::setTestNow(Carbon::parse('2026-08-17 07:25:00', 'Asia/Jakarta'));

        $response = $this->postJson('/attendance/scan', [
            'rfid_uid' => '04A1B2C3D4',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'type' => 'success',
            'status' => 'late',
            'status_label' => 'Terlambat',
        ]);

        $this->assertDatabaseHas('attendance_logs', [
            'school_student_id' => $this->student1->id,
            'status' => 'late',
            'rfid_uid' => '04A1B2C3D4',
        ]);
    }

    public function test_kiosk_scan_prevents_double_attendance_on_same_day(): void
    {
        $this->student1->update(['rfid_uid' => '04A1B2C3D4']);
        Carbon::setTestNow(Carbon::parse('2026-08-17 07:05:00', 'Asia/Jakarta'));

        // First scan
        $this->postJson('/attendance/scan', ['rfid_uid' => '04A1B2C3D4'])->assertJson(['type' => 'success']);

        // Second scan 3 seconds later
        Carbon::setTestNow(Carbon::parse('2026-08-17 07:05:03', 'Asia/Jakarta'));
        $response = $this->postJson('/attendance/scan', ['rfid_uid' => '04A1B2C3D4']);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'type' => 'already_attended',
            'student_name' => 'Agus Heryana',
        ]);

        // Total logs must remain 1
        $this->assertEquals(1, AttendanceLog::where('school_student_id', $this->student1->id)->count());
    }

    public function test_kiosk_scan_rejects_unregistered_rfid(): void
    {
        $response = $this->postJson('/attendance/scan', [
            'rfid_uid' => 'A1B2C3D499',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => false,
            'type' => 'not_registered',
        ]);
    }

    public function test_student_roster_sync_populates_local_cache(): void
    {
        $this->student1->update(['rfid_uid' => '04A1B2C3D4']);
        $this->student2->update(['rfid_uid' => '04F5E6A7B8']);

        $syncService = new StudentSyncService;
        $result = $syncService->sync();

        $this->assertTrue($result['success']);
        $this->assertEquals(2, $result['total_synced']);
        $this->assertDatabaseCount('students_cache', 2);
        $this->assertDatabaseHas('students_cache', ['rfid_uid' => '04A1B2C3D4']);
    }

    public function test_attendance_status_endpoint_returns_health_metrics(): void
    {
        $response = $this->getJson('/attendance/status');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'supabase_online',
            'reader_connected',
            'pending_sync',
            'total_today',
            'timestamp',
        ]);
    }

    public function test_kiosk_pages_render_without_errors(): void
    {
        $this->get('/attendance')->assertStatus(200);
        $this->get('/attendance/dashboard')->assertStatus(200);
        $this->get('/attendance/settings')->assertStatus(200);
    }
}
