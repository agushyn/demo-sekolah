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
        Schema::table('students', function (Blueprint $table) {
            $table->index('nis', 'students_nis_index');
        });

        Schema::table('classes', function (Blueprint $table) {
            $table->index('grade_level', 'classes_grade_level_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropIndex('students_nis_index');
        });

        Schema::table('classes', function (Blueprint $table) {
            $table->dropIndex('classes_grade_level_index');
        });
    }
};
