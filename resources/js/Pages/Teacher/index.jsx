import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import TeacherLayout from '@/Layouts/TeacherLayout';
import BentoCard from '@/Components/BentoCard';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import {
    BookOpen,
    UploadCloud,
    ClipboardCheck,
    Users,
    Sparkles,
    Calendar,
    ArrowRight,
    Clock,
    CheckCircle2,
    Award,
    FileText,
} from 'lucide-react';

export default function TeacherDashboard({ teacher, summary = {}, courses = [], recentSubmissions = [] }) {
    const { auth, school } = usePage().props;

    return (
        <TeacherLayout title="Dashboard Guru">
            <Head title="Dashboard Guru — Portal Pendidik" />

            <div className="space-y-8 max-w-7xl mx-auto">
                {/* Welcome Hero Bento */}
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-2 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                <span>Ruang Kelas Virtual & LMS</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                                Selamat Datang, {auth?.user?.name || 'Bapak/Ibu Guru'}!
                            </h2>
                            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                                {teacher?.title || 'Tenaga Pendidik'} • NIP: {teacher?.nip || '198501012010011001'} • {school?.name || 'SMK Triwijaya'}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Badge variant="emerald" size="lg" dot className="bg-white/20 text-white border border-white/30">
                                Pendidik Aktif
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* 4 Bento Statistics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div className="bento-card p-5 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kelas Diampu</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <BookOpen className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-slate-900">{summary.total_classes || 0}</p>
                        <p className="text-[11px] text-slate-500">Rombongan belajar</p>
                    </div>

                    <div className="bento-card p-5 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Tugas Aktif</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                <FileText className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-amber-600">{summary.active_assignments || 0}</p>
                        <p className="text-[11px] text-slate-500">Sedang berlangsung</p>
                    </div>

                    <div className="bento-card p-5 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Perlu Dinilai</span>
                            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                                <ClipboardCheck className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-rose-600">{summary.pending_grading || 0}</p>
                        <p className="text-[11px] text-slate-500">Menunggu feedback</p>
                    </div>

                    <div className="bento-card p-5 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wider">Modul Materi</span>
                            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                                <UploadCloud className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-teal-700">{summary.uploaded_lessons || 0}</p>
                        <p className="text-[11px] text-slate-500">Telah diterbitkan</p>
                    </div>
                </div>

                {/* Two-Column Grid: Active Courses & Pending Grading Queue */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Active Courses List (Span 7) */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-emerald-600" />
                                Rombel & Mata Pelajaran Saya
                            </h3>
                            <Link href="/guru/kelas" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
                                Kelola Semua →
                            </Link>
                        </div>

                        {courses.length === 0 ? (
                            <div className="bento-card p-8 text-center text-slate-400 text-xs">
                                Anda belum memiliki kelas atau mata pelajaran yang diampu.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {courses.map((c) => (
                                    <div
                                        key={c.id}
                                        className="bento-card p-4 sm:p-5 flex items-center justify-between gap-4 hover:border-emerald-200 transition-all"
                                    >
                                        <div className="space-y-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="emerald" size="sm">
                                                    {c.class_room?.name}
                                                </Badge>
                                                <span className="text-xs font-bold text-slate-900 truncate">
                                                    {c.subject?.name}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-500">
                                                Kode: {c.subject?.code} • Ruang Kelas Aktif
                                            </p>
                                        </div>

                                        <Link
                                            href={`/guru/kelas/${c.class_id}`}
                                            className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs shrink-0 transition-colors"
                                        >
                                            Buka Kelas
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pending Grading Queue (Span 5) */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <ClipboardCheck className="w-4 h-4 text-rose-600" />
                                Antrean Pengumpulan Tugas
                            </h3>
                            <Link href="/guru/pengumpulan" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
                                Semua ({summary.pending_grading || 0}) →
                            </Link>
                        </div>

                        {recentSubmissions.length === 0 ? (
                            <div className="bento-card p-8 text-center text-slate-400 text-xs">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                                Tidak ada tugas siswa yang menunggu penilaian saat ini.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentSubmissions.map((sub) => (
                                    <div
                                        key={sub.id}
                                        className="bento-card p-4 space-y-2 border-l-4 border-l-amber-500"
                                    >
                                        <div className="flex items-center justify-between text-xs">
                                            <strong className="text-slate-900">{sub.student?.user?.name}</strong>
                                            <Badge variant={sub.status_badge || 'warning'} size="sm">
                                                {sub.status_label}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-slate-600 truncate font-semibold">
                                            {sub.assignment?.title}
                                        </p>
                                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-400">
                                            <span>{sub.formatted_submitted_at}</span>
                                            <Link
                                                href="/guru/pengumpulan"
                                                className="font-bold text-emerald-600 hover:underline"
                                            >
                                                Beri Nilai & Feedback
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
}
