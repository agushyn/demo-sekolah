<?php

namespace Tests\Feature;

use App\Models\ForumCategory;
use App\Models\ForumPost;
use App\Models\ForumReport;
use App\Models\ForumThread;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ForumTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;

    protected User $teacherUser;

    protected User $studentUser1;

    protected User $studentUser2;

    protected ForumCategory $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleAndPermissionSeeder::class);

        $this->adminUser = User::create([
            'name' => 'Admin Forum',
            'email' => 'admin.forum@schid.test',
            'password' => Hash::make('password'),
        ]);
        $this->adminUser->assignRole('admin');

        $this->teacherUser = User::create([
            'name' => 'Guru Moderator',
            'email' => 'guru.forum@schid.test',
            'password' => Hash::make('password'),
        ]);
        $this->teacherUser->assignRole('teacher');

        $this->studentUser1 = User::create([
            'name' => 'Siswa Penulis 1',
            'email' => 'siswa1.forum@schid.test',
            'password' => Hash::make('password'),
        ]);
        $this->studentUser1->assignRole('student');

        $this->studentUser2 = User::create([
            'name' => 'Siswa Penulis 2',
            'email' => 'siswa2.forum@schid.test',
            'password' => Hash::make('password'),
        ]);
        $this->studentUser2->assignRole('student');

        $this->category = ForumCategory::create([
            'name' => 'Matematika Terapan',
            'slug' => 'matematika-terapan',
            'description' => 'Diskusi soal matematika.',
            'icon' => 'Calculator',
            'color' => 'emerald',
            'is_active' => true,
        ]);
    }

    /**
     * 1. Authenticated user can view forum directory and categories.
     */
    public function test_authenticated_user_can_view_forum_and_categories(): void
    {
        $response = $this->actingAs($this->studentUser1)->get('/forum');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Forum/Index')
            ->has('categories', 1)
        );
    }

    /**
     * 2. User can create thread and post reply.
     */
    public function test_user_can_create_thread_and_reply(): void
    {
        $response = $this->actingAs($this->studentUser1)->post('/forum/threads', [
            'category_id' => $this->category->id,
            'title' => 'Bagaimana cara mencari determinan matriks 3x3?',
            'content' => 'Mohon bantuan penjelasannya menggunakan metode Sarrus.',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('forum_threads', [
            'category_id' => $this->category->id,
            'author_id' => $this->studentUser1->id,
            'title' => 'Bagaimana cara mencari determinan matriks 3x3?',
        ]);

        $thread = ForumThread::first();

        $replyResponse = $this->actingAs($this->studentUser2)->post("/forum/threads/{$thread->id}/replies", [
            'content' => 'Gunakan perkalian diagonal utama dikurangi perkalian diagonal sekunder.',
        ]);

        $replyResponse->assertRedirect();

        $this->assertDatabaseHas('forum_posts', [
            'thread_id' => $thread->id,
            'user_id' => $this->studentUser2->id,
            'content' => 'Gunakan perkalian diagonal utama dikurangi perkalian diagonal sekunder.',
        ]);
    }

    /**
     * 3. User can edit own thread and post.
     */
    public function test_user_can_edit_own_thread_and_post(): void
    {
        $thread = ForumThread::create([
            'category_id' => $this->category->id,
            'author_id' => $this->studentUser1->id,
            'title' => 'Judul Asli',
            'content' => 'Konten Asli.',
        ]);

        $post = ForumPost::create([
            'thread_id' => $thread->id,
            'user_id' => $this->studentUser1->id,
            'content' => 'Balasan Asli.',
        ]);

        $editThreadResponse = $this->actingAs($this->studentUser1)->put("/forum/threads/{$thread->id}", [
            'title' => 'Judul Baru yang Diedit',
            'content' => 'Konten Baru yang Diedit.',
        ]);

        $editThreadResponse->assertRedirect();
        $this->assertDatabaseHas('forum_threads', ['title' => 'Judul Baru yang Diedit']);

        $editPostResponse = $this->actingAs($this->studentUser1)->put("/forum/posts/{$post->id}", [
            'content' => 'Balasan Baru yang Diedit.',
        ]);

        $editPostResponse->assertRedirect();
        $this->assertDatabaseHas('forum_posts', ['content' => 'Balasan Baru yang Diedit.']);
    }

    /**
     * 4. User cannot edit other user's post.
     */
    public function test_user_cannot_edit_other_users_post(): void
    {
        $thread = ForumThread::create([
            'category_id' => $this->category->id,
            'author_id' => $this->studentUser1->id,
            'title' => 'Thread Siswa 1',
            'content' => 'Konten.',
        ]);

        $post = ForumPost::create([
            'thread_id' => $thread->id,
            'user_id' => $this->studentUser1->id,
            'content' => 'Balasan Siswa 1.',
        ]);

        // Student 2 tries to edit Student 1's post -> 403 Forbidden!
        $response = $this->actingAs($this->studentUser2)->put("/forum/posts/{$post->id}", [
            'content' => 'Diubah oleh orang lain.',
        ]);

        $response->assertStatus(403);
    }

    /**
     * 5. User can delete own post.
     */
    public function test_user_can_delete_own_post(): void
    {
        $thread = ForumThread::create([
            'category_id' => $this->category->id,
            'author_id' => $this->studentUser1->id,
            'title' => 'Thread Siswa 1',
            'content' => 'Konten.',
        ]);

        $post = ForumPost::create([
            'thread_id' => $thread->id,
            'user_id' => $this->studentUser1->id,
            'content' => 'Balasan yang ingin dihapus.',
        ]);

        $response = $this->actingAs($this->studentUser1)->delete("/forum/posts/{$post->id}");

        $response->assertRedirect();
        $this->assertDatabaseMissing('forum_posts', ['id' => $post->id]);
    }

    /**
     * 6. User cannot delete other user's post.
     */
    public function test_user_cannot_delete_other_users_post(): void
    {
        $thread = ForumThread::create([
            'category_id' => $this->category->id,
            'author_id' => $this->studentUser1->id,
            'title' => 'Thread Siswa 1',
            'content' => 'Konten.',
        ]);

        $post = ForumPost::create([
            'thread_id' => $thread->id,
            'user_id' => $this->studentUser1->id,
            'content' => 'Balasan Siswa 1.',
        ]);

        // Student 2 tries to delete Student 1's post -> 403 Forbidden!
        $response = $this->actingAs($this->studentUser2)->delete("/forum/posts/{$post->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('forum_posts', ['id' => $post->id]);
    }

    /**
     * 7. User cannot reply to locked thread.
     */
    public function test_user_cannot_reply_to_locked_thread(): void
    {
        $lockedThread = ForumThread::create([
            'category_id' => $this->category->id,
            'author_id' => $this->adminUser->id,
            'title' => 'Pengumuman Resmi Terkunci',
            'content' => 'Pengumuman.',
            'is_locked' => true,
        ]);

        $response = $this->actingAs($this->studentUser1)->post("/forum/threads/{$lockedThread->id}/replies", [
            'content' => 'Mencoba membalas thread yang dikunci.',
        ]);

        $response->assertStatus(403);
        $this->assertDatabaseMissing('forum_posts', [
            'thread_id' => $lockedThread->id,
        ]);
    }

    /**
     * 8. User can react to thread and post.
     */
    public function test_user_can_react_to_thread_and_post(): void
    {
        $thread = ForumThread::create([
            'category_id' => $this->category->id,
            'author_id' => $this->studentUser1->id,
            'title' => 'Thread Menarik',
            'content' => 'Konten.',
        ]);

        // Toggle like (ON)
        $response = $this->actingAs($this->studentUser2)->post('/forum/reactions/toggle', [
            'reactable_type' => 'thread',
            'reactable_id' => $thread->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('forum_reactions', [
            'user_id' => $this->studentUser2->id,
            'reactable_type' => ForumThread::class,
            'reactable_id' => $thread->id,
        ]);

        // Toggle like (OFF)
        $response2 = $this->actingAs($this->studentUser2)->post('/forum/reactions/toggle', [
            'reactable_type' => 'thread',
            'reactable_id' => $thread->id,
        ]);

        $response2->assertRedirect();
        $this->assertDatabaseMissing('forum_reactions', [
            'user_id' => $this->studentUser2->id,
            'reactable_type' => ForumThread::class,
            'reactable_id' => $thread->id,
        ]);
    }

    /**
     * 9. User can report inappropriate content.
     */
    public function test_user_can_report_inappropriate_content(): void
    {
        $thread = ForumThread::create([
            'category_id' => $this->category->id,
            'author_id' => $this->studentUser1->id,
            'title' => 'Thread Bernada Provokatif',
            'content' => 'Konten tidak pantas.',
        ]);

        $response = $this->actingAs($this->studentUser2)->post('/forum/reports', [
            'reportable_type' => 'thread',
            'reportable_id' => $thread->id,
            'reason' => 'Mengandung unsur provokasi dan ujaran kebencian.',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('forum_reports', [
            'reportable_type' => ForumThread::class,
            'reportable_id' => $thread->id,
            'reported_by' => $this->studentUser2->id,
            'status' => 'pending',
        ]);
    }

    /**
     * 10. Teacher can pin and lock thread.
     */
    public function test_teacher_can_pin_and_lock_thread(): void
    {
        $thread = ForumThread::create([
            'category_id' => $this->category->id,
            'author_id' => $this->studentUser1->id,
            'title' => 'Materi Penting Ujian',
            'content' => 'Rangkuman.',
            'is_pinned' => false,
            'is_locked' => false,
        ]);

        $pinResponse = $this->actingAs($this->teacherUser)->post("/forum/threads/{$thread->id}/pin");
        $pinResponse->assertRedirect();

        $thread->refresh();
        $this->assertTrue($thread->is_pinned);

        $lockResponse = $this->actingAs($this->teacherUser)->post("/forum/threads/{$thread->id}/lock");
        $lockResponse->assertRedirect();

        $thread->refresh();
        $this->assertTrue($thread->is_locked);
    }

    /**
     * 11. Student cannot pin or lock thread.
     */
    public function test_student_cannot_pin_or_lock_thread(): void
    {
        $thread = ForumThread::create([
            'category_id' => $this->category->id,
            'author_id' => $this->studentUser1->id,
            'title' => 'Thread Siswa',
            'content' => 'Konten.',
        ]);

        $response = $this->actingAs($this->studentUser1)->post("/forum/threads/{$thread->id}/pin");
        $response->assertStatus(403);
    }

    /**
     * 12. Admin can review report and hide inappropriate content.
     */
    public function test_admin_can_review_report_and_hide_content(): void
    {
        $thread = ForumThread::create([
            'category_id' => $this->category->id,
            'author_id' => $this->studentUser1->id,
            'title' => 'Konten Melanggar',
            'content' => 'Konten.',
            'is_hidden' => false,
        ]);

        $report = ForumReport::create([
            'reportable_type' => ForumThread::class,
            'reportable_id' => $thread->id,
            'reported_by' => $this->studentUser2->id,
            'reason' => 'Spam berulang-ulang.',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->adminUser)->post("/admin/forum/reports/{$report->id}/review", [
            'status' => 'reviewed',
            'admin_notes' => 'Konten telah disensor karena terbukti melanggar.',
            'hide_target' => true,
        ]);

        $response->assertRedirect();

        $report->refresh();
        $this->assertEquals('reviewed', $report->status);
        $this->assertEquals($this->adminUser->id, $report->reviewed_by);

        $thread->refresh();
        $this->assertTrue($thread->is_hidden);
    }
}
