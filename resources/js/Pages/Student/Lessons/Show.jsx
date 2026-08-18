import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import BentoCard from '@/Components/BentoCard';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import {
    ArrowLeft,
    BookOpen,
    FileText,
    Download,
    Video,
    User,
    Calendar,
    Sparkles,
} from 'lucide-react';

export default function StudentLessonsShow({ lesson }) {
    const files = lesson.files || [];

    // Helper to extract YouTube embed URL if valid
    const getYoutubeEmbed = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
    };

    const embedUrl = getYoutubeEmbed(lesson.video_url);

    return (
        <StudentLayout title={`Materi: ${lesson.title}`}>
            <Head title={`${lesson.title} — Modul Siswa`} />

            <div className="space-y-8 max-w-4xl mx-auto">
                {/* Back Button */}
                <Link
                    href="/materi"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-sky-600 transition-colors px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs w-fit"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Daftar Materi</span>
                </Link>

                {/* Lesson Header Banner */}
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white space-y-4 shadow-xl">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="sky" size="md" className="bg-sky-500/20 text-sky-300 border-sky-500/30">
                            {lesson.class_teacher?.subject?.name}
                        </Badge>
                        <span className="text-xs text-slate-300">
                            {lesson.class_teacher?.class_room?.name}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-400">
                            Diterbitkan: {lesson.formatted_published_at}
                        </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                        {lesson.title}
                    </h1>

                    <p className="text-xs text-slate-300">
                        Disusun oleh: <strong>{lesson.class_teacher?.teacher?.user?.name || 'Guru Pengampu'}</strong>
                    </p>
                </div>

                {/* Video Player if provided */}
                {embedUrl && (
                    <div className="bento-card p-4 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                            <Video className="w-4 h-4 text-rose-500" />
                            <span>Video Pembelajaran Terlampir</span>
                        </div>
                        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner">
                            <iframe
                                src={embedUrl}
                                title={lesson.title}
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    </div>
                )}

                {/* Main Content Body */}
                <div className="bento-card p-6 sm:p-8 space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Uraian & Bahan Bacaan
                    </h3>
                    <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-4">
                        {lesson.content || 'Tidak ada uraian tertulis tambahan.'}
                    </div>
                </div>

                {/* Attached Files for Download */}
                {files.length > 0 && (
                    <div className="bento-card p-6 space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Berkas Lampiran & Unduhan ({files.length})
                        </h3>

                        <div className="space-y-3">
                            {files.map((f) => (
                                <div
                                    key={f.id}
                                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-900 truncate">
                                                {f.original_name}
                                            </p>
                                            <p className="text-[11px] text-slate-500">
                                                Ukuran: {f.formatted_file_size}
                                            </p>
                                        </div>
                                    </div>

                                    <a
                                        href={`/materi/files/${f.id}/download`}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sky-700 hover:bg-sky-50 font-bold text-xs shadow-2xs transition-colors shrink-0"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Unduh Modul</span>
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </StudentLayout>
    );
}
