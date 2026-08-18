import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import BentoCard from '@/Components/BentoCard';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import Modal from '@/Components/Modal';
import Alert from '@/Components/Alert';
import HeroCarousel from '@/Components/HeroCarousel';
import {
    GraduationCap,
    Sparkles,
    ArrowRight,
    LogIn,
    Calendar,
    Newspaper,
    Award,
    BookOpen,
    Users,
    Video,
    Clock,
    MapPin,
    Phone,
    Mail,
    CheckCircle2,
    ChevronRight,
    ShieldCheck,
    Laptop,
    Compass,
    ExternalLink,
    HelpCircle,
    UserPlus,
} from 'lucide-react';

export default function Home({ heroSlides = [], featuredNews = [], upcomingEvents = [], featuredStaff = [] }) {
    const { school } = usePage().props;
    const [isPendaftaranModalOpen, setIsPendaftaranModalOpen] = useState(false);

    const schoolName = school?.name || 'SMK Triwijaya';

    return (
        <PublicLayout>
            <Head>
                <title>Beranda Resmi</title>
                <meta
                    name="description"
                    content="Portal Resmi SMK Triwijaya. Wadah digital terpadu untuk pembelajaran virtual, manajemen akademik, kalender sekolah, dan informasi pendaftaran peserta didik baru (PPDB)."
                />
            </Head>

            {/* 1. FULL PAGE HERO CAROUSEL */}
            <section aria-label="Hero Carousel Banner" className="w-full">
                <HeroCarousel slides={heroSlides} />
            </section>

            {/* MAIN CONTENT CONTAINER */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
                {/* 2. PROFIL, AKREDITASI & STATISTIK SEKOLAH */}
                <section aria-label="Profil dan Akreditasi Sekolah">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                        <div>
                            <Badge variant="brand" size="sm" className="mb-2">
                                Profil & Keunggulan
                            </Badge>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                Standar Pendidikan Unggul & Berkualitas
                            </h2>
                        </div>
                        <Link href="/profil" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                            Selengkapnya tentang Sekolah <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Akreditasi Card */}
                        <BentoCard
                            colSpan="col-span-1"
                            icon={ShieldCheck}
                            badge="Profil Resmi"
                            title="Akreditasi Unggul (A)"
                            description="Terakreditasi A BAN-S/M dengan predikat Sekolah Penggerak Nasional Berstandar Internasional."
                            iconColor="text-emerald-700 bg-emerald-50 border-emerald-200"
                        >
                            <div className="space-y-2.5 pt-2 text-xs text-slate-600">
                                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                                    <span className="text-slate-500">NPSN</span>
                                    <span className="font-semibold text-slate-800">20108976</span>
                                </div>
                                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                                    <span className="text-slate-500">Kurikulum</span>
                                    <span className="font-semibold text-slate-800">Kurikulum Merdeka</span>
                                </div>
                                <div className="flex items-center justify-between py-1.5">
                                    <span className="text-slate-500">Status</span>
                                    <Badge variant="success" size="sm" dot>
                                        Aktif Beroperasi
                                    </Badge>
                                </div>
                            </div>
                        </BentoCard>

                        {/* Nilai & Karakter Card */}
                        <BentoCard
                            colSpan="col-span-1"
                            icon={GraduationCap}
                            badge="Visi Utama"
                            title="Pendidikan Berkarakter"
                            description="Mengembangkan potensi intelektual, spiritual, dan emosional secara seimbang melalui pembiasaan positif."
                            iconColor="text-brand-700 bg-brand-50 border-brand-200"
                        >
                            <div className="space-y-2 pt-2 text-xs text-slate-600">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>Program Penguatan Profil Pelajar Pancasila</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>Bilingual & Digital Learning Environment</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>Mentorship Olimpiade & Karir Perguruan Tinggi</span>
                                </div>
                            </div>
                        </BentoCard>

                        {/* Statistik Sekolah Card */}
                        <BentoCard
                            colSpan="col-span-1"
                            icon={Users}
                            badge="Data Terpadu"
                            title="Statistik Kampus"
                            description="Komunitas belajar yang dinamis dengan fasilitas pembelajaran modern dan tenaga pendidik tersertifikasi."
                            iconColor="text-indigo-700 bg-indigo-50 border-indigo-200"
                        >
                            <div className="grid grid-cols-2 gap-3 pt-1 text-center">
                                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                    <p className="text-xl font-black text-brand-600">960+</p>
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase">Siswa Aktif</p>
                                </div>
                                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                    <p className="text-xl font-black text-indigo-600">64</p>
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase">Guru & Staf</p>
                                </div>
                                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                    <p className="text-xl font-black text-emerald-600">32</p>
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase">Rombel Kelas</p>
                                </div>
                                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                    <p className="text-xl font-black text-amber-600">100%</p>
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase">Kelulusan PTN</p>
                                </div>
                            </div>
                        </BentoCard>
                    </div>
                </section>

                {/* 2. PROGRAM & FITUR UTAMA BENTO */}
                <section aria-label="Program dan Fitur">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                        <div>
                            <Badge variant="brand" size="sm" className="mb-2">
                                Ekosistem Digital
                            </Badge>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                Fitur Terpadu Pembelajaran & Informasi
                            </h2>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 max-w-md">
                            Aplikasi dirancang modular berbasis Bento UI untuk efisiensi komunikasi seluruh sivitas akademika.
                        </p>
                    </div>

                    <div className="bento-grid">
                        <BentoCard
                            colSpan="col-span-12 md:col-span-6 lg:col-span-4"
                            icon={Video}
                            title="Ruang Kelas Virtual"
                            description="Akses materi pembelajaran interaktif, modul PDF, rekaman video, serta pengumpulan tugas secara online."
                            badge="LMS Terpadu"
                        >
                            <Link href="/login" className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-center justify-between hover:bg-slate-100 transition-colors">
                                <span>Tersedia untuk semua rombel & mapel</span>
                                <ChevronRight className="w-4 h-4 text-brand-600" />
                            </Link>
                        </BentoCard>

                        <BentoCard
                            colSpan="col-span-12 md:col-span-6 lg:col-span-4"
                            icon={Award}
                            title="Prestasi & Portofolio"
                            description="Pencatatan rekam jejak akademik, piagam penghargaan, dan ekstrakurikuler siswa yang transparan."
                            badge="Unggulan"
                            iconColor="text-amber-600 bg-amber-50 border-amber-200"
                        >
                            <Link href="/profil" className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-center justify-between hover:bg-slate-100 transition-colors">
                                <span>Klub Robotika, Sains, Olahraga & Seni</span>
                                <ChevronRight className="w-4 h-4 text-brand-600" />
                            </Link>
                        </BentoCard>

                        <BentoCard
                            colSpan="col-span-12 md:col-span-6 lg:col-span-4"
                            icon={Laptop}
                            title="Forum & Kolaborasi"
                            description="Diskusi terarah antarsiswa dan pendidik untuk memperdalam pemahaman materi di luar jam tatap muka."
                            badge="Kolaboratif"
                            iconColor="text-purple-600 bg-purple-50 border-purple-200"
                        >
                            <Link href="/faq" className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-center justify-between hover:bg-slate-100 transition-colors">
                                <span>Panduan tata tertib & etika diskusi</span>
                                <ChevronRight className="w-4 h-4 text-brand-600" />
                            </Link>
                        </BentoCard>
                    </div>
                </section>

                {/* 2.5 MEET OUR TEACHERS & STAFF SECTION */}
                {featuredStaff && featuredStaff.length > 0 && (
                    <section aria-label="Dewan Guru dan Pendidik">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                            <div>
                                <Badge variant="brand" size="sm" className="mb-2">
                                    Pendidik Berdedikasi
                                </Badge>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                    Dibimbing oleh Guru & Pendidik Terbaik
                                </h2>
                            </div>
                            <Link
                                href="/guru"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 group"
                            >
                                <span>Lihat Semua Guru & Staf ({featuredStaff.length}+)</span>
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {featuredStaff.map((member) => (
                                <Link
                                    key={member.id}
                                    href={`/guru/${member.slug}`}
                                    className="bento-card p-5 bg-white flex flex-col justify-between space-y-4 hover:-translate-y-1 hover:border-brand-300 transition-all group"
                                >
                                    <div className="space-y-3">
                                        <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-inner">
                                            <img
                                                src={member.photo_url}
                                                alt={member.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=1e40af&color=ffffff&size=256`;
                                                }}
                                            />
                                            <div className="absolute top-2.5 left-2.5">
                                                <Badge
                                                    variant={member.category === 'teacher' ? 'brand' : 'indigo'}
                                                    size="sm"
                                                    className="shadow-sm backdrop-blur-md"
                                                >
                                                    {member.category_label}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                                                {member.name}
                                            </h3>
                                            <p className="text-xs font-semibold text-brand-700 line-clamp-1 mt-0.5">
                                                {member.position}
                                            </p>
                                            {member.subject && (
                                                <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                                                    Mapel: {member.subject}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-600">
                                        <span>Lihat Profil</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* 3. BERITA & PENGUMUMAN TERBARU */}
                <section aria-label="Portal Berita">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                        <div>
                            <Badge variant="brand" size="sm" className="mb-2">
                                Warta Sekolah
                            </Badge>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                Berita & Informasi Terkini
                            </h2>
                        </div>
                        <Link href="/berita" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                            Lihat Semua Berita <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {featuredNews.map((news) => (
                            <Link
                                key={news.id}
                                href={`/berita/${news.slug}`}
                                className="bento-card group flex flex-col justify-between p-6 cursor-pointer hover:-translate-y-1 transition-all"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Badge variant={news.badge_color || 'brand'} size="sm">
                                            {news.category}
                                        </Badge>
                                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {news.read_time}
                                        </span>
                                    </div>

                                    <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors leading-snug line-clamp-2">
                                        {news.title}
                                    </h3>

                                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                                        {news.excerpt}
                                    </p>
                                </div>

                                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                                    <span className="text-slate-400">{news.date}</span>
                                    <span className="font-semibold text-brand-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                        Baca Selengkapnya <ChevronRight className="w-3.5 h-3.5" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* 4. KALENDER AKADEMIK & AGENDA */}
                <section aria-label="Kalender Akademik">
                    <div className="bento-grid">
                        <div className="col-span-12 lg:col-span-4 space-y-4">
                            <Badge variant="brand" size="sm">
                                Kalender Akademik
                            </Badge>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                Agenda & Jadwal Terdekat
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                Pantau jadwal kegiatan sekolah, pelaksanaan ujian, pembagian rapor, libur nasional, dan agenda penting lainnya.
                            </p>
                            <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-100 text-xs text-brand-900">
                                <p className="font-bold mb-1">Tahun Ajaran 2026/2027</p>
                                <p className="text-brand-700">Semester Ganjil berjalan aktif hingga Desember 2026.</p>
                            </div>
                            <Link href="/kalender" className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 hover:text-brand-700 pt-2">
                                <span>Buka Kalender Lengkap</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {upcomingEvents.map((evt) => (
                                <div
                                    key={evt.id}
                                    className="bento-card p-5 flex items-start gap-4 hover:border-brand-200 transition-all"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex flex-col items-center justify-center shrink-0 text-center">
                                        <span className="text-xs font-bold text-brand-600 leading-none">{evt.month}</span>
                                        <span className="text-lg font-black text-brand-900 leading-none mt-1">{evt.day}</span>
                                    </div>

                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={evt.badge_color || 'brand'} size="sm">
                                                {evt.category_label || evt.category}
                                            </Badge>
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                                            {evt.title}
                                        </h4>
                                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                                            <Clock className="w-3 h-3 text-slate-400" /> {evt.time}
                                        </p>
                                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                            <MapPin className="w-3 h-3 text-slate-400" /> {evt.location}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 5. CTA PENDAFTARAN (PPDB) BANNER */}
                <section id="pendaftaran" aria-label="Pendaftaran Siswa Baru">
                    <div className="rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 p-8 sm:p-12 text-white shadow-xl relative overflow-hidden border border-brand-700/60">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />

                        <div className="relative z-10 max-w-3xl space-y-5">
                            <Badge variant="brand" size="sm" className="bg-brand-500/30 text-brand-200 border-brand-400/40">
                                Penerimaan Peserta Didik Baru (PPDB)
                            </Badge>

                            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                                Bergabunglah Bersama Generasi Unggul SMK Triwijaya
                            </h2>

                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                                Dapatkan pengalaman belajar terbaik dengan kurikulum unggulan, fasilitas laboratorium modern, serta tenaga pendidik profesional dan bersertifikasi.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 text-xs">
                                    <p className="font-bold text-white">1. Registrasi Akun</p>
                                    <p className="text-slate-300 text-[11px] mt-0.5">Isi biodata & data orang tua</p>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 text-xs">
                                    <p className="font-bold text-white">2. Unggah Berkas</p>
                                    <p className="text-slate-300 text-[11px] mt-0.5">KK, Akta & Rapor SMP</p>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 text-xs">
                                    <p className="font-bold text-white">3. Verifikasi & Tes</p>
                                    <p className="text-slate-300 text-[11px] mt-0.5">Pengumuman kelulusan online</p>
                                </div>
                            </div>

                            <div className="pt-4 flex flex-wrap items-center gap-4">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    onClick={() => setIsPendaftaranModalOpen(true)}
                                    className="bg-brand-500 hover:bg-brand-400 text-white font-bold shadow-lg"
                                >
                                    Buka Informasi Pendaftaran
                                </Button>
                                <Link href="/kontak" className="text-xs font-semibold text-slate-300 hover:text-white underline underline-offset-4">
                                    Hubungi Panitia PPDB
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 6. KONTAK & LOKASI */}
                <section aria-label="Kontak Sekolah">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                        <div>
                            <Badge variant="brand" size="sm" className="mb-2">
                                Layanan Informasi
                            </Badge>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                Hubungi & Kunjungi Sekolah
                            </h2>
                        </div>
                        <Link href="/kontak" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                            Halaman Kontak Lengkap <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="bento-grid">
                        <BentoCard
                            colSpan="col-span-12 md:col-span-6 lg:col-span-4"
                            icon={MapPin}
                            title="Lokasi Kampus"
                            description="Jl. Pendidikan No. 45, Kebayoran Baru, Jakarta Selatan, DKI Jakarta 12180"
                        >
                            <div className="mt-3 p-4 rounded-xl bg-slate-100 text-xs text-slate-600 space-y-1">
                                <p className="font-semibold text-slate-800">Petunjuk Akses:</p>
                                <p>5 menit dari Stasiun MRT Blok M, mudah dijangkau TransJakarta rute koridor 1 & 13.</p>
                            </div>
                        </BentoCard>

                        <BentoCard
                            colSpan="col-span-12 md:col-span-6 lg:col-span-4"
                            icon={Phone}
                            title="Telepon & WhatsApp"
                            description="Layanan informasi administrasi dan konsultasi pendaftaran pada hari kerja."
                            iconColor="text-emerald-700 bg-emerald-50 border-emerald-200"
                        >
                            <div className="mt-3 space-y-2 text-xs">
                                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                    <span className="text-slate-500">Hotline TU</span>
                                    <span className="font-bold text-slate-800">+62 21 8765 4321</span>
                                </div>
                                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                                    <span className="text-emerald-800">WhatsApp PPDB</span>
                                    <span className="font-bold text-emerald-900">+62 812 3456 7890</span>
                                </div>
                            </div>
                        </BentoCard>

                        <BentoCard
                            colSpan="col-span-12 md:col-span-6 lg:col-span-4"
                            icon={Clock}
                            title="Jam Operasional"
                            description="Waktu pelayanan administrasi sekolah dan kunjungan tatap muka."
                            iconColor="text-amber-600 bg-amber-50 border-amber-200"
                        >
                            <div className="mt-3 space-y-2 text-xs">
                                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                                    <span className="text-slate-500">Senin - Kamis</span>
                                    <span className="font-semibold text-slate-800">07:00 - 15:30 WIB</span>
                                </div>
                                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                                    <span className="text-slate-500">Jumat</span>
                                    <span className="font-semibold text-slate-800">07:00 - 15:00 WIB</span>
                                </div>
                                <div className="flex items-center justify-between py-1.5">
                                    <span className="text-slate-500">Sabtu - Minggu</span>
                                    <Badge variant="neutral" size="sm">Libur</Badge>
                                </div>
                            </div>
                        </BentoCard>
                    </div>
                </section>
            </div>

            {/* MODAL: Pendaftaran PPDB Info */}
            <Modal
                isOpen={isPendaftaranModalOpen}
                onClose={() => setIsPendaftaranModalOpen(false)}
                title="Pendaftaran Siswa Baru (PPDB 2026/2027)"
                description="Informasi alur pendaftaran dan persyaratan administrasi calon siswa."
                size="lg"
                footer={
                    <>
                        <Button variant="secondary" size="md" onClick={() => setIsPendaftaranModalOpen(false)}>
                            Tutup
                        </Button>
                        <Link href="/register" onClick={() => setIsPendaftaranModalOpen(false)}>
                            <Button variant="primary" size="md" leftIcon={UserPlus}>
                                Buat Akun Pendaftar
                            </Button>
                        </Link>
                    </>
                }
            >
                <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                    <Alert variant="info" title="Pendaftaran Online Dibuka">
                        Gelombang 1 dibuka mulai 1 Agustus s/d 30 September 2026. Kuota penerimaan terbatas untuk jalur prestasi dan reguler.
                    </Alert>

                    <div className="space-y-2">
                        <h4 className="font-bold text-slate-900">Dokumen yang Perlu Disiapkan:</h4>
                        <ul className="list-disc list-inside space-y-1 text-slate-600 pl-2">
                            <li>Nomor Induk Siswa Nasional (NISN) & NIK Calon Siswa</li>
                            <li>Scan Kartu Keluarga (KK) & Akta Kelahiran asli</li>
                            <li>Scan Rapor SMP/MTs Semester 1-5</li>
                            <li>Pas foto formal terbaru (background merah/biru)</li>
                            <li>Sertifikat piagam kejuaraan (khusus jalur prestasi)</li>
                        </ul>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                        <p className="text-xs text-slate-500">
                            Calon peserta didik dapat membuat akun melalui tautan pendaftaran atau menghubungi sekretariat PPDB sekolah.
                        </p>
                    </div>
                </div>
            </Modal>
        </PublicLayout>
    );
}
