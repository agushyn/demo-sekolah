<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        if (Auth::check()) {
            return redirect($request->user()->getDashboardUrl());
        }

        return Inertia::render('Public/Login');
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['nullable', 'string'],
            'identifier' => ['nullable', 'string'],
            'password' => ['required', 'string'],
            'remember' => ['nullable', 'boolean'],
        ]);

        $identifier = $request->input('email') ?: $request->input('identifier');

        if (empty($identifier)) {
            throw ValidationException::withMessages([
                'email' => 'Email atau Nomor Identitas wajib diisi.',
            ]);
        }

        $throttleKey = Str::transliterate(Str::lower($identifier).'|'.$request->ip());

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            throw ValidationException::withMessages([
                'email' => trans('auth.throttle', [
                    'seconds' => $seconds,
                    'minutes' => ceil($seconds / 60),
                ]),
            ]);
        }

        // Determine user email if identifier is NIP / NISN
        $email = $identifier;
        if (! str_contains($identifier, '@')) {
            $teacher = Teacher::where('nip', $identifier)->first();
            if ($teacher && $teacher->user) {
                $email = $teacher->user->email;
            } else {
                $student = Student::where('nisn', $identifier)->orWhere('nis', $identifier)->first();
                if ($student && $student->user) {
                    $email = $student->user->email;
                }
            }
        }

        if (! Auth::attempt(['email' => $email, 'password' => $request->input('password')], $request->boolean('remember'))) {
            RateLimiter::hit($throttleKey);

            throw ValidationException::withMessages([
                'email' => 'Kredensial yang diberikan tidak cocok dengan data kami.',
            ]);
        }

        RateLimiter::clear($throttleKey);

        $request->session()->regenerate();

        /** @var User $user */
        $user = Auth::user();

        return redirect()->intended($user->getDashboardUrl());
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/')->with('success', 'Anda telah berhasil keluar (logout).');
    }
}
