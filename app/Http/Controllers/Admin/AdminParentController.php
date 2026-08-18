<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ParentProfile;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminParentController extends Controller
{
    /**
     * Display listing of parent accounts.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');

        $query = ParentProfile::with(['user', 'students.user', 'students.classes'])
            ->latest('id');

        if (! empty($search)) {
            $term = trim($search);
            $query->where(function ($q) use ($term) {
                $q->where('nik', 'like', "%{$term}%")
                    ->orWhere('phone', 'like', "%{$term}%")
                    ->orWhere('occupation', 'like', "%{$term}%")
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$term}%")->orWhere('email', 'like', "%{$term}%"))
                    ->orWhereHas('students.user', fn ($su) => $su->where('name', 'like', "%{$term}%"))
                    ->orWhereHas('students', fn ($st) => $st->where('nisn', 'like', "%{$term}%")->orWhere('nis', 'like', "%{$term}%"));
            });
        }

        $parents = $query->paginate(10)->withQueryString();

        $stats = [
            'total' => ParentProfile::count(),
            'with_students' => ParentProfile::has('students')->count(),
            'without_students' => ParentProfile::doesntHave('students')->count(),
            'total_students_linked' => Student::whereNotNull('parent_id')->count(),
        ];

        return Inertia::render('Admin/Parents/Index', [
            'parents' => $parents,
            'stats' => $stats,
            'filters' => [
                'search' => $search ?: '',
            ],
        ]);
    }

    /**
     * Show the form for creating a new parent account.
     */
    public function create(): Response
    {
        $availableStudents = Student::with(['user', 'classes'])
            ->orderBy('id', 'asc')
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->user?->name ?? 'Siswa',
                'nisn' => $s->nisn,
                'nis' => $s->nis,
                'grade_level' => $s->grade_level ?? $s->classes->first()?->name ?? '-',
                'has_parent' => ! is_null($s->parent_id),
            ]);

        return Inertia::render('Admin/Parents/Create', [
            'availableStudents' => $availableStudents,
        ]);
    }

    /**
     * Store a newly created parent account and link to student(s).
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'relationship_type' => ['required', 'string', 'max:50'],
            'nik' => ['nullable', 'string', 'max:30'],
            'phone' => ['required', 'string', 'max:25'],
            'occupation' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'student_ids' => ['nullable', 'array'],
            'student_ids.*' => ['exists:students,id'],
        ]);

        DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'password' => Hash::make($request->input('password')),
                'email_verified_at' => now(),
            ]);

            $user->assignRole('parent');

            $parent = ParentProfile::create([
                'user_id' => $user->id,
                'nik' => $request->input('nik'),
                'relationship_type' => $request->input('relationship_type'),
                'phone' => $request->input('phone'),
                'occupation' => $request->input('occupation'),
                'address' => $request->input('address'),
            ]);

            // Link selected students
            if ($request->filled('student_ids')) {
                Student::whereIn('id', $request->input('student_ids'))
                    ->update(['parent_id' => $parent->id]);
            }
        });

        return redirect()->route('admin.parents.index')
            ->with('success', "Akun orang tua '{$request->input('name')}' berhasil dibuat dan terhubung ke siswa.");
    }

    /**
     * Show the form for editing parent account.
     */
    public function edit(ParentProfile $parent): Response
    {
        $parent->load(['user', 'students']);

        $availableStudents = Student::with(['user', 'classes'])
            ->orderBy('id', 'asc')
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->user?->name ?? 'Siswa',
                'nisn' => $s->nisn,
                'nis' => $s->nis,
                'grade_level' => $s->grade_level ?? $s->classes->first()?->name ?? '-',
                'has_parent' => ! is_null($s->parent_id) && $s->parent_id !== $parent->id,
                'is_linked_to_current' => $s->parent_id === $parent->id,
            ]);

        return Inertia::render('Admin/Parents/Edit', [
            'parent' => [
                'id' => $parent->id,
                'user_id' => $parent->user_id,
                'name' => $parent->user?->name,
                'email' => $parent->user?->email,
                'relationship_type' => $parent->relationship_type,
                'nik' => $parent->nik,
                'phone' => $parent->phone,
                'occupation' => $parent->occupation,
                'address' => $parent->address,
                'selected_student_ids' => $parent->students->pluck('id')->toArray(),
            ],
            'availableStudents' => $availableStudents,
        ]);
    }

    /**
     * Update parent account and sync linked students.
     */
    public function update(Request $request, ParentProfile $parent): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique('users', 'email')->ignore($parent->user_id)],
            'password' => ['nullable', 'string', 'min:8'],
            'relationship_type' => ['required', 'string', 'max:50'],
            'nik' => ['nullable', 'string', 'max:30'],
            'phone' => ['required', 'string', 'max:25'],
            'occupation' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'student_ids' => ['nullable', 'array'],
            'student_ids.*' => ['exists:students,id'],
        ]);

        DB::transaction(function () use ($request, $parent) {
            $user = $parent->user;
            $userUpdates = [
                'name' => $request->input('name'),
                'email' => $request->input('email'),
            ];

            if ($request->filled('password')) {
                $userUpdates['password'] = Hash::make($request->input('password'));
            }

            $user->update($userUpdates);

            $parent->update([
                'nik' => $request->input('nik'),
                'relationship_type' => $request->input('relationship_type'),
                'phone' => $request->input('phone'),
                'occupation' => $request->input('occupation'),
                'address' => $request->input('address'),
            ]);

            // Sync students: Unlink old students not in new list
            $newStudentIds = $request->input('student_ids', []);
            Student::where('parent_id', $parent->id)
                ->whereNotIn('id', $newStudentIds)
                ->update(['parent_id' => null]);

            // Link new students
            if (! empty($newStudentIds)) {
                Student::whereIn('id', $newStudentIds)
                    ->update(['parent_id' => $parent->id]);
            }
        });

        return redirect()->route('admin.parents.index')
            ->with('success', "Data akun orang tua '{$request->input('name')}' berhasil diperbarui.");
    }

    /**
     * Remove the parent profile and user account.
     */
    public function destroy(ParentProfile $parent): RedirectResponse
    {
        $name = $parent->user?->name ?? 'Orang Tua';

        DB::transaction(function () use ($parent) {
            // Detach from students
            Student::where('parent_id', $parent->id)->update(['parent_id' => null]);

            $user = $parent->user;
            $parent->delete();

            if ($user) {
                $user->delete();
            }
        });

        return redirect()->route('admin.parents.index')
            ->with('success', "Akun orang tua '{$name}' telah dihapus.");
    }
}
