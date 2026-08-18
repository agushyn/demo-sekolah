import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import BentoCard from '@/Components/BentoCard';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Select from '@/Components/Select';
import Pagination from '@/Components/Pagination';
import EmptyState from '@/Components/EmptyState';
import Alert from '@/Components/Alert';
import Modal from '@/Components/Modal';
import {
    Newspaper,
    Plus,
    Search,
    Edit3,
    Trash2,
    Eye,
    Clock,
    CheckCircle2,
    FileText,
    Calendar,
    Send,
    Filter,
    ArrowUpRight,
    Sparkles,
} from 'lucide-react';

export default function NewsIndex({ newsList, stats, categories = [], filters = {} }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [deleteModalNews, setDeleteModalNews] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/news', {
            search: search || undefined,
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleFilterChange = (cat, stat) => {
        router.get('/admin/news', {
            search: search || undefined,
            category: cat !== 'all' ? cat : undefined,
            status: stat !== 'all' ? stat : undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const confirmDelete = () => {
        if (!deleteModalNews) return;
        router.delete(`/admin/news/${deleteModalNews.id}`, {
            onSuccess: () => setDeleteModalNews(null),
        });
    };

    const handleToggleStatus = (news) => {
        router.post(`/admin/news/${news.id}/toggle-status`, {}, {
            preserveScroll: true,
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'published':
                return <Badge variant="success" size="sm" dot>Tayang</Badge>;
            case 'draft':
                return <Badge variant="neutral" size="sm">Draft</Badge>;
            case 'scheduled':
                return <Badge variant="warning" size="sm">Terjadwal</Badge>;
            default:
                return <Badge variant="neutral" size="sm">{status}</Badge>;
        }
    };

    return (
        <AdminLayout title="Manajemen Berita & Pengumuman">
            <Head title="Manajemen Berita — Admin Portal" />

            <div className="space-y-8 max-w-7xl mx-auto">
                {/* Flash Alert */}
                {flash?.success && (
                    <Alert variant="success" title="Berhasil!">
                        {flash.success}
                    </Alert>
                )}

                {/* Page Title & Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            Warta & Publikasi Sekolah
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Kelola penerbitan artikel warta, liputan prestasi, pengumuman, dan agenda sekolah.
                        </p>
                    </div>

                    <Link href="/admin/news/create">
                        <Button variant="primary" size="md" leftIcon={Plus} className="shadow-md text-xs font-bold">
                            Tulis Berita Baru
                        </Button>
                    </Link>
                </div>

                {/* 1. BENTO STATISTICS CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bento-card p-5 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Berita</span>
                            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                                <Newspaper className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats?.total_news || 0}</p>
                        <p className="text-[11px] text-slate-500">Artikel dalam database</p>
                    </div>

                    <div className="bento-card p-5 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Published</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-emerald-600">{stats?.published_count || 0}</p>
                        <p className="text-[11px] text-slate-500">Aktif tayang di portal</p>
                    </div>

                    <div className="bento-card p-5 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Draft</span>
                            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                                <FileText className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-slate-700">{stats?.draft_count || 0}</p>
                        <p className="text-[11px] text-slate-500">Belum dipublikasikan</p>
                    </div>

                    <div className="bento-card p-5 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Scheduled</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                <Clock className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-amber-600">{stats?.scheduled_count || 0}</p>
                        <p className="text-[11px] text-slate-500">Menunggu jadwal tayang</p>
                    </div>
                </div>

                {/* 2. FILTER & SEARCH BAR */}
                <div className="bento-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Status Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                        {[
                            { id: 'all', label: 'Semua Status' },
                            { id: 'published', label: 'Tayang' },
                            { id: 'draft', label: 'Draft' },
                            { id: 'scheduled', label: 'Terjadwal' },
                        ].map((stat) => (
                            <button
                                key={stat.id}
                                type="button"
                                onClick={() => {
                                    setSelectedStatus(stat.id);
                                    handleFilterChange(selectedCategory, stat.id);
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                    selectedStatus === stat.id
                                        ? 'bg-brand-600 text-white shadow-2xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                                }`}
                            >
                                {stat.label}
                            </button>
                        ))}
                    </div>

                    {/* Search & Category Filter */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 max-w-lg w-full">
                        <select
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                handleFilterChange(e.target.value, selectedStatus);
                            }}
                            className="w-full sm:w-44 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                        >
                            <option value="all">Semua Kategori</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>

                        <form onSubmit={handleSearch} className="flex items-center gap-1.5 w-full">
                            <Input
                                placeholder="Cari judul berita..."
                                leftIcon={Search}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full text-xs"
                            />
                            <Button type="submit" variant="secondary" size="md" className="shrink-0 text-xs">
                                Cari
                            </Button>
                        </form>
                    </div>
                </div>

                {/* 3. NEWS TABLE BENTO */}
                <div className="bento-card overflow-hidden p-0">
                    {newsList?.data?.length === 0 ? (
                        <div className="p-12">
                            <EmptyState
                                icon={Newspaper}
                                title="Belum Ada Berita Ditemukan"
                                description="Silakan buat berita baru atau sesuaikan filter pencarian Anda."
                                actionLabel="Tulis Berita Baru"
                                onAction={() => router.get('/admin/news/create')}
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                                        <th className="py-3.5 px-4 w-16">Thumbnail</th>
                                        <th className="py-3.5 px-4">Judul & Ringkasan</th>
                                        <th className="py-3.5 px-4">Kategori</th>
                                        <th className="py-3.5 px-4">Status</th>
                                        <th className="py-3.5 px-4">Penulis & Tanggal</th>
                                        <th className="py-3.5 px-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {newsList.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                                    <img
                                                        src={item.thumbnail_url || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=150&q=80'}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </td>

                                            <td className="py-3 px-4 max-w-xs sm:max-w-md">
                                                <div className="space-y-0.5">
                                                    <p className="font-bold text-slate-900 leading-snug line-clamp-1">
                                                        {item.title}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 line-clamp-1">
                                                        {item.excerpt}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <Badge variant={item.category?.color || 'brand'} size="sm">
                                                    {item.category?.name || 'Umum'}
                                                </Badge>
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap">
                                                {getStatusBadge(item.status)}
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                                                <p className="font-semibold text-slate-700">{item.author?.name || 'Admin'}</p>
                                                <p className="text-[10px] text-slate-400">{item.formatted_date}</p>
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap text-right">
                                                <div className="inline-flex items-center gap-1.5">
                                                    {item.status === 'published' && (
                                                        <a
                                                            href={`/berita/${item.slug}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                                            title="Lihat di Website Publik"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </a>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleStatus(item)}
                                                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                                        title={item.status === 'published' ? 'Ubah ke Draft' : 'Publikasikan Sekarang'}
                                                    >
                                                        <Send className="w-4 h-4" />
                                                    </button>

                                                    <Link
                                                        href={`/admin/news/${item.id}/edit`}
                                                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                        title="Edit Berita"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteModalNews(item)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                                        title="Hapus Berita"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {newsList?.links && newsList.links.length > 3 && (
                        <div className="p-4 border-t border-slate-100 flex justify-center">
                            <Pagination links={newsList.links} />
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Konfirmasi Hapus */}
            <Modal
                isOpen={!!deleteModalNews}
                onClose={() => setDeleteModalNews(null)}
                title="Konfirmasi Hapus Berita"
                description={`Apakah Anda yakin ingin menghapus berita "${deleteModalNews?.title}"? Tindakan ini tidak dapat dibatalkan.`}
                size="md"
                footer={
                    <>
                        <Button variant="secondary" size="md" onClick={() => setDeleteModalNews(null)}>
                            Batal
                        </Button>
                        <Button variant="danger" size="md" onClick={confirmDelete}>
                            Hapus Sekarang
                        </Button>
                    </>
                }
            />
        </AdminLayout>
    );
}
