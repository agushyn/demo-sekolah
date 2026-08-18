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
        Schema::create('school_staff', function (Blueprint $table) {
            $table->id();
            $table->string('employee_number', 50)->nullable()->comment('NIP/NUPTK/NIK');
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('position')->comment('Jabatan: Kepala Sekolah, Wakasek, Guru, Staf TU, dll');
            $table->string('department')->nullable()->comment('Unit: Kurikulum, Kesiswaan, Sarpras, Keuangan, dll');
            $table->enum('category', ['teacher', 'staff'])->default('teacher')->index();
            $table->string('subject')->nullable()->comment('Mata pelajaran untuk guru');
            $table->string('education')->nullable()->comment('Pendidikan terakhir');
            $table->text('bio')->nullable();
            $table->string('photo')->nullable();
            $table->string('email')->nullable();
            $table->string('phone', 50)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();

            $table->index(['is_active', 'category', 'sort_order']);
            $table->index(['is_active', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('school_staff');
    }
};
