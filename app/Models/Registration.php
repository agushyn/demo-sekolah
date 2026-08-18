<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class Registration extends Model
{
    use HasFactory;

    protected $fillable = [
        'registration_number',
        'full_name',
        'nik',
        'nisn',
        'birth_place',
        'birth_date',
        'gender',
        'address',
        'province',
        'regency',
        'district',
        'village',
        'phone',
        'email',
        'father_name',
        'mother_name',
        'parent_phone',
        'parent_occupation',
        'parent_address',
        'status',
        'admin_notes',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'birth_date' => 'date:Y-m-d',
        'reviewed_at' => 'datetime',
    ];

    protected $appends = [
        'formatted_created_at',
        'formatted_birth_date',
        'gender_label',
        'status_label',
        'status_badge',
    ];

    /**
     * Relationship to uploaded documents.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(RegistrationDocument::class);
    }

    /**
     * Relationship to reviewer.
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Generate a unique sequential registration number: REG-YYYY-000001.
     */
    public static function generateRegistrationNumber(): string
    {
        $year = date('Y');
        $prefix = "REG-{$year}-";

        return DB::transaction(function () use ($prefix) {
            $latest = static::where('registration_number', 'like', "{$prefix}%")
                ->orderBy('registration_number', 'desc')
                ->lockForUpdate()
                ->first();

            if (! $latest) {
                $sequence = 1;
            } else {
                $lastNumber = (int) substr($latest->registration_number, -6);
                $sequence = $lastNumber + 1;
            }

            return sprintf('%s%06d', $prefix, $sequence);
        });
    }

    /**
     * Scope for searching registration by name, number, NIK, NISN, phone, email.
     */
    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (empty($search)) {
            return $query;
        }

        return $query->where(function ($q) use ($search) {
            $q->where('full_name', 'like', "%{$search}%")
                ->orWhere('registration_number', 'like', "%{$search}%")
                ->orWhere('nik', 'like', "%{$search}%")
                ->orWhere('nisn', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%");
        });
    }

    /**
     * Scope for filtering status.
     */
    public function scopeFilterStatus(Builder $query, ?string $status): Builder
    {
        if (empty($status) || $status === 'all' || $status === 'Semua') {
            return $query;
        }

        return $query->where('status', $status);
    }

    /**
     * Accessor for gender label.
     */
    public function getGenderLabelAttribute(): string
    {
        return $this->gender === 'L' ? 'Laki-laki' : 'Perempuan';
    }

    /**
     * Accessor for status label.
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'review' => 'Sedang Ditinjau',
            'accepted' => 'Diterima',
            'rejected' => 'Ditolak',
            default => 'Menunggu Verifikasi',
        };
    }

    /**
     * Accessor for status badge variant.
     */
    public function getStatusBadgeAttribute(): string
    {
        return match ($this->status) {
            'review' => 'brand',
            'accepted' => 'success',
            'rejected' => 'danger',
            default => 'warning',
        };
    }

    /**
     * Accessor for formatted created at date.
     */
    public function getFormattedCreatedAtAttribute(): string
    {
        if (! $this->created_at) {
            return '-';
        }

        return Carbon::parse($this->created_at)->locale('id')->isoFormat('D MMMM Y, HH:mm');
    }

    /**
     * Accessor for formatted birth date.
     */
    public function getFormattedBirthDateAttribute(): string
    {
        if (! $this->birth_date) {
            return '-';
        }

        return Carbon::parse($this->birth_date)->locale('id')->isoFormat('D MMMM Y');
    }
}
