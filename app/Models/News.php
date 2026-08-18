<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class News extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'author_id',
        'title',
        'slug',
        'excerpt',
        'content',
        'thumbnail',
        'status',
        'is_featured',
        'published_at',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'published_at' => 'datetime',
    ];

    protected $appends = [
        'thumbnail_url',
        'read_time',
        'formatted_date',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($news) {
            if (empty($news->slug)) {
                $news->slug = Str::slug($news->title);
            }
            if ($news->status === 'published' && empty($news->published_at)) {
                $news->published_at = now();
            }
        });
    }

    /**
     * Relationship to Category.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(NewsCategory::class, 'category_id');
    }

    /**
     * Relationship to Author (User).
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * Scope for published news articles.
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    /**
     * Scope for searching news articles.
     */
    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (empty($search)) {
            return $query;
        }

        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
                ->orWhere('excerpt', 'like', "%{$search}%")
                ->orWhere('content', 'like', "%{$search}%");
        });
    }

    /**
     * Scope for filtering by category.
     */
    public function scopeFilterCategory(Builder $query, ?string $category): Builder
    {
        if (empty($category) || $category === 'Semua') {
            return $query;
        }

        return $query->whereHas('category', function ($q) use ($category) {
            $q->where('slug', $category)
                ->orWhere('name', $category);
        });
    }

    /**
     * Accessor for full thumbnail URL.
     */
    public function getThumbnailUrlAttribute(): ?string
    {
        if (empty($this->thumbnail)) {
            return 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80';
        }

        if (str_starts_with($this->thumbnail, 'http://') || str_starts_with($this->thumbnail, 'https://')) {
            return $this->thumbnail;
        }

        return asset('storage/'.$this->thumbnail);
    }

    /**
     * Accessor for estimated read time.
     */
    public function getReadTimeAttribute(): string
    {
        $words = str_word_count(strip_tags($this->content ?: ''));
        $minutes = max(1, (int) ceil($words / 200));

        return "{$minutes} mnt baca";
    }

    /**
     * Accessor for formatted Indonesian date.
     */
    public function getFormattedDateAttribute(): string
    {
        $date = $this->published_at ?: $this->created_at;
        if (! $date) {
            return '-';
        }

        return Carbon::parse($date)->locale('id')->isoFormat('D MMMM Y');
    }
}
