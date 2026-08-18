<?php

namespace Database\Seeders;

use App\Models\News;
use App\Models\NewsCategory;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class NewsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::role(['super_admin', 'admin'])->first() ?? User::first();
        $authorId = $admin ? $admin->id : 1;

        $catPrestasi = NewsCategory::where('slug', 'prestasi')->first();
        $catAkademik = NewsCategory::where('slug', 'akademik')->first();
        $catKegiatan = NewsCategory::where('slug', 'kegiatan')->first();
        $catPengumuman = NewsCategory::where('slug', 'pengumuman')->first();
        $catFasilitas = NewsCategory::where('slug', 'fasilitas')->first();

        $newsData = [
            [
                'category_id' => $catPrestasi?->id,
                'author_id' => $authorId,
                'title' => 'Tim Robotika SMK Triwijaya Raih Juara 1 Olimpiade Sains & Teknologi Nasional 2026',
                'slug' => 'tim-robotika-sma-nusantara-raih-juara-1-osn-2026',
                'excerpt' => 'Siswa SMK Triwijaya kembali menorehkan prestasi gemilang dengan menciptakan inovasi robot pertanian pintar berbasis IoT ramah lingkungan...',
                'content' => "Prestasi membanggakan kembali diukir oleh siswa-siswi SMK Triwijaya. Dalam ajang bergengsi Olimpiade Sains dan Robotika Nasional 2026 yang diselenggarakan di Jakarta, tim robotika berhasil merebut medali emas setelah mengungguli puluhan perwakilan sekolah ternama dari seluruh penjuru Indonesia.\n\nRobot yang dinamai 'AgroBot Nusantara' ini dirancang untuk mendeteksi kelembaban tanah, memberikan pupuk organik secara presisi, serta memantau kesehatan tanaman secara otomatis menggunakan kecerdasan buatan (AI) ringan.\n\nKepala Sekolah menyampaikan apresiasi setinggi-tingginya kepada tim dan guru pembimbing yang telah bekerja keras selama 4 bulan masa persiapan. Prestasi ini membuktikan bahwa integrasi kurikulum teknologi dan riset di SMK Triwijaya mampu mencetak inovator muda berdaya saing global.",
                'thumbnail' => 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
                'status' => 'published',
                'is_featured' => true,
                'published_at' => Carbon::now()->subDays(3),
            ],
            [
                'category_id' => $catAkademik?->id,
                'author_id' => $authorId,
                'title' => 'Sosialisasi Pembelajaran Digital Terintegrasi & Pengenalan Portal Virtual Siswa',
                'slug' => 'sosialisasi-pembelajaran-digital-portal-virtual-schid',
                'excerpt' => 'Menyambut semester ganjil tahun ajaran baru, sekolah meluncurkan sistem manajemen pembelajaran modern berbasis Bento UI untuk efisiensi belajar...',
                'content' => "Untuk memastikan seluruh siswa dan guru mendapatkan pengalaman belajar yang fleksibel, transparan, dan terstruktur, sekolah resmi mengimplementasikan Portal Pembelajaran Digital berbasis Bento UI terpadu.\n\nMelalui portal ini, siswa dapat mengunduh materi dalam berbagai format (PDF, video, presentasi), mengumpulkan tugas secara terorganisir dengan pengingat tenggat waktu otomatis, serta mengikuti forum diskusi kelas yang dimoderasi oleh guru mata pelajaran.\n\nSosialisasi diadakan secara hibrida di auditorium sekolah dan disiarkan langsung melalui kanal YouTube resmi bagi para orang tua siswa.",
                'thumbnail' => 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
                'status' => 'published',
                'is_featured' => false,
                'published_at' => Carbon::now()->subDays(5),
            ],
            [
                'category_id' => $catKegiatan?->id,
                'author_id' => $authorId,
                'title' => 'Kunjungan Edukasi dan Penandatanganan MoU Riset Bersama Universitas Terkemuka',
                'slug' => 'kunjungan-edukasi-kerjasama-riset-kampus-ternama',
                'excerpt' => 'Mempersiapkan siswa menuju perguruan tinggi impian melalui program mentorship dan pengenalan langsung laboratorium riset terdepan...',
                'content' => "Sebanyak 150 siswa kelas XII mengikuti kegiatan campus tour dan workshop riset lanjutan untuk meningkatkan kesiapan akademik menjelang seleksi masuk perguruan tinggi negeri (SNBP & SNBT) serta perguruan tinggi luar negeri.\n\nKerjasama ini mencakup pendampingan karya tulis ilmiah siswa oleh dosen universitas mitra, akses literasi jurnal digital, serta peluang beasiswa khusus bagi lulusan berprestasi SMK Triwijaya.",
                'thumbnail' => 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
                'status' => 'published',
                'is_featured' => false,
                'published_at' => Carbon::now()->subDays(10),
            ],
            [
                'category_id' => $catPengumuman?->id,
                'author_id' => $authorId,
                'title' => 'Pembukaan Pendaftaran Peserta Didik Baru (PPDB) Tahun Ajaran 2026/2027 Gelombang 1',
                'slug' => 'penerimaan-peserta-didik-baru-ppdb-2026-gelombang-1',
                'excerpt' => 'PPDB Tahun Ajaran 2026/2027 resmi dibuka melalui Jalur Prestasi Akademik, Non-Akademik, dan Jalur Reguler...',
                'content' => "Panitia Penerimaan Peserta Didik Baru (PPDB) SMK Triwijaya mengumumkan pembukaan pendaftaran online Gelombang 1 yang berlangsung dari tanggal 1 Agustus hingga 30 September 2026.\n\nCalon siswa dapat memilih jalur pendaftaran sesuai kualifikasi yang dimiliki, antara lain: Jalur Prestasi Nilai Rapor, Jalur Prestasi Kejuaraan (Olahraga, Seni, Sains), serta Jalur Tes Akademik Reguler. Kuota angkatan tahun ini dibatasi maksimal 320 siswa dalam 10 rombongan belajar.",
                'thumbnail' => 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80',
                'status' => 'published',
                'is_featured' => false,
                'published_at' => Carbon::now()->subDays(14),
            ],
            [
                'category_id' => $catFasilitas?->id,
                'author_id' => $authorId,
                'title' => 'Peresmian Laboratorium Kecerdasan Buatan (AI) & Studio Multimedia Kreatif',
                'slug' => 'peresmian-laboratorium-kecerdasan-buatan-dan-studio-multimedia',
                'excerpt' => 'Fasilitas mutakhir untuk menunjang pembelajaran coding, robotika, animasi, dan produksi konten edukatif siswa...',
                'content' => "Sebagai komitmen menghadirkan pendidikan masa depan, sekolah resmi meresmikan Lab AI & Multimedia dengan 36 unit komputer spesifikasi tinggi, workstation render grafis, dan peralatan podcast profesional.\n\nFasilitas ini dapat diakses oleh seluruh siswa melalui jadwal praktikum mata pelajaran Informatika maupun kegiatan ekstrakurikuler ICT Club.",
                'thumbnail' => 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
                'status' => 'draft',
                'is_featured' => false,
                'published_at' => null,
            ],
            [
                'category_id' => $catKegiatan?->id,
                'author_id' => $authorId,
                'title' => 'Peringatan Hari Kemerdekaan RI ke-81 & Pagelaran Seni Budaya Nusantara',
                'slug' => 'peringatan-hari-kemerdekaan-dan-pentas-seni-budaya-81',
                'excerpt' => 'Menyemarakkan bulan kemerdekaan dengan karnaval busana tradisional, lomba debat kebangsaan, dan bazar kewirausahaan siswa...',
                'content' => 'Dalam rangka menyambut HUT RI ke-81, OSIS bersama dewan guru menyelenggarakan serangkaian kegiatan yang menggabungkan semangat nasionalisme dan kreativitas generasi muda. Acara puncak akan diisi dengan pentas drama musikal kolosal bertema persatuan bangsa.',
                'thumbnail' => 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80',
                'status' => 'scheduled',
                'is_featured' => false,
                'published_at' => Carbon::now()->addDays(2),
            ],
        ];

        foreach ($newsData as $data) {
            News::updateOrCreate(['slug' => $data['slug']], $data);
        }
    }
}
