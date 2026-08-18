<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Lesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'class_teacher_id',
        'title',
        'slug',
        'content',
        'video_url',
        'is_published',
        'published_at',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'published_at' => 'datetime',
    ];

    protected $appends = [
        'formatted_published_at',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($lesson) {
            if (empty($lesson->slug)) {
                $lesson->slug = Str::slug($lesson->title).'-'.Str::random(5);
            }
            if ($lesson->is_published && empty($lesson->published_at)) {
                $lesson->published_at = now();
            }
        });
    }

    /**
     * Relationship to course offering.
     */
    public function classTeacher(): BelongsTo
    {
        return $this->belongsTo(ClassTeacher::class, 'class_teacher_id');
    }

    /**
     * Relationship to attached files.
     */
    public function files(): HasMany
    {
        return $this->hasMany(LessonFile::class, 'lesson_id');
    }

    /**
     * Accessor for formatted published date.
     */
    public function getFormattedPublishedAtAttribute(): string
    {
        if (! $this->published_at) {
            return '-';
        }

        return Carbon::parse($this->published_at)->locale('id')->isoFormat('D MMMM Y, HH:mm');
    }
}
