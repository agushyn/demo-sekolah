<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAcademicEventRequest;
use App\Http\Requests\Admin\UpdateAcademicEventRequest;
use App\Models\AcademicEvent;
use App\Models\AcademicYear;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminCalendarController extends Controller
{
    /**
     * Display the Admin Calendar page.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $category = $request->query('category');
        $visibility = $request->query('visibility');

        $query = AcademicEvent::with(['academicYear', 'author'])
            ->orderBy('start_date', 'asc');

        if (! empty($search)) {
            $query->search($search);
        }

        if (! empty($category) && $category !== 'all') {
            $query->where('category', $category);
        }

        if ($visibility === 'public') {
            $query->where('is_public', true);
        } elseif ($visibility === 'internal') {
            $query->where('is_public', false);
        }

        $events = $query->get();

        $stats = [
            'total_events' => AcademicEvent::count(),
            'upcoming_count' => AcademicEvent::upcoming()->count(),
            'public_count' => AcademicEvent::where('is_public', true)->count(),
            'internal_count' => AcademicEvent::where('is_public', false)->count(),
        ];

        $academicYears = AcademicYear::orderBy('name', 'desc')->get();
        $activeYear = AcademicYear::where('is_active', true)->first();

        return Inertia::render('Admin/Calendar/Index', [
            'events' => $events,
            'stats' => $stats,
            'academicYears' => $academicYears,
            'activeYear' => $activeYear,
            'filters' => [
                'search' => $search ?: '',
                'category' => $category ?: 'all',
                'visibility' => $visibility ?: 'all',
            ],
            'categories' => [
                ['id' => 'academic', 'name' => 'Akademik', 'color' => 'brand'],
                ['id' => 'exam', 'name' => 'Ujian', 'color' => 'danger'],
                ['id' => 'holiday', 'name' => 'Libur Sekolah', 'color' => 'emerald'],
                ['id' => 'activity', 'name' => 'Kegiatan Siswa', 'color' => 'purple'],
                ['id' => 'meeting', 'name' => 'Rapat Guru & Dinas', 'color' => 'amber'],
                ['id' => 'event', 'name' => 'Event & Pentas Seni', 'color' => 'indigo'],
            ],
        ]);
    }

    /**
     * Store a newly created academic event in storage.
     */
    public function store(StoreAcademicEventRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $activeYear = AcademicYear::where('is_active', true)->first();
        $startDate = $validated['start_date'];
        $endDate = ! empty($validated['end_date']) ? $validated['end_date'] : $startDate;

        AcademicEvent::create([
            'academic_year_id' => $validated['academic_year_id'] ?? $activeYear?->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'start_time' => ! empty($validated['start_time']) ? $validated['start_time'] : null,
            'end_time' => ! empty($validated['end_time']) ? $validated['end_time'] : null,
            'category' => $validated['category'],
            'location' => $validated['location'] ?? null,
            'is_public' => $request->boolean('is_public', true),
            'created_by' => $request->user()->id,
        ]);

        return redirect()->route('admin.calendar.index')
            ->with('success', 'Agenda kegiatan akademik berhasil ditambahkan.');
    }

    /**
     * Update the specified academic event in storage.
     */
    public function update(UpdateAcademicEventRequest $request, AcademicEvent $calendar): RedirectResponse
    {
        $validated = $request->validated();

        $startDate = $validated['start_date'] ?? $calendar->start_date;
        $endDate = ! empty($validated['end_date']) ? $validated['end_date'] : $startDate;

        $calendar->update([
            'academic_year_id' => $validated['academic_year_id'] ?? $calendar->academic_year_id,
            'title' => $validated['title'] ?? $calendar->title,
            'description' => array_key_exists('description', $validated) ? $validated['description'] : $calendar->description,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'start_time' => ! empty($validated['start_time']) ? $validated['start_time'] : null,
            'end_time' => ! empty($validated['end_time']) ? $validated['end_time'] : null,
            'category' => $validated['category'] ?? $calendar->category,
            'location' => array_key_exists('location', $validated) ? $validated['location'] : $calendar->location,
            'is_public' => $request->has('is_public') ? $request->boolean('is_public') : $calendar->is_public,
        ]);

        return redirect()->route('admin.calendar.index')
            ->with('success', 'Agenda kegiatan akademik berhasil diperbarui.');
    }

    /**
     * Remove the specified academic event from storage.
     */
    public function destroy(AcademicEvent $calendar): RedirectResponse
    {
        $calendar->delete();

        return redirect()->route('admin.calendar.index')
            ->with('success', 'Agenda kegiatan akademik berhasil dihapus.');
    }

    /**
     * Toggle visibility (public / internal).
     */
    public function toggleVisibility(AcademicEvent $calendar): RedirectResponse
    {
        $calendar->update([
            'is_public' => ! $calendar->is_public,
        ]);

        $status = $calendar->is_public ? 'Publik' : 'Internal Sekolah';

        return redirect()->back()->with('success', "Visibilitas agenda diubah menjadi {$status}.");
    }
}
