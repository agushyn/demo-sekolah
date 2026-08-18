<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchoolSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'type',
    ];

    /**
     * Get a setting by key.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();

        if (! $setting) {
            return $default;
        }

        return match ($setting->type) {
            'boolean', 'bool' => filter_var($setting->value, FILTER_VALIDATE_BOOLEAN),
            'integer', 'int' => (int) $setting->value,
            'json' => json_decode($setting->value, true),
            default => $setting->value,
        };
    }

    /**
     * Set or update a setting.
     */
    public static function set(string $key, mixed $value, string $type = 'string'): self
    {
        $stringValue = match ($type) {
            'boolean', 'bool' => $value ? '1' : '0',
            'json' => is_array($value) ? json_encode($value) : $value,
            default => (string) $value,
        };

        return static::updateOrCreate(
            ['key' => $key],
            [
                'value' => $stringValue,
                'type' => $type,
            ]
        );
    }

    /**
     * Check if registration is currently open using Asia/Jakarta timezone.
     */
    public static function isRegistrationOpen(): bool
    {
        $enabled = static::get('registration_enabled', true);

        if (! $enabled) {
            return false;
        }

        $startDate = static::get('registration_start');
        $endDate = static::get('registration_end');

        $now = Carbon::now('Asia/Jakarta')->startOfDay();

        if ($startDate && $now->lt(Carbon::parse($startDate, 'Asia/Jakarta')->startOfDay())) {
            return false;
        }

        if ($endDate && $now->gt(Carbon::parse($endDate, 'Asia/Jakarta')->endOfDay())) {
            return false;
        }

        return true;
    }

    /**
     * Get comprehensive PPDB status info.
     */
    public static function getRegistrationStatusInfo(): array
    {
        $isOpen = static::isRegistrationOpen();
        $enabled = (bool) static::get('registration_enabled', true);
        $startDate = static::get('registration_start', '2026-08-01');
        $endDate = static::get('registration_end', '2026-09-30');
        $announcement = static::get('registration_announcement', 'Info PPDB 2026/2027');
        $announcementText = static::get('registration_announcement_text', 'Pendaftaran Siswa Baru Gelombang I Telah Dibuka!');

        return [
            'isOpen' => $isOpen,
            'enabled' => $enabled,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'announcement' => $announcement,
            'announcementText' => $announcementText,
        ];
    }
}
