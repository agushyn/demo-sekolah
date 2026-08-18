import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import BentoCard from '@/Components/BentoCard';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import {
    BookOpen,
    FileText,
    Video,
    Clock,
    Download,
    ArrowRight,
} from 'lucide-react';

export default function StudentLessonsIndex({ lessons = [] }) {
    return (
        <StudentLayout title="Materi Pembelajaran">
            <Head title="Materi Pelajaran — Portal Siswa" />

            <div className="space-y-8 max-w-7xl mx-auto">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Modul & Materi Pembelajaran Digital
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Akses modul ajar, dokumen rangkuman, dan video penjelasan dari bapak/ibu guru.
                    </p>
                </div>

                {lessons.length === 0 ? (
                    <div className="bento-card p-12 text-center space-y-4">
                        <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-slate-800">Belum Ada Materi Diterbitkan</h3>
                            <p className="text-xs text-slate-500 max-w-md mx-auto">
                                Belum ada modul belajar baru yang diunggah untuk kelas Anda.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lessons.map((l) => (
                            <div
                                key={l.id}
                                className="bento-card p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-all group"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="sky" size="sm">
                                            {l.class_teacher?.subject?.name}
                                        </Badge>
                                        <span className="text-[11px] text-slate-400">
                                            {l.class_teacher?.class_room?.name}
                                        </span>
                                    </div>

                                    <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors leading-snug">
                                        {l.title}
                                    </h3>
                                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed whitespace-pre-line">
                                        {l.content}
                                    </p>
                                </div>

                                <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                                        <span>Oleh: {l.class_teacher?.teacher?.user?.name || 'Guru'}</span>
                                        <span>{l.formatted_published_at}</span>
                                    </div>

                                    <Link
                                        href={`/materi/${l.id}`}
                                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white font-bold text-xs transition-colors"
                                    >
                                        <span>Pelajari Materi</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </StudentLayout>
    );
}
