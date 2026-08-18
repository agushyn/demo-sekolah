<?php

namespace App\Http\Controllers;

use App\Http\Requests\SubmitRegistrationRequest;
use App\Models\Registration;
use App\Models\RegistrationDocument;
use App\Models\SchoolSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class RegistrationController extends Controller
{
    /**
     * Display the registration form or closed notification page.
     */
    public function index(): Response
    {
        $isOpen = SchoolSetting::isRegistrationOpen();

        $settings = [
            'registration_enabled' => SchoolSetting::get('registration_enabled', true),
            'registration_start' => SchoolSetting::get('registration_start'),
            'registration_end' => SchoolSetting::get('registration_end'),
        ];

        if (! $isOpen) {
            return Inertia::render('Public/Registration/Closed', [
                'settings' => $settings,
            ]);
        }

        return Inertia::render('Public/Registration/Index', [
            'settings' => $settings,
        ]);
    }

    /**
     * Store a newly submitted registration application with private documents.
     */
    public function store(SubmitRegistrationRequest $request): RedirectResponse
    {
        if (! SchoolSetting::isRegistrationOpen()) {
            return redirect()->route('public.registration')
                ->with('error', 'Mohon maaf, periode pendaftaran siswa baru saat ini sedang ditutup.');
        }

        $validated = $request->validated();

        $registration = DB::transaction(function () use ($validated, $request) {
            $regNumber = Registration::generateRegistrationNumber();

            $reg = Registration::create([
                'registration_number' => $regNumber,
                'full_name' => $validated['full_name'],
                'nik' => $validated['nik'],
                'nisn' => $validated['nisn'] ?? null,
                'birth_place' => $validated['birth_place'],
                'birth_date' => $validated['birth_date'],
                'gender' => $validated['gender'],
                'address' => $validated['address'],
                'province' => $validated['province'] ?? null,
                'regency' => $validated['regency'] ?? null,
                'district' => $validated['district'] ?? null,
                'village' => $validated['village'] ?? null,
                'phone' => $validated['phone'],
                'email' => $validated['email'],

                'father_name' => $validated['father_name'],
                'mother_name' => $validated['mother_name'],
                'parent_phone' => $validated['parent_phone'],
                'parent_occupation' => $validated['parent_occupation'] ?? null,
                'parent_address' => $validated['parent_address'] ?? null,

                'status' => 'pending',
            ]);

            // Save Documents in Private Storage (Disk: local/private)
            $docTypes = [
                'doc_kk' => 'kk',
                'doc_birth_certificate' => 'birth_certificate',
                'doc_diploma' => 'diploma',
                'doc_photo' => 'photo',
                'doc_additional' => 'additional',
            ];

            foreach ($docTypes as $inputKey => $type) {
                if ($request->hasFile($inputKey)) {
                    $file = $request->file($inputKey);
                    $path = $file->store("registrations/{$reg->id}", 'local');

                    RegistrationDocument::create([
                        'registration_id' => $reg->id,
                        'document_type' => $type,
                        'file_path' => $path,
                        'original_name' => $file->getClientOriginalName(),
                        'mime_type' => $file->getClientMimeType() ?: $file->getMimeType(),
                        'file_size' => $file->getSize(),
                    ]);
                }
            }

            return $reg;
        });

        // Send Email Notification if configured (safe try-catch)
        try {
            // Log submission notification
            Log::info("Registration submitted successfully: {$registration->registration_number} for {$registration->full_name}");
        } catch (\Throwable $e) {
            Log::warning("Email notification failed for registration {$registration->registration_number}: ".$e->getMessage());
        }

        return redirect()->route('public.registration.success', $registration->registration_number);
    }

    /**
     * Display the registration submission success card.
     */
    public function success(string $registrationNumber): Response
    {
        $registration = Registration::with('documents')
            ->where('registration_number', $registrationNumber)
            ->firstOrFail();

        return Inertia::render('Public/Registration/Success', [
            'registration' => $registration,
        ]);
    }
}
