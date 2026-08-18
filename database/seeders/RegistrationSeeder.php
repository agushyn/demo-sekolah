<?php

namespace Database\Seeders;

use App\Models\Registration;
use App\Models\RegistrationDocument;
use App\Models\SchoolSetting;
use App\Models\User;
use Illuminate\Database\Seeder;

class RegistrationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Settings
        SchoolSetting::set('registration_enabled', true, 'boolean');
        SchoolSetting::set('registration_start', '2026-08-01', 'string');
        SchoolSetting::set('registration_end', '2026-09-30', 'string');

        // 2. Sample Registrations
        $admin = User::role(['super_admin', 'admin'])->first() ?? User::first();
        $adminId = $admin ? $admin->id : 1;

        $samples = [
            [
                'full_name' => 'Aditya Pratama Putra',
                'nik' => '3171012304090001',
                'nisn' => '0091234567',
                'birth_place' => 'Jakarta',
                'birth_date' => '2009-04-23',
                'gender' => 'L',
                'address' => 'Jl. Tebet Barat Dalam No. 12, RT 04/RW 02',
                'province' => 'DKI Jakarta',
                'regency' => 'Jakarta Selatan',
                'district' => 'Tebet',
                'village' => 'Tebet Barat',
                'phone' => '081298765432',
                'email' => 'aditya.pratama@gmail.com',
                'father_name' => 'Budi Santoso',
                'mother_name' => 'Siti Aminah',
                'parent_phone' => '081311223344',
                'parent_occupation' => 'Karyawan Swasta',
                'parent_address' => 'Jl. Tebet Barat Dalam No. 12, Jakarta Selatan',
                'status' => 'pending',
                'admin_notes' => null,
                'reviewed_by' => null,
                'reviewed_at' => null,
            ],
            [
                'full_name' => 'Clarissa Putri Maharani',
                'nik' => '3171016508090002',
                'nisn' => '0092345678',
                'birth_place' => 'Bandung',
                'birth_date' => '2009-08-15',
                'gender' => 'P',
                'address' => 'Jl. Kemang Raya No. 45',
                'province' => 'DKI Jakarta',
                'regency' => 'Jakarta Selatan',
                'district' => 'Mampang Prapatan',
                'village' => 'Bangka',
                'phone' => '085712345678',
                'email' => 'clarissa.putri@gmail.com',
                'father_name' => 'Hendra Maharani',
                'mother_name' => 'Dewi Lestari',
                'parent_phone' => '081244556677',
                'parent_occupation' => 'Wiraswasta',
                'parent_address' => 'Jl. Kemang Raya No. 45, Jakarta Selatan',
                'status' => 'review',
                'admin_notes' => 'Berkas NIK dan Akta Kelahiran telah sesuai. Menunggu verifikasi keabsahan nilai rapor SMP.',
                'reviewed_by' => $adminId,
                'reviewed_at' => now()->subHours(4),
            ],
            [
                'full_name' => 'Fadhil Rizky Al-Ghifari',
                'nik' => '3171011112090003',
                'nisn' => '0093456789',
                'birth_place' => 'Surabaya',
                'birth_date' => '2009-12-11',
                'gender' => 'L',
                'address' => 'Jl. Gandaria Tengah II No. 8',
                'province' => 'DKI Jakarta',
                'regency' => 'Jakarta Selatan',
                'district' => 'Kebayoran Baru',
                'village' => 'Kramat Pela',
                'phone' => '087812349988',
                'email' => 'fadhil.rizky@gmail.com',
                'father_name' => 'Ahmad Ghifari',
                'mother_name' => 'Rina Marlina',
                'parent_phone' => '081199887766',
                'parent_occupation' => 'PNS / ASN',
                'parent_address' => 'Jl. Gandaria Tengah II No. 8, Jakarta Selatan',
                'status' => 'accepted',
                'admin_notes' => 'Selamat! Berkas lengkap dan memenuhi kualifikasi seleksi PPDB Gelombang 1 Jalur Prestasi.',
                'reviewed_by' => $adminId,
                'reviewed_at' => now()->subDay(),
            ],
            [
                'full_name' => 'Nadia Syakira Azzahra',
                'nik' => '3171014502090004',
                'nisn' => '0094567890',
                'birth_place' => 'Yogyakarta',
                'birth_date' => '2009-02-05',
                'gender' => 'P',
                'address' => 'Jl. Panglima Polim V No. 19',
                'province' => 'DKI Jakarta',
                'regency' => 'Jakarta Selatan',
                'district' => 'Kebayoran Baru',
                'village' => 'Melawai',
                'phone' => '081912348877',
                'email' => 'nadia.syakira@gmail.com',
                'father_name' => 'Bambang Kusuma',
                'mother_name' => 'Nurul Hidayah',
                'parent_phone' => '081288776655',
                'parent_occupation' => 'BUMN',
                'parent_address' => 'Jl. Panglima Polim V No. 19, Jakarta Selatan',
                'status' => 'rejected',
                'admin_notes' => 'Mohon maaf, dokumen Ijazah/SKL yang diunggah buram dan NIK tidak terdaftar pada Disdukcapil domisili.',
                'reviewed_by' => $adminId,
                'reviewed_at' => now()->subDays(2),
            ],
        ];

        foreach ($samples as $sample) {
            $reg = Registration::where('nik', $sample['nik'])->first();
            if (! $reg) {
                $regNumber = Registration::generateRegistrationNumber();
                $sample['registration_number'] = $regNumber;
                $reg = Registration::create($sample);

                // Sample Documents
                RegistrationDocument::create([
                    'registration_id' => $reg->id,
                    'document_type' => 'kk',
                    'file_path' => "registrations/{$reg->id}/kartu_keluarga.pdf",
                    'original_name' => 'Kartu_Keluarga_Scan.pdf',
                    'mime_type' => 'application/pdf',
                    'file_size' => 524288,
                ]);

                RegistrationDocument::create([
                    'registration_id' => $reg->id,
                    'document_type' => 'birth_certificate',
                    'file_path' => "registrations/{$reg->id}/akta_kelahiran.pdf",
                    'original_name' => 'Akta_Kelahiran_Resmi.pdf',
                    'mime_type' => 'application/pdf',
                    'file_size' => 419430,
                ]);

                RegistrationDocument::create([
                    'registration_id' => $reg->id,
                    'document_type' => 'photo',
                    'file_path' => "registrations/{$reg->id}/pas_foto.jpg",
                    'original_name' => 'Pas_Foto_3x4.jpg',
                    'mime_type' => 'image/jpeg',
                    'file_size' => 184320,
                ]);
            }
        }
    }
}
