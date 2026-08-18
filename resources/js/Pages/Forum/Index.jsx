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
import Select from '@/Components/Select';
import Alert from '@/Components/Alert';
import Modal from '@/Components/Modal';
import {
    MessageSquare,
    Search,
    Plus,
    Flame,
    Clock,
    Pin,
    Lock,
    Eye,
    ThumbsUp,
    MessageCircle,
    Calculator,
    BookOpen,
    Globe,
    FlaskConical,
    Sparkles,
    ChevronRight,
    Users,
} from 'lucide-react';

export default function ForumIndex({
    categories = [],
    latestThreads = [],
    popularThreads = [],
    stats = {},
    filters = {},
}) {
    const { auth, flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [activeTab, setActiveTab] = useState('latest'); // latest | popular
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Form create thread
    const createForm = useForm({
        category_id: categories[0]?.id || '',
        title: '',
        content: '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/forum', { search: search || undefined }, { preserveState: true, replace: true });
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

    // Category icon mapping
    const getCategoryIcon = (iconName) => {
        switch (iconName) {
            case 'Calculator':
                return Calculator;
            case 'BookOpen':
                return BookOpen;
            case 'Globe':
                return Globe;
            case 'FlaskConical':
                return FlaskConical;
            case 'Sparkles':
                return Sparkles;
            default:
                return MessageSquare;
        }
    };

    // Choose layout wrapper depending on user role
    const getLayout = (content) => {
        const role = auth?.user?.roles?.[0]?.name;
        if (role === 'teacher') return <TeacherLayout title="Forum Diskusi Komunitas">{content}</TeacherLayout>;
        if (role === 'student') return <StudentLayout title="Forum Diskusi Komunitas">{content}</StudentLayout>;
        if (role === 'admin' || role === 'super_admin') return <AdminLayout title="Forum Diskusi Komunitas">{content}</AdminLayout>;
        return <PublicLayout>{content}</PublicLayout>;
    };

    const currentThreads = activeTab === 'latest' ? latestThreads : popularThreads;

    const mainContent = (
        <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Head title="Forum Diskusi Komunitas & Akademik — SMK Triwijaya" />

            {flash?.success && (
                <Alert variant="success" title="Berhasil!">
                    {flash.success}
                </Alert>
            )}

            {/* Hero Banner Bento */}
            <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-brand-900 via-brand-800 to-slate-900 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
                        <span>Ruang Interaksi & Diskusi Ilmiah</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                        Forum Komunitas Belajar Terpadu
                    </h1>
                    <p className="text-xs sm:text-sm text-brand-100/90 leading-relaxed">
                        Tanyakan soal pelajaran, bagikan wawasan akademik, dan berdiskusi bersama bapak/ibu guru serta rekan siswa di lingkungan SMK Triwijaya.
                    </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <Button
                        variant="primary"
                        size="lg"
                        leftIcon={Plus}
                        onClick={() => setIsCreateModalOpen(true)}
                        className="font-bold text-xs shadow-lg shadow-brand-600/30"
                    >
                        Buat Diskusi Baru
                    </Button>
                </div>
            </div>

            {/* 4 Bento Statistics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bento-card p-5 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Topik Diskusi</span>
                        <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats.total_threads || 0}</p>
                    <p className="text-[11px] text-slate-500">Thread aktif</p>
                </div>

                <div className="bento-card p-5 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Tanggapan</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <MessageCircle className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-emerald-600">{stats.total_posts || 0}</p>
                    <p className="text-[11px] text-slate-500">Balasan diskusi</p>
                </div>

                <div className="bento-card p-5 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Kategori</span>
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <BookOpen className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-purple-600">{stats.total_categories || 0}</p>
                    <p className="text-[11px] text-slate-500">Bidang keilmuan</p>
                </div>

                <div className="bento-card p-5 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Anggota Aktif</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Users className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-amber-600">{stats.total_members || 0}</p>
                    <p className="text-[11px] text-slate-500">Guru & siswa</p>
                </div>
            </div>

            {/* Category Cards Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-brand-600" />
                        Kategori Ruang Diskusi
                    </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {categories.map((cat) => {
                        const Icon = getCategoryIcon(cat.icon);
                        return (
                            <Link
                                key={cat.id}
                                href={`/forum/kategori/${cat.slug}`}
                                className="bento-card p-4 flex flex-col justify-between space-y-3 hover:border-brand-300 hover:shadow-md transition-all group"
                            >
                                <div className="w-10 h-10 rounded-2xl bg-slate-100 group-hover:bg-brand-50 text-slate-700 group-hover:text-brand-600 flex items-center justify-center transition-colors">
                                    <Icon className="w-5 h-5" />
                                </div>

                                <div>
                                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-brand-700 transition-colors">
                                        {cat.name}
                                    </h3>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        {cat.threads_count || 0} Diskusi
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Discussions Section: Tabs & Search */}
            <div className="space-y-4">
                <div className="bento-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Tab Switcher */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab('latest')}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                activeTab === 'latest'
                                    ? 'bg-brand-600 text-white shadow-2xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Diskusi Terbaru</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('popular')}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                activeTab === 'popular'
                                    ? 'bg-brand-600 text-white shadow-2xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            <Flame className="w-3.5 h-3.5" />
                            <span>Populer & Ramai</span>
                        </button>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-sm w-full">
                        <Input
                            placeholder="Cari topik diskusi atau pertanyaan..."
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
                {currentThreads.length === 0 ? (
                    <div className="bento-card p-12 text-center space-y-4">
                        <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-slate-800">Belum Ada Topik Diskusi</h3>
                            <p className="text-xs text-slate-500 max-w-md mx-auto">
                                Jadilah yang pertama memulai pembahasan menarik di forum komunitas sekolah!
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {currentThreads.map((thread) => (
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
                                        <Badge variant="neutral" size="sm">
                                            {thread.category?.name}
                                        </Badge>
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
            </div>

            {/* MODAL BUAT DISKUSI BARU */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Buat Topik Diskusi Baru"
                description="Tulis pertanyaan, ulasan, atau materi yang ingin Anda diskusikan bersama komunitas."
                size="lg"
            >
                <form onSubmit={handleCreateThread} className="space-y-4">
                    <Select
                        label="Pilih Kategori Forum"
                        value={createForm.data.category_id}
                        onChange={(e) => createForm.setData('category_id', e.target.value)}
                        error={createForm.errors.category_id}
                        required
                    >
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </Select>

                    <Input
                        label="Judul Topik Diskusi"
                        placeholder="Contoh: Bagaimana cara menghitung integral tentu menggunakan substitusi trigonometri?"
                        value={createForm.data.title}
                        onChange={(e) => createForm.setData('title', e.target.value)}
                        error={createForm.errors.title}
                        required
                    />

                    <Textarea
                        label="Uraian Pembahasan / Pertanyaan"
                        placeholder="Tuliskan latar belakang masalah, contoh soal, atau materi secara jelas dan santun..."
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
