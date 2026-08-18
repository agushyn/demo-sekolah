<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentClassEnrollment extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'class_id',
        'academic_year_id',
        'status',
        'start_date',
        'end_date',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    protected $appends = [
        'status_label',
        'badge_variant',
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

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'active' => 'Aktif',
            'completed' => 'Selesai / Naik Kelas',
            'transferred' => 'Pindah Kelas',
            'graduated' => 'Lulus',
            default => ucfirst($this->status),
        };
    }

    public function getBadgeVariantAttribute(): string
    {
        return match ($this->status) {
            'active' => 'emerald',
            'completed' => 'indigo',
            'transferred' => 'amber',
            'graduated' => 'brand',
            default => 'neutral',
        };
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeForAcademicYear($query, int $academicYearId)
    {
        return $query->where('academic_year_id', $academicYearId);
    }
}
