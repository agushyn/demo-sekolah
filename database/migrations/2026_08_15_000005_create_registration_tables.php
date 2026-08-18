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
        Schema::create('school_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('string'); // string, boolean, date, json
            $table->timestamps();
        });

        Schema::create('registrations', function (Blueprint $table) {
            $table->id();
            $table->string('registration_number')->unique();
            $table->string('full_name');
            $table->string('nik', 16)->unique();
            $table->string('nisn', 10)->nullable();
            $table->string('birth_place');
            $table->date('birth_date');
            $table->enum('gender', ['L', 'P'])->default('L');
            $table->text('address');
            $table->string('province')->nullable();
            $table->string('regency')->nullable();
            $table->string('district')->nullable();
            $table->string('village')->nullable();
            $table->string('phone');
            $table->string('email');

            $table->string('father_name');
            $table->string('mother_name');
            $table->string('parent_phone');
            $table->string('parent_occupation')->nullable();
            $table->text('parent_address')->nullable();

            $table->enum('status', ['pending', 'review', 'accepted', 'rejected'])->default('pending');
            $table->text('admin_notes')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index('registration_number');
            $table->index('nik');
        });

        Schema::create('registration_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('registration_id')->constrained('registrations')->cascadeOnDelete();
            $table->enum('document_type', ['kk', 'birth_certificate', 'diploma', 'photo', 'additional']);
            $table->string('file_path');
            $table->string('original_name');
            $table->string('mime_type');
            $table->unsignedBigInteger('file_size');
            $table->timestamps();

            $table->index(['registration_id', 'document_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('registration_documents');
        Schema::dropIfExists('registrations');
        Schema::dropIfExists('school_settings');
    }
};
