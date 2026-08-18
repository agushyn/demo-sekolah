import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import BentoCard from '@/Components/BentoCard';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import {
    Video,
    FileText,
    BookOpen,
    Calendar,
    Award,
    Sparkles,
    Clock,
    CheckCircle2,
    ArrowRight,
    Download,
} from 'lucide-react';

export default function StudentDashboard({
    student,
    summary = {},
    upcomingAssignments = [],
    recentLessons = [],
    recentGraded = [],
}) {
    const { auth, school } = usePage().props;

    return (
        <StudentLayout title="Dashboard Siswa">
            <Head title="Dashboard Siswa — Ruang Belajar Digital" />

            <div className="space-y-8 max-w-7xl mx-auto">
                {/* Welcome Hero Bento */}
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-sky-600 via-indigo-700 to-slate-900 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-2 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                <span>Ruang Belajar Digital Siswa</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                                Halo, {auth?.user?.name || 'Siswa'}!
                            </h2>
                            <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed">
                                {student?.grade_level ? `Kelas Tingkat ${student.grade_level}` : 'Peserta Didik Aktif'} • NISN: {student?.nisn || '0091234567'} • {school?.name || 'SMK Triwijaya'}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Badge variant="brand" size="lg" dot className="bg-white/20 text-white border border-white/30">
                                Siswa Aktif
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* 4 Bento Statistics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div className="bento-card p-5 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kelas Terdaftar</span>
                            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                                <Video className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-slate-900">{summary.enrolled_classes || 0}</p>
                        <p className="text-[11px] text-slate-500">Rombongan belajar</p>
                    </div>

                    <div className="bento-card p-5 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Tugas Berjalan</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                <FileText className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-amber-600">{summary.active_assignments || 0}</p>
                        <p className="text-[11px] text-slate-500">Perlu dikerjakan</p>
                    </div>

                    <div className="bento-card p-5 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Modul Materi</span>
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <BookOpen className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-indigo-700">{summary.available_modules || 0}</p>
                        <p className="text-[11px] text-slate-500">Siap dipelajari</p>
                    </div>

                    <div className="bento-card p-5 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Tugas Dinilai</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Award className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-emerald-600">{summary.graded_submissions || 0}</p>
                        <p className="text-[11px] text-slate-500">Hasil evaluasi guru</p>
                    </div>
                </div>

                {/* Two-Column Grid: Upcoming Assignments & Recent Graded / Lessons */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Upcoming Assignments (Span 7) */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <FileText className="w-4 h-4 text-sky-600" />
                                Tugas & Batas Waktu Terdekat
                            </h3>
                            <Link href="/tugas" className="text-xs font-bold text-sky-600 hover:text-sky-700">
                                Lihat Semua →
                            </Link>
                        </div>

                        {upcomingAssignments.length === 0 ? (
                            <div className="bento-card p-8 text-center text-slate-400 text-xs">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                                Tidak ada penugasan aktif saat ini. Semua tugas telah tuntas!
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {upcomingAssignments.map((a) => {
                                    const sub = a.submissions && a.submissions[0];
                                    return (
                                        <div
                                            key={a.id}
                                            className="bento-card p-4 sm:p-5 flex items-center justify-between gap-4 hover:border-sky-200 transition-all"
                                        >
                                            <div className="space-y-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="sky" size="sm">
                                                        {a.class_teacher?.subject?.name}
                                                    </Badge>
                                                    <span className="text-xs text-slate-400">
                                                        {a.class_teacher?.class_room?.name}
                                                    </span>
                                                </div>

                                                <h4 className="text-sm font-bold text-slate-900 truncate">
                                                    {a.title}
                                                </h4>

                                                <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                                                    Deadline: {a.formatted_deadline}
                                                </p>
                                            </div>

                                            <div className="flex flex-col items-end gap-2 shrink-0">
                                                {sub ? (
                                                    <Badge variant={sub.status_badge || 'success'} size="sm">
                                                        {sub.status_label}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="warning" size="sm">
                                                        Belum Kumpul
                                                    </Badge>
                                                )}

                                                <Link
                                                    href={`/tugas/${a.id}`}
                                                    className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-xs transition-colors"
                                                >
                                                    Buka Tugas
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Recent Graded Feedback & Modules (Span 5) */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Nilai & Feedback Terbaru */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <Award className="w-4 h-4 text-emerald-600" />
                                Nilai & Catatan Guru Terbaru
                            </h3>

                            {recentGraded.length === 0 ? (
                                <div className="bento-card p-6 text-center text-slate-400 text-xs">
                                    Belum ada evaluasi nilai yang diterbitkan.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentGraded.map((rg) => (
                                        <div
                                            key={rg.id}
                                            className="bento-card p-4 space-y-2 border-l-4 border-l-emerald-500"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-900 truncate">
                                                    {rg.assignment?.class_teacher?.subject?.name || 'Mata Pelajaran'}
                                                </span>
                                                <span className="font-mono font-black text-emerald-600 text-base">
                                                    {rg.score} Poin
                                                </span>
                                            </div>

                                            {rg.feedback && (
                                                <p className="text-xs text-slate-600 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 italic">
                                                    "{rg.feedback}"
                                                </p>
                                            )}

                                            <div className="text-[10px] text-slate-400 flex items-center justify-between">
                                                <span>Dinilai oleh: {rg.grader?.name || 'Guru Pengampu'}</span>
                                                <span>{rg.formatted_graded_at}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Modul Belajar Terbaru */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-indigo-600" />
                                    Materi Terbaru
                                </h3>
                                <Link href="/materi" className="text-xs font-bold text-indigo-600 hover:underline">
                                    Semua →
                                </Link>
                            </div>

                            <div className="space-y-2">
                                {recentLessons.map((l) => (
                                    <Link
                                        key={l.id}
                                        href={`/materi/${l.id}`}
                                        className="bento-card p-3 flex items-center justify-between hover:bg-slate-50 transition-colors block"
                                    >
                                        <div className="min-w-0 pr-2">
                                            <span className="text-xs font-bold text-slate-800 block truncate">
                                                {l.title}
                                            </span>
                                            <span className="text-[11px] text-slate-400 truncate block">
                                                {l.class_teacher?.subject?.name}
                                            </span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
