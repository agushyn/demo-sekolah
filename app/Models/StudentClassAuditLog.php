<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentClassAuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'from_class_id',
        'to_class_id',
        'from_academic_year_id',
        'to_academic_year_id',
        'action',
        'performed_by',
        'notes',
    ];

    protected $appends = [
        'action_label',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function fromClass(): BelongsTo
    {
        return $this->belongsTo(ClassModel::class, 'from_class_id');
    }

    public function toClass(): BelongsTo
    {
        return $this->belongsTo(ClassModel::class, 'to_class_id');
    }

    public function fromAcademicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class, 'from_academic_year_id');
    }

    public function toAcademicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class, 'to_academic_year_id');
    }

    public function performer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    public function getActionLabelAttribute(): string
    {
        return match ($this->action) {
            'individual_edit' => 'Perubahan Kelas Individual',
            'promoted' => 'Kenaikan Kelas (Batch/Sistem)',
            'transferred' => 'Pindah Rombel/Kelas',
            'graduated' => 'Kelulusan Siswa',
            default => ucfirst(str_replace('_', ' ', $this->action)),
        };
    }
}
