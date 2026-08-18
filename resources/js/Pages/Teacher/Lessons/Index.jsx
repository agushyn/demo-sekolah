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
    UploadCloud,
    BookOpen,
    Plus,
    Trash2,
    Video,
    FileText,
    Download,
    ExternalLink,
} from 'lucide-react';

export default function TeacherLessonsIndex({ lessons = [], courses = [] }) {
    const { flash } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);

    const form = useForm({
        class_teacher_id: courses[0]?.id || '',
        title: '',
        content: '',
        video_url: '',
        is_published: true,
        file: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        form.post('/guru/materi', {
            onSuccess: () => {
                setIsModalOpen(false);
                form.reset();
            },
        });
    };

    const handleDelete = (lessonId) => {
        if (confirm('Apakah Anda yakin ingin menghapus modul materi ini?')) {
            form.delete(`/guru/materi/${lessonId}`);
        }
    };

    return (
        <TeacherLayout title="Kelola Materi Pembelajaran">
            <Head title="Kelola Modul Materi — Portal Guru" />

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
                            Modul & Materi Pembelajaran Digital
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Unggah bahan ajar, presentasi, dan video pembelajaran untuk peserta didik.
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
                        Unggah Materi Baru
                    </Button>
                </div>

                {/* Lessons Grid */}
                {lessons.length === 0 ? (
                    <div className="bento-card p-12 text-center space-y-4">
                        <UploadCloud className="w-12 h-12 text-slate-300 mx-auto" />
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-slate-800">Belum Ada Materi Diterbitkan</h3>
                            <p className="text-xs text-slate-500 max-w-md mx-auto">
                                Buat modul pertama Anda dengan melampirkan berkas dokumen atau video YouTube.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lessons.map((l) => (
                            <div
                                key={l.id}
                                className="bento-card p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="emerald" size="sm">
                                            {l.class_teacher?.class_room?.name} • {l.class_teacher?.subject?.name}
                                        </Badge>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(l.id)}
                                            className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                                            title="Hapus Materi"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <h3 className="text-base font-bold text-slate-900 leading-snug">{l.title}</h3>
                                    <p className="text-xs text-slate-600 line-clamp-3 whitespace-pre-line leading-relaxed">
                                        {l.content}
                                    </p>
                                </div>

                                <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                                    {l.files && l.files.length > 0 && (
                                        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-700">
                                            <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span className="truncate flex-1 font-semibold text-[11px]">
                                                {l.files[0].original_name}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                                {l.files[0].formatted_file_size}
                                            </span>
                                        </div>
                                    )}

                                    {l.video_url && (
                                        <a
                                            href={l.video_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-xs text-brand-600 hover:underline font-semibold"
                                        >
                                            <Video className="w-3.5 h-3.5 text-rose-500" />
                                            <span>Tonton Video Materi ↗</span>
                                        </a>
                                    )}

                                    <span className="text-[11px] text-slate-400 block pt-1">
                                        Diterbitkan: {l.formatted_published_at}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Tambah Materi */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Unggah Materi Pembelajaran Baru"
                description="Terbitkan modul belajar ke kelas dan mata pelajaran pilihan Anda."
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
                        label="Judul Materi / Topik Pembahasan"
                        placeholder="Contoh: Modul 02: Logika Gerbang Digital"
                        value={form.data.title}
                        onChange={(e) => form.setData('title', e.target.value)}
                        error={form.errors.title}
                        required
                    />

                    <Textarea
                        label="Uraian Materi / Rangkuman"
                        placeholder="Tuliskan petunjuk pembelajaran, poin utama, atau pengantar..."
                        rows={4}
                        value={form.data.content}
                        onChange={(e) => form.setData('content', e.target.value)}
                        error={form.errors.content}
                    />

                    <Input
                        label="Tautan Video Pembelajaran (Opsional)"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={form.data.video_url}
                        onChange={(e) => form.setData('video_url', e.target.value)}
                        error={form.errors.video_url}
                    />

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Berkas Lampiran Modul (PDF/PPT/Word/ZIP Maks 10MB)
                        </label>
                        <input
                            type="file"
                            onChange={(e) => form.setData('file', e.target.files[0])}
                            className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                        />
                        {form.errors.file && (
                            <p className="text-xs text-rose-600 mt-1">{form.errors.file}</p>
                        )}
                    </div>

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
                            Terbitkan Materi
                        </Button>
                    </div>
                </form>
            </Modal>
        </TeacherLayout>
    );
}
