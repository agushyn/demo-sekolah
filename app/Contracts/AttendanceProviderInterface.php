<?php

namespace App\Contracts;

use Carbon\Carbon;
use Illuminate\Support\Collection;

interface AttendanceProviderInterface
{
    /**
     * Get attendance records for a specific date and optional class.
     */
    public function getAttendance(Carbon $date, ?int $classId = null): Collection;

    /**
     * Get attendance history for a single student over a date range.
     */
    public function getStudentAttendance(int $studentId, Carbon $startDate, Carbon $endDate): Collection;

    /**
     * Fetch & sync attendance from the provider.
     */
    public function syncAttendance(Carbon $date): array;

    /**
     * Get summary counts (present, late, sick, permission, absent) for a date.
     */
    public function getAttendanceSummary(Carbon $date, ?int $classId = null): array;

    /**
     * Check if the provider is fully configured with credentials/endpoints.
     */
    public function isConfigured(): bool;

    /**
     * Get human-readable provider name.
     */
    public function getProviderName(): string;
}
