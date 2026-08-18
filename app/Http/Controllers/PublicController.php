<?php

namespace App\Http\Controllers;

use App\Models\AcademicEvent;
use App\Models\AcademicYear;
use App\Models\HeroSlide;
use App\Models\News;
use App\Models\NewsCategory;
use App\Models\SchoolStaff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class PublicController extends Controller
{
    /**
     * Halaman Utama (Homepage).
     */
    public function home(): Response
    {
        $heroSlides = Cache::remember('public_hero_slides', 3600, function () {
            return HeroSlide::active()
                ->get()
                ->map(fn ($slide) => [
                    'id' => $slide->id,
                    'subtitle' => $slide->subtitle,
                    'title' => $slide->title,
                    'description' => $slide->description,
                    'image' => $slide->image,
                    'image_url' => $slide->image_url,
                    'button_text' => $slide->button_text,
                    'button_url' => $slide->button_url,
                    'secondary_button_text' => $slide->secondary_button_text,
                    'secondary_button_url' => $slide->secondary_button_url,
                    'text_position' => $slide->text_position,
                    'overlay_type' => $slide->overlay_type,
                    'sort_order' => $slide->sort_order,
                    'duration' => $slide->duration,
                    'is_active' => $slide->is_active,
                ])
                ->all();
        });

        $featuredNews = News::with(['category', 'author'])
            ->published()
            ->latest('published_at')
            ->take(3)
            ->get()
            ->map(fn ($item) => [
                'id' => $item->id,
                'slug' => $item->slug,
                'title' => $item->title,
                'category' => $item->category?->name ?? 'Warta',
                'badge_color' => $item->category?->color ?? 'brand',
                'date' => $item->formatted_date,
                'read_time' => $item->read_time,
                'excerpt' => $item->excerpt,
                'thumbnail' => $item->thumbnail_url,
            ]);

        $upcomingEvents = AcademicEvent::publicOnly()
            ->upcoming()
            ->take(4)
            ->get();

        $featuredStaff = Cache::remember('public_featured_staff', 3600, function () {
            return SchoolStaff::active()
                ->take(4)
                ->get()
                ->map(fn ($s) => [
                    'id' => $s->id,
                    'name' => $s->name,
                    'slug' => $s->slug,
                    'position' => $s->position,
                    'category' => $s->category,
                    'category_label' => $s->category_label,
                    'subject' => $s->subject,
                    'photo_url' => $s->photo_url,
                ])
                ->all();
        });

        return Inertia::render('Public/Home', [
            'heroSlides' => $heroSlides,
            'featuredNews' => $featuredNews,
            'upcomingEvents' => $upcomingEvents,
            'featuredStaff' => $featuredStaff,
        ]);
    }

    /**
     * Halaman Profil Sekolah.
     */
    public function profile(): Response
    {
        return Inertia::render('Public/Profile', [
            'history' => [
                'founded' => 1998,
                'accreditation' => 'A (Unggul)',
                'npsn' => '20108976',
                'description' => 'Didirikan pada tahun 1998 di bawah naungan Yayasan Pendidikan Nusantara Unggul, SMK Triwijaya telah berkontribusi lebih dari 28 tahun dalam mencetak lulusan unggul berkarakter kuat, cerdas spiritual dan intelektual, serta berdaya saing di kancah nasional maupun internasional.',
            ],
            'vision' => 'Menjadi pusat pendidikan unggulan bertaraf internasional yang berakar pada nilai-nilai luhur Pancasila, menguasai ilmu pengetahuan dan teknologi mutakhir, serta peduli terhadap kelestarian lingkungan.',
            'mission' => [
                'Menyelenggarakan proses pembelajaran yang inovatif, interaktif, dan adaptif berbasis teknologi digital terpadu.',
                'Menumbuhkembangkan budi pekerti, integritas kepemimpinan, dan toleransi dalam keberagaman budaya nusantara.',
                'Memfasilitasi pengembangan potensi akademik dan non-akademik siswa melalui riset, olimpiade, seni, dan keolahragaan.',
                'Menjalin kemitraan strategis dengan perguruan tinggi ternama dan industri untuk memperluas wawasan karir masa depan.',
                'Menciptakan lingkungan sekolah yang aman, inklusif, asri, dan berwawasan pelestarian lingkungan hidup.',
            ],
            'coreValues' => [
                ['title' => 'Integritas', 'desc' => 'Menjunjung tinggi kejujuran, tanggung jawab moral, dan etika dalam setiap langkah.'],
                ['title' => 'Keunggulan', 'desc' => 'Selalu berusaha mencapai standar prestasi terbaik dalam akademik maupun karakter.'],
                ['title' => 'Inovasi', 'desc' => 'Terbuka terhadap perkembangan teknologi dan proaktif menciptakan solusi baru.'],
                ['title' => 'Kolaborasi', 'desc' => 'Membangun sinergi harmonis antara siswa, guru, orang tua, dan masyarakat.'],
            ],
            'facilities' => [
                ['name' => 'Smart Classrooms', 'desc' => '30 ruang kelas ber-AC dilengkapi interactive display smartboard dan koneksi internet cepat.'],
                ['name' => 'Laboratorium Riset & Komputer', 'desc' => 'Lab Fisika, Kimia, Biologi modern serta Lab Komputer AI & Robotika spesifikasi tinggi.'],
                ['name' => 'Perpustakaan Digital (E-Library)', 'desc' => 'Ribuan e-book, jurnal internasional, dan area baca multimedia yang nyaman.'],
                ['name' => 'Gelanggang Olahraga Terpadu', 'desc' => 'Lapangan basket standar FIBA, futsal vinyl, badminton, dan wall climbing.'],
                ['name' => 'Auditorium & Theater Seni', 'desc' => 'Kapasitas 800 tempat duduk dengan tata akustik dan pencahayaan panggung profesional.'],
                ['name' => 'Kantin Sehat & Student Lounge', 'desc' => 'Penyedia nutrisi higienis bersertifikasi serta ruang santai kolaborasi siswa.'],
            ],
        ]);
    }

    /**
     * Halaman Portal Berita (List & Filter).
     */
    public function news(Request $request): Response
    {
        $category = $request->query('category');
        $search = $request->query('search');

        $query = News::with(['category', 'author'])
            ->published()
            ->latest('published_at');

        if (! empty($search)) {
            $query->search($search);
        }

        if (! empty($category) && $category !== 'Semua') {
            $query->filterCategory($category);
        }

        $newsPaginator = $query->paginate(9)->withQueryString();

        $newsList = $newsPaginator->through(fn ($item) => [
            'id' => $item->id,
            'slug' => $item->slug,
            'title' => $item->title,
            'category' => $item->category?->name ?? 'Warta',
            'badge_color' => $item->category?->color ?? 'brand',
            'author' => $item->author?->name ?? 'Humas Sekolah',
            'date' => $item->formatted_date,
            'read_time' => $item->read_time,
            'excerpt' => $item->excerpt,
            'thumbnail' => $item->thumbnail_url,
            'featured' => $item->is_featured,
        ]);

        $featuredArticle = News::with(['category', 'author'])
            ->published()
            ->where('is_featured', true)
            ->latest('published_at')
            ->first() ?? News::with(['category', 'author'])->published()->latest('published_at')->first();

        $featuredFormatted = $featuredArticle ? [
            'id' => $featuredArticle->id,
            'slug' => $featuredArticle->slug,
            'title' => $featuredArticle->title,
            'category' => $featuredArticle->category?->name ?? 'Warta',
            'badge_color' => $featuredArticle->category?->color ?? 'brand',
            'author' => $featuredArticle->author?->name ?? 'Humas Sekolah',
            'date' => $featuredArticle->formatted_date,
            'read_time' => $featuredArticle->read_time,
            'excerpt' => $featuredArticle->excerpt,
            'thumbnail' => $featuredArticle->thumbnail_url,
            'featured' => true,
        ] : null;

        $dbCategories = NewsCategory::orderBy('name')->pluck('name')->toArray();
        $categories = array_merge(['Semua'], $dbCategories);

        return Inertia::render('Public/News', [
            'newsList' => $newsList,
            'featuredArticle' => $featuredFormatted,
            'categories' => $categories,
            'currentCategory' => $category ?: 'Semua',
            'searchQuery' => $search ?: '',
        ]);
    }

    /**
     * Halaman Detail Berita.
     */
    public function newsDetail(string $slug): Response
    {
        $news = News::with(['category', 'author'])
            ->published()
            ->where('slug', $slug)
            ->firstOrFail();

        $relatedNews = News::with(['category', 'author'])
            ->published()
            ->where('id', '!=', $news->id)
            ->latest('published_at')
            ->take(3)
            ->get()
            ->map(fn ($item) => [
                'id' => $item->id,
                'slug' => $item->slug,
                'title' => $item->title,
                'category' => $item->category?->name ?? 'Warta',
                'badge_color' => $item->category?->color ?? 'neutral',
                'date' => $item->formatted_date,
                'read_time' => $item->read_time,
            ]);

        $formattedNews = [
            'id' => $news->id,
            'slug' => $news->slug,
            'title' => $news->title,
            'category' => $news->category?->name ?? 'Warta',
            'badge_color' => $news->category?->color ?? 'brand',
            'author' => $news->author?->name ?? 'Humas Sekolah',
            'date' => $news->formatted_date,
            'read_time' => $news->read_time,
            'excerpt' => $news->excerpt,
            'content' => $news->content,
            'thumbnail' => $news->thumbnail_url,
        ];

        return Inertia::render('Public/NewsDetail', [
            'news' => $formattedNews,
            'relatedNews' => $relatedNews,
        ]);
    }

    /**
     * Halaman Kalender Akademik.
     */
    public function calendar(Request $request): Response
    {
        $category = $request->query('category');
        $search = $request->query('search');

        $query = AcademicEvent::with('academicYear')
            ->publicOnly()
            ->orderBy('start_date', 'asc');

        if (! empty($search)) {
            $query->search($search);
        }

        if (! empty($category) && $category !== 'Semua' && $category !== 'all') {
            $query->where('category', $category);
        }

        $events = $query->get();

        $activeYear = AcademicYear::where('is_active', true)->first();

        return Inertia::render('Public/Calendar', [
            'events' => $events,
            'activeYear' => $activeYear,
            'currentCategory' => $category ?: 'Semua',
            'categories' => [
                ['id' => 'Semua', 'name' => 'Semua Agenda'],
                ['id' => 'academic', 'name' => 'Akademik'],
                ['id' => 'exam', 'name' => 'Ujian'],
                ['id' => 'holiday', 'name' => 'Libur Sekolah'],
                ['id' => 'activity', 'name' => 'Kegiatan Siswa'],
                ['id' => 'event', 'name' => 'Event & Seni'],
            ],
        ]);
    }

    /**
     * Halaman Daftar Guru & Staf Pendidik.
     */
    public function teachers(Request $request): Response
    {
        $search = $request->query('search');
        $category = $request->query('category');

        $query = SchoolStaff::active();

        if (! empty($search)) {
            $query->search($search);
        }

        if (! empty($category) && in_array($category, ['teacher', 'staff'])) {
            $query->where('category', $category);
        }

        $staff = $query->get()->map(fn ($s) => [
            'id' => $s->id,
            'name' => $s->name,
            'slug' => $s->slug,
            'employee_number' => $s->employee_number,
            'position' => $s->position,
            'department' => $s->department,
            'category' => $s->category,
            'category_label' => $s->category_label,
            'subject' => $s->subject,
            'education' => $s->education,
            'bio' => $s->bio,
            'photo_url' => $s->photo_url,
            'email' => $s->email,
            'phone' => $s->phone,
            'sort_order' => $s->sort_order,
        ]);

        $stats = [
            'total' => SchoolStaff::where('is_active', true)->count(),
            'teachers' => SchoolStaff::where('is_active', true)->where('category', 'teacher')->count(),
            'staff' => SchoolStaff::where('is_active', true)->where('category', 'staff')->count(),
        ];

        return Inertia::render('Public/Teachers', [
            'staff' => $staff,
            'teachers' => $staff,
            'stats' => $stats,
            'currentCategory' => $category ?: 'all',
            'currentSearch' => $search ?: '',
        ]);
    }

    /**
     * Halaman Detail Profil Guru / Staf.
     */
    public function staffDetail(string $slug): Response
    {
        $member = SchoolStaff::active()->where('slug', $slug)->firstOrFail();

        $related = SchoolStaff::active()
            ->where('id', '!=', $member->id)
            ->where('category', $member->category)
            ->take(3)
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'slug' => $s->slug,
                'position' => $s->position,
                'category' => $s->category,
                'category_label' => $s->category_label,
                'subject' => $s->subject,
                'photo_url' => $s->photo_url,
            ]);

        return Inertia::render('Public/StaffDetail', [
            'staff' => [
                'id' => $member->id,
                'name' => $member->name,
                'slug' => $member->slug,
                'employee_number' => $member->employee_number,
                'position' => $member->position,
                'department' => $member->department,
                'category' => $member->category,
                'category_label' => $member->category_label,
                'subject' => $member->subject,
                'education' => $member->education,
                'bio' => $member->bio,
                'photo_url' => $member->photo_url,
                'email' => $member->email,
                'phone' => $member->phone,
            ],
            'relatedStaff' => $related,
        ]);
    }

    /**
     * Halaman Kontak Sekolah.
     */
    public function contact(): Response
    {
        return Inertia::render('Public/Contact', [
            'contactInfo' => [
                'address' => 'Jl. Pendidikan No. 45, Kebayoran Baru, Jakarta Selatan, DKI Jakarta 12180',
                'phone' => '+62 21 8765 4321',
                'whatsapp' => '+62 812 3456 7890',
                'email' => 'info@smanusantara.sch.id',
                'admissions_email' => 'ppdb@smanusantara.sch.id',
                'operating_hours' => [
                    'weekdays' => 'Senin - Kamis: 07:00 - 15:30 WIB',
                    'friday' => 'Jumat: 07:00 - 15:00 WIB',
                    'weekend' => 'Sabtu & Minggu: Libur Pelayanan Administrasi',
                ],
                'maps_url' => 'https://maps.google.com/?q=Jakarta',
            ],
        ]);
    }

    /**
     * Halaman FAQ (Tanya Jawab).
     */
    public function faq(): Response
    {
        $faqs = [
            [
                'category' => 'Penerimaan Siswa Baru (PPDB)',
                'items' => [
                    [
                        'q' => 'Kapan pendaftaran siswa baru (PPDB) tahun ajaran 2026/2027 dibuka?',
                        'a' => 'Pendaftaran Gelombang 1 dibuka mulai 1 Agustus hingga 30 September 2026 melalui portal online di website ini atau dapat langsung datang ke sekretariat panitia PPDB.',
                    ],
                    [
                        'q' => 'Apa saja dokumen yang wajib diunggah saat mendaftar?',
                        'a' => 'Dokumen yang dibutuhkan antara lain: scan Kartu Keluarga (KK), Akta Kelahiran, NISN resmi, Rapor SMP Semester 1-5, pas foto berwarna terbaru, dan piagam sertifikat kejuaraan bagi jalur prestasi.',
                    ],
                    [
                        'q' => 'Apakah tersedia jalur beasiswa untuk siswa berprestasi?',
                        'a' => 'Ya, kami menyediakan Beasiswa Prestasi Akademik & Non-Akademik (Bebas Biaya SPP 1-3 tahun) bagi peraih medali olimpiade sains, olahraga, atau seni minimal tingkat kota/kabupaten.',
                    ],
                ],
            ],
            [
                'category' => 'Kurikulum & Pembelajaran',
                'items' => [
                    [
                        'q' => 'Kurikulum apa yang diterapkan di SMK Triwijaya?',
                        'a' => 'Sekolah menerapkan Kurikulum Merdeka yang diperkaya dengan program peminatan riset, penguatan bahasa asing (Inggris & Jepang/Mandarin), serta proyek kewirausahaan teknologi.',
                    ],
                    [
                        'q' => 'Bagaimana sistem pembelajaran virtual dan tugas sekolah berjalan?',
                        'a' => 'Seluruh siswa dan guru memiliki akun portal digital terpadu (SCHID) untuk mengakses modul, materi video, mengumpulkan tugas secara online, serta berdiskusi di forum akademik terarah.',
                    ],
                ],
            ],
            [
                'category' => 'Fasilitas & Layanan',
                'items' => [
                    [
                        'q' => 'Apakah semua ruang kelas dilengkapi fasilitas AC dan Multimedia?',
                        'a' => 'Ya, seluruh 30 ruang kelas kami dilengkapi pendingin udara (AC), Smart Interactive Display, proyektor beresolusi tinggi, dan jaringan Wi-Fi fiber optic berkecepatan tinggi.',
                    ],
                    [
                        'q' => 'Bagaimana orang tua dapat memantau kehadiran dan perkembangan belajar anak?',
                        'a' => 'Orang tua dapat masuk ke Portal Wali Murid untuk memantau rekap presensi kehadiran harian, grafik nilai ujian, dan agenda pertemuan wali murid secara real-time.',
                    ],
                ],
            ],
        ];

        return Inertia::render('Public/Faq', [
            'faqCategories' => $faqs,
        ]);
    }
}
