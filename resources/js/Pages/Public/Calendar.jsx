import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import Badge from '@/Components/Badge';
import Input from '@/Components/Input';
import Button from '@/Components/Button';
import EmptyState from '@/Components/EmptyState';
import Modal from '@/Components/Modal';
import {
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    CalendarDays,
    List,
    Grid,
    Search,
    Info,
    ChevronRight,
    Sparkles,
} from 'lucide-react';

export default function CalendarPage({ events = [], categories = [], currentCategory = 'Semua', activeYear }) {
    const { school } = usePage().props;
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
    const [search, setSearch] = useState('');
    const [selectedEventModal, setSelectedEventModal] = useState(null);

    const schoolName = school?.name || 'SMK Triwijaya';

    const handleCategoryClick = (catId) => {
        router.get('/kalender', {
            category: catId !== 'Semua' ? catId : undefined,
            search: search || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/kalender', {
            category: currentCategory !== 'Semua' ? currentCategory : undefined,
            search: search || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <PublicLayout>
            <Head>
                <title>Kalender Akademik & Agenda Sekolah</title>
                <meta
                    name="description"
                    content={`Jadwal kalender akademik tahun ajaran ${activeYear?.name || '2026/2027'}, agenda kegiatan, ujian, dan hari libur sekolah di ${schoolName}.`}
                />
            </Head>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
                {/* Header Bento Banner */}
                <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-brand-700 via-brand-800 to-slate-900 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 space-y-4 max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
                            <CalendarIcon className="w-3.5 h-3.5 text-amber-300" />
                            <span>Tahun Ajaran {activeYear?.name || '2026/2027'} ({activeYear?.semester || 'Ganjil'})</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                            Kalender Akademik & Agenda
                        </h1>
                        <p className="text-xs sm:text-sm text-brand-100 leading-relaxed">
                            Pantau jadwal penting seperti awal semester, asesmen berkala, pekan ujian, kegiatan kesiswaan, hingga hari libur nasional.
                        </p>
                    </div>
                </div>

                {/* Filter & View Switcher Bar */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                        {categories.map((cat) => {
                            const isSelected = currentCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => handleCategoryClick(cat.id)}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                        isSelected
                                            ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/25'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            );
                        })}
                    </div>

                    {/* View Switcher & Search */}
                    <div className="flex items-center gap-2 max-w-md w-full">
                        <form onSubmit={handleSearch} className="flex items-center gap-1.5 w-full">
                            <Input
                                placeholder="Cari agenda..."
                                leftIcon={Search}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full text-xs"
                            />
                            <Button type="submit" variant="secondary" size="md" className="shrink-0 text-xs">
                                Cari
                            </Button>
                        </form>

                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl shrink-0">
                            <button
                                type="button"
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-xl transition-all cursor-pointer ${
                                    viewMode === 'list' ? 'bg-white text-brand-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                                }`}
                                title="Tampilan Daftar"
                            >
                                <List className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-xl transition-all cursor-pointer ${
                                    viewMode === 'grid' ? 'bg-white text-brand-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                                }`}
                                title="Tampilan Kartu Bento"
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Calendar Content */}
                {events.length === 0 ? (
                    <EmptyState
                        icon={CalendarDays}
                        title="Tidak Ada Agenda Pada Kategori Ini"
                        description="Pilih kategori lain untuk melihat agenda kegiatan sekolah."
                        actionLabel="Lihat Semua Agenda"
                        onAction={() => handleCategoryClick('Semua')}
                    />
                ) : viewMode === 'list' ? (
                    /* LIST VIEW */
                    <div className="space-y-4">
                        {events.map((evt) => (
                            <div
                                key={evt.id}
                                onClick={() => setSelectedEventModal(evt)}
                                className="bento-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-brand-300 hover:shadow-md transition-all cursor-pointer"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex flex-col items-center justify-center shrink-0 text-center">
                                        <span className="text-xs font-bold text-brand-600 leading-none">{evt.month}</span>
                                        <span className="text-lg font-black text-brand-900 leading-none mt-1">{evt.day}</span>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={evt.badge_color || 'brand'} size="sm">
                                                {evt.category_label}
                                            </Badge>
                                            <span className="text-xs text-slate-400 font-medium">
                                                {evt.formatted_date_range}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                                            {evt.title}
                                        </h3>
                                        {evt.description && (
                                            <p className="text-xs text-slate-600 line-clamp-1 max-w-2xl">
                                                {evt.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex sm:flex-col items-end justify-between gap-2 shrink-0 text-xs text-slate-500 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{evt.formatted_time_range}</span>
                                    </span>
                                    {evt.location && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="truncate max-w-[160px]">{evt.location}</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* GRID VIEW */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((evt) => (
                            <div
                                key={evt.id}
                                onClick={() => setSelectedEventModal(evt)}
                                className="bento-card p-6 flex flex-col justify-between space-y-4 hover:border-brand-300 hover:-translate-y-1 transition-all cursor-pointer"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex flex-col items-center justify-center shrink-0 text-center">
                                            <span className="text-xs font-bold text-brand-600 leading-none">{evt.month}</span>
                                            <span className="text-lg font-black text-brand-900 leading-none mt-1">{evt.day}</span>
                                        </div>

                                        <Badge variant={evt.badge_color || 'brand'} size="sm">
                                            {evt.category_label}
                                        </Badge>
                                    </div>

                                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                                        {evt.title}
                                    </h3>

                                    {evt.description && (
                                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                                            {evt.description}
                                        </p>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-slate-100 space-y-1 text-xs text-slate-500">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{evt.formatted_time_range}</span>
                                    </div>
                                    {evt.location && (
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                            <span>{evt.location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Academic Year Info Banner */}
                <div className="bento-card p-6 sm:p-8 bg-gradient-to-br from-slate-900 to-brand-950 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="space-y-2 max-w-2xl">
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-300">
                            <Info className="w-4 h-4" /> Kalender Resmi Terintegrasi
                        </div>
                        <h3 className="text-lg font-bold">Sinkronisasi Kalender Pembelajaran</h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            Jadwal ujian, pengumpulan tugas, dan libur akademik disinkronkan secara otomatis ke akun portal siswa dan wali murid.
                        </p>
                    </div>

                    <Link href="/login" className="shrink-0">
                        <Button variant="primary" size="md" className="bg-brand-500 hover:bg-brand-400 font-bold text-xs">
                            Buka Portal Belajar
                        </Button>
                    </Link>
                </div>
            </div>

            {/* MODAL: DETAIL EVENT */}
            <Modal
                isOpen={!!selectedEventModal}
                onClose={() => setSelectedEventModal(null)}
                title={selectedEventModal?.title}
                description={`Kategori: ${selectedEventModal?.category_label || ''}`}
                size="md"
                footer={
                    <Button variant="secondary" size="md" onClick={() => setSelectedEventModal(null)}>
                        Tutup
                    </Button>
                }
            >
                <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                    <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                        <div>
                            <span className="text-[11px] text-slate-400 font-bold uppercase block">Tanggal</span>
                            <span className="font-semibold text-slate-800">{selectedEventModal?.formatted_date_range}</span>
                        </div>
                        <div>
                            <span className="text-[11px] text-slate-400 font-bold uppercase block">Waktu</span>
                            <span className="font-semibold text-slate-800">{selectedEventModal?.formatted_time_range}</span>
                        </div>
                    </div>

                    {selectedEventModal?.location && (
                        <div>
                            <span className="text-xs text-slate-400 font-bold uppercase block mb-1">Lokasi / Ruangan</span>
                            <p className="font-semibold text-slate-800">{selectedEventModal.location}</p>
                        </div>
                    )}

                    {selectedEventModal?.description && (
                        <div>
                            <span className="text-xs text-slate-400 font-bold uppercase block mb-1">Deskripsi Kegiatan</span>
                            <p className="text-slate-600 leading-relaxed">{selectedEventModal.description}</p>
                        </div>
                    )}
                </div>
            </Modal>
        </PublicLayout>
    );
}
