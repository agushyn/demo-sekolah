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
        Schema::create('student_class_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignId('from_class_id')->nullable()->constrained('classes')->nullOnDelete();
            $table->foreignId('to_class_id')->nullable()->constrained('classes')->nullOnDelete();
            $table->foreignId('from_academic_year_id')->nullable()->constrained('academic_years')->nullOnDelete();
            $table->foreignId('to_academic_year_id')->nullable()->constrained('academic_years')->nullOnDelete();
            $table->string('action'); // 'individual_edit', 'promoted', 'transferred', 'graduated'
            $table->foreignId('performed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_class_audit_logs');
    }
};
