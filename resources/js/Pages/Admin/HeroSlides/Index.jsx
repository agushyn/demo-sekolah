import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import BentoCard from '@/Components/BentoCard';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Select from '@/Components/Select';
import EmptyState from '@/Components/EmptyState';
import Alert from '@/Components/Alert';
import Modal from '@/Components/Modal';
import {
    Sliders,
    Plus,
    Search,
    Edit3,
    Trash2,
    Eye,
    Clock,
    CheckCircle2,
    XCircle,
    ArrowRight,
    MoveUp,
    Sparkles,
    Layers,
    AlignLeft,
    AlignCenter,
    AlignRight,
    ExternalLink,
} from 'lucide-react';

export default function HeroSlidesIndex({ slides = [], stats = {}, filters = {} }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [deleteModalSlide, setDeleteModalSlide] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/hero-slides', {
            search: search || undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleFilterChange = (status) => {
        setStatusFilter(status);
        router.get('/admin/hero-slides', {
            search: search || undefined,
            status: status !== 'all' ? status : undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const confirmDelete = () => {
        if (deleteModalSlide) {
            router.delete(`/admin/hero-slides/${deleteModalSlide.id}`, {
                onSuccess: () => setDeleteModalSlide(null),
            });
        }
    };

    const handleToggleActive = (slide) => {
        router.post(`/admin/hero-slides/${slide.id}/toggle-active`, {}, {
            preserveScroll: true,
        });
    };

    const getPositionIcon = (pos) => {
        if (pos === 'center') return <AlignCenter className="w-3.5 h-3.5" />;
        if (pos === 'right') return <AlignRight className="w-3.5 h-3.5" />;
        return <AlignLeft className="w-3.5 h-3.5" />;
    };

    return (
        <AdminLayout title="Manajemen Hero Slider">
            <Head title="Hero Slider — Admin Portal" />

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Flash Feedback */}
                {flash?.success && (
                    <Alert variant="success" dismissible>
                        {flash.success}
                    </Alert>
                )}
                {flash?.error && (
                    <Alert variant="error" dismissible>
                        {flash.error}
                    </Alert>
                )}

                {/* Top Header & Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Badge variant="brand" size="sm">
                                Homepage Banner
                            </Badge>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                            Hero Carousel Slider
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            Kelola slide visual utama, teks promosi, tombol CTA, dan durasi transisi pada halaman depan website.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/" target="_blank">
                            <Button variant="secondary" size="md" leftIcon={Eye}>
                                Preview Website
                            </Button>
                        </Link>
                        <Link href="/admin/hero-slides/create">
                            <Button variant="primary" size="md" leftIcon={Plus} className="shadow-md shadow-brand-600/20">
                                Tambah Slide Baru
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* 1. Bento Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div className="bento-card p-5 flex items-center justify-between bg-white border border-slate-200/80 shadow-xs">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Slide</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.total_slides || 0}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
                            <Sliders className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bento-card p-5 flex items-center justify-between bg-white border border-slate-200/80 shadow-xs">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Slide Aktif</p>
                            <h3 className="text-2xl font-black text-emerald-600 mt-1">{stats.active_slides || 0}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bento-card p-5 flex items-center justify-between bg-white border border-slate-200/80 shadow-xs">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Slide Nonaktif</p>
                            <h3 className="text-2xl font-black text-amber-600 mt-1">{stats.inactive_slides || 0}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                            <XCircle className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bento-card p-5 flex items-center justify-between bg-white border border-slate-200/80 shadow-xs">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rata-rata Durasi</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.avg_duration || 5}s</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* 2. Filter Bar */}
                <div className="bento-card p-4 sm:p-5 bg-white border border-slate-200/80 shadow-xs">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="w-full sm:w-80">
                            <Input
                                placeholder="Cari judul, subtitle, deskripsi..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                leftIcon={Search}
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <span className="text-xs font-semibold text-slate-500">Status:</span>
                            <div className="flex rounded-xl bg-slate-100 p-1">
                                {[
                                    { key: 'all', label: 'Semua' },
                                    { key: 'active', label: 'Aktif' },
                                    { key: 'inactive', label: 'Nonaktif' },
                                ].map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => handleFilterChange(item.key)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                            statusFilter === item.key
                                                ? 'bg-white text-slate-900 shadow-xs'
                                                : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </form>
                </div>

                {/* 3. Slide Cards Grid */}
                {slides.length === 0 ? (
                    <EmptyState
                        icon={Sliders}
                        title="Belum Ada Slide Hero"
                        description="Tambahkan slide banner pertama untuk ditampilkan pada carousel halaman depan sekolah."
                        action={
                            <Link href="/admin/hero-slides/create">
                                <Button variant="primary" size="md" leftIcon={Plus}>
                                    Tambah Slide Pertama
                                </Button>
                            </Link>
                        }
                    />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {slides.map((slide) => (
                            <div
                                key={slide.id}
                                className={`bento-card bg-white border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                                    slide.is_active
                                        ? 'border-slate-200/90 shadow-sm hover:shadow-md hover:border-brand-300'
                                        : 'border-slate-200/60 opacity-75 bg-slate-50/50'
                                }`}
                            >
                                {/* Slide Header Image Preview */}
                                <div className="relative h-48 sm:h-56 bg-slate-900 overflow-hidden group">
                                    <img
                                        src={slide.image_url}
                                        alt={slide.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80';
                                        }}
                                    />
                                    {/* Overlay */}
                                    <div
                                        className={`absolute inset-0 ${
                                            slide.overlay_type === 'dark'
                                                ? 'bg-slate-950/70'
                                                : slide.overlay_type === 'light'
                                                ? 'bg-white/70'
                                                : 'bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent'
                                        }`}
                                    />

                                    {/* Badges on Top of Image */}
                                    <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
                                        <Badge variant="brand" size="sm" className="backdrop-blur-md bg-white/90 text-slate-900 border-none font-bold">
                                            Urutan #{slide.sort_order}
                                        </Badge>
                                        <Badge variant="neutral" size="sm" className="backdrop-blur-md bg-black/50 text-white border-none">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {slide.duration / 1000}s
                                        </Badge>
                                    </div>

                                    <div className="absolute top-3 right-3 flex items-center gap-2">
                                        <Badge
                                            variant={slide.is_active ? 'success' : 'neutral'}
                                            size="sm"
                                            dot
                                            className="backdrop-blur-md bg-white/90"
                                        >
                                            {slide.is_active ? 'Aktif Tayang' : 'Nonaktif'}
                                        </Badge>
                                    </div>

                                    {/* Live Content Overlay Preview */}
                                    <div className={`absolute inset-x-4 bottom-4 text-white z-10 space-y-1 ${
                                        slide.text_position === 'center'
                                            ? 'text-center'
                                            : slide.text_position === 'right'
                                            ? 'text-right'
                                            : 'text-left'
                                    }`}>
                                        {slide.subtitle && (
                                            <p className="text-[11px] font-semibold text-brand-300 uppercase tracking-wider">
                                                {slide.subtitle}
                                            </p>
                                        )}
                                        <h4 className="text-base sm:text-lg font-bold line-clamp-2 leading-tight drop-shadow-sm">
                                            {slide.title}
                                        </h4>
                                    </div>
                                </div>

                                {/* Slide Body Details */}
                                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                    <div className="space-y-3">
                                        {slide.description ? (
                                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                                {slide.description}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-slate-400 italic">Tidak ada deskripsi</p>
                                        )}

                                        {/* Meta Tags */}
                                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 pt-1">
                                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 font-medium">
                                                {getPositionIcon(slide.text_position)}
                                                Posisi: {slide.text_position}
                                            </span>
                                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 font-medium">
                                                <Layers className="w-3.5 h-3.5" />
                                                Overlay: {slide.overlay_type}
                                            </span>
                                        </div>

                                        {/* Buttons Info */}
                                        <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                                            {slide.button_text && (
                                                <div className="flex items-center justify-between text-slate-700">
                                                    <span className="font-semibold flex items-center gap-1.5 text-brand-600">
                                                        <ArrowRight className="w-3.5 h-3.5" /> Tombol Utama:
                                                    </span>
                                                    <span className="font-medium truncate max-w-[200px]" title={slide.button_url}>
                                                        {slide.button_text} ({slide.button_url || '-'})
                                                    </span>
                                                </div>
                                            )}
                                            {slide.secondary_button_text && (
                                                <div className="flex items-center justify-between text-slate-700">
                                                    <span className="font-semibold flex items-center gap-1.5 text-slate-500">
                                                        <ArrowRight className="w-3.5 h-3.5" /> Tombol Kedua:
                                                    </span>
                                                    <span className="font-medium truncate max-w-[200px]" title={slide.secondary_button_url}>
                                                        {slide.secondary_button_text} ({slide.secondary_button_url || '-'})
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons Footer */}
                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={() => handleToggleActive(slide)}
                                            className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                                                slide.is_active
                                                    ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                                                    : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                                            }`}
                                        >
                                            {slide.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                        </button>

                                        <div className="flex items-center gap-2">
                                            <Link href={`/admin/hero-slides/${slide.id}/edit`}>
                                                <Button variant="secondary" size="sm" leftIcon={Edit3}>
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                leftIcon={Trash2}
                                                onClick={() => setDeleteModalSlide(slide)}
                                            >
                                                Hapus
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Konfirmasi Hapus */}
            <Modal
                isOpen={!!deleteModalSlide}
                onClose={() => setDeleteModalSlide(null)}
                title="Konfirmasi Hapus Slide"
                description={`Apakah Anda yakin ingin menghapus slide "${deleteModalSlide?.title}"? Tindakan ini tidak dapat dibatalkan.`}
                size="md"
                footer={
                    <>
                        <Button variant="secondary" size="md" onClick={() => setDeleteModalSlide(null)}>
                            Batal
                        </Button>
                        <Button variant="danger" size="md" onClick={confirmDelete}>
                            Ya, Hapus Slide
                        </Button>
                    </>
                }
            >
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-700">
                    Gambar dan data slide terkait akan dihapus secara permanen dari server.
                </div>
            </Modal>
        </AdminLayout>
    );
}
