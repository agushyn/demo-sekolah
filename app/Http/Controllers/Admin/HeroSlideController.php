<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HeroSlide;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class HeroSlideController extends Controller
{
    /**
     * Display a listing of hero slides with Bento stats.
     */
    public function index(Request $request): Response
    {
        $status = $request->query('status');
        $search = $request->query('search');

        $query = HeroSlide::query()->orderBy('sort_order', 'asc')->orderBy('id', 'asc');

        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('subtitle', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        $slides = $query->get()->map(fn ($slide) => [
            'id' => $slide->id,
            'subtitle' => $slide->subtitle,
            'title' => $slide->title,
            'description' => $slide->description,
            'image' => $slide->image,
            'image_url' => $slide->image_url,
            'button_text' => $slide->button_text,
            'button_url' => $slide->button_url,
            'secondary_button_text' => $slide->secondary_button_text,
            'secondary_button_url' => $slide->secondary_button_url,
            'text_position' => $slide->text_position,
            'overlay_type' => $slide->overlay_type,
            'sort_order' => $slide->sort_order,
            'duration' => $slide->duration,
            'is_active' => $slide->is_active,
            'created_at' => $slide->created_at?->format('d M Y H:i'),
        ]);

        $stats = [
            'total_slides' => HeroSlide::count(),
            'active_slides' => HeroSlide::where('is_active', true)->count(),
            'inactive_slides' => HeroSlide::where('is_active', false)->count(),
            'avg_duration' => round(HeroSlide::avg('duration') ?: 5000) / 1000,
        ];

        return Inertia::render('Admin/HeroSlides/Index', [
            'slides' => $slides,
            'stats' => $stats,
            'filters' => [
                'search' => $search ?: '',
                'status' => $status ?: 'all',
            ],
        ]);
    }

    /**
     * Show the form for creating a new hero slide.
     */
    public function create(): Response
    {
        $maxSortOrder = HeroSlide::max('sort_order') ?? 0;

        return Inertia::render('Admin/HeroSlides/Create', [
            'nextSortOrder' => $maxSortOrder + 1,
        ]);
    }

    /**
     * Store a newly created hero slide in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp,svg|max:5120',
            'button_text' => 'nullable|string|max:100',
            'button_url' => 'nullable|string|max:255',
            'secondary_button_text' => 'nullable|string|max:100',
            'secondary_button_url' => 'nullable|string|max:255',
            'text_position' => 'required|in:left,center,right',
            'overlay_type' => 'required|in:dark,light,gradient',
            'sort_order' => 'required|integer|min:0',
            'duration' => 'required|integer|min:1000|max:60000',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('hero-slides', 'public');
        }

        $validated['is_active'] = $request->boolean('is_active', true);

        HeroSlide::create($validated);

        Cache::forget('public_hero_slides');

        return redirect()->route('admin.hero-slides.index')
            ->with('success', 'Slide carousel hero berhasil ditambahkan!');
    }

    /**
     * Show the form for editing the specified hero slide.
     */
    public function edit(HeroSlide $heroSlide): Response
    {
        return Inertia::render('Admin/HeroSlides/Edit', [
            'slide' => [
                'id' => $heroSlide->id,
                'subtitle' => $heroSlide->subtitle ?? '',
                'title' => $heroSlide->title,
                'description' => $heroSlide->description ?? '',
                'image' => $heroSlide->image,
                'image_url' => $heroSlide->image_url,
                'button_text' => $heroSlide->button_text ?? '',
                'button_url' => $heroSlide->button_url ?? '',
                'secondary_button_text' => $heroSlide->secondary_button_text ?? '',
                'secondary_button_url' => $heroSlide->secondary_button_url ?? '',
                'text_position' => $heroSlide->text_position,
                'overlay_type' => $heroSlide->overlay_type,
                'sort_order' => $heroSlide->sort_order,
                'duration' => $heroSlide->duration,
                'is_active' => $heroSlide->is_active,
            ],
        ]);
    }

    /**
     * Update the specified hero slide in storage.
     */
    public function update(Request $request, HeroSlide $heroSlide): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp,svg|max:5120',
            'button_text' => 'nullable|string|max:100',
            'button_url' => 'nullable|string|max:255',
            'secondary_button_text' => 'nullable|string|max:100',
            'secondary_button_url' => 'nullable|string|max:255',
            'text_position' => 'required|in:left,center,right',
            'overlay_type' => 'required|in:dark,light,gradient',
            'sort_order' => 'required|integer|min:0',
            'duration' => 'required|integer|min:1000|max:60000',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('image')) {
            if ($heroSlide->image && Storage::disk('public')->exists($heroSlide->image)) {
                Storage::disk('public')->delete($heroSlide->image);
            }
            $validated['image'] = $request->file('image')->store('hero-slides', 'public');
        }

        $validated['is_active'] = $request->boolean('is_active', true);

        $heroSlide->update($validated);

        Cache::forget('public_hero_slides');

        return redirect()->route('admin.hero-slides.index')
            ->with('success', 'Slide carousel hero berhasil diperbarui!');
    }

    /**
     * Remove the specified hero slide from storage.
     */
    public function destroy(HeroSlide $heroSlide): RedirectResponse
    {
        if ($heroSlide->image && Storage::disk('public')->exists($heroSlide->image)) {
            Storage::disk('public')->delete($heroSlide->image);
        }

        $heroSlide->delete();

        Cache::forget('public_hero_slides');

        return redirect()->route('admin.hero-slides.index')
            ->with('success', 'Slide carousel hero berhasil dihapus!');
    }

    /**
     * Toggle active status of hero slide.
     */
    public function toggleActive(HeroSlide $heroSlide): RedirectResponse
    {
        $heroSlide->is_active = ! $heroSlide->is_active;
        $heroSlide->save();

        Cache::forget('public_hero_slides');

        $statusText = $heroSlide->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return redirect()->back()
            ->with('success', "Slide hero berhasil {$statusText}!");
    }
}
