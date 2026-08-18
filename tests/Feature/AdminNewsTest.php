<?php

namespace Tests\Feature;

use App\Models\News;
use App\Models\NewsCategory;
use App\Models\User;
use Database\Seeders\NewsCategorySeeder;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminNewsTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;

    protected User $studentUser;

    protected User $teacherUser;

    protected NewsCategory $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleAndPermissionSeeder::class);
        $this->seed(NewsCategorySeeder::class);

        $this->adminUser = User::create([
            'name' => 'Admin Redaksi',
            'email' => 'admin.redaksi@schid.test',
            'password' => Hash::make('password'),
        ]);
        $this->adminUser->assignRole('admin');

        $this->studentUser = User::create([
            'name' => 'Siswa Pengguna',
            'email' => 'student.user@schid.test',
            'password' => Hash::make('password'),
        ]);
        $this->studentUser->assignRole('student');

        $this->teacherUser = User::create([
            'name' => 'Guru Pengampu',
            'email' => 'teacher.user@schid.test',
            'password' => Hash::make('password'),
        ]);
        $this->teacherUser->assignRole('teacher');

        $this->category = NewsCategory::first();
    }

    public function test_guest_cannot_access_admin_news_index(): void
    {
        $response = $this->get('/admin/news');

        $response->assertRedirect('/login');
    }

    public function test_student_and_teacher_cannot_access_admin_news(): void
    {
        $responseStudent = $this->actingAs($this->studentUser)->get('/admin/news');
        $responseStudent->assertStatus(403);

        $responseTeacher = $this->actingAs($this->teacherUser)->get('/admin/news');
        $responseTeacher->assertStatus(403);
    }

    public function test_admin_can_view_news_index_with_bento_stats(): void
    {
        News::create([
            'category_id' => $this->category->id,
            'author_id' => $this->adminUser->id,
            'title' => 'Berita Uji Coba Admin 1',
            'slug' => 'berita-uji-coba-admin-1',
            'content' => 'Konten pengujian berita admin.',
            'status' => 'published',
            'published_at' => now(),
        ]);

        $response = $this->actingAs($this->adminUser)->get('/admin/news');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/News/Index')
            ->has('newsList.data')
            ->has('stats.total_news')
            ->has('stats.published_count')
            ->has('stats.draft_count')
            ->has('stats.scheduled_count')
            ->has('categories')
        );
    }

    public function test_admin_can_view_create_news_page(): void
    {
        $response = $this->actingAs($this->adminUser)->get('/admin/news/create');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/News/Create')
            ->has('categories')
        );
    }

    public function test_admin_can_create_news_with_thumbnail_upload(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('prestasi.jpg', 600, 400);

        $response = $this->actingAs($this->adminUser)->post('/admin/news', [
            'title' => 'Siswa Juara 1 Robotika Nasional 2026',
            'category_id' => $this->category->id,
            'excerpt' => 'Prestasi membanggakan tim robotika.',
            'content' => 'Artikel lengkap tentang perjuangan dan pencapaian tim robotika sekolah.',
            'status' => 'published',
            'is_featured' => true,
            'thumbnail' => $file,
        ]);

        $response->assertRedirect('/admin/news');
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('news', [
            'title' => 'Siswa Juara 1 Robotika Nasional 2026',
            'slug' => 'siswa-juara-1-robotika-nasional-2026',
            'status' => 'published',
            'is_featured' => 1,
            'author_id' => $this->adminUser->id,
        ]);

        $createdNews = News::where('slug', 'siswa-juara-1-robotika-nasional-2026')->first();
        $this->assertNotNull($createdNews->thumbnail);
        Storage::disk('public')->assertExists($createdNews->thumbnail);
    }

    public function test_admin_can_view_edit_news_page(): void
    {
        $news = News::create([
            'category_id' => $this->category->id,
            'author_id' => $this->adminUser->id,
            'title' => 'Berita untuk Diedit',
            'slug' => 'berita-untuk-diedit',
            'content' => 'Konten awal.',
            'status' => 'draft',
        ]);

        $response = $this->actingAs($this->adminUser)->get("/admin/news/{$news->id}/edit");

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/News/Edit')
            ->has('news')
            ->has('categories')
        );
    }

    public function test_admin_can_update_news(): void
    {
        $news = News::create([
            'category_id' => $this->category->id,
            'author_id' => $this->adminUser->id,
            'title' => 'Judul Awal Berita',
            'slug' => 'judul-awal-berita',
            'content' => 'Konten awal.',
            'status' => 'draft',
        ]);

        $response = $this->actingAs($this->adminUser)->post("/admin/news/{$news->id}", [
            'title' => 'Judul Berita Diperbarui',
            'category_id' => $this->category->id,
            'excerpt' => 'Ringkasan baru.',
            'content' => 'Konten baru yang telah diedit.',
            'status' => 'published',
            'is_featured' => false,
        ]);

        $response->assertRedirect('/admin/news');
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('news', [
            'id' => $news->id,
            'title' => 'Judul Berita Diperbarui',
            'status' => 'published',
        ]);
    }

    public function test_admin_can_delete_news(): void
    {
        Storage::fake('public');
        $file = UploadedFile::fake()->image('del.jpg');
        $path = $file->store('news', 'public');

        $news = News::create([
            'category_id' => $this->category->id,
            'author_id' => $this->adminUser->id,
            'title' => 'Berita yang akan Dihapus',
            'slug' => 'berita-yang-akan-dihapus',
            'content' => 'Konten hapus.',
            'thumbnail' => $path,
            'status' => 'draft',
        ]);

        $response = $this->actingAs($this->adminUser)->delete("/admin/news/{$news->id}");

        $response->assertRedirect('/admin/news');
        $this->assertDatabaseMissing('news', ['id' => $news->id]);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_admin_can_toggle_news_status(): void
    {
        $news = News::create([
            'category_id' => $this->category->id,
            'author_id' => $this->adminUser->id,
            'title' => 'Berita Toggle Status',
            'slug' => 'berita-toggle-status',
            'content' => 'Konten toggle.',
            'status' => 'draft',
        ]);

        $response = $this->actingAs($this->adminUser)->post("/admin/news/{$news->id}/toggle-status");
        $response->assertRedirect();

        $news->refresh();
        $this->assertEquals('published', $news->status);
        $this->assertNotNull($news->published_at);
    }

    public function test_validation_errors_when_creating_news_with_invalid_data(): void
    {
        $response = $this->actingAs($this->adminUser)->post('/admin/news', [
            'title' => '',
            'category_id' => 99999,
            'content' => '',
            'status' => 'invalid_status',
        ]);

        $response->assertSessionHasErrors(['title', 'category_id', 'content', 'status']);
    }
}
