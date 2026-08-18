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
    BookOpen,
    Users,
    FileText,
    UploadCloud,
    Plus,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    Trash2,
    Download,
    ExternalLink,
} from 'lucide-react';

export default function TeacherClassesShow({ classroom, courses = [] }) {
    const { flash } = usePage().props;
    const [activeTab, setActiveTab] = useState('lessons'); // lessons | assignments | students

    // New Lesson Modal State & Form
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const lessonForm = useForm({
        class_teacher_id: courses[0]?.id || '',
        title: '',
        content: '',
        video_url: '',
        is_published: true,
        file: null,
    });

    // New Assignment Modal State & Form
    const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
    const assignmentForm = useForm({
        class_teacher_id: courses[0]?.id || '',
        title: '',
        description: '',
        deadline: '',
        allow_late_submission: true,
        max_score: 100,
        status: 'published',
    });

    const handleLessonSubmit = (e) => {
        e.preventDefault();
        lessonForm.post('/guru/materi', {
            onSuccess: () => {
                setIsLessonModalOpen(false);
                lessonForm.reset();
            },
        });
    };

    const handleAssignmentSubmit = (e) => {
        e.preventDefault();
        assignmentForm.post('/guru/tugas', {
            onSuccess: () => {
                setIsAssignmentModalOpen(false);
                assignmentForm.reset();
            },
        });
    };

    const students = classroom.students || [];

    return (
        <TeacherLayout title={`Kelas: ${classroom.name}`}>
            <Head title={`Ruang Kelas: ${classroom.name} — Portal Guru`} />

            <div className="space-y-8 max-w-7xl mx-auto">
                {/* Flash Alert */}
                {flash?.success && (
                    <Alert variant="success" title="Berhasil!">
                        {flash.success}
                    </Alert>
                )}

                {/* Back & Action Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <Link
                        href="/guru/kelas"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs w-fit"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali ke Daftar Kelas</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            size="md"
                            leftIcon={UploadCloud}
                            onClick={() => setIsLessonModalOpen(true)}
                            className="text-xs font-bold"
                        >
                            + Tambah Materi
                        </Button>
                        <Button
                            variant="primary"
                            size="md"
                            leftIcon={Plus}
                            onClick={() => setIsAssignmentModalOpen(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold shadow-md shadow-emerald-600/20"
                        >
                            + Buat Tugas Baru
                        </Button>
                    </div>
                </div>

                {/* Class Hero Bento */}
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Badge variant="emerald" size="md" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                                Tingkat {classroom.grade_level}
                            </Badge>
                            <span className="text-xs text-slate-300">
                                TA {classroom.academic_year?.name || '2026/2027'} ({classroom.academic_year?.semester || 'Ganjil'})
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-black tracking-tight">{classroom.name}</h1>
                        <p className="text-xs text-slate-400">
                            Wali Kelas: {classroom.homeroom_teacher?.user?.name || 'Belum Ditentukan'} • Total {students.length} Siswa Terdaftar
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {courses.map((c) => (
                            <span key={c.id} className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-bold text-emerald-200 border border-white/10">
                                {c.subject?.name}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    {[
                        { id: 'lessons', label: 'Modul Materi Belajar', icon: BookOpen },
                        { id: 'assignments', label: 'Tugas & Evaluasi', icon: FileText },
                        { id: 'students', label: `Daftar Siswa (${students.length})`, icon: Users },
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
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* TAB 1: LESSONS */}
                {activeTab === 'lessons' && (
                    <div className="space-y-4">
                        {courses.flatMap((c) => c.lessons || []).length === 0 ? (
                            <div className="bento-card p-10 text-center space-y-3">
                                <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                                <p className="text-xs text-slate-500">Belum ada materi pembelajaran di kelas ini.</p>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setIsLessonModalOpen(true)}
                                    className="text-xs"
                                >
                                    Unggah Materi Pertama
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {courses.flatMap((c) =>
                                    (c.lessons || []).map((l) => (
                                        <div key={l.id} className="bento-card p-5 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Badge variant="emerald" size="sm">
                                                    {c.subject?.name}
                                                </Badge>
                                                <span className="text-[11px] text-slate-400">
                                                    {l.formatted_published_at}
                                                </span>
                                            </div>

                                            <h4 className="text-sm font-bold text-slate-900">{l.title}</h4>
                                            <p className="text-xs text-slate-600 line-clamp-2 whitespace-pre-line">{l.content}</p>

                                            {l.files && l.files.length > 0 && (
                                                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                                                    <Badge variant="neutral" size="sm">
                                                        {l.files[0].original_name} ({l.files[0].formatted_file_size})
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: ASSIGNMENTS */}
                {activeTab === 'assignments' && (
                    <div className="space-y-4">
                        {courses.flatMap((c) => c.assignments || []).length === 0 ? (
                            <div className="bento-card p-10 text-center space-y-3">
                                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                                <p className="text-xs text-slate-500">Belum ada tugas yang dibuat untuk kelas ini.</p>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => setIsAssignmentModalOpen(true)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-xs"
                                >
                                    Buat Tugas Baru
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {courses.flatMap((c) =>
                                    (c.assignments || []).map((a) => (
                                        <div key={a.id} className="bento-card p-5 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Badge variant="amber" size="sm">
                                                    {c.subject?.name}
                                                </Badge>
                                                <Badge variant={a.status_badge} size="sm">
                                                    {a.formatted_deadline}
                                                </Badge>
                                            </div>

                                            <h4 className="text-sm font-bold text-slate-900">{a.title}</h4>
                                            <p className="text-xs text-slate-600 line-clamp-2">{a.description}</p>

                                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                                <span className="text-slate-500">
                                                    Terkumpul: <strong>{a.submissions?.length || 0}</strong> / {students.length} Siswa
                                                </span>
                                                <Link
                                                    href={`/guru/pengumpulan?assignment_id=${a.id}`}
                                                    className="font-bold text-emerald-600 hover:underline"
                                                >
                                                    Lihat & Nilai →
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: STUDENTS ROSTER */}
                {activeTab === 'students' && (
                    <div className="bento-card p-0 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                                        <th className="py-3 px-4">No.</th>
                                        <th className="py-3 px-4">Nama Siswa</th>
                                        <th className="py-3 px-4">NISN / NIS</th>
                                        <th className="py-3 px-4">Email</th>
                                        <th className="py-3 px-4">Gender</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {students.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-slate-400">
                                                Belum ada siswa yang didaftarkan ke kelas ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        students.map((s, idx) => (
                                            <tr key={s.id} className="hover:bg-slate-50">
                                                <td className="py-3 px-4 text-slate-400 font-bold">{idx + 1}</td>
                                                <td className="py-3 px-4 font-bold text-slate-900">{s.user?.name}</td>
                                                <td className="py-3 px-4 font-mono text-slate-600">{s.nisn || s.nis || '-'}</td>
                                                <td className="py-3 px-4 text-slate-600">{s.user?.email}</td>
                                                <td className="py-3 px-4 text-slate-600">{s.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL TAMBAH MATERI */}
            <Modal
                isOpen={isLessonModalOpen}
                onClose={() => setIsLessonModalOpen(false)}
                title={`Tambah Modul Materi: ${classroom.name}`}
                description="Terbitkan materi atau modul belajar digital untuk siswa di kelas ini."
                size="lg"
            >
                <form onSubmit={handleLessonSubmit} className="space-y-4">
                    <Select
                        label="Mata Pelajaran"
                        value={lessonForm.data.class_teacher_id}
                        onChange={(e) => lessonForm.setData('class_teacher_id', e.target.value)}
                        error={lessonForm.errors.class_teacher_id}
                        required
                    >
                        {courses.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.subject?.name} ({c.subject?.code})
                            </option>
                        ))}
                    </Select>

                    <Input
                        label="Judul Modul / Materi"
                        placeholder="Contoh: Bab 1 - Algoritma dan Pemrograman Dasar"
                        value={lessonForm.data.title}
                        onChange={(e) => lessonForm.setData('title', e.target.value)}
                        error={lessonForm.errors.title}
                        required
                    />

                    <Textarea
                        label="Uraian Materi / Catatan Pendidik"
                        placeholder="Tuliskan rangkuman, instruksi belajar, atau materi pembahasan..."
                        rows={4}
                        value={lessonForm.data.content}
                        onChange={(e) => lessonForm.setData('content', e.target.value)}
                        error={lessonForm.errors.content}
                    />

                    <Input
                        label="Tautan Video Pembelajaran (Opsional)"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={lessonForm.data.video_url}
                        onChange={(e) => lessonForm.setData('video_url', e.target.value)}
                        error={lessonForm.errors.video_url}
                    />

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Unggah Berkas Modul / Slide (PDF/Word/PPT Maks 10MB)
                        </label>
                        <input
                            type="file"
                            onChange={(e) => lessonForm.setData('file', e.target.files[0])}
                            className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                        />
                        {lessonForm.errors.file && (
                            <p className="text-xs text-rose-600 mt-1">{lessonForm.errors.file}</p>
                        )}
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                        <Button variant="secondary" size="md" type="button" onClick={() => setIsLessonModalOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            variant="primary"
                            size="md"
                            type="submit"
                            isLoading={lessonForm.processing}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            Terbitkan Materi
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* MODAL BUAT TUGAS BARU */}
            <Modal
                isOpen={isAssignmentModalOpen}
                onClose={() => setIsAssignmentModalOpen(false)}
                title={`Buat Penugasan Baru: ${classroom.name}`}
                description="Tentukan instruksi pengerjaan tugas dan batas akhir waktu pengumpulan."
                size="lg"
            >
                <form onSubmit={handleAssignmentSubmit} className="space-y-4">
                    <Select
                        label="Mata Pelajaran"
                        value={assignmentForm.data.class_teacher_id}
                        onChange={(e) => assignmentForm.setData('class_teacher_id', e.target.value)}
                        error={assignmentForm.errors.class_teacher_id}
                        required
                    >
                        {courses.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.subject?.name} ({c.subject?.code})
                            </option>
                        ))}
                    </Select>

                    <Input
                        label="Judul Tugas"
                        placeholder="Contoh: Tugas Praktik 01 - Analisis Algoritma"
                        value={assignmentForm.data.title}
                        onChange={(e) => assignmentForm.setData('title', e.target.value)}
                        error={assignmentForm.errors.title}
                        required
                    />

                    <Textarea
                        label="Petunjuk & Instruksi Tugas"
                        placeholder="Uraikan format pengumpulan, bobot penilaian, dan instruksi lengkap..."
                        rows={4}
                        value={assignmentForm.data.description}
                        onChange={(e) => assignmentForm.setData('description', e.target.value)}
                        error={assignmentForm.errors.description}
                        required
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            type="datetime-local"
                            label="Batas Waktu Pengumpulan (Deadline)"
                            value={assignmentForm.data.deadline}
                            onChange={(e) => assignmentForm.setData('deadline', e.target.value)}
                            error={assignmentForm.errors.deadline}
                            required
                        />

                        <Input
                            type="number"
                            label="Nilai Maksimal (Max Score)"
                            value={assignmentForm.data.max_score}
                            onChange={(e) => assignmentForm.setData('max_score', e.target.value)}
                            error={assignmentForm.errors.max_score}
                            min={10}
                            max={100}
                        />
                    </div>

                    <label className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={assignmentForm.data.allow_late_submission}
                            onChange={(e) => assignmentForm.setData('allow_late_submission', e.target.checked)}
                            className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500"
                        />
                        <div className="text-xs">
                            <span className="font-bold text-slate-800 block">Izinkan Pengumpulan Terlambat</span>
                            <span className="text-slate-500">
                                Siswa tetap dapat mengunggah jawaban setelah deadline dengan status "Terlambat".
                            </span>
                        </div>
                    </label>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                        <Button variant="secondary" size="md" type="button" onClick={() => setIsAssignmentModalOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            variant="primary"
                            size="md"
                            type="submit"
                            isLoading={assignmentForm.processing}
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
