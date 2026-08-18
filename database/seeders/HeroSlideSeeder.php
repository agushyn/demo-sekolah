<?php

namespace Database\Seeders;

use App\Models\HeroSlide;
use Illuminate\Database\Seeder;

class HeroSlideSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $slides = [
            [
                'subtitle' => 'Portal Pendidikan Modern 2026/2027',
                'title' => 'Membentuk Generasi Cerdas, Berkarakter & Berdaya Saing Global.',
                'description' => 'Selamat datang di portal resmi SMK Triwijaya. Temukan informasi sekolah, kegiatan siswa, pembelajaran, dan berbagai prestasi terbaru.',
                'image' => 'hero-slides/slide-1.svg',
                'button_text' => 'Daftar Siswa Baru',
                'button_url' => '/pendaftaran',
                'secondary_button_text' => 'Profil Sekolah',
                'secondary_button_url' => '/profil',
                'text_position' => 'left',
                'overlay_type' => 'gradient',
                'sort_order' => 1,
                'duration' => 5000,
                'is_active' => true,
            ],
            [
                'subtitle' => 'Prestasi Siswa',
                'title' => 'Melangkah Lebih Jauh, Meraih Prestasi Lebih Tinggi.',
                'description' => 'Berbagai pencapaian siswa menjadi bukti semangat belajar, kreativitas, dan karakter unggul.',
                'image' => 'hero-slides/slide-2.svg',
                'button_text' => 'Lihat Prestasi',
                'button_url' => '/berita',
                'secondary_button_text' => 'Berita Sekolah',
                'secondary_button_url' => '/berita',
                'text_position' => 'center',
                'overlay_type' => 'dark',
                'sort_order' => 2,
                'duration' => 7000,
                'is_active' => true,
            ],
            [
                'subtitle' => 'Penerimaan Peserta Didik Baru',
                'title' => 'Awali Masa Depanmu Bersama Kami.',
                'description' => 'Temukan lingkungan belajar yang mendukung perkembangan akademik, karakter, kreativitas, dan potensi setiap siswa.',
                'image' => 'hero-slides/slide-3.svg',
                'button_text' => 'Daftar Sekarang',
                'button_url' => '/pendaftaran',
                'secondary_button_text' => 'Info PPDB',
                'secondary_button_url' => '/pendaftaran',
                'text_position' => 'left',
                'overlay_type' => 'gradient',
                'sort_order' => 3,
                'duration' => 5000,
                'is_active' => true,
            ],
            [
                'subtitle' => 'Pembelajaran Terpadu',
                'title' => 'Belajar, Berkarya, dan Tumbuh Bersama.',
                'description' => 'Platform pembelajaran digital yang membantu siswa dan guru terhubung di dalam maupun di luar kelas.',
                'image' => 'hero-slides/slide-4.svg',
                'button_text' => 'Masuk Portal',
                'button_url' => '/login',
                'secondary_button_text' => 'Program Sekolah',
                'secondary_button_url' => '/profil',
                'text_position' => 'center',
                'overlay_type' => 'dark',
                'sort_order' => 4,
                'duration' => 5000,
                'is_active' => true,
            ],
        ];

        foreach ($slides as $slide) {
            HeroSlide::updateOrCreate(
                ['title' => $slide['title']],
                $slide
            );
        }
    }
}
