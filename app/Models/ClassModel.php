<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClassModel extends Model
{
    use HasFactory;

    protected $table = 'classes';

    protected $fillable = [
        'academic_year_id',
        'name',
        'grade_level',
        'section',
        'homeroom_teacher_id',
    ];

    /**
     * Relationship to enrolled students.
     */
    public function students(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'class_students', 'class_id', 'student_id')
            ->withTimestamps();
    }

    /**
     * Relationship to assigned teachers.
     */
    public function teachers(): BelongsToMany
    {
        return $this->belongsToMany(Teacher::class, 'class_teachers', 'class_id', 'teacher_id')
            ->withPivot('subject_id')
            ->withTimestamps();
    }

    /**
     * Relationship to class course offerings.
     */
    public function classTeachers(): HasMany
    {
        return $this->hasMany(ClassTeacher::class, 'class_id');
    }

    /**
     * Relationship to Homeroom Teacher.
     */
    public function homeroomTeacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'homeroom_teacher_id');
    }

    /**
     * Relationship to Academic Year.
     */
    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }
}
