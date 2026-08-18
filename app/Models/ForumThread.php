<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Str;

class ForumThread extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'author_id',
        'title',
        'slug',
        'content',
        'is_pinned',
        'is_locked',
        'is_hidden',
        'views_count',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
        'is_locked' => 'boolean',
        'is_hidden' => 'boolean',
        'views_count' => 'integer',
    ];

    protected $appends = [
        'formatted_created_at',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($thread) {
            if (empty($thread->slug)) {
                $thread->slug = Str::slug($thread->title).'-'.Str::random(5);
            }
        });
    }

    /**
     * Relationship to category.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ForumCategory::class, 'category_id');
    }

    /**
     * Relationship to thread author.
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * Relationship to replies / posts.
     */
    public function posts(): HasMany
    {
        return $this->hasMany(ForumPost::class, 'thread_id');
    }

    /**
     * Polymorphic relationship to reactions.
     */
    public function reactions(): MorphMany
    {
        return $this->morphMany(ForumReaction::class, 'reactable');
    }

    /**
     * Polymorphic relationship to reports.
     */
    public function reports(): MorphMany
    {
        return $this->morphMany(ForumReport::class, 'reportable');
    }

    /**
     * Scope visible threads.
     */
    public function scopeVisible(Builder $query): Builder
    {
        return $query->where('is_hidden', false);
    }

    /**
     * Scope pinned first.
     */
    public function scopePinnedFirst(Builder $query): Builder
    {
        return $query->orderBy('is_pinned', 'desc')->latest('created_at');
    }

    /**
     * Accessor for formatted created at.
     */
    public function getFormattedCreatedAtAttribute(): string
    {
        return Carbon::parse($this->created_at)->locale('id')->diffForHumans();
    }
}
