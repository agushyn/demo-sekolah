<?php

namespace App\Http\Middleware;

use App\Models\SchoolSetting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'appName' => config('app.name', 'Portal Sekolah'),
            'school' => [
                'name' => config('app.school_name', 'SMK Triwijaya'),
                'tagline' => config('app.school_tagline', 'Membentuk Generasi Cerdas, Berkarakter & Berdaya Saing Global'),
                'phone' => '+62 21 8765 4321',
                'whatsapp' => '+62 812 3456 7890',
                'email' => 'info@smanusantara.sch.id',
                'address' => 'Jl. Pendidikan No. 45, Kebayoran Baru, Jakarta Selatan',
                'accreditation' => 'A (Unggul)',
            ],
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->primary_role,
                    'roles' => $request->user()->roles->pluck('name')->all(),
                    'permissions' => $request->user()->getAllPermissions()->pluck('name')->all(),
                    'email_verified_at' => $request->user()->email_verified_at,
                    'dashboard_url' => $request->user()->getDashboardUrl(),
                ] : null,
            ],
            'ppdb' => fn () => SchoolSetting::getRegistrationStatusInfo(),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
                'status' => fn () => $request->session()->get('status'),
            ],
        ];
    }
}
