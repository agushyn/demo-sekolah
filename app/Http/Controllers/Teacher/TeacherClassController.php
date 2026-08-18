<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\ClassModel;
use App\Models\ClassTeacher;
use App\Models\Subject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeacherClassController extends Controller
{
    /**
     * Display classes taught by the authenticated teacher.
     */
    public function index(Request $request): Response
    {
        $teacher = $request->user()->teacher;

        if (! $teacher) {
            abort(403, 'Profil Guru tidak ditemukan.');
        }

        $courses = ClassTeacher::with(['classRoom.academicYear', 'subject', 'classRoom.students'])
            ->withCount(['lessons', 'assignments'])
            ->where('teacher_id', $teacher->id)
            ->get();

        $allClasses = ClassModel::with('academicYear')->orderBy('name')->get();
        $allSubjects = Subject::orderBy('name')->get();

        return Inertia::render('Teacher/Classes/Index', [
            'courses' => $courses,
            'allClasses' => $allClasses,
            'allSubjects' => $allSubjects,
        ]);
    }

    /**
     * Display classroom details (lessons, assignments, enrolled students).
     */
    public function show(ClassModel $class, Request $request): Response
    {
        $teacher = $request->user()->teacher;

        if (! $teacher) {
            abort(403, 'Profil Guru tidak ditemukan.');
        }

        // Authorization check: Teacher must teach this class
        $courses = ClassTeacher::with(['subject', 'lessons.files', 'assignments.submissions'])
            ->where('class_id', $class->id)
            ->where('teacher_id', $teacher->id)
            ->get();

        if ($courses->isEmpty() && $class->homeroom_teacher_id !== $teacher->id) {
            abort(403, 'Anda tidak memiliki hak akses untuk mengelola kelas ini.');
        }

        $class->load(['students.user', 'academicYear', 'homeroomTeacher.user']);

        return Inertia::render('Teacher/Classes/Show', [
            'classroom' => $class,
            'courses' => $courses,
        ]);
    }

    /**
     * Add a new course offering (teach subject in class).
     */
    public function store(Request $request): RedirectResponse
    {
        $teacher = $request->user()->teacher;

        if (! $teacher) {
            abort(403, 'Profil Guru tidak ditemukan.');
        }

        $validated = $request->validate([
            'class_id' => ['required', 'exists:classes,id'],
            'subject_id' => ['required', 'exists:subjects,id'],
        ]);

        ClassTeacher::firstOrCreate([
            'class_id' => $validated['class_id'],
            'teacher_id' => $teacher->id,
            'subject_id' => $validated['subject_id'],
        ]);

        return redirect()->back()->with('success', 'Rombongan belajar & mata pelajaran berhasil ditambahkan.');
    }
}
