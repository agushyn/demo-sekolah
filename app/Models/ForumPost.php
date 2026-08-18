<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class ForumPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'thread_id',
        'user_id',
        'content',
        'is_hidden',
    ];

    protected $casts = [
        'is_hidden' => 'boolean',
    ];

    protected $appends = [
        'formatted_created_at',
    ];

    /**
     * Relationship to parent thread.
     */
    public function thread(): BelongsTo
    {
        return $this->belongsTo(ForumThread::class, 'thread_id');
    }

    /**
     * Relationship to author user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Polymorphic reactions.
     */
    public function reactions(): MorphMany
    {
        return $this->morphMany(ForumReaction::class, 'reactable');
    }

    /**
     * Polymorphic reports.
     */
    public function reports(): MorphMany
    {
        return $this->morphMany(ForumReport::class, 'reportable');
    }

    /**
     * Scope visible posts.
     */
    public function scopeVisible(Builder $query): Builder
    {
        return $query->where('is_hidden', false);
    }

    /**
     * Accessor for formatted created at.
     */
    public function getFormattedCreatedAtAttribute(): string
    {
        return Carbon::parse($this->created_at)->locale('id')->diffForHumans();
    }
}
