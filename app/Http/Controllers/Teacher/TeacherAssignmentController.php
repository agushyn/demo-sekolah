<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\ClassTeacher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeacherAssignmentController extends Controller
{
    /**
     * Display assignments created by the teacher.
     */
    public function index(Request $request): Response
    {
        $teacher = $request->user()->teacher;

        if (! $teacher) {
            abort(403, 'Profil Guru tidak ditemukan.');
        }

        $assignments = Assignment::with(['classTeacher.classRoom', 'classTeacher.subject'])
            ->withCount(['submissions'])
            ->whereHas('classTeacher', function ($q) use ($teacher) {
                $q->where('teacher_id', $teacher->id);
            })
            ->latest('created_at')
            ->get();

        $courses = ClassTeacher::with(['classRoom', 'subject'])
            ->where('teacher_id', $teacher->id)
            ->get();

        return Inertia::render('Teacher/Assignments/Index', [
            'assignments' => $assignments,
            'courses' => $courses,
        ]);
    }

    /**
     * Store a newly created assignment.
     */
    public function store(Request $request): RedirectResponse
    {
        $teacher = $request->user()->teacher;

        if (! $teacher) {
            abort(403, 'Profil Guru tidak ditemukan.');
        }

        $validated = $request->validate([
            'class_teacher_id' => ['required', 'exists:class_teachers,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'deadline' => ['required', 'date', 'after:now'],
            'allow_late_submission' => ['nullable', 'boolean'],
            'max_score' => ['nullable', 'integer', 'min:10', 'max:100'],
            'status' => ['required', 'in:draft,published,closed'],
        ]);

        // Enforce ownership
        $course = ClassTeacher::where('id', $validated['class_teacher_id'])
            ->where('teacher_id', $teacher->id)
            ->firstOrFail();

        Assignment::create([
            'class_teacher_id' => $course->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'deadline' => $validated['deadline'],
            'allow_late_submission' => $request->boolean('allow_late_submission', false),
            'max_score' => $validated['max_score'] ?? 100,
            'status' => $validated['status'],
        ]);

        return redirect()->back()->with('success', 'Penugasan siswa berhasil dibuat dan diterbitkan.');
    }

    /**
     * Remove the specified assignment.
     */
    public function destroy(Assignment $assignment, Request $request): RedirectResponse
    {
        $teacher = $request->user()->teacher;

        if (! $teacher) {
            abort(403, 'Profil Guru tidak ditemukan.');
        }

        if ($assignment->classTeacher->teacher_id !== $teacher->id) {
            abort(403, 'Anda tidak memiliki hak untuk menghapus tugas ini.');
        }

        $assignment->delete();

        return redirect()->back()->with('success', 'Penugasan berhasil dihapus.');
    }
}
