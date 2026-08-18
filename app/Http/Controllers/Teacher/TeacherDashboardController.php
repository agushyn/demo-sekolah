<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\ClassTeacher;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeacherDashboardController extends Controller
{
    /**
     * Display the teacher dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user()->load('teacher');
        $teacher = $user->teacher;

        $courses = $teacher ? ClassTeacher::with(['classRoom', 'subject'])->where('teacher_id', $teacher->id)->get() : collect();

        $summary = [
            'total_classes' => $courses->count(),
            'active_assignments' => $teacher ? Assignment::whereHas('classTeacher', fn ($q) => $q->where('teacher_id', $teacher->id))->where('status', 'published')->count() : 0,
            'pending_grading' => $teacher ? AssignmentSubmission::whereHas('assignment.classTeacher', fn ($q) => $q->where('teacher_id', $teacher->id))->whereIn('status', ['submitted', 'late'])->count() : 0,
            'uploaded_lessons' => $teacher ? Lesson::whereHas('classTeacher', fn ($q) => $q->where('teacher_id', $teacher->id))->count() : 0,
        ];

        $recentSubmissions = $teacher ? AssignmentSubmission::with(['assignment', 'student.user'])
            ->whereHas('assignment.classTeacher', fn ($q) => $q->where('teacher_id', $teacher->id))
            ->whereIn('status', ['submitted', 'late'])
            ->latest('submitted_at')
            ->take(5)
            ->get() : collect();

        return Inertia::render('Teacher/index', [
            'teacher' => $teacher,
            'summary' => $summary,
            'courses' => $courses,
            'recentSubmissions' => $recentSubmissions,
        ]);
    }
}
