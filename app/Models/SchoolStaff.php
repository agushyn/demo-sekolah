<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SchoolStaff extends Model
{
    use HasFactory;

    protected $table = 'school_staff';

    protected $fillable = [
        'employee_number',
        'name',
        'slug',
        'position',
        'department',
        'category',
        'subject',
        'education',
        'bio',
        'photo',
        'email',
        'phone',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected $appends = [
        'photo_url',
        'category_label',
    ];

    /**
     * Boot model events for automatic slug creation.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->slug)) {
                $model->slug = static::generateUniqueSlug($model->name);
            }
        });

        static::updating(function ($model) {
            if ($model->isDirty('name') && empty($model->slug)) {
                $model->slug = static::generateUniqueSlug($model->name, $model->id);
            }
        });
    }

    /**
     * Generate a unique slug from name.
     */
    public static function generateUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $baseSlug = Str::slug($name);
        if (empty($baseSlug)) {
            $baseSlug = 'staf-pendidik';
        }

        $slug = $baseSlug;
        $counter = 1;

        while (static::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $counter++;
            $slug = "{$baseSlug}-{$counter}";
        }

        return $slug;
    }

    /**
     * Scope for active records ordered by sort_order.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)->orderBy('sort_order', 'asc')->orderBy('id', 'asc');
    }

    /**
     * Scope for teachers.
     */
    public function scopeTeachers(Builder $query): Builder
    {
        return $query->where('category', 'teacher');
    }

    /**
     * Scope for staff.
     */
    public function scopeStaff(Builder $query): Builder
    {
        return $query->where('category', 'staff');
    }

    /**
     * Scope search query across fields.
     */
    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (empty($search)) {
            return $query;
        }

        $term = trim($search);

        return $query->where(function (Builder $q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
                ->orWhere('position', 'like', "%{$term}%")
                ->orWhere('subject', 'like', "%{$term}%")
                ->orWhere('department', 'like', "%{$term}%")
                ->orWhere('employee_number', 'like', "%{$term}%")
                ->orWhere('email', 'like', "%{$term}%");
        });
    }

    /**
     * Get photo full URL with fallback avatar.
     */
    public function getPhotoUrlAttribute(): string
    {
        if (! empty($this->photo)) {
            if (Str::startsWith($this->photo, ['http://', 'https://', '/'])) {
                return $this->photo;
            }

            return Storage::disk('public')->url($this->photo);
        }

        // SVG / Initials fallback via UI Avatars or localized SVG
        $nameEncoded = urlencode($this->name);

        return "https://ui-avatars.com/api/?name={$nameEncoded}&background=1e40af&color=ffffff&size=512&bold=true";
    }

    /**
     * Get human-readable category label.
     */
    public function getCategoryLabelAttribute(): string
    {
        return match ($this->category) {
            'teacher' => 'Guru',
            'staff' => 'Staf & Tenaga Kependidikan',
            default => 'Pendidik',
        };
    }
}
