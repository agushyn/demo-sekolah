<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
    ];

    /**
     * Relationship to course offerings.
     */
    public function classTeachers(): HasMany
    {
        return $this->hasMany(ClassTeacher::class, 'subject_id');
    }

    /**
     * Relationship to classes where this subject is taught.
     */
    public function classes(): BelongsToMany
    {
        return $this->belongsToMany(ClassModel::class, 'class_teachers', 'subject_id', 'class_id')
            ->withPivot('teacher_id')
            ->withTimestamps();
    }
}
