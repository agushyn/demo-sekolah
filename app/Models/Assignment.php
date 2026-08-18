<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Assignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'class_teacher_id',
        'title',
        'description',
        'deadline',
        'allow_late_submission',
        'max_score',
        'status',
        'attachment_path',
    ];

    protected $casts = [
        'deadline' => 'datetime',
        'allow_late_submission' => 'boolean',
        'max_score' => 'integer',
    ];

    protected $appends = [
        'formatted_deadline',
        'is_past_deadline',
        'status_badge',
    ];

    /**
     * Relationship to course offering.
     */
    public function classTeacher(): BelongsTo
    {
        return $this->belongsTo(ClassTeacher::class, 'class_teacher_id');
    }

    /**
     * Relationship to student submissions.
     */
    public function submissions(): HasMany
    {
        return $this->hasMany(AssignmentSubmission::class, 'assignment_id');
    }

    /**
     * Scope for published assignments.
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }

    /**
     * Scope for active assignments (published and not past deadline).
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'published')
            ->where('deadline', '>=', now());
    }

    /**
     * Accessor for formatted deadline string.
     */
    public function getFormattedDeadlineAttribute(): string
    {
        if (! $this->deadline) {
            return '-';
        }

        return Carbon::parse($this->deadline)->locale('id')->isoFormat('D MMMM Y, HH:mm').' WIB';
    }

    /**
     * Accessor for deadline passed status.
     */
    public function getIsPastDeadlineAttribute(): bool
    {
        if (! $this->deadline) {
            return false;
        }

        return now()->gt($this->deadline);
    }

    /**
     * Accessor for status badge variant.
     */
    public function getStatusBadgeAttribute(): string
    {
        if ($this->status === 'closed') {
            return 'danger';
        }

        if ($this->status === 'draft') {
            return 'neutral';
        }

        if ($this->is_past_deadline) {
            return 'warning';
        }

        return 'success';
    }
}
