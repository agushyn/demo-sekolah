<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ForumReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'reportable_type',
        'reportable_id',
        'reported_by',
        'reason',
        'status',
        'reviewed_by',
        'reviewed_at',
        'admin_notes',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    protected $appends = [
        'status_badge',
        'formatted_created_at',
    ];

    /**
     * Polymorphic reported target (ForumThread or ForumPost).
     */
    public function reportable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * User who filed the report.
     */
    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    /**
     * Admin/Staff who reviewed the report.
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Accessor for status badge variant.
     */
    public function getStatusBadgeAttribute(): string
    {
        return match ($this->status) {
            'reviewed' => 'success',
            'dismissed' => 'neutral',
            default => 'warning',
        };
    }

    /**
     * Accessor for formatted created at.
     */
    public function getFormattedCreatedAtAttribute(): string
    {
        return Carbon::parse($this->created_at)->locale('id')->isoFormat('D MMMM Y, HH:mm');
    }
}
