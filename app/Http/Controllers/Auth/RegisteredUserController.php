<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\ParentProfile;
use App\Models\Student;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        if (Auth::check()) {
            return redirect($request->user()->getDashboardUrl());
        }

        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => ['nullable', 'string', 'in:student,parent'],
            'nisn' => ['nullable', 'string', 'max:20', 'unique:'.Student::class.',nisn'],
            'phone' => ['nullable', 'string', 'max:20'],
        ]);

        $role = $request->input('role', 'student');

        $user = User::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => Hash::make($request->input('password')),
        ]);

        $user->assignRole($role);

        if ($role === 'student') {
            Student::create([
                'user_id' => $user->id,
                'nisn' => $request->input('nisn'),
                'phone' => $request->input('phone'),
            ]);
        } elseif ($role === 'parent') {
            ParentProfile::create([
                'user_id' => $user->id,
                'phone' => $request->input('phone'),
            ]);
        }

        event(new Registered($user));

        Auth::login($user);

        return redirect($user->getDashboardUrl());
    }
}
