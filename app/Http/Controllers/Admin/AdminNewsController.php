<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreNewsRequest;
use App\Http\Requests\Admin\UpdateNewsRequest;
use App\Models\News;
use App\Models\NewsCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminNewsController extends Controller
{
    /**
     * Display a listing of news articles with Bento stats.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $category = $request->query('category');
        $status = $request->query('status');

        $query = News::with(['category', 'author'])
            ->latest('created_at');

        if (! empty($search)) {
            $query->search($search);
        }

        if (! empty($category) && $category !== 'all') {
            $query->where('category_id', $category);
        }

        if (! empty($status) && $status !== 'all') {
            $query->where('status', $status);
        }

        $newsList = $query->paginate(10)->withQueryString();

        // Bento UI Statistics
        $stats = [
            'total_news' => News::count(),
            'published_count' => News::where('status', 'published')->count(),
            'draft_count' => News::where('status', 'draft')->count(),
            'scheduled_count' => News::where('status', 'scheduled')->count(),
        ];

        $categories = NewsCategory::orderBy('name')->get();

        return Inertia::render('Admin/News/Index', [
            'newsList' => $newsList,
            'stats' => $stats,
            'categories' => $categories,
            'filters' => [
                'search' => $search ?: '',
                'category' => $category ?: 'all',
                'status' => $status ?: 'all',
            ],
        ]);
    }

    /**
     * Show the form for creating a new news article.
     */
    public function create(): Response
    {
        $categories = NewsCategory::orderBy('name')->get();

        return Inertia::render('Admin/News/Create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created news article in storage.
     */
    public function store(StoreNewsRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $slug = Str::slug($validated['title']);
        $originalSlug = $slug;
        $counter = 1;
        while (News::where('slug', $slug)->exists()) {
            $slug = "{$originalSlug}-{$counter}";
            $counter++;
        }

        $thumbnailPath = null;
        if ($request->hasFile('thumbnail')) {
            $thumbnailPath = $request->file('thumbnail')->store('news', 'public');
        }

        $publishedAt = null;
        if ($validated['status'] === 'published') {
            $publishedAt = ! empty($validated['published_at'])
                ? Carbon::parse($validated['published_at'])
                : now();
        } elseif ($validated['status'] === 'scheduled') {
            $publishedAt = ! empty($validated['published_at'])
                ? Carbon::parse($validated['published_at'])
                : now()->addDay();
        }

        News::create([
            'category_id' => $validated['category_id'],
            'author_id' => $request->user()->id,
            'title' => $validated['title'],
            'slug' => $slug,
            'excerpt' => $validated['excerpt'] ?? Str::limit(strip_tags($validated['content']), 150),
            'content' => $validated['content'],
            'thumbnail' => $thumbnailPath,
            'status' => $validated['status'],
            'is_featured' => $request->boolean('is_featured'),
            'published_at' => $publishedAt,
        ]);

        return redirect()->route('admin.news.index')
            ->with('success', 'Berita berhasil diterbitkan dan disimpan.');
    }

    /**
     * Show the form for editing the specified news article.
     */
    public function edit(News $news): Response
    {
        $news->load(['category', 'author']);
        $categories = NewsCategory::orderBy('name')->get();

        return Inertia::render('Admin/News/Edit', [
            'news' => $news,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified news article in storage.
     */
    public function update(UpdateNewsRequest $request, News $news): RedirectResponse
    {
        $validated = $request->validated();

        if ($news->title !== $validated['title']) {
            $slug = Str::slug($validated['title']);
            $originalSlug = $slug;
            $counter = 1;
            while (News::where('slug', $slug)->where('id', '!=', $news->id)->exists()) {
                $slug = "{$originalSlug}-{$counter}";
                $counter++;
            }
            $news->slug = $slug;
        }

        if ($request->hasFile('thumbnail')) {
            // Delete old thumbnail if it exists in local storage
            if ($news->thumbnail && ! str_starts_with($news->thumbnail, 'http')) {
                Storage::disk('public')->delete($news->thumbnail);
            }
            $news->thumbnail = $request->file('thumbnail')->store('news', 'public');
        }

        $publishedAt = $news->published_at;
        if ($validated['status'] === 'published') {
            $publishedAt = ! empty($validated['published_at'])
                ? Carbon::parse($validated['published_at'])
                : ($news->published_at ?: now());
        } elseif ($validated['status'] === 'scheduled') {
            $publishedAt = ! empty($validated['published_at'])
                ? Carbon::parse($validated['published_at'])
                : now()->addDay();
        } elseif ($validated['status'] === 'draft') {
            $publishedAt = null;
        }

        $news->update([
            'category_id' => $validated['category_id'],
            'title' => $validated['title'],
            'excerpt' => $validated['excerpt'] ?? Str::limit(strip_tags($validated['content']), 150),
            'content' => $validated['content'],
            'status' => $validated['status'],
            'is_featured' => $request->boolean('is_featured'),
            'published_at' => $publishedAt,
        ]);

        return redirect()->route('admin.news.index')
            ->with('success', 'Berita berhasil diperbarui.');
    }

    /**
     * Remove the specified news article from storage.
     */
    public function destroy(News $news): RedirectResponse
    {
        if ($news->thumbnail && ! str_starts_with($news->thumbnail, 'http')) {
            Storage::disk('public')->delete($news->thumbnail);
        }

        $news->delete();

        return redirect()->route('admin.news.index')
            ->with('success', 'Berita berhasil dihapus.');
    }

    /**
     * Toggle publish / draft status quickly.
     */
    public function toggleStatus(News $news): RedirectResponse
    {
        if ($news->status === 'published') {
            $news->update(['status' => 'draft', 'published_at' => null]);
            $message = 'Status berita diubah menjadi Draft.';
        } else {
            $news->update(['status' => 'published', 'published_at' => now()]);
            $message = 'Berita berhasil dipublikasikan.';
        }

        return redirect()->back()->with('success', $message);
    }
}
