<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\AcademicEvent;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\News;
use App\Models\SchoolSetting;
use App\Models\SchoolStaff;
use App\Models\StudentAttendance;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ParentDashboardController extends Controller
{
    /**
     * Display the comprehensive parent portal dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user()->load(['parentProfile.students.user', 'parentProfile.students.classes.homeroomTeacher.user']);
        $parentProfile = $user->parentProfile;

        $children = $parentProfile?->students ?? collect();

        // Active selected child
        $selectedChildId = $request->query('child_id');
        $selectedChild = null;

        if ($selectedChildId) {
            $selectedChild = $children->firstWhere('id', (int) $selectedChildId);
        }

        if (! $selectedChild && $children->isNotEmpty()) {
            $selectedChild = $children->first();
        }

        // Child Academic Data (If child exists)
        $childData = null;
        if ($selectedChild) {
            $selectedChild->load(['user', 'classes.academicYear', 'classes.homeroomTeacher.user', 'classes.classTeachers.subject']);

            $enrolledClass = $selectedChild->classes->first();
            $enrolledClassIds = $selectedChild->classes->pluck('id')->toArray();

            // 1. Graded Submissions / Nilai
            $gradedSubmissions = AssignmentSubmission::with(['assignment.classTeacher.subject', 'assignment.classTeacher.classRoom', 'grader'])
                ->where('student_id', $selectedChild->id)
                ->where('status', 'graded')
                ->latest('graded_at')
                ->get()
                ->map(fn ($sub) => [
                    'id' => $sub->id,
                    'assignment_title' => $sub->assignment?->title ?? 'Tugas',
                    'subject_name' => $sub->assignment?->classTeacher?->subject?->name ?? 'Mata Pelajaran',
                    'class_name' => $sub->assignment?->classTeacher?->classRoom?->name ?? '-',
                    'score' => $sub->score,
                    'max_score' => $sub->assignment?->max_score ?? 100,
                    'feedback' => $sub->feedback,
                    'grader_name' => $sub->grader?->name ?? 'Guru Pengampu',
                    'graded_at' => $sub->graded_at?->translatedFormat('d M Y, H:i'),
                    'submitted_at' => $sub->submitted_at?->translatedFormat('d M Y, H:i'),
                ]);

            $avgScore = $gradedSubmissions->isNotEmpty()
                ? round($gradedSubmissions->avg('score'), 1)
                : 0;

            // 2. Active & Past Assignments / Tugas
            $assignments = Assignment::with(['classTeacher.subject', 'classTeacher.classRoom'])
                ->whereHas('classTeacher', fn ($q) => $q->whereIn('class_id', $enrolledClassIds))
                ->where('status', 'published')
                ->latest('deadline')
                ->take(10)
                ->get()
                ->map(function ($asg) use ($selectedChild) {
                    $submission = AssignmentSubmission::where('assignment_id', $asg->id)
                        ->where('student_id', $selectedChild->id)
                        ->first();

                    $isOverdue = ! $submission && now()->isAfter($asg->deadline);

                    return [
                        'id' => $asg->id,
                        'title' => $asg->title,
                        'description' => $asg->description,
                        'subject_name' => $asg->classTeacher?->subject?->name ?? 'Mata Pelajaran',
                        'class_name' => $asg->classTeacher?->classRoom?->name ?? '-',
                        'deadline' => $asg->deadline->translatedFormat('d M Y, H:i'),
                        'deadline_iso' => $asg->deadline->toIso8601String(),
                        'is_overdue' => $isOverdue,
                        'submission' => $submission ? [
                            'status' => $submission->status,
                            'score' => $submission->score,
                            'feedback' => $submission->feedback,
                            'submitted_at' => $submission->submitted_at?->translatedFormat('d M Y, H:i'),
                        ] : null,
                    ];
                });

            // 3. Attendance Records / Presensi
            $attendanceStats = $selectedChild->getAttendanceStats();
            $recentAttendances = StudentAttendance::with('classRoom')
                ->where('student_id', $selectedChild->id)
                ->latest('date')
                ->take(10)
                ->get()
                ->map(fn ($att) => [
                    'id' => $att->id,
                    'date' => $att->date->translatedFormat('d M Y'),
                    'day_name' => $att->date->translatedFormat('l'),
                    'status' => $att->status,
                    'status_label' => $att->status_label,
                    'badge_variant' => $att->badge_variant,
                    'notes' => $att->notes,
                    'class_name' => $att->classRoom?->name ?? '-',
                ]);

            $childData = [
                'id' => $selectedChild->id,
                'name' => $selectedChild->user?->name ?? 'Siswa',
                'email' => $selectedChild->user?->email,
                'nisn' => $selectedChild->nisn,
                'nis' => $selectedChild->nis,
                'gender' => $selectedChild->gender === 'L' ? 'Laki-laki' : ($selectedChild->gender === 'P' ? 'Perempuan' : '-'),
                'birth_place' => $selectedChild->birth_place,
                'birth_date' => $selectedChild->birth_date?->translatedFormat('d F Y'),
                'address' => $selectedChild->address,
                'phone' => $selectedChild->phone,
                'grade_level' => $selectedChild->grade_level ?? $enrolledClass?->name ?? 'Tingkat X',
                'class' => $enrolledClass ? [
                    'id' => $enrolledClass->id,
                    'name' => $enrolledClass->name,
                    'academic_year' => $enrolledClass->academicYear?->name ?? '2026/2027',
                    'homeroom_teacher' => $enrolledClass->homeroomTeacher?->user?->name ?? 'Wali Kelas Terdaftar',
                    'homeroom_phone' => $enrolledClass->homeroomTeacher?->phone ?? '-',
                ] : null,
                'stats' => [
                    'average_score' => $avgScore,
                    'graded_count' => $gradedSubmissions->count(),
                    'pending_assignments' => $assignments->where('submission', null)->where('is_overdue', false)->count(),
                    'attendance_rate' => $attendanceStats['attendance_rate'],
                ],
                'grades' => $gradedSubmissions,
                'assignments' => $assignments,
                'attendance_summary' => $attendanceStats,
                'recent_attendances' => $recentAttendances,
            ];
        }

        // 4. School Announcements & Calendar
        $upcomingEvents = AcademicEvent::publicOnly()
            ->upcoming()
            ->take(3)
            ->get()
            ->map(fn ($ev) => [
                'id' => $ev->id,
                'title' => $ev->title,
                'description' => $ev->description,
                'formatted_date' => $ev->formatted_date_range,
                'category_name' => $ev->category?->name ?? 'Umum',
                'color' => $ev->category?->color ?? 'brand',
            ]);

        $latestNews = News::published()
            ->latest('published_at')
            ->take(3)
            ->get()
            ->map(fn ($n) => [
                'id' => $n->id,
                'title' => $n->title,
                'slug' => $n->slug,
                'date' => $n->formatted_date,
                'excerpt' => $n->excerpt,
            ]);

        // 5. School Information
        $principal = SchoolStaff::active()->where('position', 'like', '%Kepala Sekolah%')->first();

        $schoolInfo = [
            'name' => SchoolSetting::get('school_name', 'SMK Triwijaya'),
            'accreditation' => 'A (Unggul) — BAN-S/M',
            'npsn' => '20101456',
            'curriculum' => 'Kurikulum Merdeka Mandiri Berbagi',
            'phone' => SchoolSetting::get('school_phone', '+62 21 7890 1234'),
            'email' => SchoolSetting::get('school_email', 'info@smanusantara.sch.id'),
            'address' => 'Jl. Pendidikan Karakter No. 100, Jakarta Selatan, DKI Jakarta',
            'principal_name' => $principal?->name ?? 'Drs. H. Bambang Suryono, M.Pd.',
            'office_hours' => 'Senin - Jumat (07.00 - 16.00 WIB)',
        ];

        return Inertia::render('Parent/index', [
            'parentProfile' => $parentProfile,
            'childrenList' => $children->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->user?->name ?? 'Siswa',
                'nisn' => $c->nisn,
                'class_name' => $c->classes->first()?->name ?? $c->grade_level ?? 'Kelas',
            ]),
            'selectedChild' => $childData,
            'upcomingEvents' => $upcomingEvents,
            'latestNews' => $latestNews,
            'schoolInfo' => $schoolInfo,
        ]);
    }
}
