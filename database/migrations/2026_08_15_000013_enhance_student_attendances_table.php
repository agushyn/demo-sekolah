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
        Schema::table('student_attendances', function (Blueprint $table) {
            $table->foreignId('academic_year_id')->nullable()->after('class_id')->constrained('academic_years')->nullOnDelete();
            $table->string('check_in', 10)->nullable()->after('date');
            $table->string('check_out', 10)->nullable()->after('check_in');
            $table->string('source', 30)->default('manual')->after('status')->index(); // manual, internal, external_api
            $table->string('external_id')->nullable()->after('source')->index();
            $table->json('raw_data')->nullable()->after('notes');
            $table->timestamp('synced_at')->nullable()->after('raw_data');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_attendances', function (Blueprint $table) {
            $table->dropForeign(['academic_year_id']);
            $table->dropColumn([
                'academic_year_id',
                'check_in',
                'check_out',
                'source',
                'external_id',
                'raw_data',
                'synced_at',
            ]);
        });
    }
};
