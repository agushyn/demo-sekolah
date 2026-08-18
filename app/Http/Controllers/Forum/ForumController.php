<?php

namespace App\Http\Controllers\Forum;

use App\Http\Controllers\Controller;
use App\Models\ForumCategory;
use App\Models\ForumPost;
use App\Models\ForumReaction;
use App\Models\ForumReport;
use App\Models\ForumThread;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ForumController extends Controller
{
    /**
     * Display the forum directory and discussion boards.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');

        $categories = ForumCategory::active()
            ->withCount(['threads' => fn ($q) => $q->visible()])
            ->get();

        $threadsQuery = ForumThread::visible()
            ->with(['category', 'author', 'reactions'])
            ->withCount(['posts' => fn ($q) => $q->visible(), 'reactions']);

        if (! empty($search)) {
            $threadsQuery->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $latestThreads = (clone $threadsQuery)->pinnedFirst()->take(10)->get();
        $popularThreads = (clone $threadsQuery)->orderBy('views_count', 'desc')->take(6)->get();

        $stats = [
            'total_threads' => ForumThread::visible()->count(),
            'total_posts' => ForumPost::visible()->count(),
            'total_categories' => $categories->count(),
            'total_members' => User::count(),
        ];

        return Inertia::render('Forum/Index', [
            'categories' => $categories,
            'latestThreads' => $latestThreads,
            'popularThreads' => $popularThreads,
            'stats' => $stats,
            'filters' => [
                'search' => $search ?: '',
            ],
        ]);
    }

    /**
     * Display threads filtered by category.
     */
    public function category(ForumCategory $category, Request $request): Response
    {
        $search = $request->query('search');

        $threadsQuery = ForumThread::visible()
            ->where('category_id', $category->id)
            ->with(['author', 'reactions'])
            ->withCount(['posts' => fn ($q) => $q->visible(), 'reactions']);

        if (! empty($search)) {
            $threadsQuery->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $threads = $threadsQuery->pinnedFirst()->paginate(15)->withQueryString();

        $allCategories = ForumCategory::active()->get();

        return Inertia::render('Forum/Category', [
            'category' => $category,
            'threads' => $threads,
            'categories' => $allCategories,
            'filters' => [
                'search' => $search ?: '',
            ],
        ]);
    }

    /**
     * Display single thread with its discussion posts.
     */
    public function show(ForumThread $thread, Request $request): Response
    {
        if ($thread->is_hidden && ! $request->user()?->hasAnyRole(['admin', 'super_admin'])) {
            abort(404, 'Diskusi tidak ditemukan atau telah dinonaktifkan.');
        }

        $thread->increment('views_count');

        $thread->load([
            'category',
            'author.roles',
            'reactions.user',
            'posts' => fn ($q) => $q->visible()->with(['user.roles', 'reactions.user'])->orderBy('created_at', 'asc'),
        ]);

        $userId = $request->user()?->id;

        // Check if user reacted to thread
        $threadIsLiked = $userId ? $thread->reactions->contains('user_id', $userId) : false;

        $postsData = $thread->posts->map(function ($post) use ($userId) {
            return [
                'id' => $post->id,
                'content' => $post->content,
                'user' => $post->user,
                'created_at' => $post->created_at,
                'formatted_created_at' => $post->formatted_created_at,
                'reactions_count' => $post->reactions->count(),
                'is_liked' => $userId ? $post->reactions->contains('user_id', $userId) : false,
            ];
        });

        $categories = ForumCategory::active()->get();

        return Inertia::render('Forum/Show', [
            'thread' => [
                'id' => $thread->id,
                'title' => $thread->title,
                'slug' => $thread->slug,
                'content' => $thread->content,
                'is_pinned' => $thread->is_pinned,
                'is_locked' => $thread->is_locked,
                'is_hidden' => $thread->is_hidden,
                'views_count' => $thread->views_count,
                'author' => $thread->author,
                'category' => $thread->category,
                'created_at' => $thread->created_at,
                'formatted_created_at' => $thread->formatted_created_at,
                'reactions_count' => $thread->reactions->count(),
                'is_liked' => $threadIsLiked,
            ],
            'posts' => $postsData,
            'categories' => $categories,
        ]);
    }

    /**
     * Store a new forum thread.
     */
    public function storeThread(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => ['required', 'exists:forum_categories,id'],
            'title' => ['required', 'string', 'min:5', 'max:255'],
            'content' => ['required', 'string', 'min:10'],
        ]);

        $thread = ForumThread::create([
            'category_id' => $validated['category_id'],
            'author_id' => $request->user()->id,
            'title' => e($validated['title']),
            'slug' => Str::slug($validated['title']).'-'.Str::random(5),
            'content' => strip_tags($validated['content']),
            'is_pinned' => false,
            'is_locked' => false,
            'is_hidden' => false,
        ]);

        return redirect()->route('forum.show', $thread->slug)->with('success', 'Topik diskusi baru berhasil diterbitkan.');
    }

    /**
     * Update an existing thread (Own author or admin).
     */
    public function updateThread(ForumThread $thread, Request $request): RedirectResponse
    {
        $user = $request->user();

        // Enforce ownership or admin
        if ($thread->author_id !== $user->id && ! $user->hasAnyRole(['admin', 'super_admin'])) {
            abort(403, 'Anda tidak memiliki hak akses untuk mengedit topik ini.');
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'min:5', 'max:255'],
            'content' => ['required', 'string', 'min:10'],
        ]);

        $thread->update([
            'title' => e($validated['title']),
            'content' => strip_tags($validated['content']),
        ]);

        return redirect()->back()->with('success', 'Topik diskusi berhasil diperbarui.');
    }

    /**
     * Delete thread (Own author, teacher, or admin).
     */
    public function destroyThread(ForumThread $thread, Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($thread->author_id !== $user->id && ! $user->hasAnyRole(['admin', 'super_admin', 'teacher'])) {
            abort(403, 'Anda tidak memiliki hak untuk menghapus diskusi ini.');
        }

        $thread->delete();

        return redirect()->route('forum.index')->with('success', 'Topik diskusi berhasil dihapus.');
    }

    /**
     * Store a reply post in thread.
     */
    public function storePost(ForumThread $thread, Request $request): RedirectResponse
    {
        // Enforce locked thread check
        if ($thread->is_locked) {
            abort(403, 'Diskusi ini telah dikunci oleh moderator dan tidak menerima balasan baru.');
        }

        $validated = $request->validate([
            'content' => ['required', 'string', 'min:3'],
        ]);

        ForumPost::create([
            'thread_id' => $thread->id,
            'user_id' => $request->user()->id,
            'content' => strip_tags($validated['content']),
            'is_hidden' => false,
        ]);

        return redirect()->back()->with('success', 'Balasan Anda berhasil dikirimkan.');
    }

    /**
     * Update a reply post (Own author or admin).
     */
    public function updatePost(ForumPost $post, Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($post->user_id !== $user->id && ! $user->hasAnyRole(['admin', 'super_admin'])) {
            abort(403, 'Anda tidak memiliki hak untuk mengedit balasan ini.');
        }

        $validated = $request->validate([
            'content' => ['required', 'string', 'min:3'],
        ]);

        $post->update([
            'content' => strip_tags($validated['content']),
        ]);

        return redirect()->back()->with('success', 'Balasan berhasil diperbarui.');
    }

    /**
     * Delete a reply post (Own author, teacher, or admin).
     */
    public function destroyPost(ForumPost $post, Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($post->user_id !== $user->id && ! $user->hasAnyRole(['admin', 'super_admin', 'teacher'])) {
            abort(403, 'Anda tidak memiliki hak untuk menghapus balasan ini.');
        }

        $post->delete();

        return redirect()->back()->with('success', 'Balasan berhasil dihapus.');
    }

    /**
     * Toggle reaction (Like/Unlike) on thread or post.
     */
    public function toggleReaction(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'reactable_type' => ['required', 'in:thread,post'],
            'reactable_id' => ['required', 'integer'],
        ]);

        $modelClass = $validated['reactable_type'] === 'thread' ? ForumThread::class : ForumPost::class;
        $target = $modelClass::findOrFail($validated['reactable_id']);

        $reaction = ForumReaction::where('user_id', $request->user()->id)
            ->where('reactable_type', $modelClass)
            ->where('reactable_id', $target->id)
            ->first();

        if ($reaction) {
            $reaction->delete();
        } else {
            ForumReaction::create([
                'user_id' => $request->user()->id,
                'reactable_type' => $modelClass,
                'reactable_id' => $target->id,
                'reaction_type' => 'like',
            ]);
        }

        return redirect()->back();
    }

    /**
     * Report content violation.
     */
    public function report(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'reportable_type' => ['required', 'in:thread,post'],
            'reportable_id' => ['required', 'integer'],
            'reason' => ['required', 'string', 'min:5', 'max:500'],
        ]);

        $modelClass = $validated['reportable_type'] === 'thread' ? ForumThread::class : ForumPost::class;

        ForumReport::create([
            'reportable_type' => $modelClass,
            'reportable_id' => $validated['reportable_id'],
            'reported_by' => $request->user()->id,
            'reason' => $validated['reason'],
            'status' => 'pending',
        ]);

        return redirect()->back()->with('success', 'Laporan Anda telah dikirimkan kepada tim moderator untuk ditindaklanjuti.');
    }

    /**
     * Toggle Pin status (Teachers & Admins only).
     */
    public function togglePin(ForumThread $thread, Request $request): RedirectResponse
    {
        if (! $request->user()->hasAnyRole(['teacher', 'admin', 'super_admin'])) {
            abort(403, 'Hanya pendidik dan administrator yang dapat menyematkan topik.');
        }

        $thread->update([
            'is_pinned' => ! $thread->is_pinned,
        ]);

        $msg = $thread->is_pinned ? 'Topik berhasil disematkan di bagian atas.' : 'Penyematan topik dibatalkan.';

        return redirect()->back()->with('success', $msg);
    }

    /**
     * Toggle Lock status (Teachers & Admins only).
     */
    public function toggleLock(ForumThread $thread, Request $request): RedirectResponse
    {
        if (! $request->user()->hasAnyRole(['teacher', 'admin', 'super_admin'])) {
            abort(403, 'Hanya pendidik dan administrator yang dapat mengunci topik.');
        }

        $thread->update([
            'is_locked' => ! $thread->is_locked,
        ]);

        $msg = $thread->is_locked ? 'Topik berhasil dikunci dan tidak menerima balasan baru.' : 'Kunci topik berhasil dibuka.';

        return redirect()->back()->with('success', $msg);
    }
}
