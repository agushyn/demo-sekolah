<?php

namespace App\Services;

use App\Models\ClassModel;
use App\Models\Student;
use App\Models\StudentClassAuditLog;
use App\Models\StudentClassEnrollment;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class StudentClassService
{
    /**
     * Update student class individually with full history tracking and audit log.
     */
    public function updateIndividualClass(
        Student $student,
        int $toClassId,
        ?int $toAcademicYearId = null,
        ?string $notes = null,
        ?int $performedBy = null
    ): Student {
        $toClass = ClassModel::with('academicYear')->findOrFail($toClassId);
        $academicYearId = $toAcademicYearId ?? $toClass->academic_year_id ?? 1;

        return DB::transaction(function () use ($student, $toClass, $academicYearId, $notes, $performedBy) {
            // Find current active enrollment
            $currentEnrollment = $student->enrollments()
                ->where('status', 'active')
                ->first();

            $fromClassId = $currentEnrollment?->class_id ?? $student->classes()->first()?->id;
            $fromAcademicYearId = $currentEnrollment?->academic_year_id ?? $currentEnrollment?->classRoom?->academic_year_id;

            // If changing to a different class
            if ($fromClassId !== $toClass->id) {
                if ($currentEnrollment) {
                    $currentEnrollment->update([
                        'status' => 'transferred',
                        'end_date' => now()->toDateString(),
                        'notes' => $notes ? ($currentEnrollment->notes."\n".$notes) : $currentEnrollment->notes,
                    ]);
                }

                // Create new active enrollment
                StudentClassEnrollment::updateOrCreate(
                    [
                        'student_id' => $student->id,
                        'academic_year_id' => $academicYearId,
                        'class_id' => $toClass->id,
                    ],
                    [
                        'status' => 'active',
                        'start_date' => now()->toDateString(),
                        'end_date' => null,
                        'notes' => $notes,
                        'created_by' => $performedBy,
                    ]
                );

                // Sync active class pivot for Virtual Classroom & relations
                $student->classes()->sync([$toClass->id]);

                // Update grade level on student model
                $student->update([
                    'grade_level' => $toClass->name,
                ]);

                // Log audit trail
                StudentClassAuditLog::create([
                    'student_id' => $student->id,
                    'from_class_id' => $fromClassId,
                    'to_class_id' => $toClass->id,
                    'from_academic_year_id' => $fromAcademicYearId,
                    'to_academic_year_id' => $academicYearId,
                    'action' => 'individual_edit',
                    'performed_by' => $performedBy,
                    'notes' => $notes ?? 'Perubahan kelas siswa secara individual oleh administrator.',
                ]);
            }

            return $student->fresh(['classes', 'enrollments', 'auditLogs']);
        });
    }

    /**
     * Preview candidate students for batch promotion.
     */
    public function previewPromotion(int $fromClassId, int $toClassId, ?array $selectedStudentIds = null): array
    {
        $fromClass = ClassModel::with(['academicYear', 'students.user'])->findOrFail($fromClassId);
        $toClass = ClassModel::with('academicYear')->findOrFail($toClassId);

        $query = $fromClass->students();
        if (! empty($selectedStudentIds)) {
            $query->whereIn('students.id', $selectedStudentIds);
        }

        $students = $query->get();

        $previewList = [];
        $readyCount = 0;
        $skipCount = 0;

        foreach ($students as $student) {
            $issues = [];
            $status = 'ready';

            // Check if already in target class
            if ($fromClassId === $toClassId) {
                $status = 'skip';
                $issues[] = 'Kelas asal dan kelas tujuan tidak boleh sama.';
            }

            // Check if student already has active enrollment in target class or target year
            $existingTargetEnrollment = StudentClassEnrollment::where('student_id', $student->id)
                ->where('academic_year_id', $toClass->academic_year_id)
                ->where('class_id', $toClass->id)
                ->where('status', 'active')
                ->first();

            if ($existingTargetEnrollment) {
                $status = 'skip';
                $issues[] = "Siswa sudah terdaftar aktif di {$toClass->name}.";
            }

            if ($status === 'ready') {
                $readyCount++;
            } else {
                $skipCount++;
            }

            $previewList[] = [
                'id' => $student->id,
                'name' => $student->user?->name ?? 'Siswa',
                'nisn' => $student->nisn,
                'nis' => $student->nis,
                'from_class' => $fromClass->name,
                'to_class' => $toClass->name,
                'status' => $status,
                'issues' => $issues,
            ];
        }

        return [
            'from_class' => [
                'id' => $fromClass->id,
                'name' => $fromClass->name,
                'academic_year' => $fromClass->academicYear?->name ?? '-',
            ],
            'to_class' => [
                'id' => $toClass->id,
                'name' => $toClass->name,
                'academic_year' => $toClass->academicYear?->name ?? '-',
            ],
            'total_found' => count($previewList),
            'ready_count' => $readyCount,
            'skip_count' => $skipCount,
            'students' => $previewList,
        ];
    }

    /**
     * Execute atomic batch promotion for selected students.
     */
    public function promoteStudents(
        int $fromClassId,
        int $toClassId,
        array $studentIds,
        ?string $notes = null,
        ?int $performedBy = null
    ): array {
        if (empty($studentIds)) {
            throw new InvalidArgumentException('Daftar siswa yang akan dinaikkan tidak boleh kosong.');
        }

        $fromClass = ClassModel::with('academicYear')->findOrFail($fromClassId);
        $toClass = ClassModel::with('academicYear')->findOrFail($toClassId);

        return DB::transaction(function () use ($fromClass, $toClass, $studentIds, $notes, $performedBy) {
            $successCount = 0;
            $skipped = [];

            $students = Student::whereIn('id', $studentIds)->get();

            foreach ($students as $student) {
                // Check if already active in target
                $isAlreadyTarget = StudentClassEnrollment::where('student_id', $student->id)
                    ->where('academic_year_id', $toClass->academic_year_id)
                    ->where('class_id', $toClass->id)
                    ->where('status', 'active')
                    ->exists();

                if ($isAlreadyTarget) {
                    $skipped[] = [
                        'id' => $student->id,
                        'name' => $student->user?->name ?? $student->nisn,
                        'reason' => 'Siswa sudah terdaftar di kelas tujuan.',
                    ];

                    continue;
                }

                // 1. Mark current enrollment as completed
                StudentClassEnrollment::where('student_id', $student->id)
                    ->where('status', 'active')
                    ->update([
                        'status' => 'completed',
                        'end_date' => now()->toDateString(),
                    ]);

                // 2. Create new active enrollment in target class
                StudentClassEnrollment::updateOrCreate(
                    [
                        'student_id' => $student->id,
                        'academic_year_id' => $toClass->academic_year_id ?? 1,
                        'class_id' => $toClass->id,
                    ],
                    [
                        'status' => 'active',
                        'start_date' => now()->toDateString(),
                        'end_date' => null,
                        'notes' => $notes,
                        'created_by' => $performedBy,
                    ]
                );

                // 3. Sync pivot & update grade_level
                $student->classes()->sync([$toClass->id]);
                $student->update(['grade_level' => $toClass->name]);

                // 4. Audit Log
                StudentClassAuditLog::create([
                    'student_id' => $student->id,
                    'from_class_id' => $fromClass->id,
                    'to_class_id' => $toClass->id,
                    'from_academic_year_id' => $fromClass->academic_year_id,
                    'to_academic_year_id' => $toClass->academic_year_id,
                    'action' => 'promoted',
                    'performed_by' => $performedBy,
                    'notes' => $notes ?? "Kenaikan kelas dari {$fromClass->name} ke {$toClass->name}.",
                ]);

                $successCount++;
            }

            return [
                'success_count' => $successCount,
                'skip_count' => count($skipped),
                'skipped' => $skipped,
                'from_class' => $fromClass->name,
                'to_class' => $toClass->name,
            ];
        });
    }

    /**
     * Preview candidate students for batch transfer.
     */
    public function previewTransfer(int $fromClassId, int $toClassId, ?array $selectedStudentIds = null): array
    {
        return $this->previewPromotion($fromClassId, $toClassId, $selectedStudentIds);
    }

    /**
     * Execute atomic batch transfer for selected students.
     */
    public function transferStudents(
        int $fromClassId,
        int $toClassId,
        array $studentIds,
        ?string $notes = null,
        ?int $performedBy = null
    ): array {
        if (empty($studentIds)) {
            throw new InvalidArgumentException('Daftar siswa yang akan dipindahkan tidak boleh kosong.');
        }

        $fromClass = ClassModel::with('academicYear')->findOrFail($fromClassId);
        $toClass = ClassModel::with('academicYear')->findOrFail($toClassId);

        return DB::transaction(function () use ($fromClass, $toClass, $studentIds, $notes, $performedBy) {
            $successCount = 0;
            $skipped = [];

            $students = Student::whereIn('id', $studentIds)->get();

            foreach ($students as $student) {
                // Check if already in target
                $isAlreadyTarget = StudentClassEnrollment::where('student_id', $student->id)
                    ->where('academic_year_id', $toClass->academic_year_id)
                    ->where('class_id', $toClass->id)
                    ->where('status', 'active')
                    ->exists();

                if ($isAlreadyTarget) {
                    $skipped[] = [
                        'id' => $student->id,
                        'name' => $student->user?->name ?? $student->nisn,
                        'reason' => 'Siswa sudah berada di kelas tujuan.',
                    ];

                    continue;
                }

                // 1. Mark previous enrollment as transferred
                StudentClassEnrollment::where('student_id', $student->id)
                    ->where('status', 'active')
                    ->update([
                        'status' => 'transferred',
                        'end_date' => now()->toDateString(),
                    ]);

                // 2. Create new active enrollment
                StudentClassEnrollment::updateOrCreate(
                    [
                        'student_id' => $student->id,
                        'academic_year_id' => $toClass->academic_year_id ?? 1,
                        'class_id' => $toClass->id,
                    ],
                    [
                        'status' => 'active',
                        'start_date' => now()->toDateString(),
                        'end_date' => null,
                        'notes' => $notes,
                        'created_by' => $performedBy,
                    ]
                );

                // 3. Sync pivot & update grade_level
                $student->classes()->sync([$toClass->id]);
                $student->update(['grade_level' => $toClass->name]);

                // 4. Audit Log
                StudentClassAuditLog::create([
                    'student_id' => $student->id,
                    'from_class_id' => $fromClass->id,
                    'to_class_id' => $toClass->id,
                    'from_academic_year_id' => $fromClass->academic_year_id,
                    'to_academic_year_id' => $toClass->academic_year_id,
                    'action' => 'transferred',
                    'performed_by' => $performedBy,
                    'notes' => $notes ?? "Pindah rombel dari {$fromClass->name} ke {$toClass->name}.",
                ]);

                $successCount++;
            }

            return [
                'success_count' => $successCount,
                'skip_count' => count($skipped),
                'skipped' => $skipped,
                'from_class' => $fromClass->name,
                'to_class' => $toClass->name,
            ];
        });
    }
}
