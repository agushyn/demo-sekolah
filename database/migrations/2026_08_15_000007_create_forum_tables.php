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
        // 1. Forum Categories
        Schema::create('forum_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('icon', 50)->default('MessageCircle');
            $table->string('color', 50)->default('brand');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Forum Threads
        Schema::create('forum_threads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('forum_categories')->cascadeOnDelete();
            $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->longText('content');
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_locked')->default(false);
            $table->boolean('is_hidden')->default(false);
            $table->unsignedInteger('views_count')->default(0);
            $table->timestamps();

            $table->index(['category_id', 'is_pinned', 'created_at']);
        });

        // 3. Forum Posts (Replies)
        Schema::create('forum_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('thread_id')->constrained('forum_threads')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->longText('content');
            $table->boolean('is_hidden')->default(false);
            $table->timestamps();

            $table->index(['thread_id', 'created_at']);
        });

        // 4. Forum Reactions (Likes / Upvotes on Threads or Posts)
        Schema::create('forum_reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('reactable_type'); // App\Models\ForumThread or App\Models\ForumPost
            $table->unsignedBigInteger('reactable_id');
            $table->string('reaction_type', 30)->default('like');
            $table->timestamps();

            $table->unique(['user_id', 'reactable_type', 'reactable_id']);
            $table->index(['reactable_type', 'reactable_id']);
        });

        // 5. Forum Reports (Laporan Pelanggaran)
        Schema::create('forum_reports', function (Blueprint $table) {
            $table->id();
            $table->string('reportable_type'); // App\Models\ForumThread or App\Models\ForumPost
            $table->unsignedBigInteger('reportable_id');
            $table->foreignId('reported_by')->constrained('users')->cascadeOnDelete();
            $table->text('reason');
            $table->enum('status', ['pending', 'reviewed', 'dismissed'])->default('pending');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('reviewed_at')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('forum_reports');
        Schema::dropIfExists('forum_reactions');
        Schema::dropIfExists('forum_posts');
        Schema::dropIfExists('forum_threads');
        Schema::dropIfExists('forum_categories');
    }
};
