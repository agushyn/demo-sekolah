<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class StudentAssignmentController extends Controller
{
    /**
     * Display assignments from enrolled classes.
     */
    public function index(Request $request): Response
    {
        $student = $request->user()->student;

        if (! $student) {
            abort(403, 'Profil Siswa tidak ditemukan.');
        }

        $enrolledClassIds = $student->classes()->pluck('classes.id')->toArray();

        $assignments = Assignment::with([
            'classTeacher.classRoom',
            'classTeacher.subject',
            'classTeacher.teacher.user',
            'submissions' => fn ($q) => $q->where('student_id', $student->id),
        ])
            ->where('status', 'published')
            ->whereHas('classTeacher', function ($q) use ($enrolledClassIds) {
                $q->whereIn('class_id', $enrolledClassIds);
            })
            ->orderBy('deadline', 'asc')
            ->get();

        return Inertia::render('Student/Assignments/Index', [
            'assignments' => $assignments,
        ]);
    }

    /**
     * Display assignment detail and submission panel.
     */
    public function show(Assignment $assignment, Request $request): Response
    {
        $student = $request->user()->student;

        if (! $student) {
            abort(403, 'Profil Siswa tidak ditemukan.');
        }

        $enrolledClassIds = $student->classes()->pluck('classes.id')->toArray();

        // Enforce enrollment
        if (! in_array($assignment->classTeacher->class_id, $enrolledClassIds, true)) {
            abort(403, 'Anda tidak terdaftar di kelas untuk tugas ini.');
        }

        $assignment->load([
            'classTeacher.classRoom',
            'classTeacher.subject',
            'classTeacher.teacher.user',
        ]);

        $submission = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->where('student_id', $student->id)
            ->first();

        return Inertia::render('Student/Assignments/Show', [
            'assignment' => $assignment,
            'submission' => $submission,
        ]);
    }

    /**
     * Submit assignment answer file.
     */
    public function submit(Assignment $assignment, Request $request): RedirectResponse
    {
        $student = $request->user()->student;

        if (! $student) {
            abort(403, 'Profil Siswa tidak ditemukan.');
        }

        $enrolledClassIds = $student->classes()->pluck('classes.id')->toArray();

        // Enforce enrollment
        if (! in_array($assignment->classTeacher->class_id, $enrolledClassIds, true)) {
            abort(403, 'Anda tidak terdaftar di kelas untuk tugas ini.');
        }

        // Enforce deadline
        $isLate = now()->gt($assignment->deadline);

        if ($isLate && ! $assignment->allow_late_submission) {
            return redirect()->back()->withErrors([
                'file' => 'Batas waktu pengumpulan tugas telah berakhir dan pengumpulan terlambat tidak diizinkan.',
            ]);
        }

        $request->validate([
            'file' => ['required', 'file', 'max:15360'], // 15MB max
            'notes' => ['nullable', 'string'],
        ]);

        $file = $request->file('file');
        $path = $file->store("submissions/{$assignment->id}/{$student->id}", 'local');

        AssignmentSubmission::updateOrCreate(
            [
                'assignment_id' => $assignment->id,
                'student_id' => $student->id,
            ],
            [
                'file_path' => $path,
                'notes' => $request->input('notes'),
                'status' => $isLate ? 'late' : 'submitted',
                'submitted_at' => now(),
            ]
        );

        $statusMsg = $isLate ? 'Tugas berhasil dikumpulkan (Terlambat).' : 'Tugas berhasil dikumpulkan tepat waktu.';

        return redirect()->back()->with('success', $statusMsg);
    }

    /**
     * Download own private submission file.
     */
    public function downloadSubmission(AssignmentSubmission $submission, Request $request)
    {
        $student = $request->user()->student;

        if (! $student) {
            abort(403, 'Profil Siswa tidak ditemukan.');
        }

        // Strict authorization: Student can only download their OWN submission
        if ($submission->student_id !== $student->id) {
            abort(403, 'Anda tidak diizinkan mengakses pengumpulan tugas siswa lain.');
        }

        if (! $submission->file_path || ! Storage::disk('local')->exists($submission->file_path)) {
            abort(404, 'Berkas pengumpulan tidak ditemukan.');
        }

        return Storage::disk('local')->download($submission->file_path, basename($submission->file_path));
    }
}
