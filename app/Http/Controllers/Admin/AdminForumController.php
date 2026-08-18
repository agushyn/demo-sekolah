<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ForumCategory;
use App\Models\ForumPost;
use App\Models\ForumReport;
use App\Models\ForumThread;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminForumController extends Controller
{
    /**
     * Display Forum Moderation & Category Dashboard.
     */
    public function index(Request $request): Response
    {
        $status = $request->query('report_status', 'pending');

        $reportsQuery = ForumReport::with(['reporter', 'reviewer'])
            ->latest('created_at');

        if ($status !== 'all') {
            $reportsQuery->where('status', $status);
        }

        $reports = $reportsQuery->get()->map(function ($rep) {
            $target = null;
            if ($rep->reportable_type === ForumThread::class) {
                $thread = ForumThread::find($rep->reportable_id);
                $target = $thread ? [
                    'type' => 'Thread',
                    'title' => $thread->title,
                    'content' => $thread->content,
                    'author' => $thread->author?->name,
                    'is_hidden' => $thread->is_hidden,
                ] : null;
            } elseif ($rep->reportable_type === ForumPost::class) {
                $post = ForumPost::find($rep->reportable_id);
                $target = $post ? [
                    'type' => 'Balasan',
                    'title' => "Balasan pada '{$post->thread?->title}'",
                    'content' => $post->content,
                    'author' => $post->user?->name,
                    'is_hidden' => $post->is_hidden,
                ] : null;
            }

            return [
                'id' => $rep->id,
                'reportable_type' => class_basename($rep->reportable_type),
                'reportable_id' => $rep->reportable_id,
                'reason' => $rep->reason,
                'status' => $rep->status,
                'status_badge' => $rep->status_badge,
                'admin_notes' => $rep->admin_notes,
                'reporter' => $rep->reporter,
                'reviewer' => $rep->reviewer,
                'created_at' => $rep->formatted_created_at,
                'target' => $target,
            ];
        });

        $categories = ForumCategory::withCount(['threads', 'posts'])->get();

        $stats = [
            'pending_reports' => ForumReport::where('status', 'pending')->count(),
            'total_threads' => ForumThread::count(),
            'total_posts' => ForumPost::count(),
            'hidden_items' => ForumThread::where('is_hidden', true)->count() + ForumPost::where('is_hidden', true)->count(),
        ];

        return Inertia::render('Admin/Forum/Index', [
            'reports' => $reports,
            'categories' => $categories,
            'stats' => $stats,
            'filters' => [
                'report_status' => $status,
            ],
        ]);
    }

    /**
     * Resolve / Review a moderation report.
     */
    public function reviewReport(ForumReport $report, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:reviewed,dismissed'],
            'admin_notes' => ['nullable', 'string'],
            'hide_target' => ['nullable', 'boolean'],
        ]);

        $report->update([
            'status' => $validated['status'],
            'admin_notes' => $validated['admin_notes'] ?? null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        if ($request->boolean('hide_target')) {
            $targetClass = $report->reportable_type;
            $target = $targetClass::find($report->reportable_id);
            if ($target) {
                $target->update(['is_hidden' => true]);
            }
        }

        return redirect()->back()->with('success', 'Status laporan moderasi berhasil diperbarui.');
    }

    /**
     * Toggle hide status on thread or post.
     */
    public function toggleHide(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'in:thread,post'],
            'id' => ['required', 'integer'],
        ]);

        $modelClass = $validated['type'] === 'thread' ? ForumThread::class : ForumPost::class;
        $target = $modelClass::findOrFail($validated['id']);

        $target->update([
            'is_hidden' => ! $target->is_hidden,
        ]);

        $statusMsg = $target->is_hidden ? 'Konten berhasil disembunyikan dari publik.' : 'Konten kembali ditampilkan ke publik.';

        return redirect()->back()->with('success', $statusMsg);
    }

    /**
     * Store new forum category.
     */
    public function storeCategory(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:50'],
            'color' => ['nullable', 'string', 'max:50'],
        ]);

        ForumCategory::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'icon' => $validated['icon'] ?? 'MessageCircle',
            'color' => $validated['color'] ?? 'brand',
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', 'Kategori forum baru berhasil dibuat.');
    }

    /**
     * Delete forum category.
     */
    public function destroyCategory(ForumCategory $category, Request $request): RedirectResponse
    {
        $category->delete();

        return redirect()->back()->with('success', 'Kategori forum berhasil dihapus.');
    }
}
