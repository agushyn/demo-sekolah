<?php

namespace Tests\Feature;

use App\Models\SchoolStaff;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SchoolStaffTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $teacher;

    protected User $student;

    protected User $parent;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleAndPermissionSeeder::class);

        $this->admin = User::create([
            'name' => 'Admin Guru',
            'email' => 'admin.guru@test.com',
            'password' => Hash::make('password'),
        ]);
        $this->admin->assignRole('admin');

        $this->teacher = User::create([
            'name' => 'Teacher User',
            'email' => 'teacher.user@test.com',
            'password' => Hash::make('password'),
        ]);
        $this->teacher->assignRole('teacher');

        $this->student = User::create([
            'name' => 'Student User',
            'email' => 'student.user@test.com',
            'password' => Hash::make('password'),
        ]);
        $this->student->assignRole('student');

        $this->parent = User::create([
            'name' => 'Parent User',
            'email' => 'parent.user@test.com',
            'password' => Hash::make('password'),
        ]);
        $this->parent->assignRole('parent');
    }

    public function test_admin_can_view_staff_list_with_stats(): void
    {
        SchoolStaff::create([
            'name' => 'Drs. Bambang',
            'position' => 'Kepala Sekolah',
            'category' => 'teacher',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        SchoolStaff::create([
            'name' => 'Agus TU',
            'position' => 'Staf TU',
            'category' => 'staff',
            'sort_order' => 2,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->get('/admin/guru-staff');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Staff/Index')
            ->has('staff.data', 2)
            ->where('stats.total', 2)
            ->where('stats.active_teachers', 1)
            ->where('stats.active_staff', 1)
        );
    }

    public function test_admin_can_create_teacher_with_photo_upload(): void
    {
        Storage::fake('public');

        $photo = UploadedFile::fake()->image('teacher.jpg', 600, 800);

        $response = $this->actingAs($this->admin)->post('/admin/guru-staff', [
            'name' => 'Siti Rahmawati, M.Pd.',
            'employee_number' => '19800101 200501 2 001',
            'position' => 'Guru Matematika',
            'category' => 'teacher',
            'subject' => 'Matematika Peminatan',
            'department' => 'Kurikulum',
            'education' => 'S2 Pendidikan Matematika',
            'bio' => 'Guru matematika berpengalaman 15 tahun.',
            'email' => 'siti@test.com',
            'phone' => '08123456789',
            'sort_order' => 3,
            'is_active' => true,
            'photo' => $photo,
        ]);

        $response->assertRedirect('/admin/guru-staff');
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('school_staff', [
            'name' => 'Siti Rahmawati, M.Pd.',
            'slug' => 'siti-rahmawati-mpd',
            'category' => 'teacher',
            'position' => 'Guru Matematika',
            'subject' => 'Matematika Peminatan',
        ]);

        $staff = SchoolStaff::where('name', 'Siti Rahmawati, M.Pd.')->first();
        $this->assertNotNull($staff->photo);
        Storage::disk('public')->assertExists($staff->photo);
    }

    public function test_admin_can_create_staff_with_photo_upload(): void
    {
        Storage::fake('public');

        $photo = UploadedFile::fake()->image('staff.png', 400, 400);

        $response = $this->actingAs($this->admin)->post('/admin/guru-staff', [
            'name' => 'Budi Setiawan',
            'employee_number' => '19900101 201501 1 002',
            'position' => 'Operator IT',
            'category' => 'staff',
            'department' => 'Teknologi Informasi',
            'education' => 'D3 Manajemen Informatika',
            'email' => 'budi@test.com',
            'sort_order' => 8,
            'is_active' => true,
            'photo' => $photo,
        ]);

        $response->assertRedirect('/admin/guru-staff');

        $this->assertDatabaseHas('school_staff', [
            'name' => 'Budi Setiawan',
            'category' => 'staff',
            'position' => 'Operator IT',
        ]);
    }

    public function test_admin_can_edit_staff_and_replace_photo(): void
    {
        Storage::fake('public');

        $oldPhoto = UploadedFile::fake()->image('old.jpg');
        $oldPath = $oldPhoto->store('staff-photos', 'public');

        $member = SchoolStaff::create([
            'name' => 'Ahmad Fauzi',
            'slug' => 'ahmad-fauzi',
            'position' => 'Guru Fisika',
            'category' => 'teacher',
            'sort_order' => 5,
            'photo' => $oldPath,
            'is_active' => true,
        ]);

        $newPhoto = UploadedFile::fake()->image('new.jpg');

        $response = $this->actingAs($this->admin)->post("/admin/guru-staff/{$member->id}", [
            'name' => 'Ahmad Fauzi, M.Kom.',
            'position' => 'Wakil Kepala Sekolah Bidang Kesiswaan',
            'category' => 'teacher',
            'subject' => 'Informatika',
            'sort_order' => 2,
            'is_active' => true,
            'photo' => $newPhoto,
        ]);

        $response->assertRedirect('/admin/guru-staff');

        $member->refresh();
        $this->assertEquals('Ahmad Fauzi, M.Kom.', $member->name);
        $this->assertEquals('Wakil Kepala Sekolah Bidang Kesiswaan', $member->position);
        $this->assertEquals('ahmad-fauzi-mkom', $member->slug);

        // Old file deleted, new file exists
        Storage::disk('public')->assertMissing($oldPath);
        Storage::disk('public')->assertExists($member->photo);
    }

    public function test_admin_can_delete_staff_with_storage_cleanup(): void
    {
        Storage::fake('public');

        $photo = UploadedFile::fake()->image('staff.jpg');
        $path = $photo->store('staff-photos', 'public');

        $member = SchoolStaff::create([
            'name' => 'Staff To Delete',
            'slug' => 'staff-to-delete',
            'position' => 'Staf Kebersihan',
            'category' => 'staff',
            'photo' => $path,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->delete("/admin/guru-staff/{$member->id}");

        $response->assertRedirect('/admin/guru-staff');
        $this->assertDatabaseMissing('school_staff', ['id' => $member->id]);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_admin_can_toggle_active_status(): void
    {
        $member = SchoolStaff::create([
            'name' => 'Guru Active',
            'slug' => 'guru-active',
            'position' => 'Guru',
            'category' => 'teacher',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->post("/admin/guru-staff/{$member->id}/toggle-active");

        $response->assertRedirect();
        $member->refresh();
        $this->assertFalse($member->is_active);

        // Toggle back
        $this->actingAs($this->admin)->post("/admin/guru-staff/{$member->id}/toggle-active");
        $member->refresh();
        $this->assertTrue($member->is_active);
    }

    public function test_admin_can_reorder_staff(): void
    {
        $m1 = SchoolStaff::create(['name' => 'Personil 1', 'slug' => 'p1', 'position' => 'Guru', 'category' => 'teacher', 'sort_order' => 10]);
        $m2 = SchoolStaff::create(['name' => 'Personil 2', 'slug' => 'p2', 'position' => 'Guru', 'category' => 'teacher', 'sort_order' => 20]);

        $response = $this->actingAs($this->admin)->post('/admin/guru-staff/reorder', [
            'items' => [
                ['id' => $m1->id, 'sort_order' => 1],
                ['id' => $m2->id, 'sort_order' => 2],
            ],
        ]);

        $response->assertRedirect();
        $this->assertEquals(1, $m1->fresh()->sort_order);
        $this->assertEquals(2, $m2->fresh()->sort_order);
    }

    public function test_public_directory_renders_active_staff_and_leadership_first(): void
    {
        // Inactive staff
        SchoolStaff::create([
            'name' => 'Guru Tidak Aktif',
            'slug' => 'guru-tidak-aktif',
            'position' => 'Mantan Guru',
            'category' => 'teacher',
            'sort_order' => 99,
            'is_active' => false,
        ]);

        // Active staff
        $kepsek = SchoolStaff::create([
            'name' => 'Drs. Bambang (Kepsek)',
            'slug' => 'drs-bambang-kepsek',
            'position' => 'Kepala Sekolah',
            'category' => 'teacher',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $guru = SchoolStaff::create([
            'name' => 'Guru Aktif Biasa',
            'slug' => 'guru-aktif-biasa',
            'position' => 'Guru Kimia',
            'category' => 'teacher',
            'sort_order' => 5,
            'is_active' => true,
        ]);

        $response = $this->get('/guru');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Public/Teachers')
            ->has('staff', 2)
            ->where('staff.0.slug', 'drs-bambang-kepsek')
            ->where('staff.1.slug', 'guru-aktif-biasa')
        );

        // Also test alias /guru-staf
        $aliasResponse = $this->get('/guru-staf');
        $aliasResponse->assertStatus(200);
    }

    public function test_public_directory_filters_by_category(): void
    {
        SchoolStaff::create(['name' => 'Guru 1', 'slug' => 'g1', 'position' => 'Guru', 'category' => 'teacher', 'is_active' => true]);
        SchoolStaff::create(['name' => 'Staf 1', 'slug' => 's1', 'position' => 'Staf TU', 'category' => 'staff', 'is_active' => true]);

        // Filter teacher
        $responseTeacher = $this->get('/guru?category=teacher');
        $responseTeacher->assertInertia(fn (Assert $page) => $page
            ->has('staff', 1)
            ->where('staff.0.category', 'teacher')
        );

        // Filter staff
        $responseStaff = $this->get('/guru?category=staff');
        $responseStaff->assertInertia(fn (Assert $page) => $page
            ->has('staff', 1)
            ->where('staff.0.category', 'staff')
        );
    }

    public function test_public_staff_detail_renders_profile_by_slug(): void
    {
        $member = SchoolStaff::create([
            'name' => 'Dr. Siti Rahmawati',
            'slug' => 'dr-siti-rahmawati',
            'position' => 'Wakil Kepala Sekolah',
            'category' => 'teacher',
            'subject' => 'Matematika',
            'education' => 'S3 ITB',
            'bio' => 'Profil lengkap Siti Rahmawati.',
            'is_active' => true,
        ]);

        $response = $this->get('/guru/dr-siti-rahmawati');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Public/StaffDetail')
            ->where('staff.slug', 'dr-siti-rahmawati')
            ->where('staff.position', 'Wakil Kepala Sekolah')
        );

        // Also test /guru-staf/{slug} alias
        $aliasResponse = $this->get('/guru-staf/dr-siti-rahmawati');
        $aliasResponse->assertStatus(200);
    }

    public function test_public_inactive_staff_returns_404(): void
    {
        SchoolStaff::create([
            'name' => 'Inactive Staff',
            'slug' => 'inactive-staff',
            'position' => 'Staf',
            'category' => 'staff',
            'is_active' => false,
        ]);

        $this->get('/guru/inactive-staff')->assertNotFound();
    }

    public function test_unauthorized_users_cannot_access_admin_staff_crud(): void
    {
        // Guest redirects to login
        $this->get('/admin/guru-staff')->assertRedirect('/login');
        $this->post('/admin/guru-staff', [])->assertRedirect('/login');

        // Teacher forbidden (403)
        $this->actingAs($this->teacher)->get('/admin/guru-staff')->assertForbidden();
        $this->actingAs($this->teacher)->post('/admin/guru-staff', [])->assertForbidden();

        // Student forbidden (403)
        $this->actingAs($this->student)->get('/admin/guru-staff')->assertForbidden();

        // Parent forbidden (403)
        $this->actingAs($this->parent)->get('/admin/guru-staff')->assertForbidden();
    }

    public function test_validation_errors_when_creating_staff(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/guru-staff', [
            'name' => '',
            'position' => '',
            'category' => 'invalid_category',
        ]);

        $response->assertSessionHasErrors(['name', 'position', 'category']);
    }
}
