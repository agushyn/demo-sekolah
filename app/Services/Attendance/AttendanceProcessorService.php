<?php

namespace App\Services\Attendance;

use App\Models\AttendanceLog;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\StudentCache;
use App\Models\SystemSetting;
use App\Services\Rfid\UsbKeyboardRfidReader;
use App\Services\Supabase\SupabaseAttendanceService;
use Carbon\Carbon;

class AttendanceProcessorService
{
    public function __construct(
        protected UsbKeyboardRfidReader $rfidReader,
        protected SupabaseAttendanceService $supabaseService
    ) {}

    /**
     * Process RFID UID scan from Kiosk.
     */
    public function processScan(string $rawUid): array
    {
        $uid = $this->rfidReader->normalizeUid($rawUid);

        if (! $this->rfidReader->validateUid($uid)) {
            return [
                'success' => false,
                'type' => 'invalid_format',
                'title' => 'FORMAT RFID TIDAK VALID',
                'message' => 'UID kartu tidak sesuai format.',
                'rfid_uid' => $rawUid,
            ];
        }

        // 1. Student Lookup (Local Cache first, fallback to Master Student)
        $studentCache = StudentCache::findByRfid($uid)->first();

        $studentData = null;
        if ($studentCache) {
            $studentData = [
                'id' => $studentCache->school_student_id,
                'nis' => $studentCache->nis,
                'nisn' => $studentCache->nisn,
                'name' => $studentCache->name,
                'class_id' => $studentCache->class_id,
                'class_name' => $studentCache->class_name,
                'academic_year_id' => $studentCache->academic_year_id,
                'status' => $studentCache->status,
                'photo_url' => $studentCache->photo_url,
            ];
        } else {
            // Fallback direct check on Master Student table
            $masterStudent = Student::with(['user', 'classes', 'activeEnrollment.classRoom', 'activeEnrollment.academicYear'])
                ->where('rfid_uid', $uid)
                ->first();

            if ($masterStudent) {
                $activeClass = $masterStudent->activeEnrollment?->classRoom ?? $masterStudent->classes->first();
                $activeYear = $masterStudent->activeEnrollment?->academicYear ?? $activeClass?->academicYear;

                $studentData = [
                    'id' => $masterStudent->id,
                    'nis' => $masterStudent->nis,
                    'nisn' => $masterStudent->nisn,
                    'name' => $masterStudent->user?->name ?? 'Siswa',
                    'class_id' => $activeClass?->id,
                    'class_name' => $activeClass?->name ?? $masterStudent->grade_level ?? 'Kelas',
                    'academic_year_id' => $activeYear?->id,
                    'status' => 'active',
                    'photo_url' => null,
                ];

                // Auto cache for subsequent scans
                StudentCache::updateOrCreate(
                    ['school_student_id' => $masterStudent->id],
                    [
                        'nis' => $studentData['nis'],
                        'nisn' => $studentData['nisn'],
                        'name' => $studentData['name'],
                        'class_id' => $studentData['class_id'],
                        'class_name' => $studentData['class_name'],
                        'academic_year_id' => $studentData['academic_year_id'],
                        'rfid_uid' => $uid,
                        'status' => 'active',
                        'synced_at' => Carbon::now(),
                    ]
                );
            }
        }

        // 2. Reject if Student Not Found
        if (! $studentData) {
            return [
                'success' => false,
                'type' => 'not_registered',
                'title' => 'KARTU TIDAK TERDAFTAR',
                'message' => 'Kartu RFID belum ditautkan ke akun siswa. Hubungi administrator.',
                'rfid_uid' => $uid,
            ];
        }

        // 3. Reject if Student is Inactive
        if ($studentData['status'] !== 'active') {
            return [
                'success' => false,
                'type' => 'inactive_student',
                'title' => 'KARTU TIDAK AKTIF',
                'message' => 'Status siswa nonaktif atau sudah lulus.',
                'student_name' => $studentData['name'],
                'rfid_uid' => $uid,
            ];
        }

        // 4. Double Scan Protection (Check today's attendance record)
        $now = Carbon::now('Asia/Jakarta');
        $todayDate = $now->toDateString();
        $currentTime = $now->format('H:i:s');

        $existingLog = AttendanceLog::where('school_student_id', $studentData['id'])
            ->whereDate('attendance_date', $todayDate)
            ->first();

        if ($existingLog) {
            return [
                'success' => true,
                'type' => 'already_attended',
                'title' => 'SUDAH MELAKUKAN ABSENSI',
                'student_name' => $studentData['name'],
                'nis' => $studentData['nis'] ?? '-',
                'class_name' => $studentData['class_name'] ?? '-',
                'status' => $existingLog->status,
                'status_label' => $existingLog->status_label,
                'attendance_time' => $existingLog->attendance_time,
                'message' => "Anda sudah tercatat absen pada pukul {$existingLog->attendance_time}.",
            ];
        }

        // 5. Evaluate Attendance Status (Present vs Late)
        $schoolStartTime = SystemSetting::get('attendance_start_time', '07:00');
        $lateAfterTime = SystemSetting::get('attendance_late_threshold', '07:15');

        $currentHourMinute = $now->format('H:i');
        $status = ($currentHourMinute <= $lateAfterTime) ? 'present' : 'late';

        // 6. Device configuration
        $deviceId = SystemSetting::get('kiosk_device_id', 'KIOSK-001');
        $deviceName = SystemSetting::get('kiosk_device_name', 'Gerbang Utama');

        // 7. Save Local AttendanceLog Record
        $log = AttendanceLog::create([
            'school_student_id' => $studentData['id'],
            'nis' => $studentData['nis'],
            'student_name' => $studentData['name'],
            'class_id' => $studentData['class_id'],
            'class_name' => $studentData['class_name'],
            'rfid_uid' => $uid,
            'attendance_date' => $todayDate,
            'attendance_time' => $currentTime,
            'status' => $status,
            'device_id' => $deviceId,
            'device_name' => $deviceName,
            'source' => 'rfid',
            'sync_status' => 'pending',
        ]);

        // 8. Also record in Master StudentAttendance table if available
        try {
            StudentAttendance::updateOrCreate(
                [
                    'student_id' => $studentData['id'],
                    'date' => $todayDate,
                ],
                [
                    'class_id' => $studentData['class_id'],
                    'academic_year_id' => $studentData['academic_year_id'],
                    'check_in' => $currentTime,
                    'status' => $status === 'late' ? 'present' : 'present',
                    'source' => 'internal',
                    'external_id' => $uid,
                    'notes' => $status === 'late' ? "Terlambat (Scan Kiosk {$currentTime})" : "Tepat Waktu (Scan Kiosk {$currentTime})",
                    'synced_at' => $now,
                ]
            );
        } catch (\Throwable $e) {
            // Non-blocking
        }

        // 9. Asynchronously/Directly attempt Supabase POST
        $supabaseResult = $this->supabaseService->postAttendance($log);

        return [
            'success' => true,
            'type' => 'success',
            'title' => 'ABSENSI BERHASIL',
            'student_name' => $studentData['name'],
            'nis' => $studentData['nis'] ?? '-',
            'class_name' => $studentData['class_name'] ?? '-',
            'status' => $status,
            'status_label' => $status === 'late' ? 'Terlambat' : 'Hadir Tepat Waktu',
            'attendance_time' => $currentTime,
            'attendance_date' => $now->translatedFormat('l, d F Y'),
            'sync_status' => $log->fresh()->sync_status,
            'supabase_connected' => ! empty($supabaseResult['success']),
        ];
    }
}
