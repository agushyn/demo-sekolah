<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttendanceLog extends Model
{
    use HasFactory;

    protected $table = 'attendance_logs';

    protected $fillable = [
        'school_student_id',
        'nis',
        'student_name',
        'class_id',
        'class_name',
        'rfid_uid',
        'attendance_date',
        'attendance_time',
        'status',
        'device_id',
        'device_name',
        'source',
        'sync_status',
        'supabase_id',
        'attempts',
        'error_message',
        'payload',
        'last_attempt_at',
    ];

    protected $casts = [
        'attendance_date' => 'date',
        'payload' => 'array',
        'last_attempt_at' => 'datetime',
    ];

    protected $appends = [
        'status_label',
        'status_badge',
        'sync_status_label',
        'sync_badge',
    ];

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'present' => 'Hadir Tepat Waktu',
            'late' => 'Terlambat',
            'permission' => 'Izin',
            'sick' => 'Sakit',
            'absent' => 'Alpa',
            default => 'Hadir',
        };
    }

    public function getStatusBadgeAttribute(): string
    {
        return match ($this->status) {
            'present' => 'success',
            'late' => 'warning',
            'permission' => 'indigo',
            'sick' => 'warning',
            'absent' => 'danger',
            default => 'neutral',
        };
    }

    public function getSyncStatusLabelAttribute(): string
    {
        return match ($this->sync_status) {
            'synced' => 'Tersinkron (Supabase)',
            'pending' => 'Menunggu Antrean (Pending)',
            'failed' => 'Gagal Sinkron',
            default => 'Pending',
        };
    }

    public function getSyncBadgeAttribute(): string
    {
        return match ($this->sync_status) {
            'synced' => 'success',
            'pending' => 'warning',
            'failed' => 'danger',
            default => 'neutral',
        };
    }
}
