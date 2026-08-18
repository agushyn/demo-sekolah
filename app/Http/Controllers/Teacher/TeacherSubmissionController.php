<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class TeacherSubmissionController extends Controller
{
    /**
     * Display student submissions for review.
     */
    public function index(Request $request): Response
    {
        $teacher = $request->user()->teacher;

        if (! $teacher) {
            abort(403, 'Profil Guru tidak ditemukan.');
        }

        $assignmentId = $request->query('assignment_id');
        $status = $request->query('status');

        $query = AssignmentSubmission::with([
            'assignment.classTeacher.classRoom',
            'assignment.classTeacher.subject',
            'student.user',
            'grader',
        ])->whereHas('assignment.classTeacher', function ($q) use ($teacher) {
            $q->where('teacher_id', $teacher->id);
        })->latest('submitted_at');

        if (! empty($assignmentId) && $assignmentId !== 'all') {
            $query->where('assignment_id', $assignmentId);
        }

        if (! empty($status) && $status !== 'all') {
            $query->where('status', $status);
        }

        $submissions = $query->get();

        $assignments = Assignment::with(['classTeacher.classRoom', 'classTeacher.subject'])
            ->whereHas('classTeacher', function ($q) use ($teacher) {
                $q->where('teacher_id', $teacher->id);
            })
            ->get();

        return Inertia::render('Teacher/Assignments/Submissions', [
            'submissions' => $submissions,
            'assignments' => $assignments,
            'filters' => [
                'assignment_id' => $assignmentId ?: 'all',
                'status' => $status ?: 'all',
            ],
        ]);
    }

    /**
     * Grade a student submission with score and feedback.
     */
    public function grade(AssignmentSubmission $submission, Request $request): RedirectResponse
    {
        $teacher = $request->user()->teacher;

        if (! $teacher) {
            abort(403, 'Profil Guru tidak ditemukan.');
        }

        // Verify teacher teaches this course
        if ($submission->assignment->classTeacher->teacher_id !== $teacher->id) {
            abort(403, 'Anda tidak memiliki hak akses untuk menilai tugas ini.');
        }

        $maxScore = $submission->assignment->max_score ?? 100;

        $validated = $request->validate([
            'score' => ['required', 'numeric', 'min:0', "max:{$maxScore}"],
            'feedback' => ['nullable', 'string'],
        ]);

        $submission->update([
            'score' => $validated['score'],
            'feedback' => $validated['feedback'] ?? null,
            'status' => 'graded',
            'graded_by' => $request->user()->id,
            'graded_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Nilai dan evaluasi feedback berhasil disimpan.');
    }

    /**
     * Securely download private submission file.
     */
    public function download(AssignmentSubmission $submission, Request $request)
    {
        $teacher = $request->user()->teacher;

        if (! $teacher) {
            abort(403, 'Profil Guru tidak ditemukan.');
        }

        // Verify teacher teaches this assignment
        if ($submission->assignment->classTeacher->teacher_id !== $teacher->id) {
            abort(403, 'Anda tidak memiliki hak untuk mengunduh berkas ini.');
        }

        if (! $submission->file_path || ! Storage::disk('local')->exists($submission->file_path)) {
            abort(404, 'Berkas jawaban siswa tidak ditemukan di server.');
        }

        $filename = basename($submission->file_path);

        return Storage::disk('local')->download($submission->file_path, "Tugas_{$submission->student->user->name}_{$filename}");
    }
}
