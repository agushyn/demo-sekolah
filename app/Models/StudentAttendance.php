<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentAttendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'class_id',
        'academic_year_id',
        'date',
        'check_in',
        'check_out',
        'status',
        'source',
        'external_id',
        'notes',
        'raw_data',
        'recorded_by',
        'synced_at',
    ];

    protected $casts = [
        'date' => 'date',
        'raw_data' => 'array',
        'synced_at' => 'datetime',
    ];

    protected $appends = [
        'status_label',
        'badge_variant',
        'source_label',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function classRoom(): BelongsTo
    {
        return $this->belongsTo(ClassModel::class, 'class_id');
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'present' => 'Hadir',
            'permission' => 'Izin',
            'sick' => 'Sakit',
            'absent' => 'Alpa / Tanpa Keterangan',
            default => 'Hadir',
        };
    }

    public function getBadgeVariantAttribute(): string
    {
        return match ($this->status) {
            'present' => 'success',
            'permission' => 'indigo',
            'sick' => 'warning',
            'absent' => 'danger',
            default => 'neutral',
        };
    }

    public function getSourceLabelAttribute(): string
    {
        return match ($this->source) {
            'external_api' => 'API Eksternal',
            'internal' => 'Internal Sekolah',
            default => 'Manual (Admin/Guru)',
        };
    }

    public function scopeForStudent($query, int $studentId)
    {
        return $query->where('student_id', $studentId);
    }
}
