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
import Alert from '@/Components/Alert';
import Modal from '@/Components/Modal';
import {
    ArrowLeft,
    Pin,
    Lock,
    Unlock,
    ThumbsUp,
    MessageCircle,
    Flag,
    Edit,
    Trash2,
    Send,
    User,
    Shield,
    Calendar,
    Clock,
    AlertCircle,
    CheckCircle2,
} from 'lucide-react';

export default function ForumShow({ thread, posts = [], categories = [] }) {
    const { auth, flash } = usePage().props;
    const user = auth?.user;
    const isTeacherOrAdmin = user && (user.roles?.some((r) => ['teacher', 'admin', 'super_admin'].includes(r.name)) || false);
    const isThreadAuthor = user && user.id === thread.author?.id;

    // Reply Form
    const replyForm = useForm({
        content: '',
    });

    // Report Modal State & Form
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [reportTarget, setReportTarget] = useState({ type: 'thread', id: thread.id });
    const reportForm = useForm({
        reportable_type: 'thread',
        reportable_id: thread.id,
        reason: '',
    });

    // Edit Thread Modal State & Form
    const [editThreadModalOpen, setEditThreadModalOpen] = useState(false);
    const editThreadForm = useForm({
        title: thread.title,
        content: thread.content,
    });

    // Edit Post Modal State & Form
    const [editPostModalOpen, setEditPostModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const editPostForm = useForm({
        content: '',
    });

    const handleReplySubmit = (e) => {
        e.preventDefault();
        replyForm.post(`/forum/threads/${thread.id}/replies`, {
            preserveScroll: true,
            onSuccess: () => replyForm.reset(),
        });
    };

    const handleReaction = (type, id) => {
        router.post('/forum/reactions/toggle', {
            reactable_type: type,
            reactable_id: id,
        }, { preserveScroll: true });
    };

    const openReportModal = (type, id) => {
        setReportTarget({ type, id });
        reportForm.setData({
            reportable_type: type,
            reportable_id: id,
            reason: '',
        });
        setReportModalOpen(true);
    };

    const handleReportSubmit = (e) => {
        e.preventDefault();
        reportForm.post('/forum/reports', {
            preserveScroll: true,
            onSuccess: () => {
                setReportModalOpen(false);
                reportForm.reset();
            },
        });
    };

    const handleEditThreadSubmit = (e) => {
        e.preventDefault();
        editThreadForm.put(`/forum/threads/${thread.id}`, {
            onSuccess: () => setEditThreadModalOpen(false),
        });
    };

    const handleDeleteThread = () => {
        if (confirm('Apakah Anda yakin ingin menghapus topik diskusi ini? Seluruh balasan juga akan terhapus.')) {
            router.delete(`/forum/threads/${thread.id}`);
        }
    };

    const openEditPostModal = (post) => {
        setEditingPost(post);
        editPostForm.setData({ content: post.content });
        setEditPostModalOpen(true);
    };

    const handleEditPostSubmit = (e) => {
        e.preventDefault();
        if (!editingPost) return;

        editPostForm.put(`/forum/posts/${editingPost.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setEditPostModalOpen(false);
                setEditingPost(null);
            },
        });
    };

    const handleDeletePost = (postId) => {
        if (confirm('Apakah Anda yakin ingin menghapus balasan ini?')) {
            router.delete(`/forum/posts/${postId}`, { preserveScroll: true });
        }
    };

    const handleTogglePin = () => {
        router.post(`/forum/threads/${thread.id}/pin`, {}, { preserveScroll: true });
    };

    const handleToggleLock = () => {
        router.post(`/forum/threads/${thread.id}/lock`, {}, { preserveScroll: true });
    };

    const getLayout = (content) => {
        const role = user?.roles?.[0]?.name;
        if (role === 'teacher') return <TeacherLayout title={`Diskusi: ${thread.title}`}>{content}</TeacherLayout>;
        if (role === 'student') return <StudentLayout title={`Diskusi: ${thread.title}`}>{content}</StudentLayout>;
        if (role === 'admin' || role === 'super_admin') return <AdminLayout title={`Diskusi: ${thread.title}`}>{content}</AdminLayout>;
        return <PublicLayout>{content}</PublicLayout>;
    };

    const mainContent = (
        <div className="space-y-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Head title={`${thread.title} — Forum Komunitas`} />

            {flash?.success && (
                <Alert variant="success" title="Berhasil!">
                    {flash.success}
                </Alert>
            )}

            {/* Back Button */}
            <Link
                href="/forum"
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-brand-600 transition-colors px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs w-fit"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Forum</span>
            </Link>

            {/* Main Thread Card */}
            <div className="bento-card p-6 sm:p-8 space-y-6">
                {/* Header & Badges */}
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="brand" size="sm">
                                {thread.category?.name}
                            </Badge>
                            {thread.is_pinned && (
                                <Badge variant="warning" size="sm" className="flex items-center gap-1">
                                    <Pin className="w-3 h-3" /> Disematkan
                                </Badge>
                            )}
                            {thread.is_locked && (
                                <Badge variant="danger" size="sm" className="flex items-center gap-1">
                                    <Lock className="w-3 h-3" /> Diskusi Dikunci
                                </Badge>
                            )}
                        </div>

                        {/* Moderation Actions for Teacher/Admin */}
                        {isTeacherOrAdmin && (
                            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
                                <button
                                    type="button"
                                    onClick={handleTogglePin}
                                    className="px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-white text-slate-700 transition-colors cursor-pointer"
                                    title={thread.is_pinned ? 'Batal Sematkan' : 'Sematkan Topik'}
                                >
                                    {thread.is_pinned ? 'Unpin' : 'Pin'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleToggleLock}
                                    className="px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-white text-slate-700 transition-colors cursor-pointer"
                                    title={thread.is_locked ? 'Buka Kunci' : 'Kunci Diskusi'}
                                >
                                    {thread.is_locked ? 'Unlock' : 'Lock'}
                                </button>
                            </div>
                        )}
                    </div>

                    <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                        {thread.title}
                    </h1>

                    {/* Author & Timestamp */}
                    <div className="flex items-center gap-3 pt-1 border-b border-slate-100 pb-4 text-xs">
                        <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                            {thread.author?.name?.substring(0, 2).toUpperCase() || 'US'}
                        </div>
                        <div>
                            <span className="font-bold text-slate-900 block">{thread.author?.name}</span>
                            <span className="text-[11px] text-slate-400">
                                Diterbitkan {thread.formatted_created_at} • Dilihat {thread.views_count} kali
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line space-y-4">
                    {thread.content}
                </div>

                {/* Action Bar (Like, Report, Edit/Delete) */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => handleReaction('thread', thread.id)}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                thread.is_liked
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>{thread.reactions_count} Suka</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => openReportModal('thread', thread.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 font-semibold transition-colors cursor-pointer"
                            title="Laporkan Pelanggaran"
                        >
                            <Flag className="w-3.5 h-3.5" />
                            <span>Laporkan</span>
                        </button>
                    </div>

                    {(isThreadAuthor || isTeacherOrAdmin) && (
                        <div className="flex items-center gap-1">
                            {isThreadAuthor && (
                                <button
                                    type="button"
                                    onClick={() => setEditThreadModalOpen(true)}
                                    className="p-1.5 text-slate-500 hover:text-brand-600 rounded-lg hover:bg-slate-100 transition-colors"
                                    title="Edit Topik"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleDeleteThread}
                                className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                                title="Hapus Topik"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Replies Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-brand-600" />
                    Tanggapan & Balasan Diskusi ({posts.length})
                </h3>

                {posts.length === 0 ? (
                    <div className="bento-card p-8 text-center text-slate-400 text-xs">
                        Belum ada tanggapan untuk diskusi ini. Jadilah yang pertama memberikan masukan!
                    </div>
                ) : (
                    <div className="space-y-3">
                        {posts.map((post) => {
                            const isPostAuthor = user && user.id === post.user?.id;
                            return (
                                <div key={post.id} className="bento-card p-5 space-y-3">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                                                {post.user?.name?.substring(0, 2).toUpperCase() || 'US'}
                                            </div>
                                            <div>
                                                <span className="font-bold text-xs text-slate-900 block">
                                                    {post.user?.name}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    {post.formatted_created_at}
                                                </span>
                                            </div>
                                        </div>

                                        {(isPostAuthor || isTeacherOrAdmin) && (
                                            <div className="flex items-center gap-1">
                                                {isPostAuthor && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditPostModal(post)}
                                                        className="p-1 text-slate-400 hover:text-brand-600 transition-colors"
                                                        title="Edit Balasan"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeletePost(post.id)}
                                                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                                    title="Hapus Balasan"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                                        {post.content}
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                                        <button
                                            type="button"
                                            onClick={() => handleReaction('post', post.id)}
                                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                                post.is_liked
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'text-slate-500 hover:bg-slate-100'
                                            }`}
                                        >
                                            <ThumbsUp className="w-3.5 h-3.5" />
                                            <span>{post.reactions_count || 0}</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => openReportModal('post', post.id)}
                                            className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors"
                                        >
                                            Laporkan
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Reply Composer Form / Locked Notice */}
                {thread.is_locked ? (
                    <div className="bento-card p-6 text-center space-y-2 bg-slate-50 border border-slate-200">
                        <Lock className="w-6 h-6 text-slate-400 mx-auto" />
                        <p className="text-xs font-bold text-slate-700">Topik Diskusi Ini Telah Dikunci</p>
                        <p className="text-[11px] text-slate-500">
                            Moderator telah menutup sesi tanggapan untuk diskusi ini.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleReplySubmit} className="bento-card p-6 space-y-4">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            Tulis Tanggapan Anda
                        </h4>

                        <Textarea
                            placeholder="Ketikkan balasan atau solusi yang membantu..."
                            rows={4}
                            value={replyForm.data.content}
                            onChange={(e) => replyForm.setData('content', e.target.value)}
                            error={replyForm.errors.content}
                            required
                        />

                        <div className="flex items-center justify-end">
                            <Button
                                type="submit"
                                variant="primary"
                                size="md"
                                leftIcon={Send}
                                isLoading={replyForm.processing}
                                className="font-bold text-xs"
                            >
                                Kirim Tanggapan
                            </Button>
                        </div>
                    </form>
                )}
            </div>

            {/* MODAL LAPORKAN KONTEN */}
            <Modal
                isOpen={reportModalOpen}
                onClose={() => setReportModalOpen(false)}
                title="Laporkan Konten Melanggar"
                description="Bantu kami menjaga forum tetap aman dan nyaman bagi seluruh komunitas sekolah."
                size="md"
            >
                <form onSubmit={handleReportSubmit} className="space-y-4">
                    <Textarea
                        label="Alasan Pelaporan"
                        placeholder="Contoh: Mengandung kata-kata tidak sopan, spam promosi, atau perundungan..."
                        rows={4}
                        value={reportForm.data.reason}
                        onChange={(e) => reportForm.setData('reason', e.target.value)}
                        error={reportForm.errors.reason}
                        required
                    />

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                        <Button variant="secondary" size="md" type="button" onClick={() => setReportModalOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            variant="primary"
                            size="md"
                            type="submit"
                            isLoading={reportForm.processing}
                            className="bg-rose-600 hover:bg-rose-700"
                        >
                            Kirim Laporan
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* MODAL EDIT THREAD */}
            <Modal
                isOpen={editThreadModalOpen}
                onClose={() => setEditThreadModalOpen(false)}
                title="Edit Topik Diskusi"
                size="lg"
            >
                <form onSubmit={handleEditThreadSubmit} className="space-y-4">
                    <Input
                        label="Judul Diskusi"
                        value={editThreadForm.data.title}
                        onChange={(e) => editThreadForm.setData('title', e.target.value)}
                        error={editThreadForm.errors.title}
                        required
                    />

                    <Textarea
                        label="Uraian Diskusi"
                        rows={5}
                        value={editThreadForm.data.content}
                        onChange={(e) => editThreadForm.setData('content', e.target.value)}
                        error={editThreadForm.errors.content}
                        required
                    />

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                        <Button variant="secondary" size="md" type="button" onClick={() => setEditThreadModalOpen(false)}>
                            Batal
                        </Button>
                        <Button variant="primary" size="md" type="submit" isLoading={editThreadForm.processing}>
                            Simpan Perubahan
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* MODAL EDIT POST */}
            <Modal
                isOpen={editPostModalOpen}
                onClose={() => setEditPostModalOpen(false)}
                title="Edit Balasan Diskusi"
                size="md"
            >
                <form onSubmit={handleEditPostSubmit} className="space-y-4">
                    <Textarea
                        label="Isi Balasan"
                        rows={4}
                        value={editPostForm.data.content}
                        onChange={(e) => editPostForm.setData('content', e.target.value)}
                        error={editPostForm.errors.content}
                        required
                    />

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                        <Button variant="secondary" size="md" type="button" onClick={() => setEditPostModalOpen(false)}>
                            Batal
                        </Button>
                        <Button variant="primary" size="md" type="submit" isLoading={editPostForm.processing}>
                            Simpan Perubahan
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );

    return getLayout(mainContent);
}
