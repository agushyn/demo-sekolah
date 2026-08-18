<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSchoolStaffRequest;
use App\Http\Requests\Admin\UpdateSchoolStaffRequest;
use App\Models\SchoolStaff;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AdminSchoolStaffController extends Controller
{
    /**
     * Display a listing of school staff with Bento UI statistics.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $category = $request->query('category');
        $status = $request->query('status');

        $query = SchoolStaff::query()->orderBy('sort_order', 'asc')->orderBy('id', 'asc');

        if (! empty($search)) {
            $query->search($search);
        }

        if (! empty($category) && $category !== 'all') {
            $query->where('category', $category);
        }

        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        $staff = $query->paginate(12)->withQueryString();

        $stats = [
            'total' => SchoolStaff::count(),
            'active_teachers' => SchoolStaff::where('category', 'teacher')->where('is_active', true)->count(),
            'active_staff' => SchoolStaff::where('category', 'staff')->where('is_active', true)->count(),
            'inactive' => SchoolStaff::where('is_active', false)->count(),
        ];

        return Inertia::render('Admin/Staff/Index', [
            'staff' => $staff,
            'stats' => $stats,
            'filters' => [
                'search' => $search ?: '',
                'category' => $category ?: 'all',
                'status' => $status ?: 'all',
            ],
        ]);
    }

    /**
     * Show the form for creating a new staff member.
     */
    public function create(): Response
    {
        // Suggest next sort order
        $maxSortOrder = SchoolStaff::max('sort_order') ?? 0;

        return Inertia::render('Admin/Staff/Create', [
            'suggestedSortOrder' => $maxSortOrder + 1,
        ]);
    }

    /**
     * Store a newly created staff member in storage.
     */
    public function store(StoreSchoolStaffRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('staff-photos', 'public');
            $data['photo'] = $path;
        }

        $data['is_active'] = $request->boolean('is_active', true);
        $data['sort_order'] = (int) ($data['sort_order'] ?? 0);
        $data['slug'] = SchoolStaff::generateUniqueSlug($data['name']);

        SchoolStaff::create($data);

        Cache::forget('public_school_staff');

        return redirect()->route('admin.staff.index')->with('success', 'Data Guru & Staf berhasil ditambahkan.');
    }

    /**
     * Show the form for editing the specified staff member.
     */
    public function edit(SchoolStaff $guru_staff): Response
    {
        return Inertia::render('Admin/Staff/Edit', [
            'staff' => $guru_staff,
        ]);
    }

    /**
     * Update the specified staff member in storage.
     */
    public function update(UpdateSchoolStaffRequest $request, SchoolStaff $guru_staff): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('photo')) {
            // Delete old photo if exists on public disk
            if ($guru_staff->photo && Storage::disk('public')->exists($guru_staff->photo)) {
                Storage::disk('public')->delete($guru_staff->photo);
            }

            $path = $request->file('photo')->store('staff-photos', 'public');
            $data['photo'] = $path;
        }

        if ($data['name'] !== $guru_staff->name) {
            $data['slug'] = SchoolStaff::generateUniqueSlug($data['name'], $guru_staff->id);
        }

        $data['is_active'] = $request->boolean('is_active', true);
        $data['sort_order'] = (int) ($data['sort_order'] ?? $guru_staff->sort_order);

        $guru_staff->update($data);

        Cache::forget('public_school_staff');

        return redirect()->route('admin.staff.index')->with('success', "Data '{$guru_staff->name}' berhasil diperbarui.");
    }

    /**
     * Remove the specified staff member from storage.
     */
    public function destroy(SchoolStaff $guru_staff): RedirectResponse
    {
        if ($guru_staff->photo && Storage::disk('public')->exists($guru_staff->photo)) {
            Storage::disk('public')->delete($guru_staff->photo);
        }

        $name = $guru_staff->name;
        $guru_staff->delete();

        Cache::forget('public_school_staff');

        return redirect()->route('admin.staff.index')->with('success', "Data '{$name}' berhasil dihapus.");
    }

    /**
     * Toggle active status for specified staff member.
     */
    public function toggleActive(SchoolStaff $guru_staff): RedirectResponse
    {
        $guru_staff->update([
            'is_active' => ! $guru_staff->is_active,
        ]);

        Cache::forget('public_school_staff');

        $statusText = $guru_staff->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return redirect()->back()->with('success', "Status '{$guru_staff->name}' berhasil {$statusText}.");
    }

    /**
     * Reorder staff list.
     */
    public function reorder(Request $request): RedirectResponse
    {
        $request->validate([
            'items' => ['required', 'array'],
            'items.*.id' => ['required', 'exists:school_staff,id'],
            'items.*.sort_order' => ['required', 'integer'],
        ]);

        foreach ($request->input('items') as $item) {
            SchoolStaff::where('id', $item['id'])->update([
                'sort_order' => $item['sort_order'],
            ]);
        }

        Cache::forget('public_school_staff');

        return redirect()->back()->with('success', 'Urutan Guru & Staf berhasil disimpan.');
    }
}
