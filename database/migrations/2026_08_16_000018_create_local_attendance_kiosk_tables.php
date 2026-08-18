<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Local Student Cache (Lightweight cache synced from Master School Management)
        Schema::create('students_cache', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('school_student_id')->unique();
            $table->string('nis', 50)->nullable()->index();
            $table->string('nisn', 50)->nullable()->index();
            $table->string('name', 255);
            $table->unsignedBigInteger('class_id')->nullable();
            $table->string('class_name', 100)->nullable();
            $table->unsignedBigInteger('academic_year_id')->nullable();
            $table->string('rfid_uid', 100)->nullable()->index();
            $table->string('photo_url', 500)->nullable();
            $table->string('status', 30)->default('active');
            $table->timestamp('synced_at')->nullable();
            $table->timestamps();
        });

        // 2. Attendance Logs & Sync Queue (Local logs with Supabase sync tracking)
        Schema::create('attendance_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('school_student_id')->index();
            $table->string('nis', 50)->nullable();
            $table->string('student_name', 255);
            $table->unsignedBigInteger('class_id')->nullable();
            $table->string('class_name', 100)->nullable();
            $table->string('rfid_uid', 100)->nullable()->index();
            $table->date('attendance_date')->index();
            $table->string('attendance_time', 15);
            $table->string('status', 30)->default('present'); // present, late, permission, sick, absent
            $table->string('device_id', 50)->default('KIOSK-001')->index();
            $table->string('device_name', 100)->default('Gerbang Utama');
            $table->string('source', 30)->default('rfid'); // rfid, manual
            $table->string('sync_status', 30)->default('pending')->index(); // pending, synced, failed
            $table->string('supabase_id', 100)->nullable();
            $table->unsignedSmallInteger('attempts')->default(0);
            $table->text('error_message')->nullable();
            $table->json('payload')->nullable();
            $table->timestamp('last_attempt_at')->nullable();
            $table->timestamps();

            // Unique constraint to guarantee 1 attendance record per student per day
            $table->unique(['school_student_id', 'attendance_date'], 'unique_student_daily_attendance');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendance_logs');
        Schema::dropIfExists('students_cache');
    }
};
