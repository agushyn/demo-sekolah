<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\ClassModel;
use App\Models\ParentProfile;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\StudentCache;
use App\Models\StudentClassAuditLog;
use App\Models\StudentClassEnrollment;
use App\Models\User;
use App\Services\Excel\StudentExcelExportService;
use App\Services\Excel\StudentExcelImportService;
use App\Services\Excel\StudentExcelTemplateService;
use App\Services\StudentClassService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminStudentController extends Controller
{
    /**
     * Display a listing of students with parent linking and bulk selection support.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $classId = $request->query('class_id');
        $parentStatus = $request->query('parent_status'); // 'linked', 'unlinked', 'all'

        $query = Student::with(['user', 'parent.user', 'classes.academicYear'])
            ->orderBy('id', 'asc');

        if (! empty($search)) {
            $term = trim($search);
            $query->where(function ($q) use ($term) {
                $q->where('nisn', 'like', "%{$term}%")
                    ->orWhere('nis', 'like', "%{$term}%")
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$term}%")->orWhere('email', 'like', "%{$term}%"));
            });
        }

        if (! empty($classId) && $classId !== 'all') {
            $query->whereHas('classes', fn ($c) => $c->where('classes.id', $classId));
        }

        if ($parentStatus === 'linked') {
            $query->whereNotNull('parent_id');
        } elseif ($parentStatus === 'unlinked') {
            $query->whereNull('parent_id');
        }

        $students = $query->paginate(12)->withQueryString();

        $stats = [
            'total' => Student::count(),
            'linked' => Student::whereNotNull('parent_id')->count(),
            'unlinked' => Student::whereNull('parent_id')->count(),
            'classes_count' => ClassModel::count(),
        ];

        $classes = ClassModel::with('academicYear')->orderBy('name', 'asc')->get()->map(fn ($c) => [
            'id' => $c->id,
            'name' => $c->name,
            'grade_level' => $c->grade_level,
            'academic_year' => $c->academicYear?->name ?? '2026/2027',
            'students_count' => $c->students()->count(),
        ]);

        $academicYears = AcademicYear::orderBy('id', 'desc')->get(['id', 'name', 'semester', 'is_active']);

        $parents = ParentProfile::with('user')->get()->map(fn ($p) => [
            'id' => $p->id,
            'name' => $p->user?->name ?? 'Wali Murid',
            'relationship_type' => $p->relationship_type,
            'phone' => $p->phone,
            'email' => $p->user?->email,
        ]);

        return Inertia::render('Admin/Students/Index', [
            'students' => $students,
            'stats' => $stats,
            'classes' => $classes,
            'academicYears' => $academicYears,
            'parents' => $parents,
            'filters' => [
                'search' => $search ?: '',
                'class_id' => $classId ?: 'all',
                'parent_status' => $parentStatus ?: 'all',
            ],
        ]);
    }

    /**
     * Show the form for creating a new student account manually.
     */
    public function create(): Response
    {
        $classes = ClassModel::with('academicYear')->orderBy('name', 'asc')->get();
        $academicYears = AcademicYear::orderBy('id', 'desc')->get();
        $parents = ParentProfile::with('user')->get()->map(fn ($p) => [
            'id' => $p->id,
            'name' => $p->user?->name ?? 'Wali Murid',
            'relationship_type' => $p->relationship_type,
            'phone' => $p->phone,
        ]);

        return Inertia::render('Admin/Students/Create', [
            'classes' => $classes,
            'academicYears' => $academicYears,
            'parents' => $parents,
        ]);
    }

    /**
     * Store a newly created student in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['nullable', 'string', 'min:6'],
            'nisn' => ['nullable', 'string', 'max:20', 'unique:students,nisn'],
            'nis' => ['nullable', 'string', 'max:20', 'unique:students,nis'],
            'gender' => ['required', 'in:L,P'],
            'birth_place' => ['nullable', 'string', 'max:100'],
            'birth_date' => ['nullable', 'date'],
            'address' => ['nullable', 'string', 'max:500'],
            'phone' => ['nullable', 'string', 'max:30'],
            'class_id' => ['required', 'exists:classes,id'],
            'parent_id' => ['nullable', 'exists:parents,id'],
        ]);

        DB::transaction(function () use ($validated, $request) {
            // 1. Create User
            $user = User::create([
                'name' => $validated['name'],
                'email' => strtolower(trim($validated['email'])),
                'password' => Hash::make(($validated['password'] ?? null) ?: 'password'),
                'email_verified_at' => now(),
            ]);
            $user->assignRole('student');

            $class = ClassModel::find($validated['class_id']);

            // 2. Create Student Profile
            $student = Student::create([
                'user_id' => $user->id,
                'parent_id' => ($validated['parent_id'] ?? null) ?: null,
                'nisn' => ($validated['nisn'] ?? null) ?: null,
                'nis' => ($validated['nis'] ?? null) ?: null,
                'gender' => $validated['gender'] ?? 'L',
                'birth_place' => ($validated['birth_place'] ?? null) ?: null,
                'birth_date' => ($validated['birth_date'] ?? null) ?: null,
                'address' => ($validated['address'] ?? null) ?: null,
                'phone' => ($validated['phone'] ?? null) ?: null,
                'grade_level' => $class?->name ?? '10',
            ]);

            // 3. Create Active Enrollment
            if ($class) {
                StudentClassEnrollment::create([
                    'student_id' => $student->id,
                    'class_id' => $class->id,
                    'academic_year_id' => $class->academic_year_id ?? 1,
                    'status' => 'active',
                    'start_date' => now()->toDateString(),
                    'notes' => 'Pendaftaran akun siswa baru secara manual oleh admin.',
                    'created_by' => $request->user()->id,
                ]);

                $student->classes()->sync([$class->id]);
            }

            // 4. Audit Log
            StudentClassAuditLog::create([
                'student_id' => $student->id,
                'to_class_id' => $class?->id,
                'to_academic_year_id' => $class?->academic_year_id,
                'action' => 'initial_enrollment',
                'performed_by' => $request->user()->id,
                'notes' => "Pembuatan akun siswa baru di kelas {$class?->name}.",
            ]);
        });

        return redirect()->route('admin.students.index')->with('success', "Akun siswa '{$validated['name']}' berhasil dibuat.");
    }

    /**
     * Download official XLSX import template with 2 sheets and data validation.
     */
    public function downloadTemplate(StudentExcelTemplateService $templateService): StreamedResponse
    {
        $binary = $templateService->generate();

        return response()->streamDownload(function () use ($binary) {
            echo $binary;
        }, 'template_import_siswa.xlsx', [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    /**
     * Preview student XLSX import file with row-by-row validation.
     */
    public function previewImport(Request $request, StudentExcelImportService $importService): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx', 'max:5120'],
        ], [
            'file.mimes' => 'Format file tidak didukung. Silakan gunakan file Excel .xlsx.',
        ]);

        try {
            $preview = $importService->preview($request->file('file'));

            return response()->json($preview);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Download XLSX error report for failed import rows.
     */
    public function downloadErrorReport(Request $request, StudentExcelImportService $importService): StreamedResponse
    {
        $errorRows = $request->input('error_rows', []);
        $summary = $request->input('summary', []);

        $binary = $importService->generateErrorReport($errorRows, $summary);
        $filename = 'import_error_siswa_'.date('Y').'.xlsx';

        return response()->streamDownload(function () use ($binary) {
            echo $binary;
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    /**
     * Execute batch student import from XLSX data.
     */
    public function executeImport(Request $request, StudentExcelImportService $importService): JsonResponse|RedirectResponse
    {
        $request->validate([
            'rows' => ['required', 'array', 'min:1'],
        ]);

        $result = $importService->executeImport($request->input('rows'), $request->user()->id);

        if ($request->wantsJson()) {
            return response()->json($result);
        }

        $msg = "Import Selesai: {$result['imported_count']} akun siswa berhasil ditambahkan, {$result['skipped_count']} dilewati.";

        return redirect()->route('admin.students.index')->with('success', $msg);
    }

    /**
     * Download temporary credentials as XLSX workbook.
     */
    public function downloadCredentials(Request $request, StudentExcelImportService $importService): StreamedResponse
    {
        $credentials = $request->input('credentials', []);
        $binary = $importService->generateCredentialExport($credentials);
        $filename = 'credential_siswa_'.date('Y').'.xlsx';

        return response()->streamDownload(function () use ($binary) {
            echo $binary;
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    /**
     * Export all student records to XLSX workbook.
     */
    public function export(Request $request, StudentExcelExportService $exportService): StreamedResponse
    {
        $binary = $exportService->export($request->all());
        $filename = 'data_siswa_'.Carbon::today()->format('Y-m-d').'.xlsx';

        return response()->streamDownload(function () use ($binary) {
            echo $binary;
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    /**
     * Display the detailed view of a single student with 6 comprehensive tabs.
     */
    public function show(Student $student): Response
    {
        $student->load([
            'user',
            'parent.user',
            'classes.academicYear',
            'classes.homeroomTeacher.user',
            'activeEnrollment.classRoom',
            'activeEnrollment.academicYear',
            'classHistory.classRoom.homeroomTeacher.user',
            'classHistory.academicYear',
            'classHistory.creator',
            'auditLogs.fromClass',
            'auditLogs.toClass',
            'auditLogs.fromAcademicYear',
            'auditLogs.toAcademicYear',
            'auditLogs.performer',
        ]);

        $classes = ClassModel::with('academicYear')->orderBy('name', 'asc')->get();
        $academicYears = AcademicYear::orderBy('id', 'desc')->get();

        $recentAttendances = $student->attendances()
            ->with(['classRoom', 'recorder'])
            ->latest('date')
            ->take(20)
            ->get();

        $attendanceStats = $student->getAttendanceStats();

        return Inertia::render('Admin/Students/Show', [
            'student' => $student,
            'classes' => $classes,
            'academicYears' => $academicYears,
            'recentAttendances' => $recentAttendances,
            'attendanceStats' => $attendanceStats,
        ]);
    }

    /**
     * Update student class individually with history & audit trail.
     */
    public function updateClass(Request $request, Student $student, StudentClassService $service): RedirectResponse
    {
        $validated = $request->validate([
            'to_class_id' => ['required', 'exists:classes,id'],
            'academic_year_id' => ['nullable', 'exists:academic_years,id'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $service->updateIndividualClass(
            student: $student,
            toClassId: (int) $validated['to_class_id'],
            toAcademicYearId: $validated['academic_year_id'] ? (int) $validated['academic_year_id'] : null,
            notes: $validated['notes'] ?? null,
            performedBy: $request->user()->id
        );

        return redirect()->back()->with('success', "Kelas siswa '{$student->user?->name}' berhasil diperbarui.");
    }

    /**
     * Preview candidate students for batch promotion.
     */
    public function previewBatchPromote(Request $request, StudentClassService $service): JsonResponse
    {
        $validated = $request->validate([
            'from_class_id' => ['required', 'exists:classes,id'],
            'to_class_id' => ['required', 'exists:classes,id'],
            'student_ids' => ['nullable', 'array'],
            'student_ids.*' => ['exists:students,id'],
        ]);

        $preview = $service->previewPromotion(
            fromClassId: (int) $validated['from_class_id'],
            toClassId: (int) $validated['to_class_id'],
            selectedStudentIds: $validated['student_ids'] ?? null
        );

        return response()->json($preview);
    }

    /**
     * Execute atomic batch promotion.
     */
    public function batchPromote(Request $request, StudentClassService $service): RedirectResponse
    {
        $validated = $request->validate([
            'from_class_id' => ['required', 'exists:classes,id'],
            'to_class_id' => ['required', 'exists:classes,id'],
            'student_ids' => ['required', 'array', 'min:1'],
            'student_ids.*' => ['exists:students,id'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $result = $service->promoteStudents(
            fromClassId: (int) $validated['from_class_id'],
            toClassId: (int) $validated['to_class_id'],
            studentIds: $validated['student_ids'],
            notes: $validated['notes'] ?? null,
            performedBy: $request->user()->id
        );

        $msg = "Batch Kenaikan Kelas Berhasil: {$result['success_count']} siswa berhasil dinaikkan dari {$result['from_class']} ke {$result['to_class']}.";

        return redirect()->route('admin.students.index')->with('success', $msg);
    }

    /**
     * Preview candidate students for batch transfer.
     */
    public function previewBatchTransfer(Request $request, StudentClassService $service): JsonResponse
    {
        $validated = $request->validate([
            'from_class_id' => ['required', 'exists:classes,id'],
            'to_class_id' => ['required', 'exists:classes,id'],
            'student_ids' => ['nullable', 'array'],
            'student_ids.*' => ['exists:students,id'],
        ]);

        $preview = $service->previewTransfer(
            fromClassId: (int) $validated['from_class_id'],
            toClassId: (int) $validated['to_class_id'],
            selectedStudentIds: $validated['student_ids'] ?? null
        );

        return response()->json($preview);
    }

    /**
     * Execute atomic batch transfer.
     */
    public function batchTransfer(Request $request, StudentClassService $service): RedirectResponse
    {
        $validated = $request->validate([
            'from_class_id' => ['required', 'exists:classes,id'],
            'to_class_id' => ['required', 'exists:classes,id'],
            'student_ids' => ['required', 'array', 'min:1'],
            'student_ids.*' => ['exists:students,id'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $result = $service->transferStudents(
            fromClassId: (int) $validated['from_class_id'],
            toClassId: (int) $validated['to_class_id'],
            studentIds: $validated['student_ids'],
            notes: $validated['notes'] ?? null,
            performedBy: $request->user()->id
        );

        $msg = "Batch Pindah Kelas Berhasil: {$result['success_count']} siswa dipindahkan dari {$result['from_class']} ke {$result['to_class']}.";

        return redirect()->route('admin.students.index')->with('success', $msg);
    }

    /**
     * Link or unlink a student to a parent profile.
     */
    public function linkParent(Request $request, Student $student): RedirectResponse
    {
        $request->validate([
            'parent_id' => ['nullable', 'exists:parents,id'],
        ]);

        $student->update([
            'parent_id' => $request->input('parent_id'),
        ]);

        $studentName = $student->user?->name ?? $student->nisn;

        if ($request->filled('parent_id')) {
            $parent = ParentProfile::with('user')->find($request->input('parent_id'));
            $parentName = $parent?->user?->name ?? 'Orang Tua';
            $msg = "Siswa '{$studentName}' berhasil dihubungkan ke akun wali '{$parentName}'.";
        } else {
            $msg = "Hubungan akun orang tua untuk siswa '{$studentName}' telah dilepas.";
        }

        return redirect()->back()->with('success', $msg);
    }

    /**
     * Record daily attendance for a student.
     */
    public function recordAttendance(Request $request, Student $student): RedirectResponse
    {
        $request->validate([
            'date' => ['required', 'date'],
            'status' => ['required', 'in:present,permission,sick,absent'],
            'check_in' => ['nullable', 'string', 'max:10'],
            'check_out' => ['nullable', 'string', 'max:10'],
            'notes' => ['nullable', 'string', 'max:255'],
            'class_id' => ['nullable', 'exists:classes,id'],
        ]);

        StudentAttendance::updateOrCreate(
            [
                'student_id' => $student->id,
                'date' => $request->input('date'),
            ],
            [
                'class_id' => $request->input('class_id') ?? $student->classes()->first()?->id,
                'academic_year_id' => $student->activeEnrollment?->academic_year_id,
                'check_in' => $request->input('check_in'),
                'check_out' => $request->input('check_out'),
                'status' => $request->input('status'),
                'source' => 'manual',
                'notes' => $request->input('notes'),
                'recorded_by' => $request->user()->id,
            ]
        );

        return redirect()->back()->with('success', 'Presensi siswa berhasil dicatat.');
    }

    /**
     * Assign a new RFID card to the student.
     */
    public function assignRfid(Request $request, Student $student): RedirectResponse
    {
        $request->validate([
            'rfid_uid' => ['required', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:255'],
        ]);

        $uid = strtoupper(preg_replace('/[^a-zA-Z0-9]/', '', trim($request->input('rfid_uid'))));

        if (empty($uid)) {
            return redirect()->back()->with('error', 'UID RFID tidak boleh kosong.');
        }

        // Check uniqueness across other students
        $existing = Student::where('rfid_uid', $uid)
            ->where('id', '!=', $student->id)
            ->with('user')
            ->first();

        if ($existing) {
            $ownerName = $existing->user?->name ?? 'Siswa lain';

            return redirect()->back()->with('error', "Kartu RFID '{$uid}' sudah terdaftar pada {$ownerName} (NIS: {$existing->nis}).");
        }

        DB::transaction(function () use ($student, $uid, $request) {
            // Deactivate any currently active cards for this student
            $student->rfidCards()->where('is_active', true)->update([
                'is_active' => false,
                'unassigned_at' => Carbon::now(),
            ]);

            // Assign to master student
            $student->update(['rfid_uid' => $uid]);

            // Record history
            $student->rfidCards()->create([
                'rfid_uid' => $uid,
                'assigned_at' => Carbon::now(),
                'is_active' => true,
                'notes' => $request->input('notes', 'Kartu RFID Baru'),
                'created_by' => $request->user()->id,
            ]);

            // Sync to local cache
            StudentCache::updateOrCreate(
                ['school_student_id' => $student->id],
                [
                    'nis' => $student->nis,
                    'nisn' => $student->nisn,
                    'name' => $student->user?->name ?? 'Siswa',
                    'rfid_uid' => $uid,
                    'status' => 'active',
                    'synced_at' => Carbon::now(),
                ]
            );
        });

        return redirect()->back()->with('success', "Kartu RFID '{$uid}' berhasil ditautkan ke siswa.");
    }

    /**
     * Replace an existing RFID card for the student.
     */
    public function replaceRfid(Request $request, Student $student): RedirectResponse
    {
        $request->validate([
            'new_rfid_uid' => ['required', 'string', 'max:100'],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        $newUid = strtoupper(preg_replace('/[^a-zA-Z0-9]/', '', trim($request->input('new_rfid_uid'))));

        if (empty($newUid)) {
            return redirect()->back()->with('error', 'UID RFID pengganti tidak valid.');
        }

        // Check uniqueness across other students
        $existing = Student::where('rfid_uid', $newUid)
            ->where('id', '!=', $student->id)
            ->with('user')
            ->first();

        if ($existing) {
            $ownerName = $existing->user?->name ?? 'Siswa lain';

            return redirect()->back()->with('error', "Kartu RFID '{$newUid}' sudah terdaftar pada {$ownerName} (NIS: {$existing->nis}).");
        }

        $oldUid = $student->rfid_uid;

        DB::transaction(function () use ($student, $newUid, $request, $oldUid) {
            // Deactivate existing cards
            $student->rfidCards()->where('is_active', true)->update([
                'is_active' => false,
                'unassigned_at' => Carbon::now(),
                'notes' => 'Digantikan dengan kartu baru: '.$newUid,
            ]);

            // Assign new UID
            $student->update(['rfid_uid' => $newUid]);

            // Record new history card
            $student->rfidCards()->create([
                'rfid_uid' => $newUid,
                'assigned_at' => Carbon::now(),
                'is_active' => true,
                'notes' => $request->input('reason', 'Penggantian kartu lama ('.($oldUid ?: '-').')'),
                'created_by' => $request->user()->id,
            ]);

            // Sync to local cache
            StudentCache::updateOrCreate(
                ['school_student_id' => $student->id],
                [
                    'nis' => $student->nis,
                    'nisn' => $student->nisn,
                    'name' => $student->user?->name ?? 'Siswa',
                    'rfid_uid' => $newUid,
                    'status' => 'active',
                    'synced_at' => Carbon::now(),
                ]
            );
        });

        return redirect()->back()->with('success', "Kartu RFID berhasil diganti ke '{$newUid}'.");
    }

    /**
     * Remove / de-assign RFID card from student.
     */
    public function removeRfid(Request $request, Student $student): RedirectResponse
    {
        $oldUid = $student->rfid_uid;

        DB::transaction(function () use ($student) {
            $student->rfidCards()->where('is_active', true)->update([
                'is_active' => false,
                'unassigned_at' => Carbon::now(),
                'notes' => 'Kartu dinonaktifkan / dilepas oleh admin',
            ]);

            $student->update(['rfid_uid' => null]);

            StudentCache::updateOrCreate(
                ['school_student_id' => $student->id],
                [
                    'rfid_uid' => null,
                    'synced_at' => Carbon::now(),
                ]
            );
        });

        return redirect()->back()->with('success', "Kartu RFID ('{$oldUid}') berhasil dinonaktifkan dari siswa.");
    }
}
