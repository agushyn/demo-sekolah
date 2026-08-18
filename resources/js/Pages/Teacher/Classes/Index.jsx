import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import TeacherLayout from '@/Layouts/TeacherLayout';
import BentoCard from '@/Components/BentoCard';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import Select from '@/Components/Select';
import Alert from '@/Components/Alert';
import Modal from '@/Components/Modal';
import {
    BookOpen,
    Users,
    FileText,
    UploadCloud,
    Plus,
    ChevronRight,
    GraduationCap,
    Sparkles,
} from 'lucide-react';

export default function TeacherClassesIndex({ courses = [], allClasses = [], allSubjects = [] }) {
    const { flash } = usePage().props;
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const form = useForm({
        class_id: '',
        subject_id: '',
    });

    const handleAddCourse = (e) => {
        e.preventDefault();
        form.post('/guru/kelas', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                form.reset();
            },
        });
    };

    return (
        <TeacherLayout title="Daftar Kelas & Mata Pelajaran">
            <Head title="Kelas Saya — Portal Guru" />

            <div className="space-y-8 max-w-7xl mx-auto">
                {/* Flash Notice */}
                {flash?.success && (
                    <Alert variant="success" title="Berhasil!">
                        {flash.success}
                    </Alert>
                )}

                {/* Header & Add Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            Rombongan Belajar & Mata Pelajaran Saya
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Kelola materi digital, penugasan, dan penilaian pada kelas yang Anda ampu.
                        </p>
                    </div>

                    <Button
                        variant="primary"
                        size="md"
                        leftIcon={Plus}
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 font-bold text-xs shadow-md shadow-emerald-600/20"
                    >
                        Tambah Rombel / Mapel
                    </Button>
                </div>

                {/* Courses Grid */}
                {courses.length === 0 ? (
                    <div className="bento-card p-12 text-center space-y-4">
                        <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-slate-800">Belum Ada Rombongan Belajar</h3>
                            <p className="text-xs text-slate-500 max-w-md mx-auto">
                                Anda belum mengajar di kelas manapun. Klik tombol "Tambah Rombel / Mapel" di atas untuk menambahkan jadwal kelas Anda.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((c) => (
                            <div
                                key={c.id}
                                className="bento-card p-6 flex flex-col justify-between space-y-6 hover:shadow-lg hover:border-emerald-200 transition-all group"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="emerald" size="md">
                                            {c.class_room?.name}
                                        </Badge>
                                        <span className="text-[11px] font-mono font-bold text-slate-400">
                                            {c.subject?.code}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                                            {c.subject?.name}
                                        </h3>
                                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                                            {c.subject?.description || 'Pembelajaran kurikulum terpadu sekolah.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                                            <span className="text-[10px] text-slate-400 block">Siswa</span>
                                            <strong className="text-slate-800 font-black">
                                                {c.class_room?.students?.length || 0}
                                            </strong>
                                        </div>
                                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                                            <span className="text-[10px] text-slate-400 block">Materi</span>
                                            <strong className="text-emerald-700 font-black">
                                                {c.lessons_count || 0}
                                            </strong>
                                        </div>
                                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                                            <span className="text-[10px] text-slate-400 block">Tugas</span>
                                            <strong className="text-amber-600 font-black">
                                                {c.assignments_count || 0}
                                            </strong>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/guru/kelas/${c.class_id}`}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white font-bold text-xs transition-colors"
                                    >
                                        <span>Buka Ruang Kelas</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Tambah Rombel & Mapel */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Tambah Rombel & Mata Pelajaran"
                description="Tautkan kelas yang Anda ajar dengan mata pelajaran pengampu."
                size="md"
            >
                <form onSubmit={handleAddCourse} className="space-y-4">
                    <Select
                        label="Pilih Ruang Kelas"
                        value={form.data.class_id}
                        onChange={(e) => form.setData('class_id', e.target.value)}
                        error={form.errors.class_id}
                        required
                    >
                        <option value="">-- Pilih Kelas --</option>
                        {allClasses.map((cls) => (
                            <option key={cls.id} value={cls.id}>
                                {cls.name} (Tingkat {cls.grade_level})
                            </option>
                        ))}
                    </Select>

                    <Select
                        label="Pilih Mata Pelajaran"
                        value={form.data.subject_id}
                        onChange={(e) => form.setData('subject_id', e.target.value)}
                        error={form.errors.subject_id}
                        required
                    >
                        <option value="">-- Pilih Mata Pelajaran --</option>
                        {allSubjects.map((sbj) => (
                            <option key={sbj.id} value={sbj.id}>
                                {sbj.code} — {sbj.name}
                            </option>
                        ))}
                    </Select>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                        <Button variant="secondary" size="md" type="button" onClick={() => setIsAddModalOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            variant="primary"
                            size="md"
                            type="submit"
                            isLoading={form.processing}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            Simpan Kelas
                        </Button>
                    </div>
                </form>
            </Modal>
        </TeacherLayout>
    );
}
