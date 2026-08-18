import React, { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import TeacherLayout from '@/Layouts/TeacherLayout';
import StudentLayout from '@/Layouts/StudentLayout';
import AdminLayout from '@/Layouts/AdminLayout';
import BentoCard from '@/Components/BentoCard';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Textarea from '@/Components/Textarea';
import Pagination from '@/Components/Pagination';
import Modal from '@/Components/Modal';
import {
    MessageSquare,
    Search,
    Plus,
    ArrowLeft,
    Pin,
    Lock,
    Eye,
    ThumbsUp,
    MessageCircle,
    ChevronRight,
} from 'lucide-react';

export default function ForumCategoryShow({ category, threads, categories = [], filters = {} }) {
    const { auth, flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const createForm = useForm({
        category_id: category.id,
        title: '',
        content: '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(`/forum/kategori/${category.slug}`, { search: search || undefined }, { preserveState: true, replace: true });
    };

    const handleCreateThread = (e) => {
        e.preventDefault();
        createForm.post('/forum/threads', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const getLayout = (content) => {
        const role = auth?.user?.roles?.[0]?.name;
        if (role === 'teacher') return <TeacherLayout title={`Forum: ${category.name}`}>{content}</TeacherLayout>;
        if (role === 'student') return <StudentLayout title={`Forum: ${category.name}`}>{content}</StudentLayout>;
        if (role === 'admin' || role === 'super_admin') return <AdminLayout title={`Forum: ${category.name}`}>{content}</AdminLayout>;
        return <PublicLayout>{content}</PublicLayout>;
    };

    const threadList = threads?.data || [];
    const paginationLinks = threads?.links || [];

    const mainContent = (
        <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Head title={`Kategori ${category.name} — Forum Komunitas`} />

            {/* Back Button */}
            <Link
                href="/forum"
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-brand-600 transition-colors px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs w-fit"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Direktori Forum</span>
            </Link>

            {/* Category Hero Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <Badge variant="brand" size="md" className="bg-brand-500/20 text-brand-300 border-brand-500/30">
                        Kategori Diskusi
                    </Badge>
                    <h1 className="text-2xl sm:text-4xl font-black tracking-tight">{category.name}</h1>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                        {category.description || 'Ruang diskusi dan tanya jawab untuk kategori ini.'}
                    </p>
                </div>

                <Button
                    variant="primary"
                    size="lg"
                    leftIcon={Plus}
                    onClick={() => setIsCreateModalOpen(true)}
                    className="font-bold text-xs shrink-0"
                >
                    + Buat Diskusi di Kategori Ini
                </Button>
            </div>

            {/* Search Bar */}
            <div className="bento-card p-4">
                <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md w-full">
                    <Input
                        placeholder={`Cari dalam kategori ${category.name}...`}
                        leftIcon={Search}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full text-xs"
                    />
                    <Button type="submit" variant="secondary" size="md" className="shrink-0 text-xs font-bold">
                        Cari
                    </Button>
                </form>
            </div>

            {/* Threads List */}
            {threadList.length === 0 ? (
                <div className="bento-card p-12 text-center space-y-4">
                    <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
                    <div className="space-y-1">
                        <h3 className="text-base font-bold text-slate-800">Belum Ada Diskusi di Kategori Ini</h3>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                            Mulai diskusi pertama Anda di kategori {category.name}.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {threadList.map((thread) => (
                        <div
                            key={thread.id}
                            className={`bento-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all ${
                                thread.is_pinned ? 'border-l-4 border-l-brand-600 bg-brand-50/20' : ''
                            }`}
                        >
                            <div className="space-y-2 min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    {thread.is_pinned && (
                                        <Badge variant="brand" size="sm" className="flex items-center gap-1">
                                            <Pin className="w-3 h-3" /> Disematkan
                                        </Badge>
                                    )}
                                    {thread.is_locked && (
                                        <Badge variant="danger" size="sm" className="flex items-center gap-1">
                                            <Lock className="w-3 h-3" /> Terkunci
                                        </Badge>
                                    )}
                                </div>

                                <Link
                                    href={`/forum/thread/${thread.slug}`}
                                    className="text-base sm:text-lg font-bold text-slate-900 hover:text-brand-600 transition-colors block leading-snug"
                                >
                                    {thread.title}
                                </Link>

                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                    {thread.content}
                                </p>

                                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                                    <span>Oleh: <strong className="text-slate-700">{thread.author?.name}</strong></span>
                                    <span>•</span>
                                    <span>{thread.formatted_created_at}</span>
                                </div>
                            </div>

                            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                                    <span className="flex items-center gap-1" title="Balasan">
                                        <MessageCircle className="w-4 h-4 text-slate-400" />
                                        {thread.posts_count || 0}
                                    </span>
                                    <span className="flex items-center gap-1" title="Suka">
                                        <ThumbsUp className="w-4 h-4 text-emerald-500" />
                                        {thread.reactions_count || 0}
                                    </span>
                                    <span className="flex items-center gap-1" title="Dilihat">
                                        <Eye className="w-4 h-4 text-slate-400" />
                                        {thread.views_count || 0}
                                    </span>
                                </div>

                                <Link
                                    href={`/forum/thread/${thread.slug}`}
                                    className="px-3.5 py-1.5 rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-600 hover:text-white font-bold text-xs transition-colors inline-flex items-center gap-1"
                                >
                                    <span>Ikuti Diskusi</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {paginationLinks.length > 3 && (
                <div className="flex justify-center pt-4">
                    <Pagination links={paginationLinks} />
                </div>
            )}

            {/* MODAL BUAT DISKUSI BARU */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title={`Buat Diskusi Baru: ${category.name}`}
                description="Tulis pertanyaan atau topik diskusi yang relevan dengan kategori ini."
                size="lg"
            >
                <form onSubmit={handleCreateThread} className="space-y-4">
                    <Input
                        label="Judul Topik Diskusi"
                        placeholder="Contoh: Pembahasan soal latihan bab 3..."
                        value={createForm.data.title}
                        onChange={(e) => createForm.setData('title', e.target.value)}
                        error={createForm.errors.title}
                        required
                    />

                    <Textarea
                        label="Uraian Pembahasan / Pertanyaan"
                        placeholder="Tuliskan materi secara jelas dan santun..."
                        rows={5}
                        value={createForm.data.content}
                        onChange={(e) => createForm.setData('content', e.target.value)}
                        error={createForm.errors.content}
                        required
                    />

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                        <Button variant="secondary" size="md" type="button" onClick={() => setIsCreateModalOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            variant="primary"
                            size="md"
                            type="submit"
                            isLoading={createForm.processing}
                        >
                            Terbitkan Diskusi
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );

    return getLayout(mainContent);
}
