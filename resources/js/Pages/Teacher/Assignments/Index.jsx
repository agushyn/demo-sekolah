import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
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
    FileText,
    Clock,
    CheckCircle2,
    Plus,
    Trash2,
    Award,
    Users,
} from 'lucide-react';

export default function TeacherAssignmentsIndex({ assignments = [], courses = [] }) {
    const { flash } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);

    const form = useForm({
        class_teacher_id: courses[0]?.id || '',
        title: '',
        description: '',
        deadline: '',
        allow_late_submission: true,
        max_score: 100,
        status: 'published',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        form.post('/guru/tugas', {
            onSuccess: () => {
                setIsModalOpen(false);
                form.reset();
            },
        });
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus tugas ini? Seluruh data pengumpulan siswa juga akan terhapus.')) {
            form.delete(`/guru/tugas/${id}`);
        }
    };

    return (
        <TeacherLayout title="Penugasan & Evaluasi Siswa">
            <Head title="Kelola Penugasan — Portal Guru" />

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
                            Manajemen Penugasan & Evaluasi Siswa
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Buat tugas berbasis deadline, terima berkas pengumpulan siswa, dan lakukan penilaian.
                        </p>
                    </div>

                    <Button
                        variant="primary"
                        size="md"
                        leftIcon={Plus}
                        onClick={() => setIsModalOpen(true)}
                        disabled={courses.length === 0}
                        className="bg-emerald-600 hover:bg-emerald-700 font-bold text-xs shadow-md shadow-emerald-600/20"
                    >
                        Buat Tugas Baru
                    </Button>
                </div>

                {/* Assignments List */}
                {assignments.length === 0 ? (
                    <div className="bento-card p-12 text-center space-y-4">
                        <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-slate-800">Belum Ada Tugas Dibuat</h3>
                            <p className="text-xs text-slate-500 max-w-md mx-auto">
                                Buat penugasan pertama dengan menetapkan batas waktu (deadline) dan kriteria penilaian.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {assignments.map((a) => (
                            <div
                                key={a.id}
                                className="bento-card p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="emerald" size="sm">
                                            {a.class_teacher?.class_room?.name} • {a.class_teacher?.subject?.name}
                                        </Badge>
                                        <div className="flex items-center gap-1">
                                            <Badge variant={a.status_badge} size="sm">
                                                {a.is_past_deadline ? 'Deadline Lewat' : 'Aktif'}
                                            </Badge>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(a.id)}
                                                className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                                                title="Hapus Tugas"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-base font-bold text-slate-900 leading-snug">{a.title}</h3>
                                    <p className="text-xs text-slate-600 line-clamp-3 whitespace-pre-line leading-relaxed">
                                        {a.description}
                                    </p>
                                </div>

                                <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                                    <div className="flex items-center justify-between text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                                            Deadline:
                                        </span>
                                        <strong className="text-slate-800 text-[11px]">{a.formatted_deadline}</strong>
                                    </div>

                                    <div className="flex items-center justify-between text-slate-500">
                                        <span>Pengumpulan Siswa:</span>
                                        <strong className="text-emerald-700 font-bold">
                                            {a.submissions_count || 0} Terkumpul
                                        </strong>
                                    </div>

                                    <Link
                                        href={`/guru/pengumpulan?assignment_id=${a.id}`}
                                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-bold text-xs transition-colors"
                                    >
                                        <Award className="w-4 h-4" />
                                        <span>Periksa & Beri Nilai</span>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Tambah Tugas */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Buat Penugasan Baru"
                description="Tentukan kelas target, batas waktu pengumpulan, dan instruksi tugas."
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Select
                        label="Pilih Kelas & Mata Pelajaran"
                        value={form.data.class_teacher_id}
                        onChange={(e) => form.setData('class_teacher_id', e.target.value)}
                        error={form.errors.class_teacher_id}
                        required
                    >
                        {courses.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.class_room?.name} — {c.subject?.name} ({c.subject?.code})
                            </option>
                        ))}
                    </Select>

                    <Input
                        label="Judul Tugas"
                        placeholder="Contoh: Tugas Mandiri: Logika Pemrograman Array"
                        value={form.data.title}
                        onChange={(e) => form.setData('title', e.target.value)}
                        error={form.errors.title}
                        required
                    />

                    <Textarea
                        label="Petunjuk & Instruksi Pengerjaan"
                        placeholder="Uraikan format pengumpulan, bobot penilaian, dan instruksi tugas..."
                        rows={4}
                        value={form.data.description}
                        onChange={(e) => form.setData('description', e.target.value)}
                        error={form.errors.description}
                        required
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            type="datetime-local"
                            label="Batas Waktu Pengumpulan (Deadline)"
                            value={form.data.deadline}
                            onChange={(e) => form.setData('deadline', e.target.value)}
                            error={form.errors.deadline}
                            required
                        />

                        <Input
                            type="number"
                            label="Nilai Maksimal (Max Score)"
                            value={form.data.max_score}
                            onChange={(e) => form.setData('max_score', e.target.value)}
                            error={form.errors.max_score}
                            min={10}
                            max={100}
                        />
                    </div>

                    <label className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.data.allow_late_submission}
                            onChange={(e) => form.setData('allow_late_submission', e.target.checked)}
                            className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500"
                        />
                        <div className="text-xs">
                            <span className="font-bold text-slate-800 block">Izinkan Pengumpulan Terlambat</span>
                            <span className="text-slate-500">
                                Siswa tetap dapat mengunggah jawaban setelah waktu deadline.
                            </span>
                        </div>
                    </label>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                        <Button variant="secondary" size="md" type="button" onClick={() => setIsModalOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            variant="primary"
                            size="md"
                            type="submit"
                            isLoading={form.processing}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            Publikasikan Tugas
                        </Button>
                    </div>
                </form>
            </Modal>
        </TeacherLayout>
    );
}
