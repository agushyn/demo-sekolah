<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClassTeacher extends Model
{
    use HasFactory;

    protected $table = 'class_teachers';

    protected $fillable = [
        'class_id',
        'teacher_id',
        'subject_id',
    ];

    /**
     * Relationship to classroom.
     */
    public function classRoom(): BelongsTo
    {
        return $this->belongsTo(ClassModel::class, 'class_id');
    }

    /**
     * Relationship to teacher.
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }

    /**
     * Relationship to subject.
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }

    /**
     * Relationship to lessons.
     */
    public function lessons(): HasMany
    {
        return $this->hasMany(Lesson::class, 'class_teacher_id');
    }

    /**
     * Relationship to assignments.
     */
    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class, 'class_teacher_id');
    }
}
