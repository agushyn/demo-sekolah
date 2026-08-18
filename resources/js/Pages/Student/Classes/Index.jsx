import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import BentoCard from '@/Components/BentoCard';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import {
    Video,
    BookOpen,
    Users,
    ChevronRight,
    Award,
    Sparkles,
} from 'lucide-react';

export default function StudentClassesIndex({ classes = [] }) {
    return (
        <StudentLayout title="Kelas & Jadwal Saya">
            <Head title="Kelas Terdaftar — Portal Siswa" />

            <div className="space-y-8 max-w-7xl mx-auto">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Ruang Kelas & Rombongan Belajar
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Daftar kelas aktif tempat Anda terdaftar sebagai peserta didik resmi.
                    </p>
                </div>

                {classes.length === 0 ? (
                    <div className="bento-card p-12 text-center space-y-4">
                        <Video className="w-12 h-12 text-slate-300 mx-auto" />
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-slate-800">Belum Terdaftar di Kelas</h3>
                            <p className="text-xs text-slate-500 max-w-md mx-auto">
                                Anda belum dimasukkan ke dalam rombongan belajar oleh administrator sekolah. Silakan hubungi bagian kurikulum.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {classes.map((cls) => (
                            <div
                                key={cls.id}
                                className="bento-card p-6 flex flex-col justify-between space-y-6 hover:shadow-lg hover:border-sky-200 transition-all group"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="sky" size="md">
                                            Tingkat {cls.grade_level}
                                        </Badge>
                                        <span className="text-xs font-bold text-slate-400">
                                            {cls.students_count || 0} Siswa
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 group-hover:text-sky-600 transition-colors">
                                            {cls.name}
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Wali Kelas: {cls.homeroom_teacher?.user?.name || 'Bapak/Ibu Guru'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <div className="space-y-1">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                            Mata Pelajaran:
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {cls.class_teachers?.map((ct) => (
                                                <span
                                                    key={ct.id}
                                                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-semibold text-slate-700"
                                                >
                                                    {ct.subject?.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <Link
                                        href={`/kelas/${cls.id}`}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sky-50 text-sky-700 group-hover:bg-sky-600 group-hover:text-white font-bold text-xs transition-colors"
                                    >
                                        <span>Masuk Ruang Kelas</span>
                                        <ChevronRight className="w-4 h-4" />
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
