<?php

namespace App\Services\Attendance;

use App\Contracts\AttendanceProviderInterface;
use App\Models\SystemSetting;

class AttendanceProviderFactory
{
    /**
     * Create the active attendance provider instance based on database settings.
     */
    public static function make(?string $driver = null): AttendanceProviderInterface
    {
        $activeDriver = $driver ?? SystemSetting::get('attendance_driver', config('services.attendance_api.driver', 'internal'));

        return match ($activeDriver) {
            'supabase' => new SupabaseAttendanceProvider,
            'external_api' => new ExternalAttendanceProvider,
            default => new InternalAttendanceProvider,
        };
    }
}
