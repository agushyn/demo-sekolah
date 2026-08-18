<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\ClassModel;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentClassController extends Controller
{
    /**
     * Display enrolled classes for the authenticated student.
     */
    public function index(Request $request): Response
    {
        $student = $request->user()->student;

        if (! $student) {
            abort(403, 'Profil Siswa tidak ditemukan.');
        }

        $classes = $student->classes()
            ->with(['homeroomTeacher.user', 'classTeachers.teacher.user', 'classTeachers.subject'])
            ->withCount(['students'])
            ->get();

        return Inertia::render('Student/Classes/Index', [
            'classes' => $classes,
        ]);
    }

    /**
     * Display classroom details (Lessons and Assignments).
     */
    public function show(ClassModel $class, Request $request): Response
    {
        $student = $request->user()->student;

        if (! $student) {
            abort(403, 'Profil Siswa tidak ditemukan.');
        }

        // Strict Enrollment Verification
        if (! $class->students()->where('student_id', $student->id)->exists()) {
            abort(403, 'Anda tidak terdaftar sebagai siswa di kelas ini.');
        }

        $class->load([
            'academicYear',
            'homeroomTeacher.user',
            'classTeachers.subject',
            'classTeachers.teacher.user',
            'classTeachers.lessons' => fn ($q) => $q->where('is_published', true)->with('files')->latest(),
            'classTeachers.assignments' => fn ($q) => $q->where('status', 'published')->with([
                'submissions' => fn ($subQ) => $subQ->where('student_id', $student->id),
            ]),
        ]);

        return Inertia::render('Student/Classes/Show', [
            'classroom' => $class,
        ]);
    }
}
