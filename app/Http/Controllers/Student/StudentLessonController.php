<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\LessonFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class StudentLessonController extends Controller
{
    /**
     * Display published lessons for enrolled classes.
     */
    public function index(Request $request): Response
    {
        $student = $request->user()->student;

        if (! $student) {
            abort(403, 'Profil Siswa tidak ditemukan.');
        }

        $enrolledClassIds = $student->classes()->pluck('classes.id')->toArray();

        $lessons = Lesson::with(['classTeacher.classRoom', 'classTeacher.subject', 'classTeacher.teacher.user', 'files'])
            ->where('is_published', true)
            ->whereHas('classTeacher', function ($q) use ($enrolledClassIds) {
                $q->whereIn('class_id', $enrolledClassIds);
            })
            ->latest('published_at')
            ->get();

        return Inertia::render('Student/Lessons/Index', [
            'lessons' => $lessons,
        ]);
    }

    /**
     * Display lesson details.
     */
    public function show(Lesson $lesson, Request $request): Response
    {
        $student = $request->user()->student;

        if (! $student) {
            abort(403, 'Profil Siswa tidak ditemukan.');
        }

        $enrolledClassIds = $student->classes()->pluck('classes.id')->toArray();

        // Enforce student is enrolled in this lesson's class
        if (! in_array($lesson->classTeacher->class_id, $enrolledClassIds, true)) {
            abort(403, 'Anda tidak terdaftar di kelas untuk materi ini.');
        }

        if (! $lesson->is_published) {
            abort(404, 'Materi belum dipublikasikan.');
        }

        $lesson->load(['classTeacher.classRoom', 'classTeacher.subject', 'classTeacher.teacher.user', 'files']);

        return Inertia::render('Student/Lessons/Show', [
            'lesson' => $lesson,
        ]);
    }

    /**
     * Download attached lesson file.
     */
    public function download(LessonFile $file, Request $request)
    {
        $student = $request->user()->student;

        if (! $student) {
            abort(403, 'Profil Siswa tidak ditemukan.');
        }

        $enrolledClassIds = $student->classes()->pluck('classes.id')->toArray();

        if (! in_array($file->lesson->classTeacher->class_id, $enrolledClassIds, true)) {
            abort(403, 'Anda tidak memiliki hak untuk mengunduh modul ini.');
        }

        if (! Storage::disk('public')->exists($file->file_path)) {
            abort(404, 'Berkas materi tidak ditemukan di server.');
        }

        return Storage::disk('public')->download($file->file_path, $file->original_name);
    }
}
