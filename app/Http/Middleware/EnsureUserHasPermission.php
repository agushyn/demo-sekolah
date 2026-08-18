<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     * @param  string  ...$permissions
     */
    public function handle(Request $request, Closure $next, ...$permissions): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        $allowedPermissions = [];
        foreach ($permissions as $permGroup) {
            foreach (preg_split('/[,|]/', $permGroup) as $p) {
                $trimmed = trim($p);
                if ($trimmed !== '') {
                    $allowedPermissions[] = $trimmed;
                }
            }
        }

        $hasAnyPermission = false;
        foreach ($allowedPermissions as $perm) {
            if ($user->hasPermission($perm)) {
                $hasAnyPermission = true;
                break;
            }
        }

        if (! empty($allowedPermissions) && ! $hasAnyPermission) {
            abort(403, 'Akses ditolak: Anda tidak memiliki hak izin (permission) yang sesuai.');
        }

        return $next($request);
    }
}
