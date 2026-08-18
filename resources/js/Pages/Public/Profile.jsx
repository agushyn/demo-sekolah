import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import BentoCard from '@/Components/BentoCard';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import {
    Award,
    History,
    Eye,
    Target,
    Sparkles,
    ShieldCheck,
    CheckCircle2,
    Building2,
    Compass,
    Users,
    ArrowRight,
    GraduationCap,
    Lightbulb,
    HeartHandshake,
} from 'lucide-react';

export default function Profile({ history, vision, mission = [], coreValues = [], facilities = [] }) {
    const { school } = usePage().props;
    const schoolName = school?.name || 'SMK Triwijaya';

    return (
        <PublicLayout>
            <Head>
                <title>Profil & Sejarah Sekolah</title>
                <meta
                    name="description"
                    content={`Pelajari profil, sejarah, visi misi, fasilitas unggulan, dan nilai-nilai luhur ${schoolName}.`}
                />
            </Head>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
                {/* Header Bento Banner */}
                <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-brand-700 via-brand-800 to-slate-900 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 space-y-4 max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>Mengenal Lebih Dekat</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                            Profil & Nilai Keunggulan {schoolName}
                        </h1>
                        <p className="text-xs sm:text-sm text-brand-100 leading-relaxed">
                            Mewujudkan lingkungan pendidikan inspiratif yang memadukan keunggulan akademik, riset teknologi, serta penguatan karakter berbudi pekerti luhur.
                        </p>
                    </div>
                </div>

                {/* 1. SEJARAH SEKOLAH BENTO */}
                <section aria-label="Sejarah Sekolah">
                    <div className="bento-grid">
                        <div className="col-span-12 lg:col-span-8 bento-card p-8 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                                    <History className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Sejarah & Perjalanan Sekolah</h2>
                                    <p className="text-xs text-slate-500">Berdiri sejak tahun {history?.founded || 1998}</p>
                                </div>
                            </div>

                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                {history?.description || 'Didirikan pada tahun 1998, SMK Triwijaya telah berkontribusi lebih dari 28 tahun dalam mencetak generasi muda berkualitas tinggi.'}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                    <span className="text-slate-400 font-bold text-[10px] uppercase">Akreditasi</span>
                                    <p className="text-base font-extrabold text-brand-700">{history?.accreditation || 'A (Unggul)'}</p>
                                    <p className="text-[11px] text-slate-500">BAN-S/M Nasional</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                    <span className="text-slate-400 font-bold text-[10px] uppercase">Nomor Pokok (NPSN)</span>
                                    <p className="text-base font-extrabold text-slate-900">{history?.npsn || '20108976'}</p>
                                    <p className="text-[11px] text-slate-500">Kemendikbudristek</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                    <span className="text-slate-400 font-bold text-[10px] uppercase">Alumni Sukses</span>
                                    <p className="text-base font-extrabold text-emerald-600">8.500+</p>
                                    <p className="text-[11px] text-slate-500">Tersebar Global</p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Side Bento: Identitas Resmi */}
                        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
                            <BentoCard
                                colSpan="col-span-12"
                                icon={ShieldCheck}
                                badge="Status Resmi"
                                title="Sekolah Penggerak"
                                description="Terpilih sebagai salah satu sekolah rujukan implementasi Kurikulum Merdeka dan integrasi teknologi digital."
                                iconColor="text-emerald-700 bg-emerald-50 border-emerald-200"
                            />
                            <BentoCard
                                colSpan="col-span-12"
                                icon={Users}
                                badge="Tenaga Pendidik"
                                title="Pendidik Bersertifikasi"
                                description="85+ Guru & Staf dengan kualifikasi S2/S3 dan sertifikasi pendidik profesional nasional."
                            />
                        </div>
                    </div>
                </section>

                {/* 2. VISI & MISI BENTO */}
                <section aria-label="Visi dan Misi">
                    <div className="bento-grid">
                        {/* Visi */}
                        <div className="col-span-12 lg:col-span-5 bento-card p-8 bg-gradient-to-br from-white to-brand-50/50 border-brand-200/80 flex flex-col justify-between space-y-6">
                            <div className="space-y-4">
                                <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-sm">
                                    <Eye className="w-6 h-6" />
                                </div>
                                <Badge variant="brand" size="sm">
                                    Visi Sekolah
                                </Badge>
                                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                                    Pusat Pendidikan Bertaraf Internasional
                                </h3>
                                <blockquote className="text-xs sm:text-sm text-slate-700 leading-relaxed italic border-l-2 border-brand-500 pl-4">
                                    "{vision || 'Menjadi pusat pendidikan unggulan bertaraf internasional yang berakar pada nilai-nilai luhur Pancasila, menguasai ilmu pengetahuan dan teknologi mutakhir, serta peduli terhadap kelestarian lingkungan.'}"
                                </blockquote>
                            </div>
                        </div>

                        {/* Misi */}
                        <div className="col-span-12 lg:col-span-7 bento-card p-8 space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <Target className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Misi Sekolah</h3>
                                    <p className="text-xs text-slate-500">5 Pilar Utama Pembangunan Akademik & Karakter</p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                {mission.map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
                                        <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                            {idx + 1}
                                        </div>
                                        <p className="text-xs text-slate-700 leading-relaxed">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. NILAI-NILAI SEKOLAH (CORE VALUES) */}
                <section aria-label="Nilai Sekolah">
                    <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
                        <Badge variant="brand" size="sm">
                            Karakter & Budaya
                        </Badge>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Nilai-Nilai Utama (Core Values)
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500">
                            Prinsip yang memandu perilaku seluruh siswa, pendidik, dan tenaga kependidikan
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {coreValues.map((val, idx) => (
                            <div key={idx} className="bento-card p-6 space-y-3 text-center">
                                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center">
                                    <Lightbulb className="w-6 h-6" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900">{val.title}</h3>
                                <p className="text-xs text-slate-600 leading-relaxed">{val.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 4. FASILITAS SEKOLAH BENTO GRID */}
                <section aria-label="Fasilitas Sekolah">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                        <div>
                            <Badge variant="brand" size="sm" className="mb-2">
                                Sarana & Prasarana
                            </Badge>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                Fasilitas Pembelajaran Modern
                            </h2>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 max-w-md">
                            Mendukung eksplorasi akademik, kenyamanan belajar, dan aktivitas ekstrakurikuler siswa secara menyeluruh.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {facilities.map((fac, idx) => (
                            <div key={idx} className="bento-card p-6 space-y-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900">{fac.name}</h3>
                                <p className="text-xs text-slate-600 leading-relaxed">{fac.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Bottom CTA */}
                <div className="p-8 rounded-3xl bg-slate-100 border border-slate-200 text-center space-y-4 max-w-3xl mx-auto">
                    <h3 className="text-xl font-bold text-slate-900">Ingin Mengetahui Lebih Lanjut?</h3>
                    <p className="text-xs sm:text-sm text-slate-600">
                        Kunjungi sekolah kami atau konsultasikan kebutuhan pendidikan putra-putri Anda bersama tim konseling sekolah.
                    </p>
                    <div className="flex justify-center gap-3 pt-2">
                        <Link href="/kontak">
                            <Button variant="primary" size="md" rightIcon={ArrowRight}>
                                Hubungi Kami
                            </Button>
                        </Link>
                        <Link href="/guru">
                            <Button variant="secondary" size="md">
                                Lihat Profil Guru
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
