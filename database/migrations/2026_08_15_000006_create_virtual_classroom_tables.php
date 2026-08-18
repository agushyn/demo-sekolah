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
        // 1. Classes / Romongan Belajar
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_year_id')->nullable()->constrained('academic_years')->nullOnDelete();
            $table->string('name'); // e.g. "X MIPA 1"
            $table->string('grade_level', 10)->default('10'); // 10, 11, 12
            $table->string('section', 50)->nullable(); // "MIPA 1"
            $table->foreignId('homeroom_teacher_id')->nullable()->constrained('teachers')->nullOnDelete();
            $table->timestamps();
        });

        // 2. Subjects / Mata Pelajaran
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // e.g. "MAT-10", "INF-11"
            $table->string('name'); // e.g. "Matematika Peminatan"
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 3. Class Teachers (Course Offerings: Teacher teaches Subject in Class)
        Schema::create('class_teachers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained('teachers')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['class_id', 'teacher_id', 'subject_id']);
        });

        // 4. Class Students (Enrollments: Student enrolled in Class)
        Schema::create('class_students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['class_id', 'student_id']);
        });

        // 5. Lessons / Materi Pembelajaran
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_teacher_id')->constrained('class_teachers')->cascadeOnDelete();
            $table->string('title');
            $table->string('slug');
            $table->longText('content')->nullable();
            $table->string('video_url')->nullable();
            $table->boolean('is_published')->default(true);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index(['class_teacher_id', 'is_published']);
        });

        // 6. Lesson Files / Lampiran Materi
        Schema::create('lesson_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained('lessons')->cascadeOnDelete();
            $table->string('file_path');
            $table->string('original_name');
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('file_size')->default(0);
            $table->timestamps();
        });

        // 7. Assignments / Penugasan
        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_teacher_id')->constrained('class_teachers')->cascadeOnDelete();
            $table->string('title');
            $table->longText('description')->nullable();
            $table->dateTime('deadline');
            $table->boolean('allow_late_submission')->default(false);
            $table->integer('max_score')->default(100);
            $table->enum('status', ['draft', 'published', 'closed'])->default('published');
            $table->string('attachment_path')->nullable();
            $table->timestamps();

            $table->index(['class_teacher_id', 'status', 'deadline']);
        });

        // 8. Assignment Submissions / Pengumpulan Jawaban Tugas
        Schema::create('assignment_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained('assignments')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->string('file_path')->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'submitted', 'late', 'graded'])->default('submitted');
            $table->decimal('score', 5, 2)->nullable();
            $table->text('feedback')->nullable();
            $table->foreignId('graded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('graded_at')->nullable();
            $table->dateTime('submitted_at')->nullable();
            $table->timestamps();

            $table->unique(['assignment_id', 'student_id']);
            $table->index(['assignment_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assignment_submissions');
        Schema::dropIfExists('assignments');
        Schema::dropIfExists('lesson_files');
        Schema::dropIfExists('lessons');
        Schema::dropIfExists('class_students');
        Schema::dropIfExists('class_teachers');
        Schema::dropIfExists('subjects');
        Schema::dropIfExists('classes');
    }
};
