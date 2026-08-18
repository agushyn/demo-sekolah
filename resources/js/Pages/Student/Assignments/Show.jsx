import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import BentoCard from '@/Components/BentoCard';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import Textarea from '@/Components/Textarea';
import Alert from '@/Components/Alert';
import {
    ArrowLeft,
    FileText,
    Clock,
    Upload,
    CheckCircle2,
    Award,
    AlertCircle,
    Download,
    Lock,
    Send,
} from 'lucide-react';

export default function StudentAssignmentsShow({ assignment, submission }) {
    const { flash } = usePage().props;

    const form = useForm({
        file: null,
        notes: submission?.notes || '',
    });

    const isPastDeadline = assignment.is_past_deadline;
    const canSubmit = !isPastDeadline || assignment.allow_late_submission;

    const handleSubmit = (e) => {
        e.preventDefault();
        form.post(`/tugas/${assignment.id}/submit`, {
            preserveScroll: true,
        });
    };

    return (
        <StudentLayout title={`Tugas: ${assignment.title}`}>
            <Head title={`${assignment.title} — Tugas Siswa`} />

            <div className="space-y-8 max-w-4xl mx-auto">
                {flash?.success && (
                    <Alert variant="success" title="Berhasil!">
                        {flash.success}
                    </Alert>
                )}

                {/* Back Button */}
                <Link
                    href="/tugas"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-sky-600 transition-colors px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs w-fit"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Daftar Tugas</span>
                </Link>

                {/* Assignment Header */}
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white space-y-4 shadow-xl">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Badge variant="sky" size="md" className="bg-sky-500/20 text-sky-300 border-sky-500/30">
                                {assignment.class_teacher?.subject?.name}
                            </Badge>
                            <span className="text-xs text-slate-300">
                                {assignment.class_teacher?.class_room?.name}
                            </span>
                        </div>

                        {submission ? (
                            <Badge variant={submission.status_badge || 'success'} size="md" dot>
                                {submission.status_label}
                            </Badge>
                        ) : (
                            <Badge variant={isPastDeadline ? 'danger' : 'warning'} size="md" dot>
                                {isPastDeadline ? 'Batas Waktu Terlewat' : 'Belum Dikumpulkan'}
                            </Badge>
                        )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                        {assignment.title}
                    </h1>

                    <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-300 border-t border-white/10">
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            Tenggat Waktu: <strong className="text-white">{assignment.formatted_deadline}</strong>
                        </span>
                        <span>•</span>
                        <span>Nilai Maksimal: <strong className="text-white">{assignment.max_score} Poin</strong></span>
                        <span>•</span>
                        <span>
                            Guru: <strong>{assignment.class_teacher?.teacher?.user?.name || 'Pendidik'}</strong>
                        </span>
                    </div>
                </div>

                {/* Instructions Body */}
                <div className="bento-card p-6 sm:p-8 space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Petunjuk & Instruksi Pengerjaan
                    </h3>
                    <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-4">
                        {assignment.description}
                    </div>
                </div>

                {/* GRADED SCORE & FEEDBACK CARD (If already graded) */}
                {submission && submission.status === 'graded' && (
                    <div className="bento-card p-6 sm:p-8 space-y-4 bg-emerald-50/50 border-emerald-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                                <Award className="w-5 h-5 text-emerald-600" />
                                Hasil Penilaian & Feedback Guru
                            </h3>
                            <span className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-mono font-black text-lg shadow-sm">
                                {submission.score} / {assignment.max_score}
                            </span>
                        </div>

                        {submission.feedback ? (
                            <div className="p-4 rounded-2xl bg-white border border-emerald-100 space-y-1">
                                <span className="text-[11px] font-bold text-slate-400 uppercase block">
                                    Catatan Evaluasi Guru:
                                </span>
                                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-semibold italic">
                                    "{submission.feedback}"
                                </p>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500 italic">Tidak ada catatan feedback tambahan.</p>
                        )}

                        <p className="text-[11px] text-slate-400">
                            Dinilai oleh: {submission.grader?.name || 'Guru Pengampu'} pada {submission.formatted_graded_at}
                        </p>
                    </div>
                )}

                {/* SUBMISSION PANEL */}
                <div className="bento-card p-6 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <Upload className="w-4 h-4 text-sky-600" />
                            Status & Lembar Pengumpulan Jawaban
                        </h3>
                        {submission && (
                            <span className="text-[11px] text-slate-400">
                                Dikumpulkan: {submission.formatted_submitted_at}
                            </span>
                        )}
                    </div>

                    {/* If Already Submitted: Show File & Option to Re-submit if allowed */}
                    {submission && submission.file_path && (
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4">
                            <div className="space-y-0.5 min-w-0">
                                <span className="text-xs font-bold text-slate-900 block">
                                    Berkas Jawaban Terunggah
                                </span>
                                <p className="text-[11px] text-slate-500 truncate">
                                    Tersimpan aman di Private Storage
                                </p>
                            </div>

                            <a
                                href={`/tugas/submissions/${submission.id}/download`}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sky-700 hover:bg-sky-50 font-bold text-xs shadow-2xs transition-colors shrink-0"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span>Unduh Berkas Saya</span>
                            </a>
                        </div>
                    )}

                    {/* Deadline Exceeded Warning without Late Submission */}
                    {!canSubmit && !submission && (
                        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1 text-xs">
                            <div className="flex items-center gap-2 font-bold text-rose-900">
                                <Lock className="w-4 h-4 text-rose-600" />
                                <span>Pengumpulan Ditutup</span>
                            </div>
                            <p>
                                Batas waktu pengumpulan tugas ini telah berakhir ({assignment.formatted_deadline}) dan pengumpulan terlambat dinonaktifkan oleh guru pengampu.
                            </p>
                        </div>
                    )}

                    {/* Upload / Re-upload Form */}
                    {canSubmit && (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {isPastDeadline && (
                                <Alert variant="warning" title="Peringatan Keterlambatan">
                                    <p className="text-xs">
                                        Waktu deadline tugas telah terlewat. Tugas yang Anda kirim sekarang akan ditandai dengan status <strong>"Terlambat"</strong>.
                                    </p>
                                </Alert>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-800 mb-1">
                                    Pilih Berkas Jawaban (PDF / Dokumen / ZIP Maks 15MB) *
                                </label>
                                <input
                                    type="file"
                                    onChange={(e) => form.setData('file', e.target.files[0])}
                                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                                    required={!submission}
                                />
                                {form.errors.file && (
                                    <p className="text-xs text-rose-600 font-semibold mt-1">{form.errors.file}</p>
                                )}
                            </div>

                            <Textarea
                                label="Catatan Tambahan untuk Guru (Opsional)"
                                placeholder="Tuliskan catatan pengerjaan, kendala yang dihadapi, atau pesan pengantar..."
                                rows={3}
                                value={form.data.notes}
                                onChange={(e) => form.setData('notes', e.target.value)}
                                error={form.errors.notes}
                            />

                            <div className="pt-2 flex items-center justify-end">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    leftIcon={Send}
                                    isLoading={form.processing}
                                    className="bg-sky-600 hover:bg-sky-700 font-bold text-xs shadow-md shadow-sky-600/20"
                                >
                                    {submission ? 'Perbarui Pengumpulan Tugas' : 'Kirim Jawaban Tugas Sekarang'}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </StudentLayout>
    );
}
