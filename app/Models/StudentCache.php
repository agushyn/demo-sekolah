<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentCache extends Model
{
    use HasFactory;

    protected $table = 'students_cache';

    protected $fillable = [
        'school_student_id',
        'nis',
        'nisn',
        'name',
        'class_id',
        'class_name',
        'academic_year_id',
        'rfid_uid',
        'photo_url',
        'status',
        'synced_at',
    ];

    protected $casts = [
        'synced_at' => 'datetime',
    ];

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeFindByRfid($query, string $rfidUid)
    {
        return $query->where('rfid_uid', $rfidUid);
    }
}
