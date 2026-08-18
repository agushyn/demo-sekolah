<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        // Allow comma or pipe separated roles in middleware argument
        $allowedRoles = [];
        foreach ($roles as $roleGroup) {
            foreach (preg_split('/[,|]/', $roleGroup) as $r) {
                $trimmed = trim($r);
                if ($trimmed !== '') {
                    $allowedRoles[] = $trimmed;
                }
            }
        }

        if (! empty($allowedRoles) && ! $user->hasAnyRole($allowedRoles)) {
            abort(403, 'Akses ditolak: Anda tidak memiliki peran (role) yang diizinkan untuk mengakses halaman ini.');
        }

        return $next($request);
    }
}
