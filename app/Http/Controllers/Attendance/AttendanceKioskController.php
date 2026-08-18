<?php

namespace App\Http\Controllers\Attendance;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\StudentCache;
use App\Models\SystemSetting;
use App\Services\Attendance\AttendanceProcessorService;
use App\Services\Supabase\SupabaseAttendanceService;
use App\Services\Sync\StudentSyncService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceKioskController extends Controller
{
    public function __construct(
        protected AttendanceProcessorService $processorService,
        protected SupabaseAttendanceService $supabaseService,
        protected StudentSyncService $syncService
    ) {}

    /**
     * Display the Fullscreen RFID Attendance Kiosk.
     */
    public function kiosk(): Response
    {
        $supabaseSettings = $this->supabaseService->getSettings();
        $deviceId = SystemSetting::get('kiosk_device_id', 'KIOSK-001');
        $deviceName = SystemSetting::get('kiosk_device_name', 'Gerbang Utama');
        $location = SystemSetting::get('kiosk_location', 'Gerbang Depan');
        $schoolName = config('app.name', 'SMK Triwijaya');

        $pendingSyncCount = AttendanceLog::where('sync_status', 'pending')->count();

        return Inertia::render('Attendance/Kiosk', [
            'schoolName' => $schoolName,
            'device' => [
                'id' => $deviceId,
                'name' => $deviceName,
                'location' => $location,
            ],
            'supabaseConfigured' => ! empty($supabaseSettings['url']) && ! empty($supabaseSettings['key']),
            'supabaseEnabled' => $supabaseSettings['enabled'],
            'pendingSyncCount' => $pendingSyncCount,
        ]);
    }

    /**
     * Process RFID UID scan from Kiosk.
     */
    public function scan(Request $request): JsonResponse
    {
        $request->validate([
            'rfid_uid' => 'required|string|max:100',
        ]);

        $result = $this->processorService->processScan($request->input('rfid_uid'));

        return response()->json($result);
    }

    /**
     * Get live status of Kiosk subsystems (Supabase, Reader, Pending Sync).
     */
    public function status(): JsonResponse
    {
        $test = $this->supabaseService->testConnection();
        $pendingCount = AttendanceLog::where('sync_status', 'pending')->count();
        $totalToday = AttendanceLog::where('attendance_date', Carbon::today()->toDateString())->count();

        return response()->json([
            'supabase_online' => ! empty($test['success']),
            'supabase_message' => $test['message'] ?? '',
            'reader_connected' => true,
            'pending_sync' => $pendingCount,
            'total_today' => $totalToday,
            'timestamp' => Carbon::now('Asia/Jakarta')->toIso8601String(),
        ]);
    }

    /**
     * Display Attendance Dashboard & Local Logs.
     */
    public function dashboard(Request $request): Response
    {
        $today = Carbon::today('Asia/Jakarta')->toDateString();
        $filterDate = $request->input('date', $today);
        $filterClass = $request->input('class_id');
        $filterStatus = $request->input('status');
        $filterSync = $request->input('sync_status');

        $query = AttendanceLog::orderBy('created_at', 'desc');

        if ($filterDate) {
            $query->where('attendance_date', $filterDate);
        }
        if ($filterClass) {
            $query->where('class_id', $filterClass);
        }
        if ($filterStatus) {
            $query->where('status', $filterStatus);
        }
        if ($filterSync) {
            $query->where('sync_status', $filterSync);
        }

        $logs = $query->paginate(20)->withQueryString();

        // Summary Stats
        $todayLogs = AttendanceLog::where('attendance_date', $today)->get();
        $totalCachedStudents = StudentCache::count();

        $stats = [
            'total_students' => $totalCachedStudents,
            'today_total' => $todayLogs->count(),
            'today_present' => $todayLogs->where('status', 'present')->count(),
            'today_late' => $todayLogs->where('status', 'late')->count(),
            'pending_sync' => AttendanceLog::where('sync_status', 'pending')->count(),
            'synced_count' => AttendanceLog::where('sync_status', 'synced')->count(),
        ];

        $classes = StudentCache::select('class_id', 'class_name')
            ->whereNotNull('class_id')
            ->distinct()
            ->get();

        $lastSyncAt = SystemSetting::get('last_student_sync_at');

        return Inertia::render('Attendance/Dashboard', [
            'logs' => $logs,
            'stats' => $stats,
            'classes' => $classes,
            'filters' => $request->only(['date', 'class_id', 'status', 'sync_status']),
            'lastSyncAt' => $lastSyncAt ? Carbon::parse($lastSyncAt)->translatedFormat('d F Y, H:i') : null,
        ]);
    }

    /**
     * Display Kiosk & Integration Settings.
     */
    public function settings(): Response
    {
        $settings = [
            'kiosk_device_id' => SystemSetting::get('kiosk_device_id', 'KIOSK-001'),
            'kiosk_device_name' => SystemSetting::get('kiosk_device_name', 'Gerbang Utama'),
            'kiosk_location' => SystemSetting::get('kiosk_location', 'Gerbang Depan'),
            'attendance_start_time' => SystemSetting::get('attendance_start_time', '07:00'),
            'attendance_late_threshold' => SystemSetting::get('attendance_late_threshold', '07:15'),
            'attendance_sync_enabled' => filter_var(SystemSetting::get('attendance_sync_enabled', false), FILTER_VALIDATE_BOOLEAN),
            'supabase_url' => SystemSetting::get('supabase_url', ''),
            'supabase_key' => SystemSetting::get('supabase_key', '') ? '••••••••••••••••' : '',
            'supabase_attendance_table' => SystemSetting::get('supabase_attendance_table', 'student_attendance'),
            'school_api_url' => SystemSetting::get('school_api_url', ''),
            'school_api_token' => SystemSetting::get('school_api_token', '') ? '••••••••••••••••' : '',
            'auto_sync_interval' => (int) SystemSetting::get('auto_sync_interval', 30),
        ];

        return Inertia::render('Attendance/Settings', [
            'settings' => $settings,
            'totalCachedStudents' => StudentCache::count(),
            'lastSyncAt' => SystemSetting::get('last_student_sync_at'),
        ]);
    }

    /**
     * Update Kiosk & Supabase Settings.
     */
    public function updateSettings(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'kiosk_device_id' => 'required|string|max:50',
            'kiosk_device_name' => 'required|string|max:100',
            'kiosk_location' => 'nullable|string|max:100',
            'attendance_start_time' => 'required|string|max:5',
            'attendance_late_threshold' => 'required|string|max:5',
            'attendance_sync_enabled' => 'nullable|boolean',
            'supabase_url' => 'nullable|url|max:255',
            'supabase_key' => 'nullable|string|max:500',
            'supabase_attendance_table' => 'nullable|string|max:100',
            'school_api_url' => 'nullable|url|max:255',
            'school_api_token' => 'nullable|string|max:500',
            'auto_sync_interval' => 'nullable|integer|min:5|max:1440',
        ]);

        foreach ($validated as $key => $value) {
            // If masked password is sent back unchanged, skip overwriting
            if (in_array($key, ['supabase_key', 'school_api_token']) && $value === '••••••••••••••••') {
                continue;
            }

            if ($value !== null) {
                SystemSetting::set($key, $value);
            }
        }

        return back()->with('success', 'Pengaturan Kiosk dan Integrasi Presensi berhasil disimpan.');
    }

    /**
     * Test Supabase connection.
     */
    public function testSupabase(): JsonResponse
    {
        $result = $this->supabaseService->testConnection();

        return response()->json($result);
    }

    /**
     * Trigger Student Roster Sync into Local Cache.
     */
    public function syncStudents(): RedirectResponse
    {
        $result = $this->syncService->sync();

        if ($result['success']) {
            return back()->with('success', $result['message']);
        }

        return back()->with('error', $result['message']);
    }

    /**
     * Retry sending pending attendance logs to Supabase.
     */
    public function retrySync(): RedirectResponse
    {
        $result = $this->supabaseService->retryPendingLogs();

        return back()->with('success', "Proses pengiriman selesai. Berhasil: {$result['synced']}, Gagal/Pending: {$result['failed']} dari {$result['total']} data.");
    }
}
