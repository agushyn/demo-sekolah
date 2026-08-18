import React, { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
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
    Flag,
    Shield,
    CheckCircle2,
    XCircle,
    Eye,
    EyeOff,
    Trash2,
    Plus,
    Clock,
    AlertCircle,
    Layers,
} from 'lucide-react';

export default function AdminForumIndex({ reports = [], categories = [], stats = {}, filters = {} }) {
    const { flash } = usePage().props;
    const [activeTab, setActiveTab] = useState('reports'); // reports | categories
    const [statusFilter, setStatusFilter] = useState(filters.report_status || 'pending');

    // Review Report Modal
    const [selectedReport, setSelectedReport] = useState(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const reviewForm = useForm({
        status: 'reviewed',
        admin_notes: '',
        hide_target: true,
    });

    // Create Category Modal
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const categoryForm = useForm({
        name: '',
        description: '',
        icon: 'MessageSquare',
        color: 'brand',
    });

    const handleFilterStatus = (status) => {
        setStatusFilter(status);
        router.get('/admin/forum', { report_status: status }, { preserveState: true, replace: true });
    };

    const openReviewModal = (report) => {
        setSelectedReport(report);
        reviewForm.setData({
            status: 'reviewed',
            admin_notes: '',
            hide_target: true,
        });
        setIsReviewModalOpen(true);
    };

    const handleReviewSubmit = (e) => {
        e.preventDefault();
        if (!selectedReport) return;

        reviewForm.post(`/admin/forum/reports/${selectedReport.id}/review`, {
            onSuccess: () => {
                setIsReviewModalOpen(false);
                setSelectedReport(null);
            },
        });
    };

    const handleToggleHide = (type, id) => {
        router.post('/admin/forum/toggle-hide', {
            type: type.toLowerCase() === 'thread' ? 'thread' : 'post',
            id: id,
        }, { preserveScroll: true });
    };

    const handleCreateCategory = (e) => {
        e.preventDefault();
        categoryForm.post('/admin/forum/categories', {
            onSuccess: () => {
                setIsCategoryModalOpen(false);
                categoryForm.reset();
            },
        });
    };

    const handleDeleteCategory = (catId) => {
        if (confirm('Apakah Anda yakin ingin menghapus kategori ini? Seluruh topik di dalamnya juga akan terhapus.')) {
            router.delete(`/admin/forum/categories/${catId}`);
        }
    };

    return (
        <AdminLayout title="Moderasi Forum Komunitas">
            <Head title="Moderasi Forum & Laporan — Admin Portal" />

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
                            Pusat Moderasi & Kategori Forum
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Pantau laporan pelanggaran, sensor konten bermasalah, dan kelola kategori ruang diskusi.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href="/forum" className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs">
                            Kunjungi Forum Publik →
                        </Link>
                    </div>
                </div>

                {/* 4 Bento Statistics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bento-card p-5 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Laporan Menunggu</span>
                            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                                <Flag className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-rose-600">{stats.pending_reports || 0}</p>
                        <p className="text-[11px] text-slate-500">Perlu ditindaklanjuti</p>
                    </div>

                    <div className="bento-card p-5 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Diskusi</span>
                            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                                <MessageSquare className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats.total_threads || 0}</p>
                        <p className="text-[11px] text-slate-500">Thread diterbitkan</p>
                    </div>

                    <div className="bento-card p-5 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Total Balasan</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-emerald-600">{stats.total_posts || 0}</p>
                        <p className="text-[11px] text-slate-500">Komentar aktif</p>
                    </div>

                    <div className="bento-card p-5 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Disembunyikan</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                <EyeOff className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-amber-600">{stats.hidden_items || 0}</p>
                        <p className="text-[11px] text-slate-500">Disensor dari publik</p>
                    </div>
                </div>

                {/* Tabs Switcher */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('reports')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTab === 'reports'
                                ? 'bg-brand-600 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        <Flag className="w-4 h-4" />
                        <span>Laporan Pelanggaran ({stats.pending_reports || 0})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('categories')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTab === 'categories'
                                ? 'bg-brand-600 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        <Layers className="w-4 h-4" />
                        <span>Kelola Kategori ({categories.length})</span>
                    </button>
                </div>

                {/* TAB 1: REPORTS */}
                {activeTab === 'reports' && (
                    <div className="space-y-4">
                        {/* Filter Status Pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                            {[
                                { id: 'pending', label: 'Menunggu Review' },
                                { id: 'reviewed', label: 'Telah Ditindak' },
                                { id: 'dismissed', label: 'Diabaikan (Valid)' },
                                { id: 'all', label: 'Semua Laporan' },
                            ].map((s) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => handleFilterStatus(s.id)}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                        statusFilter === s.id
                                            ? 'bg-slate-900 text-white shadow-2xs'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>

                        <div className="bento-card p-0 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                                            <th className="py-3 px-4">Tipe & Konten Terlapor</th>
                                            <th className="py-3 px-4">Alasan Pelaporan</th>
                                            <th className="py-3 px-4">Pelapor & Waktu</th>
                                            <th className="py-3 px-4">Status</th>
                                            <th className="py-3 px-4 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {reports.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-12 text-center text-slate-400">
                                                    Tidak ada laporan pelanggaran pada status ini.
                                                </td>
                                            </tr>
                                        ) : (
                                            reports.map((rep) => (
                                                <tr key={rep.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="py-3 px-4 max-w-xs">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-1.5">
                                                                <Badge variant="neutral" size="sm">
                                                                    {rep.reportable_type}
                                                                </Badge>
                                                                {rep.target?.is_hidden && (
                                                                    <Badge variant="danger" size="sm">Disensor</Badge>
                                                                )}
                                                            </div>
                                                            <p className="font-bold text-slate-900 line-clamp-1">
                                                                {rep.target?.title || 'Konten telah dihapus'}
                                                            </p>
                                                            <p className="text-[11px] text-slate-500 line-clamp-2 italic">
                                                                "{rep.target?.content}"
                                                            </p>
                                                        </div>
                                                    </td>

                                                    <td className="py-3 px-4 max-w-xs">
                                                        <p className="text-slate-800 font-semibold leading-relaxed">
                                                            {rep.reason}
                                                        </p>
                                                    </td>

                                                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                                                        <span className="font-bold text-slate-800 block">
                                                            {rep.reporter?.name || 'User'}
                                                        </span>
                                                        {rep.created_at}
                                                    </td>

                                                    <td className="py-3 px-4 whitespace-nowrap">
                                                        <Badge variant={rep.status_badge} size="sm" dot>
                                                            {rep.status}
                                                        </Badge>
                                                    </td>

                                                    <td className="py-3 px-4 whitespace-nowrap text-right space-x-2">
                                                        <Button
                                                            variant="primary"
                                                            size="sm"
                                                            onClick={() => openReviewModal(rep)}
                                                            className="text-xs font-bold"
                                                        >
                                                            Tinjau Laporan
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
                )}

                {/* TAB 2: CATEGORIES */}
                {activeTab === 'categories' && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <Button
                                variant="primary"
                                size="md"
                                leftIcon={Plus}
                                onClick={() => setIsCategoryModalOpen(true)}
                                className="font-bold text-xs"
                            >
                                + Tambah Kategori Baru
                            </Button>
                        </div>

                        <div className="bento-card p-0 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                                            <th className="py-3 px-4">Nama Kategori & Slug</th>
                                            <th className="py-3 px-4">Deskripsi</th>
                                            <th className="py-3 px-4">Ikon & Warna</th>
                                            <th className="py-3 px-4">Jumlah Topik / Balasan</th>
                                            <th className="py-3 px-4 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {categories.map((cat) => (
                                            <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="py-3 px-4">
                                                    <span className="font-bold text-slate-900 block">{cat.name}</span>
                                                    <span className="text-[11px] font-mono text-slate-400">{cat.slug}</span>
                                                </td>
                                                <td className="py-3 px-4 text-slate-600 max-w-sm">
                                                    {cat.description || '-'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge variant={cat.color || 'brand'} size="sm">
                                                        {cat.icon} ({cat.color})
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 font-semibold text-slate-700">
                                                    {cat.threads_count || 0} Topik • {cat.posts_count || 0} Balasan
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteCategory(cat.id)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                                        title="Hapus Kategori"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL TINJAU LAPORAN */}
            <Modal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                title="Keputusan Moderasi Laporan"
                description={`Laporan ID #${selectedReport?.id} untuk ${selectedReport?.reportable_type}`}
                size="md"
            >
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                        <span className="font-bold text-slate-700 block">Alasan Pelapor:</span>
                        <p className="text-slate-600 italic">"{selectedReport?.reason}"</p>
                    </div>

                    <Select
                        label="Keputusan Laporan"
                        value={reviewForm.data.status}
                        onChange={(e) => reviewForm.setData('status', e.target.value)}
                        error={reviewForm.errors.status}
                        required
                    >
                        <option value="reviewed">Ditindak / Pelanggaran Terbukti (Reviewed)</option>
                        <option value="dismissed">Diabaikan / Laporan Tidak Valid (Dismissed)</option>
                    </Select>

                    <label className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={reviewForm.data.hide_target}
                            onChange={(e) => reviewForm.setData('hide_target', e.target.checked)}
                            className="w-4 h-4 text-brand-600 rounded-md focus:ring-brand-500"
                        />
                        <div className="text-xs">
                            <span className="font-bold text-slate-800 block">Sembunyikan (Sensor) Konten Terlapor</span>
                            <span className="text-slate-500">
                                Konten tidak akan dapat dilihat lagi oleh publik di forum.
                            </span>
                        </div>
                    </label>

                    <Textarea
                        label="Catatan Moderator"
                        placeholder="Masukkan alasan keputusan moderasi..."
                        rows={3}
                        value={reviewForm.data.admin_notes}
                        onChange={(e) => reviewForm.setData('admin_notes', e.target.value)}
                        error={reviewForm.errors.admin_notes}
                    />

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                        <Button variant="secondary" size="md" type="button" onClick={() => setIsReviewModalOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            variant="primary"
                            size="md"
                            type="submit"
                            isLoading={reviewForm.processing}
                        >
                            Simpan Keputusan
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* MODAL TAMBAH KATEGORI */}
            <Modal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                title="Tambah Kategori Forum Baru"
                size="md"
            >
                <form onSubmit={handleCreateCategory} className="space-y-4">
                    <Input
                        label="Nama Kategori"
                        placeholder="Contoh: Robotika & Sains Terapan"
                        value={categoryForm.data.name}
                        onChange={(e) => categoryForm.setData('name', e.target.value)}
                        error={categoryForm.errors.name}
                        required
                    />

                    <Textarea
                        label="Deskripsi Kategori"
                        placeholder="Uraian topik bahasan untuk kategori ini..."
                        rows={3}
                        value={categoryForm.data.description}
                        onChange={(e) => categoryForm.setData('description', e.target.value)}
                        error={categoryForm.errors.description}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Ikon"
                            value={categoryForm.data.icon}
                            onChange={(e) => categoryForm.setData('icon', e.target.value)}
                        >
                            <option value="MessageSquare">MessageSquare</option>
                            <option value="Calculator">Calculator</option>
                            <option value="BookOpen">BookOpen</option>
                            <option value="Globe">Globe</option>
                            <option value="FlaskConical">FlaskConical</option>
                            <option value="Sparkles">Sparkles</option>
                        </Select>

                        <Select
                            label="Warna Badge"
                            value={categoryForm.data.color}
                            onChange={(e) => categoryForm.setData('color', e.target.value)}
                        >
                            <option value="brand">Brand (Biru)</option>
                            <option value="emerald">Emerald (Hijau)</option>
                            <option value="amber">Amber (Kuning)</option>
                            <option value="purple">Purple (Ungu)</option>
                            <option value="rose">Rose (Merah)</option>
                            <option value="sky">Sky (Biru Langit)</option>
                        </Select>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                        <Button variant="secondary" size="md" type="button" onClick={() => setIsCategoryModalOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            variant="primary"
                            size="md"
                            type="submit"
                            isLoading={categoryForm.processing}
                        >
                            Simpan Kategori
                        </Button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
