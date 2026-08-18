import React, { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import TeacherLayout from '@/Layouts/TeacherLayout';
import BentoCard from '@/Components/BentoCard';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Textarea from '@/Components/Textarea';
import Select from '@/Components/Select';
import Alert from '@/Components/Alert';
import Modal from '@/Components/Modal';
import {
    Award,
    FileText,
    Download,
    CheckCircle2,
    Clock,
    Search,
    MessageSquare,
    Save,
    ArrowLeft,
} from 'lucide-react';

export default function TeacherSubmissionsIndex({ submissions = [], assignments = [], filters = {} }) {
    const { flash } = usePage().props;
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);

    const gradeForm = useForm({
        score: '',
        feedback: '',
    });

    const handleFilterAssignment = (e) => {
        const val = e.target.value;
        router.get('/guru/pengumpulan', {
            assignment_id: val !== 'all' ? val : undefined,
            status: filters.status !== 'all' ? filters.status : undefined,
        }, { preserveState: true, replace: true });
    };

    const handleFilterStatus = (status) => {
        router.get('/guru/pengumpulan', {
            assignment_id: filters.assignment_id !== 'all' ? filters.assignment_id : undefined,
            status: status !== 'all' ? status : undefined,
        }, { preserveState: true, replace: true });
    };

    const openGradeModal = (sub) => {
        setSelectedSubmission(sub);
        gradeForm.setData({
            score: sub.score !== null ? sub.score : '',
            feedback: sub.feedback || '',
        });
        setIsGradeModalOpen(true);
    };

    const handleGradeSubmit = (e) => {
        e.preventDefault();
        if (!selectedSubmission) return;

        gradeForm.post(`/guru/pengumpulan/${selectedSubmission.id}/grade`, {
            onSuccess: () => {
                setIsGradeModalOpen(false);
                setSelectedSubmission(null);
            },
        });
    };

    return (
        <TeacherLayout title="Penilaian Tugas Siswa">
            <Head title="Penilaian Pengumpulan Tugas — Portal Guru" />

            <div className="space-y-8 max-w-7xl mx-auto">
                {flash?.success && (
                    <Alert variant="success" title="Berhasil!">
                        {flash.success}
                    </Alert>
                )}

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            Pengumpulan Jawaban & Penilaian Tugas
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Evaluasi berkas jawaban siswa, berikan nilai skor, serta catatan masukan dan feedback.
                        </p>
                    </div>
                </div>

                {/* Filters Bento Card */}
                <div className="bento-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Status Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                        {[
                            { id: 'all', label: 'Semua Pengumpulan' },
                            { id: 'submitted', label: 'Menunggu Nilai' },
                            { id: 'graded', label: 'Sudah Dinilai' },
                            { id: 'late', label: 'Terlambat' },
                        ].map((s) => (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => handleFilterStatus(s.id)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                    (filters.status || 'all') === s.id
                                        ? 'bg-emerald-600 text-white shadow-2xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>

                    {/* Filter by Assignment Select */}
                    <div className="max-w-xs w-full">
                        <select
                            value={filters.assignment_id || 'all'}
                            onChange={handleFilterAssignment}
                            className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-white py-2 px-3 focus:ring-emerald-500"
                        >
                            <option value="all">-- Semua Penugasan --</option>
                            {assignments.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.class_teacher?.class_room?.name} — {a.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Submissions Table */}
                <div className="bento-card p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                                    <th className="py-3.5 px-4">Nama Siswa</th>
                                    <th className="py-3.5 px-4">Tugas & Kelas</th>
                                    <th className="py-3.5 px-4">Waktu Kumpul</th>
                                    <th className="py-3.5 px-4">Status & Nilai</th>
                                    <th className="py-3.5 px-4">Berkas Jawaban</th>
                                    <th className="py-3.5 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {submissions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-400">
                                            Tidak ada data pengumpulan tugas yang sesuai filter.
                                        </td>
                                    </tr>
                                ) : (
                                    submissions.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-3 px-4 font-bold text-slate-900">
                                                {sub.student?.user?.name}
                                                <span className="block text-[11px] text-slate-400 font-normal">
                                                    NISN: {sub.student?.nisn || '-'}
                                                </span>
                                            </td>

                                            <td className="py-3 px-4 max-w-xs">
                                                <p className="font-bold text-slate-800 leading-snug">{sub.assignment?.title}</p>
                                                <p className="text-[11px] text-slate-500">
                                                    {sub.assignment?.class_teacher?.class_room?.name} • {sub.assignment?.class_teacher?.subject?.name}
                                                </p>
                                            </td>

                                            <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                                                {sub.formatted_submitted_at}
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <Badge variant={sub.status_badge || 'warning'} size="sm" dot>
                                                        {sub.status_label}
                                                    </Badge>
                                                    {sub.score !== null && (
                                                        <span className="block font-black text-sm text-emerald-700 font-mono">
                                                            Nilai: {sub.score} / {sub.assignment?.max_score || 100}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap">
                                                {sub.file_path ? (
                                                    <a
                                                        href={`/guru/pengumpulan/${sub.id}/download`}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-semibold text-xs transition-colors"
                                                    >
                                                        <Download className="w-3.5 h-3.5" />
                                                        <span>Unduh Berkas</span>
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-400 italic text-[11px]">Tanpa berkas</span>
                                                )}
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap text-right">
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    leftIcon={Award}
                                                    onClick={() => openGradeModal(sub)}
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold"
                                                >
                                                    {sub.status === 'graded' ? 'Edit Nilai' : 'Beri Nilai'}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL PENILAIAN & FEEDBACK */}
            <Modal
                isOpen={isGradeModalOpen}
                onClose={() => setIsGradeModalOpen(false)}
                title={`Penilaian Tugas: ${selectedSubmission?.student?.user?.name}`}
                description={`Tugas: ${selectedSubmission?.assignment?.title} (Maks Nilai: ${selectedSubmission?.assignment?.max_score || 100})`}
                size="md"
            >
                <form onSubmit={handleGradeSubmit} className="space-y-4">
                    {selectedSubmission?.notes && (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                            <span className="font-bold text-slate-700 block">Catatan Pengumpulan Siswa:</span>
                            <p className="text-slate-600 italic">"{selectedSubmission.notes}"</p>
                        </div>
                    )}

                    <Input
                        type="number"
                        step="0.01"
                        label={`Skor Nilai (0 - ${selectedSubmission?.assignment?.max_score || 100})`}
                        placeholder="Contoh: 95"
                        value={gradeForm.data.score}
                        onChange={(e) => gradeForm.setData('score', e.target.value)}
                        error={gradeForm.errors.score}
                        min={0}
                        max={selectedSubmission?.assignment?.max_score || 100}
                        required
                    />

                    <Textarea
                        label="Catatan Evaluasi / Feedback Guru"
                        placeholder="Berikan saran perbaikan, apresiasi, atau catatan bagi siswa..."
                        rows={4}
                        value={gradeForm.data.feedback}
                        onChange={(e) => gradeForm.setData('feedback', e.target.value)}
                        error={gradeForm.errors.feedback}
                    />

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                        <Button variant="secondary" size="md" type="button" onClick={() => setIsGradeModalOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            variant="primary"
                            size="md"
                            type="submit"
                            leftIcon={Save}
                            isLoading={gradeForm.processing}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            Simpan Nilai & Feedback
                        </Button>
                    </div>
                </form>
            </Modal>
        </TeacherLayout>
    );
}
