<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'group',
        'key',
        'value',
        'type',
    ];

    /**
     * Get a setting value with fallback.
     */
    public static function get(string $key, $default = null, string $group = 'attendance')
    {
        $setting = static::where('group', $group)->where('key', $key)->first();

        if (! $setting || $setting->value === null) {
            return $default;
        }

        return match ($setting->type) {
            'boolean' => filter_var($setting->value, FILTER_VALIDATE_BOOLEAN),
            'integer' => (int) $setting->value,
            'json' => json_decode($setting->value, true),
            default => $setting->value,
        };
    }

    /**
     * Set / update a setting value.
     */
    public static function set(string $key, $value, string $group = 'attendance', string $type = 'string'): self
    {
        $rawValue = match ($type) {
            'boolean' => $value ? '1' : '0',
            'json' => is_array($value) ? json_encode($value) : $value,
            default => (string) $value,
        };

        return static::updateOrCreate(
            ['group' => $group, 'key' => $key],
            ['value' => $rawValue, 'type' => $type]
        );
    }

    /**
     * Get all settings in a specific group as key-value array.
     */
    public static function getGroup(string $group): array
    {
        $settings = static::where('group', $group)->get();
        $result = [];

        foreach ($settings as $setting) {
            $result[$setting->key] = match ($setting->type) {
                'boolean' => filter_var($setting->value, FILTER_VALIDATE_BOOLEAN),
                'integer' => (int) $setting->value,
                'json' => json_decode($setting->value, true),
                default => $setting->value,
            };
        }

        return $result;
    }
}
