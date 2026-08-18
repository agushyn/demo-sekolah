import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import BentoCard from '@/Components/BentoCard';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import {
    FileText,
    Clock,
    CheckCircle2,
    Award,
    AlertCircle,
    ArrowRight,
} from 'lucide-react';

export default function StudentAssignmentsIndex({ assignments = [] }) {
    const [filter, setFilter] = useState('all'); // all | pending | submitted | graded

    const filteredAssignments = assignments.filter((a) => {
        const sub = a.submissions && a.submissions[0];
        if (filter === 'pending') return !sub;
        if (filter === 'submitted') return sub && (sub.status === 'submitted' || sub.status === 'late');
        if (filter === 'graded') return sub && sub.status === 'graded';
        return true;
    });

    return (
        <StudentLayout title="Tugas & Penilaian">
            <Head title="Tugas Pembelajaran — Portal Siswa" />

            <div className="space-y-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            Daftar Penugasan & Evaluasi Siswa
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Pantau tenggat waktu tugas, unggah berkas jawaban, dan periksa nilai evaluasi guru.
                        </p>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                        {[
                            { id: 'all', label: 'Semua Tugas' },
                            { id: 'pending', label: 'Belum Kumpul' },
                            { id: 'submitted', label: 'Menunggu Nilai' },
                            { id: 'graded', label: 'Sudah Dinilai' },
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                type="button"
                                onClick={() => setFilter(btn.id)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                    filter === btn.id
                                        ? 'bg-sky-600 text-white shadow-2xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Assignments List */}
                {filteredAssignments.length === 0 ? (
                    <div className="bento-card p-12 text-center space-y-4">
                        <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-slate-800">Tidak Ada Tugas Ditemukan</h3>
                            <p className="text-xs text-slate-500 max-w-md mx-auto">
                                Tidak ada penugasan yang sesuai dengan kategori filter yang Anda pilih.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAssignments.map((a) => {
                            const sub = a.submissions && a.submissions[0];
                            return (
                                <div
                                    key={a.id}
                                    className="bento-card p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-all group"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Badge variant="sky" size="sm">
                                                {a.class_teacher?.subject?.name}
                                            </Badge>
                                            {sub ? (
                                                <Badge variant={sub.status_badge || 'success'} size="sm" dot>
                                                    {sub.status_label}
                                                </Badge>
                                            ) : (
                                                <Badge variant={a.is_past_deadline ? 'danger' : 'warning'} size="sm" dot>
                                                    {a.is_past_deadline ? 'Terlewat' : 'Belum Kumpul'}
                                                </Badge>
                                            )}
                                        </div>

                                        <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors leading-snug">
                                            {a.title}
                                        </h3>
                                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                                            {a.description}
                                        </p>
                                    </div>

                                    <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                                        <div className="flex items-center justify-between text-slate-500">
                                            <span className="flex items-center gap-1 text-[11px]">
                                                <Clock className="w-3.5 h-3.5 text-amber-500" />
                                                Deadline:
                                            </span>
                                            <strong className="text-slate-800 text-[11px]">{a.formatted_deadline}</strong>
                                        </div>

                                        {sub && sub.score !== null && (
                                            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                                                <span className="font-bold text-emerald-800 text-xs">Nilai Diperoleh:</span>
                                                <strong className="font-black text-emerald-700 text-sm font-mono">
                                                    {sub.score} / {a.max_score}
                                                </strong>
                                            </div>
                                        )}

                                        <Link
                                            href={`/tugas/${a.id}`}
                                            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white font-bold text-xs transition-colors"
                                        >
                                            <span>{sub ? 'Lihat Rincian & Nilai' : 'Kerjakan Tugas'}</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </StudentLayout>
    );
}
