<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'parent_id',
        'nisn',
        'nis',
        'gender',
        'birth_place',
        'birth_date',
        'address',
        'phone',
        'grade_level',
        'rfid_uid',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
        ];
    }

    /**
     * RFID Card assignment history.
     */
    public function rfidCards()
    {
        return $this->hasMany(StudentRfidCard::class, 'student_id')->latest();
    }

    /**
     * Active RFID card.
     */
    public function activeRfidCard()
    {
        return $this->hasOne(StudentRfidCard::class, 'student_id')->where('is_active', true);
    }

    /**
     * The user account for this student.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The parent or guardian of this student.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(ParentProfile::class, 'parent_id');
    }

    /**
     * Classes where this student is enrolled.
     */
    public function classes()
    {
        return $this->belongsToMany(ClassModel::class, 'class_students', 'student_id', 'class_id')
            ->withTimestamps();
    }

    /**
     * Assignment submissions made by this student.
     */
    public function submissions()
    {
        return $this->hasMany(AssignmentSubmission::class, 'student_id');
    }

    /**
     * Enrollment history for this student.
     */
    public function enrollments()
    {
        return $this->hasMany(StudentClassEnrollment::class, 'student_id');
    }

    /**
     * Active enrollment for the current academic year.
     */
    public function activeEnrollment()
    {
        return $this->hasOne(StudentClassEnrollment::class, 'student_id')->where('status', 'active');
    }

    /**
     * Full class timeline / history ordered chronologically.
     */
    public function classHistory()
    {
        return $this->hasMany(StudentClassEnrollment::class, 'student_id')
            ->with(['classRoom.homeroomTeacher.user', 'academicYear', 'creator'])
            ->orderBy('start_date', 'desc');
    }

    /**
     * Audit log of class changes (individual edits, promotions, transfers).
     */
    public function auditLogs()
    {
        return $this->hasMany(StudentClassAuditLog::class, 'student_id')
            ->with(['fromClass', 'toClass', 'fromAcademicYear', 'toAcademicYear', 'performer'])
            ->latest();
    }

    /**
     * Attendance records for this student.
     */
    public function attendances()
    {
        return $this->hasMany(StudentAttendance::class, 'student_id');
    }

    /**
     * Calculate attendance summary stats for student.
     */
    public function getAttendanceStats(): array
    {
        $total = $this->attendances()->count();
        $present = $this->attendances()->where('status', 'present')->count();
        $permission = $this->attendances()->where('status', 'permission')->count();
        $sick = $this->attendances()->where('status', 'sick')->count();
        $absent = $this->attendances()->where('status', 'absent')->count();

        $rate = $total > 0 ? round(($present / $total) * 100, 1) : 100;

        return [
            'total_days' => $total,
            'present' => $present,
            'permission' => $permission,
            'sick' => $sick,
            'absent' => $absent,
            'attendance_rate' => "{$rate}%",
        ];
    }
}
