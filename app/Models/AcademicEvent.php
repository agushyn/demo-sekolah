<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AcademicEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'academic_year_id',
        'title',
        'description',
        'start_date',
        'end_date',
        'start_time',
        'end_time',
        'category',
        'location',
        'is_public',
        'created_by',
    ];

    protected $casts = [
        'start_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
        'is_public' => 'boolean',
    ];

    protected $appends = [
        'formatted_date_range',
        'formatted_time_range',
        'category_label',
        'badge_color',
        'day',
        'month',
    ];

    /**
     * Relationship to Academic Year.
     */
    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    /**
     * Relationship to Creator (User).
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope for public only events.
     */
    public function scopePublicOnly(Builder $query): Builder
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope for upcoming events from today.
     */
    public function scopeUpcoming(Builder $query): Builder
    {
        return $query->where(function ($q) {
            $today = now()->toDateString();
            $q->where('start_date', '>=', $today)
                ->orWhere(function ($sub) use ($today) {
                    $sub->whereNotNull('end_date')
                        ->where('end_date', '>=', $today);
                });
        })->orderBy('start_date', 'asc');
    }

    /**
     * Scope for filtering category.
     */
    public function scopeFilterCategory(Builder $query, ?string $category): Builder
    {
        if (empty($category) || $category === 'all' || $category === 'Semua') {
            return $query;
        }

        return $query->where('category', $category);
    }

    /**
     * Scope for searching event title/desc/location.
     */
    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (empty($search)) {
            return $query;
        }

        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%")
                ->orWhere('location', 'like', "%{$search}%");
        });
    }

    /**
     * Accessor for day number string.
     */
    public function getDayAttribute(): string
    {
        if (! $this->start_date) {
            return '01';
        }

        return Carbon::parse($this->start_date)->format('d');
    }

    /**
     * Accessor for Indonesian month abbreviation.
     */
    public function getMonthAttribute(): string
    {
        if (! $this->start_date) {
            return 'AGU';
        }

        $months = [
            1 => 'JAN', 2 => 'FEB', 3 => 'MAR', 4 => 'APR',
            5 => 'MEI', 6 => 'JUN', 7 => 'JUL', 8 => 'AGU',
            9 => 'SEP', 10 => 'OKT', 11 => 'NOV', 12 => 'DES',
        ];

        $m = (int) Carbon::parse($this->start_date)->format('n');

        return $months[$m] ?? 'AGU';
    }

    /**
     * Accessor for human-readable category label.
     */
    public function getCategoryLabelAttribute(): string
    {
        $labels = [
            'academic' => 'Akademik',
            'exam' => 'Ujian',
            'holiday' => 'Libur Nasional / Sekolah',
            'activity' => 'Kegiatan Siswa',
            'meeting' => 'Rapat Dinas & Guru',
            'event' => 'Event & Pentas Seni',
        ];

        return $labels[$this->category] ?? ucfirst($this->category);
    }

    /**
     * Accessor for badge color mapping.
     */
    public function getBadgeColorAttribute(): string
    {
        $colors = [
            'academic' => 'brand',
            'exam' => 'danger',
            'holiday' => 'emerald',
            'activity' => 'purple',
            'meeting' => 'amber',
            'event' => 'indigo',
        ];

        return $colors[$this->category] ?? 'brand';
    }

    /**
     * Accessor for formatted date range.
     */
    public function getFormattedDateRangeAttribute(): string
    {
        if (! $this->start_date) {
            return '-';
        }

        $start = Carbon::parse($this->start_date)->locale('id');

        if (! $this->end_date || $this->end_date === $this->start_date) {
            return $start->isoFormat('D MMMM Y');
        }

        $end = Carbon::parse($this->end_date)->locale('id');

        if ($start->format('Y-m') === $end->format('Y-m')) {
            return $start->format('j').' - '.$end->isoFormat('D MMMM Y');
        }

        return $start->isoFormat('D MMMM Y').' - '.$end->isoFormat('D MMMM Y');
    }

    /**
     * Accessor for formatted time range.
     */
    public function getFormattedTimeRangeAttribute(): string
    {
        if (! $this->start_time) {
            return 'Sepanjang Hari';
        }

        $start = substr($this->start_time, 0, 5);

        if (! $this->end_time) {
            return "{$start} WIB - Selesai";
        }

        $end = substr($this->end_time, 0, 5);

        return "{$start} - {$end} WIB";
    }
}
