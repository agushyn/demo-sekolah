<?php

namespace Database\Seeders;

use App\Models\ForumCategory;
use App\Models\ForumPost;
use App\Models\ForumReaction;
use App\Models\ForumThread;
use App\Models\User;
use Illuminate\Database\Seeder;

class ForumSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::role('admin')->first() ?? User::first();
        $teacher = User::role('teacher')->first() ?? User::first();
        $student = User::role('student')->first() ?? User::first();

        // 1. Categories
        $categories = [
            [
                'name' => 'General',
                'slug' => 'general',
                'description' => 'Diskusi umum seputar kehidupan sekolah, tips belajar efektif, dan informasi komunitas.',
                'icon' => 'MessageSquare',
                'color' => 'brand',
            ],
            [
                'name' => 'Matematika',
                'slug' => 'matematika',
                'description' => 'Ruang tanya jawab dan pemecahan soal kalkulus, aljabar, trigonometri, dan olimpiade.',
                'icon' => 'Calculator',
                'color' => 'emerald',
            ],
            [
                'name' => 'Bahasa Indonesia',
                'slug' => 'bahasa-indonesia',
                'description' => 'Apresiasi karya sastra, kaidah tata bahasa EYD, penulisan esai, puisi, dan cerpen.',
                'icon' => 'BookOpen',
                'color' => 'amber',
            ],
            [
                'name' => 'Bahasa Inggris',
                'slug' => 'bahasa-inggris',
                'description' => 'English corner: Grammar discussions, IELTS/TOEFL practice, and daily speaking tips.',
                'icon' => 'Globe',
                'color' => 'purple',
            ],
            [
                'name' => 'IPA',
                'slug' => 'ipa',
                'description' => 'Eksplorasi eksperimen laboratorium sains fisika, kimia, biologi, dan astronomi.',
                'icon' => 'FlaskConical',
                'color' => 'rose',
            ],
            [
                'name' => 'Kegiatan Sekolah',
                'slug' => 'kegiatan-sekolah',
                'description' => 'Seputar kegiatan OSIS, ekstrakurikuler, festival seni, dan kompetisi antarkelas.',
                'icon' => 'Sparkles',
                'color' => 'sky',
            ],
        ];

        $categoryModels = [];
        foreach ($categories as $cat) {
            $categoryModels[$cat['slug']] = ForumCategory::updateOrCreate(['slug' => $cat['slug']], $cat);
        }

        // 2. Threads
        $thread1 = ForumThread::updateOrCreate(
            ['slug' => 'tata-tertib-dan-panduan-komunitas-forum-diskusi-schid'],
            [
                'category_id' => $categoryModels['general']->id,
                'author_id' => $admin->id,
                'title' => 'Tata Tertib dan Panduan Berdiskusi di Forum Komunitas Sekolah',
                'content' => "Selamat datang di Forum Resmi SMK Triwijaya!\n\nUntuk menjaga kenyamanan berdiskusi, harap perhatikan etika berikut:\n1. Gunakan bahasa yang santun dan konstruktif.\n2. Dilarang memposting konten berbau SARA, perundungan (bullying), atau spam promosi.\n3. Hormati perbedaan pendapat dan berikan argumen berbasis fakta.\n4. Manfaatkan kategori yang sesuai saat membuat thread baru.\n\nMari kita jadikan forum ini sarana bertukar ilmu yang bermanfaat!",
                'is_pinned' => true,
                'is_locked' => true, // Locked pinned guideline
                'views_count' => 142,
            ]
        );

        $thread2 = ForumThread::updateOrCreate(
            ['slug' => 'tips-menghadapi-soal-olimpiade-matematika-materi-kombinatorika'],
            [
                'category_id' => $categoryModels['matematika']->id,
                'author_id' => $teacher->id,
                'title' => 'Tips Menghadapi Soal Olimpiade Matematika Materi Kombinatorika & Peluang',
                'content' => "Halo teman-teman pejuang OSN Matematika!\n\nKombinatorika seringkali menjadi materi yang menantang karena menuntut penalaran logis tingkat tinggi. Kunci utamanya adalah menguasai Prinsip Sarang Merpati (Pigeonhole Principle) dan Inklusi-Eksklusi.\n\nApakah ada yang memiliki soal latihan menarik untuk dibahas bersama di sini?",
                'is_pinned' => false,
                'is_locked' => false,
                'views_count' => 88,
            ]
        );

        $thread3 = ForumThread::updateOrCreate(
            ['slug' => 'rekomendasi-buku-bacaan-novel-sastra-klasik-indonesia'],
            [
                'category_id' => $categoryModels['bahasa-indonesia']->id,
                'author_id' => $student->id,
                'title' => 'Rekomendasi Novel Sastra Klasik Indonesia yang Wajib Dibaca Siswa',
                'content' => 'Teman-teman, ada rekomendasi buku sastra Indonesia yang seru untuk bahan resensi tugas bahasa Indonesia? Saya baru selesai membaca Tetralogi Buru karya Pramoedya dan sangat kagum dengan narasinya.',
                'is_pinned' => false,
                'is_locked' => false,
                'views_count' => 54,
            ]
        );

        // 3. Posts (Replies)
        ForumPost::updateOrCreate(
            ['thread_id' => $thread2->id, 'user_id' => $student->id],
            [
                'content' => 'Terima kasih tipsnya Pak! Sangat membantu. Saya sering bingung membedakan penggunaan kombinasi dengan pengulangan (stars and bars method).',
            ]
        );

        ForumPost::updateOrCreate(
            ['thread_id' => $thread2->id, 'user_id' => $teacher->id],
            [
                'content' => 'Untuk stars and bars, ingat rumusnya (n + k - 1) C (k - 1). Nanti kita bahas studi kasus spesifik saat ekstrakurikuler ya!',
            ]
        );

        ForumPost::updateOrCreate(
            ['thread_id' => $thread3->id, 'user_id' => $teacher->id],
            [
                'content' => 'Coba baca juga "Tenggelamnya Kapal Van der Wijck" karya Buya Hamka atau "Ronggeng Dukuh Paruk" karya Ahmad Tohari. Keduanya sarat akan nilai budaya dan stilistika bahasa yang indah.',
            ]
        );

        // 4. Reactions
        ForumReaction::updateOrCreate(
            ['user_id' => $student->id, 'reactable_type' => ForumThread::class, 'reactable_id' => $thread2->id],
            ['reaction_type' => 'like']
        );

        ForumReaction::updateOrCreate(
            ['user_id' => $admin->id, 'reactable_type' => ForumThread::class, 'reactable_id' => $thread2->id],
            ['reaction_type' => 'like']
        );
    }
}
