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
        // Teachers profile table
        Schema::create('teachers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('nip')->nullable()->unique();
            $table->string('nuptk')->nullable();
            $table->string('title')->nullable();
            $table->string('gender', 10)->nullable();
            $table->string('phone')->nullable();
            $table->string('specialization')->nullable();
            $table->text('bio')->nullable();
            $table->timestamps();
        });

        // Parents profile table
        Schema::create('parents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('nik')->nullable();
            $table->string('relationship_type')->default('parent'); // father, mother, guardian
            $table->string('phone')->nullable();
            $table->string('occupation')->nullable();
            $table->text('address')->nullable();
            $table->timestamps();
        });

        // Students profile table
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('parents')->nullOnDelete();
            $table->string('nisn')->nullable()->unique();
            $table->string('nis')->nullable();
            $table->string('gender', 10)->nullable();
            $table->string('birth_place')->nullable();
            $table->date('birth_date')->nullable();
            $table->text('address')->nullable();
            $table->string('phone')->nullable();
            $table->string('grade_level')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
        Schema::dropIfExists('parents');
        Schema::dropIfExists('teachers');
    }
};
