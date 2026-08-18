<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class HealthCheckController extends Controller
{
    /**
     * Check application and database health without exposing sensitive credentials.
     */
    public function __invoke(): JsonResponse
    {
        $health = [
            'status' => 'ok',
            'app' => config('app.name', 'SMK Triwijaya'),
            'environment' => config('app.env'),
            'timestamp' => Carbon::now()->toIso8601String(),
            'subsystems' => [
                'database' => 'ok',
                'storage' => 'ok',
            ],
        ];

        $isHealthy = true;

        // 1. Database Check
        try {
            DB::connection()->getPdo();
        } catch (\Throwable $e) {
            $health['status'] = 'degraded';
            $health['subsystems']['database'] = 'disconnected';
            $isHealthy = false;
        }

        // 2. Storage Check
        try {
            Storage::disk('public')->exists('');
        } catch (\Throwable $e) {
            $health['status'] = 'degraded';
            $health['subsystems']['storage'] = 'unreachable';
            $isHealthy = false;
        }

        return response()->json($health, $isHealthy ? 200 : 503);
    }
}
