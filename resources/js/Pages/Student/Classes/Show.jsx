import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import BentoCard from '@/Components/BentoCard';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import {
    Video,
    BookOpen,
    FileText,
    Users,
    ArrowLeft,
    Clock,
    CheckCircle2,
    Calendar,
    ChevronRight,
} from 'lucide-react';

export default function StudentClassesShow({ classroom }) {
    const [activeTab, setActiveTab] = useState('lessons'); // lessons | assignments | teachers

    const classTeachers = classroom.class_teachers || [];

    const allLessons = classTeachers.flatMap((ct) =>
        (ct.lessons || []).map((l) => ({ ...l, subject: ct.subject, teacher: ct.teacher }))
    );

    const allAssignments = classTeachers.flatMap((ct) =>
        (ct.assignments || []).map((a) => ({ ...a, subject: ct.subject, teacher: ct.teacher }))
    );

    return (
        <StudentLayout title={`Kelas: ${classroom.name}`}>
            <Head title={`Ruang Kelas: ${classroom.name} — Portal Siswa`} />

            <div className="space-y-8 max-w-7xl mx-auto">
                {/* Back Button */}
                <Link
                    href="/kelas"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-sky-600 transition-colors px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs w-fit"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Daftar Kelas</span>
                </Link>

                {/* Hero Classroom Banner */}
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Badge variant="sky" size="md" className="bg-sky-500/20 text-sky-300 border-sky-500/30">
                                Tingkat {classroom.grade_level}
                            </Badge>
                            <span className="text-xs text-slate-300">
                                TA {classroom.academic_year?.name || '2026/2027'} ({classroom.academic_year?.semester || 'Ganjil'})
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-black tracking-tight">{classroom.name}</h1>
                        <p className="text-xs text-slate-400">
                            Wali Kelas: {classroom.homeroom_teacher?.user?.name || 'Bapak/Ibu Guru'}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {classTeachers.map((ct) => (
                            <span key={ct.id} className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-bold text-sky-200 border border-white/10">
                                {ct.subject?.name}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    {[
                        { id: 'lessons', label: `Materi Belajar (${allLessons.length})`, icon: BookOpen },
                        { id: 'assignments', label: `Tugas & Evaluasi (${allAssignments.length})`, icon: FileText },
                        { id: 'teachers', label: `Guru Pengampu (${classTeachers.length})`, icon: Users },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    isActive
                                        ? 'bg-sky-600 text-white shadow-xs'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* TAB 1: MATERI */}
                {activeTab === 'lessons' && (
                    <div className="space-y-4">
                        {allLessons.length === 0 ? (
                            <div className="bento-card p-10 text-center text-slate-400 text-xs">
                                Belum ada materi yang diterbitkan oleh bapak/ibu guru di kelas ini.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {allLessons.map((l) => (
                                    <div key={l.id} className="bento-card p-5 space-y-3 flex flex-col justify-between">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Badge variant="sky" size="sm">
                                                    {l.subject?.name}
                                                </Badge>
                                                <span className="text-[11px] text-slate-400">{l.formatted_published_at}</span>
                                            </div>

                                            <h4 className="text-sm font-bold text-slate-900">{l.title}</h4>
                                            <p className="text-xs text-slate-600 line-clamp-2">{l.content}</p>
                                        </div>

                                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                            <span className="text-[11px] text-slate-400">
                                                Oleh: {l.teacher?.user?.name || 'Guru'}
                                            </span>
                                            <Link
                                                href={`/materi/${l.id}`}
                                                className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-xs"
                                            >
                                                Buka Materi →
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: TUGAS */}
                {activeTab === 'assignments' && (
                    <div className="space-y-4">
                        {allAssignments.length === 0 ? (
                            <div className="bento-card p-10 text-center text-slate-400 text-xs">
                                Tidak ada tugas aktif di kelas ini.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {allAssignments.map((a) => {
                                    const sub = a.submissions && a.submissions[0];
                                    return (
                                        <div key={a.id} className="bento-card p-5 space-y-3 flex flex-col justify-between">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Badge variant="sky" size="sm">
                                                        {a.subject?.name}
                                                    </Badge>
                                                    {sub ? (
                                                        <Badge variant={sub.status_badge || 'success'} size="sm">
                                                            {sub.status_label}
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="warning" size="sm">
                                                            Belum Kumpul
                                                        </Badge>
                                                    )}
                                                </div>

                                                <h4 className="text-sm font-bold text-slate-900">{a.title}</h4>
                                                <p className="text-xs text-slate-600 line-clamp-2">{a.description}</p>
                                            </div>

                                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                                <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                                                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                                                    {a.formatted_deadline}
                                                </span>
                                                <Link
                                                    href={`/tugas/${a.id}`}
                                                    className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-xs"
                                                >
                                                    Buka Tugas →
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: GURU */}
                {activeTab === 'teachers' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {classTeachers.map((ct) => (
                            <div key={ct.id} className="bento-card p-5 space-y-2">
                                <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider block">
                                    {ct.subject?.name}
                                </span>
                                <h4 className="text-sm font-bold text-slate-900">{ct.teacher?.user?.name || 'Guru'}</h4>
                                <p className="text-xs text-slate-500">{ct.teacher?.title || 'Tenaga Pendidik'}</p>
                                <p className="text-[11px] text-slate-400">{ct.teacher?.user?.email}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </StudentLayout>
    );
}
