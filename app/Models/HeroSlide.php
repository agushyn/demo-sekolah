<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HeroSlide extends Model
{
    use HasFactory;

    protected $fillable = [
        'subtitle',
        'title',
        'description',
        'image',
        'button_text',
        'button_url',
        'secondary_button_text',
        'secondary_button_url',
        'text_position',
        'overlay_type',
        'sort_order',
        'duration',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'duration' => 'integer',
    ];

    protected $appends = [
        'image_url',
    ];

    /**
     * Scope for active slides ordered by sort order.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc');
    }

    /**
     * Accessor for full image URL.
     */
    public function getImageUrlAttribute(): ?string
    {
        if (empty($this->image)) {
            return 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80';
        }

        if (str_starts_with($this->image, 'http://') || str_starts_with($this->image, 'https://')) {
            return $this->image;
        }

        if (str_starts_with($this->image, 'images/') || str_starts_with($this->image, 'assets/')) {
            return asset($this->image);
        }

        return asset('storage/'.$this->image);
    }
}
