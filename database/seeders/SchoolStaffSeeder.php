<?php

namespace Database\Seeders;

use App\Models\SchoolStaff;
use Illuminate\Database\Seeder;

class SchoolStaffSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $staff = [
            // Pimpinan Sekolah (Urutan 1, 2, 3)
            [
                'name' => 'Drs. H. Bambang Suryono, M.Pd.',
                'employee_number' => '19680315 199303 1 004',
                'position' => 'Kepala Sekolah',
                'category' => 'teacher',
                'department' => 'Pimpinan Sekolah',
                'subject' => 'Pendidikan Karakter & Kepemimpinan',
                'education' => 'S2 Manajemen Pendidikan — Universitas Negeri Jakarta',
                'bio' => "Berpengalaman lebih dari 25 tahun dalam tata kelola pendidikan modern. Berkomitmen mewujudkan sekolah berwawasan global dengan landasan budi pekerti luhur.\n\n\"Mendidik pikiran tanpa mendidik hati bukanlah pendidikan sama sekali.\"",
                'email' => 'kepsek@smanusantara.sch.id',
                'phone' => '+62 812-1111-2233',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'Dr. Hj. Siti Rahmawati, M.Si.',
                'employee_number' => '19750820 199903 2 002',
                'position' => 'Wakil Kepala Sekolah Bidang Kurikulum',
                'category' => 'teacher',
                'department' => 'Pimpinan & Kurikulum',
                'subject' => 'Matematika Peminatan & Pembina OSN',
                'education' => 'S3 Pendidikan Sains — Institut Teknologi Bandung',
                'bio' => "Fokus pada inovasi kurikulum terpadu berbasis komputasi dan riset terapan untuk mempersiapkan siswa menuju perguruan tinggi terbaik dunia.\n\nPembina aktif tim olimpiade sains nasional bidang matematika.",
                'email' => 'siti.rahmawati@smanusantara.sch.id',
                'phone' => '+62 812-2222-3344',
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'Ahmad Fauzi, S.Pd., M.Kom.',
                'employee_number' => '19810412 200604 1 009',
                'position' => 'Wakil Kepala Sekolah Bidang Kesiswaan',
                'category' => 'teacher',
                'department' => 'Pimpinan & Kesiswaan',
                'subject' => 'Informatika & Robotika',
                'education' => 'S2 Ilmu Komputer — Universitas Indonesia',
                'bio' => 'Membina karakter, kedisiplinan, dan prestasi bakat minat siswa di bidang teknologi, kepemimpinan organisasi OSIS, dan kewirausahaan digital.',
                'email' => 'ahmad.fauzi@smanusantara.sch.id',
                'phone' => '+62 812-3333-4455',
                'sort_order' => 3,
                'is_active' => true,
            ],

            // Dewan Guru (Urutan 4, 5, 6)
            [
                'name' => 'Budi Hartono, S.Pd.',
                'employee_number' => '19860718 201001 1 012',
                'position' => 'Guru Fisika & Koordinator Lab',
                'category' => 'teacher',
                'department' => 'Laboratorium & Sains',
                'subject' => 'Fisika & Riset Eksperimen',
                'education' => 'S1 Pendidikan Fisika — Universitas Pendidikan Indonesia',
                'bio' => 'Menerapkan metode pembelajaran praktikum interaktif dan eksperimen terapan untuk menumbuhkan nalar kritis siswa di bidang sains murni.',
                'email' => 'budi.hartono@smanusantara.sch.id',
                'phone' => '+62 812-4444-5566',
                'sort_order' => 4,
                'is_active' => true,
            ],
            [
                'name' => 'Dian Kusuma Wardani, S.Pd., M.A.',
                'employee_number' => '19891105 201402 2 007',
                'position' => 'Guru Bahasa Inggris',
                'category' => 'teacher',
                'department' => 'Bahasa & Diplomasi',
                'subject' => 'Bahasa Inggris & Model UN',
                'education' => 'S2 Applied Linguistics — University of Melbourne',
                'bio' => 'Melatih kemampuan komunikasi global, public speaking, debat kritis, dan pemahaman lintas budaya bagi generasi muda calon pemimpin dunia.',
                'email' => 'dian.kusuma@smanusantara.sch.id',
                'phone' => '+62 812-5555-6677',
                'sort_order' => 5,
                'is_active' => true,
            ],
            [
                'name' => 'Rina Wulandari, S.Pd.',
                'employee_number' => '19910214 201601 2 010',
                'position' => 'Guru Bahasa Indonesia',
                'category' => 'teacher',
                'department' => 'Literasi & Jurnalistik',
                'subject' => 'Bahasa Indonesia & Penulisan Kreatif',
                'education' => 'S1 Sastra & Pendidikan Bahasa Indonesia — Universitas Gadjah Mada',
                'bio' => 'Mengembangkan budaya literasi membaca, apresiasi sastra nusantara, serta karya jurnalistik dan majalah digital siswa.',
                'email' => 'rina.wulandari@smanusantara.sch.id',
                'phone' => '+62 812-6666-7788',
                'sort_order' => 6,
                'is_active' => true,
            ],

            // Tenaga Kependidikan & Staf (Urutan 7, 8, 9)
            [
                'name' => 'Agus Wijaya, S.E.',
                'employee_number' => '19800910 200801 1 005',
                'position' => 'Kepala Tata Usaha & Sarpras',
                'category' => 'staff',
                'department' => 'Bagian Tata Usaha',
                'subject' => null,
                'education' => 'S1 Manajemen Keuangan — Universitas Diponegoro',
                'bio' => 'Mengelola administrasi perkantoran sekolah, perencanaan sarana prasarana modern, dan pelayanan prima kepada seluruh civitas akademika.',
                'email' => 'agus.wijaya@smanusantara.sch.id',
                'phone' => '+62 812-7777-8899',
                'sort_order' => 7,
                'is_active' => true,
            ],
            [
                'name' => 'Budi Setiawan, A.Md.',
                'employee_number' => '19930516 201801 1 015',
                'position' => 'Operator IT & Sistem Data (Dapodik)',
                'category' => 'staff',
                'department' => 'Teknologi Informasi & Data',
                'subject' => null,
                'education' => 'D3 Manajemen Informatika — Politeknik Negeri Jakarta',
                'bio' => 'Bertanggung jawab atas sinkronisasi data Dapodik Kemendikbudristek, pemeliharaan portal digital sekolah, dan infrastruktur jaringan WiFi kampus.',
                'email' => 'budi.setiawan@smanusantara.sch.id',
                'phone' => '+62 812-8888-9900',
                'sort_order' => 8,
                'is_active' => true,
            ],
            [
                'name' => 'Maya Lestari, S.Sos.',
                'employee_number' => '19951201 202001 2 011',
                'position' => 'Staf Administrasi Akademik & Layanan PPDB',
                'category' => 'staff',
                'department' => 'Layanan Siswa & PPDB',
                'subject' => null,
                'education' => 'S1 Administrasi Publik — Universitas Padjadjaran',
                'bio' => 'Melayani penerbitan legalisir ijazah, surat keterangan siswa aktif, verifikasi dokumen pendaftaran peserta didik baru (PPDB), dan arsip siswa.',
                'email' => 'maya.lestari@smanusantara.sch.id',
                'phone' => '+62 812-9999-0011',
                'sort_order' => 9,
                'is_active' => true,
            ],
        ];

        foreach ($staff as $item) {
            SchoolStaff::updateOrCreate(
                ['name' => $item['name']],
                $item
            );
        }
    }
}
