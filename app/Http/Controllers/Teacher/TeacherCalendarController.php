<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\AcademicEvent;
use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeacherCalendarController extends Controller
{
    /**
     * Display the academic calendar for teachers (includes internal events).
     */
    public function index(Request $request): Response
    {
        $category = $request->query('category');
        $search = $request->query('search');

        $query = AcademicEvent::with(['academicYear', 'author'])
            ->orderBy('start_date', 'asc');

        if (! empty($search)) {
            $query->search($search);
        }

        if (! empty($category) && $category !== 'all' && $category !== 'Semua') {
            $query->where('category', $category);
        }

        $events = $query->get();

        $activeYear = AcademicYear::where('is_active', true)->first();

        return Inertia::render('Teacher/Calendar', [
            'events' => $events,
            'activeYear' => $activeYear,
            'currentCategory' => $category ?: 'Semua',
            'categories' => [
                ['id' => 'Semua', 'name' => 'Semua Agenda'],
                ['id' => 'academic', 'name' => 'Akademik'],
                ['id' => 'exam', 'name' => 'Ujian & Asesmen'],
                ['id' => 'meeting', 'name' => 'Rapat Dinas & Dewan Guru'],
                ['id' => 'holiday', 'name' => 'Libur Sekolah'],
                ['id' => 'activity', 'name' => 'Kegiatan Siswa'],
                ['id' => 'event', 'name' => 'Event & Upacara'],
            ],
        ]);
    }
}
