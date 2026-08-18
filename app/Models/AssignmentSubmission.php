<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssignmentSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'assignment_id',
        'student_id',
        'file_path',
        'notes',
        'status',
        'score',
        'feedback',
        'graded_by',
        'graded_at',
        'submitted_at',
    ];

    protected $casts = [
        'score' => 'float',
        'graded_at' => 'datetime',
        'submitted_at' => 'datetime',
    ];

    protected $appends = [
        'status_label',
        'status_badge',
        'formatted_submitted_at',
        'formatted_graded_at',
    ];

    /**
     * Relationship to assignment.
     */
    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class, 'assignment_id');
    }

    /**
     * Relationship to student.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    /**
     * Relationship to teacher / grader.
     */
    public function grader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'graded_by');
    }

    /**
     * Accessor for status label.
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'graded' => 'Sudah Dinilai',
            'late' => 'Dikumpulkan Terlambat',
            'submitted' => 'Menunggu Penilaian',
            default => 'Belum Dikumpulkan',
        };
    }

    /**
     * Accessor for status badge variant.
     */
    public function getStatusBadgeAttribute(): string
    {
        return match ($this->status) {
            'graded' => 'success',
            'late' => 'danger',
            'submitted' => 'brand',
            default => 'warning',
        };
    }

    /**
     * Accessor for formatted submitted at.
     */
    public function getFormattedSubmittedAtAttribute(): string
    {
        if (! $this->submitted_at) {
            return '-';
        }

        return Carbon::parse($this->submitted_at)->locale('id')->isoFormat('D MMMM Y, HH:mm').' WIB';
    }

    /**
     * Accessor for formatted graded at.
     */
    public function getFormattedGradedAtAttribute(): string
    {
        if (! $this->graded_at) {
            return '-';
        }

        return Carbon::parse($this->graded_at)->locale('id')->isoFormat('D MMMM Y, HH:mm').' WIB';
    }
}
