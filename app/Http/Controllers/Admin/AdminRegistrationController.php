<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateRegistrationStatusRequest;
use App\Models\Registration;
use App\Models\RegistrationDocument;
use App\Models\SchoolSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminRegistrationController extends Controller
{
    /**
     * Display the Admin PPDB Dashboard and applicant list.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $status = $request->query('status');

        $query = Registration::with('documents')
            ->latest();

        if (! empty($search)) {
            $query->search($search);
        }

        if (! empty($status) && $status !== 'all' && $status !== 'Semua') {
            $query->filterStatus($status);
        }

        $registrations = $query->paginate(10)->withQueryString();

        $stats = [
            'total' => Registration::count(),
            'pending' => Registration::where('status', 'pending')->count(),
            'review' => Registration::where('status', 'review')->count(),
            'accepted' => Registration::where('status', 'accepted')->count(),
            'rejected' => Registration::where('status', 'rejected')->count(),
        ];

        $settings = [
            'registration_enabled' => SchoolSetting::get('registration_enabled', true),
            'registration_start' => SchoolSetting::get('registration_start', '2026-08-01'),
            'registration_end' => SchoolSetting::get('registration_end', '2026-09-30'),
            'registration_announcement' => SchoolSetting::get('registration_announcement', 'Info PPDB 2026/2027'),
            'registration_announcement_text' => SchoolSetting::get('registration_announcement_text', 'Pendaftaran Siswa Baru Gelombang I Telah Dibuka!'),
        ];

        return Inertia::render('Admin/Registration/Index', [
            'registrations' => $registrations,
            'stats' => $stats,
            'settings' => $settings,
            'filters' => [
                'search' => $search ?: '',
                'status' => $status ?: 'all',
            ],
        ]);
    }

    /**
     * Display applicant detail.
     */
    public function show(Registration $registration): Response
    {
        $registration->load(['documents', 'reviewer']);

        return Inertia::render('Admin/Registration/Show', [
            'registration' => $registration,
        ]);
    }

    /**
     * Update applicant status and review notes.
     */
    public function updateStatus(UpdateRegistrationStatusRequest $request, Registration $registration): RedirectResponse
    {
        $validated = $request->validated();

        $registration->update([
            'status' => $validated['status'],
            'admin_notes' => $validated['admin_notes'] ?? null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        try {
            Log::info("Registration {$registration->registration_number} status updated to {$validated['status']} by Admin {$request->user()->name}");
        } catch (\Throwable $e) {
            // Ignore log error
        }

        return redirect()->back()->with('success', "Status pendaftaran calon siswa berhasil diperbarui menjadi {$registration->status_label}.");
    }

    /**
     * Securely download private registration document.
     */
    public function downloadDocument(Registration $registration, RegistrationDocument $document)
    {
        // Enforce document belongs to registration
        if ($document->registration_id !== $registration->id) {
            abort(404, 'Dokumen tidak ditemukan.');
        }

        if (! Storage::disk('local')->exists($document->file_path)) {
            abort(404, 'Berkas fisik dokumen tidak ditemukan di penyimpanan server.');
        }

        return Storage::disk('local')->download($document->file_path, $document->original_name);
    }

    /**
     * Update Registration System Settings (ON/OFF, Start/End dates).
     */
    public function updateSettings(Request $request): RedirectResponse
    {
        $request->validate([
            'registration_enabled' => ['required', 'boolean'],
            'registration_start' => ['nullable', 'date'],
            'registration_end' => ['nullable', 'date', 'after_or_equal:registration_start'],
            'registration_announcement' => ['nullable', 'string', 'max:255'],
            'registration_announcement_text' => ['nullable', 'string', 'max:500'],
        ]);

        SchoolSetting::set('registration_enabled', $request->boolean('registration_enabled'), 'boolean');

        if ($request->filled('registration_start')) {
            SchoolSetting::set('registration_start', $request->input('registration_start'), 'string');
        }

        if ($request->filled('registration_end')) {
            SchoolSetting::set('registration_end', $request->input('registration_end'), 'string');
        }

        if ($request->has('registration_announcement')) {
            SchoolSetting::set('registration_announcement', $request->input('registration_announcement') ?: 'Info PPDB 2026/2027', 'string');
        }

        if ($request->has('registration_announcement_text')) {
            SchoolSetting::set('registration_announcement_text', $request->input('registration_announcement_text') ?: 'Pendaftaran Siswa Baru Gelombang I Telah Dibuka!', 'string');
        }

        Cache::forget('public_hero_slides');

        $status = $request->boolean('registration_enabled') ? 'DIBUKA' : 'DITUTUP';

        return redirect()->back()->with('success', "Pengaturan pendaftaran berhasil disimpan. Status PPDB saat ini: {$status}.");
    }

    /**
     * Export all registrations to CSV.
     */
    public function exportCsv(): StreamedResponse
    {
        $fileName = 'data_pendaftar_ppdb_'.date('Ymd_His').'.csv';

        $headers = [
            'Content-type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $columns = [
            'No Pendaftaran',
            'Nama Lengkap',
            'NIK',
            'NISN',
            'Tempat Lahir',
            'Tanggal Lahir',
            'Jenis Kelamin',
            'Alamat Domisili',
            'Provinsi',
            'Kota/Kabupaten',
            'Kecamatan',
            'Kelurahan',
            'No Telepon/WA',
            'Email',
            'Nama Ayah',
            'Nama Ibu',
            'No HP Ortu',
            'Pekerjaan Ortu',
            'Status',
            'Catatan Admin',
            'Waktu Daftar',
        ];

        $callback = function () use ($columns) {
            $file = fopen('php://output', 'w');
            // Write BOM for UTF-8 compatibility with Excel
            fwrite($file, "\xEF\xBB\xBF");
            fputcsv($file, $columns);

            Registration::orderBy('id', 'asc')->chunk(200, function ($registrations) use ($file) {
                foreach ($registrations as $reg) {
                    fputcsv($file, [
                        $reg->registration_number,
                        $reg->full_name,
                        "'".$reg->nik,
                        $reg->nisn ? "'".$reg->nisn : '-',
                        $reg->birth_place,
                        $reg->birth_date?->format('Y-m-d'),
                        $reg->gender_label,
                        $reg->address,
                        $reg->province ?: '-',
                        $reg->regency ?: '-',
                        $reg->district ?: '-',
                        $reg->village ?: '-',
                        $reg->phone,
                        $reg->email,
                        $reg->father_name,
                        $reg->mother_name,
                        $reg->parent_phone,
                        $reg->parent_occupation ?: '-',
                        $reg->status_label,
                        $reg->admin_notes ?: '-',
                        $reg->created_at?->format('Y-m-d H:i:s'),
                    ]);
                }
            });

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
