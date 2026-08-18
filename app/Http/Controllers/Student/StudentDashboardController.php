<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentDashboardController extends Controller
{
    /**
     * Display the student dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user()->load('student.parent');
        $student = $user->student;

        $enrolledClassIds = $student ? $student->classes()->pluck('classes.id')->toArray() : [];

        $summary = [
            'enrolled_classes' => count($enrolledClassIds),
            'active_assignments' => Assignment::where('status', 'published')
                ->where('deadline', '>=', now())
                ->whereHas('classTeacher', fn ($q) => $q->whereIn('class_id', $enrolledClassIds))
                ->count(),
            'available_modules' => Lesson::where('is_published', true)
                ->whereHas('classTeacher', fn ($q) => $q->whereIn('class_id', $enrolledClassIds))
                ->count(),
            'graded_submissions' => $student ? AssignmentSubmission::where('student_id', $student->id)->where('status', 'graded')->count() : 0,
        ];

        $upcomingAssignments = Assignment::with([
            'classTeacher.classRoom',
            'classTeacher.subject',
            'submissions' => fn ($q) => $q->where('student_id', $student?->id),
        ])
            ->where('status', 'published')
            ->whereHas('classTeacher', fn ($q) => $q->whereIn('class_id', $enrolledClassIds))
            ->orderBy('deadline', 'asc')
            ->take(4)
            ->get();

        $recentLessons = Lesson::with(['classTeacher.classRoom', 'classTeacher.subject', 'files'])
            ->where('is_published', true)
            ->whereHas('classTeacher', fn ($q) => $q->whereIn('class_id', $enrolledClassIds))
            ->latest('published_at')
            ->take(4)
            ->get();

        $recentGraded = $student ? AssignmentSubmission::with(['assignment.classTeacher.subject', 'grader'])
            ->where('student_id', $student->id)
            ->where('status', 'graded')
            ->latest('graded_at')
            ->take(4)
            ->get() : collect();

        return Inertia::render('Student/index', [
            'student' => $student,
            'summary' => $summary,
            'upcomingAssignments' => $upcomingAssignments,
            'recentLessons' => $recentLessons,
            'recentGraded' => $recentGraded,
        ]);
    }
}
