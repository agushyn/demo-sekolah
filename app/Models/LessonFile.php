<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonFile extends Model
{
    use HasFactory;

    protected $fillable = [
        'lesson_id',
        'file_path',
        'original_name',
        'mime_type',
        'file_size',
    ];

    protected $appends = [
        'formatted_file_size',
    ];

    /**
     * Relationship to lesson.
     */
    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    /**
     * Accessor for formatted file size.
     */
    public function getFormattedFileSizeAttribute(): string
    {
        $bytes = (int) $this->file_size;

        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2).' MB';
        }

        if ($bytes >= 1024) {
            return number_format($bytes / 1024, 1).' KB';
        }

        return $bytes.' B';
    }
}
