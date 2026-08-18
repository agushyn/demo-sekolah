<?php

namespace App\Http\Requests;

use App\Models\SchoolSetting;
use Illuminate\Foundation\Http\FormRequest;

class SubmitRegistrationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return SchoolSetting::isRegistrationOpen();
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            // Data Calon Siswa
            'full_name' => ['required', 'string', 'max:255'],
            'nik' => ['required', 'digits:16', 'unique:registrations,nik'],
            'nisn' => ['nullable', 'digits:10'],
            'birth_place' => ['required', 'string', 'max:255'],
            'birth_date' => ['required', 'date', 'before:today'],
            'gender' => ['required', 'in:L,P'],
            'address' => ['required', 'string'],
            'province' => ['nullable', 'string', 'max:255'],
            'regency' => ['nullable', 'string', 'max:255'],
            'district' => ['nullable', 'string', 'max:255'],
            'village' => ['nullable', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'email' => ['required', 'email', 'max:255'],

            // Data Orang Tua / Wali
            'father_name' => ['required', 'string', 'max:255'],
            'mother_name' => ['required', 'string', 'max:255'],
            'parent_phone' => ['required', 'string', 'max:20'],
            'parent_occupation' => ['nullable', 'string', 'max:255'],
            'parent_address' => ['nullable', 'string'],

            // Dokumen Unggahan
            'doc_kk' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:3072'],
            'doc_birth_certificate' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:3072'],
            'doc_diploma' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:3072'],
            'doc_photo' => ['required', 'file', 'mimes:jpg,jpeg,png', 'max:3072'],
            'doc_additional' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:3072'],

            // Persetujuan
            'agreement' => ['required', 'accepted'],
        ];
    }

    /**
     * Custom attribute names for clear error messages.
     */
    public function attributes(): array
    {
        return [
            'full_name' => 'Nama Lengkap Siswa',
            'nik' => 'Nomor Induk Kependudukan (NIK)',
            'nisn' => 'NISN',
            'birth_place' => 'Tempat Lahir',
            'birth_date' => 'Tanggal Lahir',
            'gender' => 'Jenis Kelamin',
            'address' => 'Alamat Domisili Siswa',
            'phone' => 'Nomor HP / WhatsApp Siswa',
            'email' => 'Alamat Email Siswa',
            'father_name' => 'Nama Lengkap Ayah',
            'mother_name' => 'Nama Lengkap Ibu',
            'parent_phone' => 'Nomor Telepon Orang Tua',
            'parent_occupation' => 'Pekerjaan Orang Tua',
            'doc_kk' => 'Scan Kartu Keluarga (KK)',
            'doc_birth_certificate' => 'Scan Akta Kelahiran',
            'doc_diploma' => 'Scan Ijazah / SKL',
            'doc_photo' => 'Pas Foto 3x4 Berwarna',
            'doc_additional' => 'Dokumen Tambahan / Sertifikat Prestasi',
            'agreement' => 'Persetujuan Kebenaran Data',
        ];
    }

    /**
     * Custom messages.
     */
    public function messages(): array
    {
        return [
            'nik.unique' => 'NIK ini telah terdaftar pada sistem pendaftaran.',
            'nik.digits' => 'NIK wajib berjumlah tepat 16 digit angka.',
            'nisn.digits' => 'NISN wajib berjumlah tepat 10 digit angka.',
            'agreement.accepted' => 'Anda wajib menyetujui pernyataan kebenaran data untuk melanjutkan.',
            'doc_kk.required' => 'Dokumen Kartu Keluarga wajib diunggah.',
            'doc_birth_certificate.required' => 'Dokumen Akta Kelahiran wajib diunggah.',
            'doc_photo.required' => 'Pas foto resmi wajib diunggah.',
        ];
    }
}
