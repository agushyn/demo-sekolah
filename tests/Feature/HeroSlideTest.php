<?php

namespace Tests\Feature;

use App\Models\HeroSlide;
use App\Models\SchoolSetting;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class HeroSlideTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $teacher;

    protected User $student;

    protected User $parent;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles & permissions
        $this->seed(RoleAndPermissionSeeder::class);

        $this->admin = User::create([
            'name' => 'Admin Hero',
            'email' => 'admin@test.com',
            'password' => Hash::make('password'),
        ]);
        $this->admin->assignRole('admin');

        $this->teacher = User::create([
            'name' => 'Guru Pengajar',
            'email' => 'teacher@test.com',
            'password' => Hash::make('password'),
        ]);
        $this->teacher->assignRole('teacher');

        $this->student = User::create([
            'name' => 'Siswa Pelajar',
            'email' => 'student@test.com',
            'password' => Hash::make('password'),
        ]);
        $this->student->assignRole('student');

        $this->parent = User::create([
            'name' => 'Orang Tua Murid',
            'email' => 'parent@test.com',
            'password' => Hash::make('password'),
        ]);
        $this->parent->assignRole('parent');
    }

    public function test_public_homepage_renders_active_hero_slides(): void
    {
        HeroSlide::create([
            'subtitle' => 'Portal 2026',
            'title' => 'Slide Aktif Pertama',
            'description' => 'Deskripsi slide aktif',
            'button_text' => 'Daftar',
            'button_url' => '/pendaftaran',
            'sort_order' => 1,
            'duration' => 5000,
            'is_active' => true,
        ]);

        HeroSlide::create([
            'subtitle' => 'Draft Slide',
            'title' => 'Slide Nonaktif',
            'description' => 'Tidak boleh tampil',
            'sort_order' => 2,
            'duration' => 5000,
            'is_active' => false,
        ]);

        Cache::forget('public_hero_slides');

        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Public/Home')
            ->has('heroSlides', 1)
            ->where('heroSlides.0.title', 'Slide Aktif Pertama')
        );
    }

    public function test_admin_can_view_hero_slides_list(): void
    {
        HeroSlide::create([
            'title' => 'Test Slide List',
            'sort_order' => 1,
            'duration' => 5000,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->get('/admin/hero-slides');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/HeroSlides/Index')
            ->has('slides')
            ->has('stats')
        );
    }

    public function test_admin_can_create_new_hero_slide_with_image(): void
    {
        Storage::fake('public');

        $image = UploadedFile::fake()->image('campus.jpg', 1200, 600);

        $response = $this->actingAs($this->admin)->post('/admin/hero-slides', [
            'title' => 'Generasi Unggul Berprestasi',
            'subtitle' => 'Pendidikan Berkualitas',
            'description' => 'Membangun karakter siswa cerdas dan berintegritas.',
            'image' => $image,
            'button_text' => 'Daftar Sekarang',
            'button_url' => '/pendaftaran',
            'secondary_button_text' => 'Profil',
            'secondary_button_url' => '/profil',
            'text_position' => 'left',
            'overlay_type' => 'gradient',
            'sort_order' => 1,
            'duration' => 6000,
            'is_active' => true,
        ]);

        $response->assertRedirect('/admin/hero-slides');
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('hero_slides', [
            'title' => 'Generasi Unggul Berprestasi',
            'subtitle' => 'Pendidikan Berkualitas',
            'sort_order' => 1,
            'duration' => 6000,
            'is_active' => true,
        ]);

        $slide = HeroSlide::where('title', 'Generasi Unggul Berprestasi')->first();
        $this->assertNotNull($slide->image);
        Storage::disk('public')->assertExists($slide->image);
    }

    public function test_admin_can_edit_hero_slide(): void
    {
        $slide = HeroSlide::create([
            'title' => 'Judul Lama',
            'subtitle' => 'Subtitle Lama',
            'sort_order' => 1,
            'duration' => 5000,
            'is_active' => true,
            'text_position' => 'left',
            'overlay_type' => 'gradient',
        ]);

        $response = $this->actingAs($this->admin)->post("/admin/hero-slides/{$slide->id}", [
            'title' => 'Judul Baru Diperbarui',
            'subtitle' => 'Subtitle Baru',
            'description' => 'Deskripsi baru',
            'button_text' => 'Pelajari',
            'button_url' => '/profil',
            'text_position' => 'center',
            'overlay_type' => 'dark',
            'sort_order' => 2,
            'duration' => 7000,
            'is_active' => true,
        ]);

        $response->assertRedirect('/admin/hero-slides');
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('hero_slides', [
            'id' => $slide->id,
            'title' => 'Judul Baru Diperbarui',
            'text_position' => 'center',
            'overlay_type' => 'dark',
            'sort_order' => 2,
            'duration' => 7000,
        ]);
    }

    public function test_admin_can_toggle_active_status(): void
    {
        $slide = HeroSlide::create([
            'title' => 'Slide Toggle',
            'sort_order' => 1,
            'duration' => 5000,
            'is_active' => true,
            'text_position' => 'left',
            'overlay_type' => 'gradient',
        ]);

        $response = $this->actingAs($this->admin)->post("/admin/hero-slides/{$slide->id}/toggle-active");

        $response->assertRedirect();
        $this->assertDatabaseHas('hero_slides', [
            'id' => $slide->id,
            'is_active' => false,
        ]);
    }

    public function test_admin_can_delete_hero_slide(): void
    {
        Storage::fake('public');
        $imagePath = UploadedFile::fake()->image('test.jpg')->store('hero-slides', 'public');

        $slide = HeroSlide::create([
            'title' => 'Slide Akan Dihapus',
            'image' => $imagePath,
            'sort_order' => 1,
            'duration' => 5000,
            'is_active' => true,
            'text_position' => 'left',
            'overlay_type' => 'gradient',
        ]);

        $response = $this->actingAs($this->admin)->delete("/admin/hero-slides/{$slide->id}");

        $response->assertRedirect('/admin/hero-slides');
        $this->assertDatabaseMissing('hero_slides', [
            'id' => $slide->id,
        ]);
        Storage::disk('public')->assertMissing($imagePath);
    }

    public function test_unauthorized_users_cannot_access_hero_slide_admin(): void
    {
        // Guest
        $this->get('/admin/hero-slides')
            ->assertRedirect('/login');

        // Teacher
        $this->actingAs($this->teacher)
            ->get('/admin/hero-slides')
            ->assertForbidden();

        // Student
        $this->actingAs($this->student)
            ->get('/admin/hero-slides')
            ->assertForbidden();

        // Parent
        $this->actingAs($this->parent)
            ->get('/admin/hero-slides')
            ->assertForbidden();
    }

    public function test_ppdb_status_case_1_when_disabled(): void
    {
        SchoolSetting::set('registration_enabled', false, 'boolean');

        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->where('ppdb.isOpen', false)
            ->where('ppdb.enabled', false)
        );
    }

    public function test_ppdb_status_case_2_when_enabled_and_in_range(): void
    {
        $today = now()->setTimezone('Asia/Jakarta')->format('Y-m-d');
        SchoolSetting::set('registration_enabled', true, 'boolean');
        SchoolSetting::set('registration_start', $today, 'string');
        SchoolSetting::set('registration_end', now()->addDays(30)->format('Y-m-d'), 'string');

        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->where('ppdb.isOpen', true)
            ->where('ppdb.enabled', true)
        );
    }

    public function test_ppdb_status_case_3_when_before_start_date(): void
    {
        SchoolSetting::set('registration_enabled', true, 'boolean');
        SchoolSetting::set('registration_start', now()->addDays(5)->format('Y-m-d'), 'string');
        SchoolSetting::set('registration_end', now()->addDays(30)->format('Y-m-d'), 'string');

        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->where('ppdb.isOpen', false)
        );
    }

    public function test_ppdb_status_case_4_when_after_end_date(): void
    {
        SchoolSetting::set('registration_enabled', true, 'boolean');
        SchoolSetting::set('registration_start', now()->subDays(30)->format('Y-m-d'), 'string');
        SchoolSetting::set('registration_end', now()->subDays(5)->format('Y-m-d'), 'string');

        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->where('ppdb.isOpen', false)
        );
    }

    public function test_ppdb_status_case_5_and_6_admin_update_settings(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/registrations/settings', [
            'registration_enabled' => true,
            'registration_start' => now()->subDays(1)->format('Y-m-d'),
            'registration_end' => now()->addDays(10)->format('Y-m-d'),
            'registration_announcement' => 'Info PPDB Gelombang 2',
            'registration_announcement_text' => 'Pendaftaran Gelombang 2 Resmi Dibuka!',
        ]);

        $response->assertRedirect();

        $homeResponse = $this->get('/');
        $homeResponse->assertInertia(fn (Assert $page) => $page
            ->where('ppdb.isOpen', true)
            ->where('ppdb.announcement', 'Info PPDB Gelombang 2')
            ->where('ppdb.announcementText', 'Pendaftaran Gelombang 2 Resmi Dibuka!')
        );

        // Turn OFF
        $this->actingAs($this->admin)->post('/admin/registrations/settings', [
            'registration_enabled' => false,
        ]);

        $homeResponseOff = $this->get('/');
        $homeResponseOff->assertInertia(fn (Assert $page) => $page
            ->where('ppdb.isOpen', false)
            ->where('ppdb.enabled', false)
        );
    }
}
