<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Teacher extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nip',
        'nuptk',
        'title',
        'gender',
        'phone',
        'specialization',
        'bio',
    ];

    /**
     * The user account for this teacher.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Classes taught by this teacher.
     */
    public function classes()
    {
        return $this->belongsToMany(ClassModel::class, 'class_teachers', 'teacher_id', 'class_id')
            ->withPivot('subject_id')
            ->withTimestamps();
    }

    /**
     * Course offerings taught by this teacher.
     */
    public function classTeachers()
    {
        return $this->hasMany(ClassTeacher::class, 'teacher_id');
    }

    /**
     * Classes where this teacher is homeroom teacher.
     */
    public function homeroomClasses()
    {
        return $this->hasMany(ClassModel::class, 'homeroom_teacher_id');
    }
}
