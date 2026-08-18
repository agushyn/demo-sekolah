<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\ClassModel;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\SystemSetting;
use App\Services\Attendance\AttendanceProviderFactory;
use App\Services\Attendance\InternalAttendanceProvider;
use App\Services\Excel\AttendanceExcelExportService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminAttendanceController extends Controller
{
    /**
     * Display the admin attendance dashboard with statistics, filters, and API ready status.
     */
    public function index(Request $request): Response
    {
        $dateStr = $request->query('date', Carbon::today()->toDateString());
        $date = Carbon::parse($dateStr);

        $classId = $request->query('class_id');
        $source = $request->query('source'); // 'manual', 'internal', 'external_api', 'all'
        $status = $request->query('status'); // 'present', 'permission', 'sick', 'absent', 'all'

        $query = StudentAttendance::with(['student.user', 'student.classes', 'classRoom', 'recorder'])
            ->whereDate('date', $date->toDateString());

        if (! empty($classId) && $classId !== 'all') {
            $query->where('class_id', $classId);
        }

        if (! empty($source) && $source !== 'all') {
            $query->where('source', $source);
        }

        if (! empty($status) && $status !== 'all') {
            $query->where('status', $status);
        }

        $attendances = $query->paginate(15)->withQueryString();

        $activeProvider = AttendanceProviderFactory::make();
        $summary = (new InternalAttendanceProvider)->getAttendanceSummary($date, (! empty($classId) && $classId !== 'all') ? (int) $classId : null);

        $classes = ClassModel::with('academicYear')->orderBy('name', 'asc')->get();
        $academicYears = AcademicYear::orderBy('id', 'desc')->get();

        $isApiConfigured = $activeProvider->isConfigured();
        $driver = SystemSetting::get('attendance_driver', config('services.attendance_api.driver', 'internal'));

        $apiStatus = [
            'is_configured' => $isApiConfigured,
            'provider_name' => $activeProvider->getProviderName(),
            'driver' => $driver,
            'message' => $isApiConfigured
                ? "Integrasi {$activeProvider->getProviderName()} Aktif & Siap Disinkronkan."
                : 'Integrasi aplikasi presensi eksternal belum dikonfigurasi. Sistem saat ini berjalan dalam mode Basis Data Internal / Presensi Manual.',
        ];

        return Inertia::render('Admin/Attendance/Index', [
            'attendances' => $attendances,
            'summary' => $summary,
            'classes' => $classes,
            'academicYears' => $academicYears,
            'apiStatus' => $apiStatus,
            'filters' => [
                'date' => $date->toDateString(),
                'class_id' => $classId ?: 'all',
                'source' => $source ?: 'all',
                'status' => $status ?: 'all',
            ],
        ]);
    }

    /**
     * Store or update manual attendance record.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'student_id' => ['required', 'exists:students,id'],
            'date' => ['required', 'date'],
            'status' => ['required', 'in:present,permission,sick,absent'],
            'check_in' => ['nullable', 'string', 'max:10'],
            'check_out' => ['nullable', 'string', 'max:10'],
            'notes' => ['nullable', 'string', 'max:255'],
            'class_id' => ['nullable', 'exists:classes,id'],
        ]);

        $student = Student::findOrFail($validated['student_id']);
        $classId = $validated['class_id'] ?? $student->classes()->first()?->id;

        StudentAttendance::updateOrCreate(
            [
                'student_id' => $student->id,
                'date' => $validated['date'],
            ],
            [
                'class_id' => $classId,
                'academic_year_id' => $student->activeEnrollment?->academic_year_id,
                'check_in' => $validated['check_in'] ?? null,
                'check_out' => $validated['check_out'] ?? null,
                'status' => $validated['status'],
                'source' => 'manual',
                'notes' => $validated['notes'] ?? null,
                'recorded_by' => $request->user()->id,
            ]
        );

        return redirect()->back()->with('success', 'Presensi siswa berhasil dicatat.');
    }

    /**
     * Trigger synchronization with external attendance API / Supabase.
     */
    public function sync(Request $request): RedirectResponse
    {
        $dateStr = $request->input('date', Carbon::today()->toDateString());
        $date = Carbon::parse($dateStr);

        $provider = AttendanceProviderFactory::make();
        $result = $provider->syncAttendance($date);

        if ($result['status'] === 'unconfigured') {
            return redirect()->back()->with('warning', $result['message']);
        }

        if ($result['status'] === 'error') {
            return redirect()->back()->with('error', $result['message']);
        }

        return redirect()->back()->with('success', $result['message']);
    }

    /**
     * Export attendance data to XLSX with filters and multi-sheet summary.
     */
    public function export(Request $request, AttendanceExcelExportService $exportService): StreamedResponse
    {
        $filters = [
            'class_id' => $request->query('class_id'),
            'date' => $request->query('date'),
            'start_date' => $request->query('start_date'),
            'end_date' => $request->query('end_date'),
            'academic_year_id' => $request->query('academic_year_id'),
            'student_id' => $request->query('student_id'),
            'status' => $request->query('status'),
            'source' => $request->query('source'),
        ];

        $exportData = $exportService->export($filters);
        $binary = $exportData['binary'];
        $filename = $exportData['filename'];

        return response()->streamDownload(function () use ($binary) {
            echo $binary;
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }
}
