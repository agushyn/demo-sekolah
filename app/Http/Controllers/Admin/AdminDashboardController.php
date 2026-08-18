<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ParentProfile;
use App\Models\SchoolStaff;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    /**
     * Display the admin dashboard with Bento statistics.
     */
    public function index(Request $request): Response
    {
        $stats = [
            'total_users' => User::count(),
            'total_teachers' => Teacher::count(),
            'total_students' => Student::count(),
            'total_parents' => ParentProfile::count(),
            'total_admins' => User::whereHas('roles', fn ($q) => $q->whereIn('name', ['super_admin', 'admin']))->count(),
            'active_staff_teachers' => SchoolStaff::where('category', 'teacher')->where('is_active', true)->count(),
            'active_staff_nonteachers' => SchoolStaff::where('category', 'staff')->where('is_active', true)->count(),
        ];

        $recentUsers = User::with('roles')
            ->latest()
            ->take(6)
            ->get()
            ->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->primary_role,
                'created_at' => $u->created_at->translatedFormat('d M Y, H:i'),
            ]);

        return Inertia::render('Admin/index', [
            'stats' => $stats,
            'recentUsers' => $recentUsers,
        ]);
    }
}
