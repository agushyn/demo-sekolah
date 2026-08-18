<?php

namespace Database\Seeders;

use App\Models\NewsCategory;
use Illuminate\Database\Seeder;

class NewsCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Prestasi',
                'slug' => 'prestasi',
                'description' => 'Berita pencapaian kejuaraan sains, seni, teknologi, dan olahraga siswa.',
                'color' => 'success',
            ],
            [
                'name' => 'Akademik',
                'slug' => 'akademik',
                'description' => 'Informasi kurikulum, jadwal pembelajaran digital, riset, dan workshop.',
                'color' => 'brand',
            ],
            [
                'name' => 'Kegiatan',
                'slug' => 'kegiatan',
                'description' => 'Liputan acara sekolah, perayaan hari besar, dan agenda OSIS/ekskul.',
                'color' => 'warning',
            ],
            [
                'name' => 'Pengumuman',
                'slug' => 'pengumuman',
                'description' => 'Pemberitahuan resmi dinas, jadwal libur, dan informasi PPDB.',
                'color' => 'purple',
            ],
            [
                'name' => 'Fasilitas',
                'slug' => 'fasilitas',
                'description' => 'Pembaruan sarana prasarana, laboratorium, dan teknologi pembelajaran.',
                'color' => 'indigo',
            ],
        ];

        foreach ($categories as $cat) {
            NewsCategory::updateOrCreate(['slug' => $cat['slug']], $cat);
        }
    }
}
