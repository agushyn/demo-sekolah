<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\ClassTeacher;
use App\Models\Lesson;
use App\Models\LessonFile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeacherLessonController extends Controller
{
    /**
     * Display list of lessons created by this teacher.
     */
    public function index(Request $request): Response
    {
        $teacher = $request->user()->teacher;

        if (! $teacher) {
            abort(403, 'Profil Guru tidak ditemukan.');
        }

        $lessons = Lesson::with(['classTeacher.classRoom', 'classTeacher.subject', 'files'])
            ->whereHas('classTeacher', function ($q) use ($teacher) {
                $q->where('teacher_id', $teacher->id);
            })
            ->latest('created_at')
            ->get();

        $courses = ClassTeacher::with(['classRoom', 'subject'])
            ->where('teacher_id', $teacher->id)
            ->get();

        return Inertia::render('Teacher/Lessons/Index', [
            'lessons' => $lessons,
            'courses' => $courses,
        ]);
    }

    /**
     * Store a newly created lesson and optional attachment file.
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
            'content' => ['nullable', 'string'],
            'video_url' => ['nullable', 'url', 'max:255'],
            'is_published' => ['nullable', 'boolean'],
            'file' => ['nullable', 'file', 'max:10240'], // 10MB max
        ]);

        // Enforce ownership: ClassTeacher must belong to this teacher
        $course = ClassTeacher::where('id', $validated['class_teacher_id'])
            ->where('teacher_id', $teacher->id)
            ->firstOrFail();

        $lesson = Lesson::create([
            'class_teacher_id' => $course->id,
            'title' => $validated['title'],
            'content' => $validated['content'] ?? null,
            'video_url' => $validated['video_url'] ?? null,
            'is_published' => $request->boolean('is_published', true),
            'published_at' => $request->boolean('is_published', true) ? now() : null,
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store("lessons/{$lesson->id}", 'public');

            LessonFile::create([
                'lesson_id' => $lesson->id,
                'file_path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getClientMimeType() ?: $file->getMimeType(),
                'file_size' => $file->getSize(),
            ]);
        }

        return redirect()->back()->with('success', 'Materi modul pembelajaran berhasil diterbitkan.');
    }

    /**
     * Remove the specified lesson.
     */
    public function destroy(Lesson $lesson, Request $request): RedirectResponse
    {
        $teacher = $request->user()->teacher;

        if (! $teacher) {
            abort(403, 'Profil Guru tidak ditemukan.');
        }

        // Verify ownership
        if ($lesson->classTeacher->teacher_id !== $teacher->id) {
            abort(403, 'Anda tidak memiliki hak untuk menghapus materi ini.');
        }

        $lesson->delete();

        return redirect()->back()->with('success', 'Materi modul pembelajaran berhasil dihapus.');
    }
}
