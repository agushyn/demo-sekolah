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
    Calendar as CalendarIcon,
    Plus,
    Search,
    Edit3,
    Trash2,
    Clock,
    MapPin,
    Eye,
    EyeOff,
    CheckCircle2,
    CalendarDays,
    List,
    Grid,
    Sparkles,
    AlertCircle,
    Info,
} from 'lucide-react';

export default function CalendarIndex({ events = [], stats = {}, academicYears = [], activeYear, filters = {}, categories = [] }) {
    const { flash, errors: pageErrors } = usePage().props;
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
    const [selectedVisibility, setSelectedVisibility] = useState(filters.visibility || 'all');

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [deleteEventItem, setDeleteEventItem] = useState(null);

    // Create Form
    const createForm = useForm({
        academic_year_id: activeYear?.id || (academicYears[0]?.id ?? ''),
        title: '',
        description: '',
        start_date: new Date().toISOString().substring(0, 10),
        end_date: '',
        start_time: '08:00',
        end_time: '12:00',
        category: 'academic',
        location: '',
        is_public: true,
    });

    // Edit Form
    const editForm = useForm({
        academic_year_id: activeYear?.id || '',
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        start_time: '',
        end_time: '',
        category: 'academic',
        location: '',
        is_public: true,
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/calendar', {
            search: search || undefined,
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            visibility: selectedVisibility !== 'all' ? selectedVisibility : undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleFilterChange = (cat, vis) => {
        router.get('/admin/calendar', {
            search: search || undefined,
            category: cat !== 'all' ? cat : undefined,
            visibility: vis !== 'all' ? vis : undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const openEditModal = (event) => {
        setEditingEvent(event);
        editForm.setData({
            academic_year_id: event.academic_year_id || activeYear?.id || '',
            title: event.title || '',
            description: event.description || '',
            start_date: event.start_date || '',
            end_date: event.end_date || '',
            start_time: event.start_time ? event.start_time.substring(0, 5) : '',
            end_time: event.end_time ? event.end_time.substring(0, 5) : '',
            category: event.category || 'academic',
            location: event.location || '',
            is_public: !!event.is_public,
        });
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post('/admin/calendar', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editingEvent) return;
        editForm.post(`/admin/calendar/${editingEvent.id}`, {
            onSuccess: () => {
                setEditingEvent(null);
                editForm.reset();
            },
        });
    };

    const confirmDelete = () => {
        if (!deleteEventItem) return;
        router.delete(`/admin/calendar/${deleteEventItem.id}`, {
            onSuccess: () => setDeleteEventItem(null),
        });
    };

    const handleToggleVisibility = (event) => {
        router.post(`/admin/calendar/${event.id}/toggle-visibility`, {}, {
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout title="Manajemen Kalender Akademik">
            <Head title="Manajemen Kalender Akademik — Admin Portal" />

            <div className="space-y-8 max-w-7xl mx-auto">
                {/* Flash Alert */}
                {flash?.success && (
                    <Alert variant="success" title="Berhasil!">
                        {flash.success}
                    </Alert>
                )}

                {/* Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            Kalender & Agenda Sekolah
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Tahun Ajaran Aktif: <strong className="text-brand-700">{activeYear?.name || '2026/2027'} ({activeYear?.semester || 'Ganjil'})</strong>
                        </p>
                    </div>

                    <Button
                        variant="primary"
                        size="md"
                        leftIcon={Plus}
                        onClick={() => setIsCreateModalOpen(true)}
                        className="shadow-md text-xs font-bold shrink-0"
                    >
                        Tambah Agenda Baru
                    </Button>
                </div>

                {/* 1. BENTO STATISTICS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bento-card p-5 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Agenda</span>
                            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                                <CalendarIcon className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats?.total_events || 0}</p>
                        <p className="text-[11px] text-slate-500">Semua kegiatan terdaftar</p>
                    </div>

                    <div className="bento-card p-5 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Mendatang</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <CalendarDays className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-emerald-600">{stats?.upcoming_count || 0}</p>
                        <p className="text-[11px] text-slate-500">Agenda ke depan</p>
                    </div>

                    <div className="bento-card p-5 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">Publik</span>
                            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                                <Eye className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-brand-700">{stats?.public_count || 0}</p>
                        <p className="text-[11px] text-slate-500">Tampil di portal umum</p>
                    </div>

                    <div className="bento-card p-5 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Internal</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                <EyeOff className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-amber-600">{stats?.internal_count || 0}</p>
                        <p className="text-[11px] text-slate-500">Rapat & urusan guru</p>
                    </div>
                </div>

                {/* 2. FILTER & SEARCH BAR */}
                <div className="bento-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* View Switcher & Visibility Filter */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setViewMode('list')}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    viewMode === 'list' ? 'bg-white text-brand-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                <List className="w-3.5 h-3.5" />
                                <span>Tabel</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    viewMode === 'grid' ? 'bg-white text-brand-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                <Grid className="w-3.5 h-3.5" />
                                <span>Kartu</span>
                            </button>
                        </div>

                        {/* Visibility Pills */}
                        <div className="flex items-center gap-1">
                            {[
                                { id: 'all', label: 'Semua' },
                                { id: 'public', label: 'Publik' },
                                { id: 'internal', label: 'Internal' },
                            ].map((vis) => (
                                <button
                                    key={vis.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedVisibility(vis.id);
                                        handleFilterChange(selectedCategory, vis.id);
                                    }}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        selectedVisibility === vis.id
                                            ? 'bg-brand-600 text-white shadow-2xs'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                                    }`}
                                >
                                    {vis.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search & Category Filter */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 max-w-lg w-full">
                        <select
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                handleFilterChange(e.target.value, selectedVisibility);
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
                                placeholder="Cari kegiatan/lokasi..."
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

                {/* 3. CONTENT AREA (LIST VIEW / GRID VIEW) */}
                {events.length === 0 ? (
                    <div className="bento-card p-12 text-center">
                        <EmptyState
                            icon={CalendarDays}
                            title="Tidak Ada Agenda Ditemukan"
                            description="Silakan tambahkan agenda baru atau sesuaikan filter pencarian Anda."
                            actionLabel="Tambah Agenda Baru"
                            onAction={() => setIsCreateModalOpen(true)}
                        />
                    </div>
                ) : viewMode === 'list' ? (
                    /* LIST TABLE */
                    <div className="bento-card overflow-hidden p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                                        <th className="py-3.5 px-4 w-20">Tanggal</th>
                                        <th className="py-3.5 px-4">Nama Kegiatan & Lokasi</th>
                                        <th className="py-3.5 px-4">Kategori</th>
                                        <th className="py-3.5 px-4">Waktu</th>
                                        <th className="py-3.5 px-4">Visibilitas</th>
                                        <th className="py-3.5 px-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {events.map((evt) => (
                                        <tr key={evt.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex flex-col items-center justify-center text-center">
                                                    <span className="text-[10px] font-bold text-brand-600 leading-none">{evt.month}</span>
                                                    <span className="text-base font-black text-brand-900 leading-none mt-0.5">{evt.day}</span>
                                                </div>
                                            </td>

                                            <td className="py-3 px-4 max-w-sm">
                                                <div className="space-y-0.5">
                                                    <p className="font-bold text-slate-900 leading-snug">{evt.title}</p>
                                                    {evt.location && (
                                                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                                            <span>{evt.location}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <Badge variant={evt.badge_color || 'brand'} size="sm">
                                                    {evt.category_label}
                                                </Badge>
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>{evt.formatted_time_range}</span>
                                                </div>
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap">
                                                {evt.is_public ? (
                                                    <Badge variant="success" size="sm" dot>Publik</Badge>
                                                ) : (
                                                    <Badge variant="neutral" size="sm">Internal</Badge>
                                                )}
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap text-right">
                                                <div className="inline-flex items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleVisibility(evt)}
                                                        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors cursor-pointer"
                                                        title={evt.is_public ? 'Ubah ke Internal' : 'Publikasikan ke Publik'}
                                                    >
                                                        {evt.is_public ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(evt)}
                                                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                                        title="Edit Agenda"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteEventItem(evt)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                                        title="Hapus Agenda"
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
                    </div>
                ) : (
                    /* GRID CARD VIEW */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((evt) => (
                            <div
                                key={evt.id}
                                className="bento-card p-6 flex flex-col justify-between space-y-4 hover:-translate-y-1 hover:border-brand-300 transition-all"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex flex-col items-center justify-center shrink-0 text-center">
                                            <span className="text-xs font-bold text-brand-600 leading-none">{evt.month}</span>
                                            <span className="text-lg font-black text-brand-900 leading-none mt-1">{evt.day}</span>
                                        </div>

                                        <div className="flex flex-col items-end gap-1">
                                            <Badge variant={evt.badge_color || 'brand'} size="sm">
                                                {evt.category_label}
                                            </Badge>
                                            {evt.is_public ? (
                                                <span className="text-[10px] text-emerald-600 font-semibold">Publik</span>
                                            ) : (
                                                <span className="text-[10px] text-slate-400 font-semibold">Internal</span>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                                        {evt.title}
                                    </h3>

                                    {evt.description && (
                                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                                            {evt.description}
                                        </p>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                            <span>{evt.formatted_time_range}</span>
                                        </div>
                                        {evt.location && (
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="truncate max-w-[160px]">{evt.location}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(evt)}
                                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDeleteEventItem(evt)}
                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL: TAMBAH AGENDA BARU */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Tambah Agenda Kalender Baru"
                description="Masukkan detail agenda kegiatan, ujian, atau hari libur sekolah."
                size="lg"
            >
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <Input
                        label="Judul Agenda / Kegiatan"
                        placeholder="Contoh: Upacara Bendera HUT RI ke-81"
                        value={createForm.data.title}
                        onChange={(e) => createForm.setData('title', e.target.value)}
                        error={createForm.errors.title}
                        required
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Select
                            label="Kategori Agenda"
                            value={createForm.data.category}
                            onChange={(e) => createForm.setData('category', e.target.value)}
                            error={createForm.errors.category}
                            required
                        >
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </Select>

                        <Input
                            label="Lokasi / Ruangan"
                            placeholder="Contoh: Lapangan Utama / Auditorium"
                            value={createForm.data.location}
                            onChange={(e) => createForm.setData('location', e.target.value)}
                            error={createForm.errors.location}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            type="date"
                            label="Tanggal Mulai"
                            value={createForm.data.start_date}
                            onChange={(e) => createForm.setData('start_date', e.target.value)}
                            error={createForm.errors.start_date}
                            required
                        />

                        <Input
                            type="date"
                            label="Tanggal Selesai (Opsional)"
                            value={createForm.data.end_date}
                            onChange={(e) => createForm.setData('end_date', e.target.value)}
                            error={createForm.errors.end_date}
                            helper="Jika 1 hari saja, kosongkan atau samakan dengan tanggal mulai."
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            type="time"
                            label="Jam Mulai"
                            value={createForm.data.start_time}
                            onChange={(e) => createForm.setData('start_time', e.target.value)}
                            error={createForm.errors.start_time}
                        />

                        <Input
                            type="time"
                            label="Jam Selesai"
                            value={createForm.data.end_time}
                            onChange={(e) => createForm.setData('end_time', e.target.value)}
                            error={createForm.errors.end_time}
                        />
                    </div>

                    <Textarea
                        label="Deskripsi / Catatan Tambahan"
                        placeholder="Detail agenda, instruksi pakaian, atau informasi teknis..."
                        rows={3}
                        value={createForm.data.description}
                        onChange={(e) => createForm.setData('description', e.target.value)}
                        error={createForm.errors.description}
                    />

                    <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                        <input
                            type="checkbox"
                            checked={createForm.data.is_public}
                            onChange={(e) => createForm.setData('is_public', e.target.checked)}
                            className="w-4 h-4 text-brand-600 rounded-md focus:ring-brand-500"
                        />
                        <div className="text-xs">
                            <span className="font-bold text-slate-800 block">Tampilkan di Kalender Publik</span>
                            <span className="text-slate-500">Jika tidak dicentang, hanya dapat dilihat oleh guru & staf admin.</span>
                        </div>
                    </label>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                        <Button variant="secondary" size="md" type="button" onClick={() => setIsCreateModalOpen(false)}>
                            Batal
                        </Button>
                        <Button variant="primary" size="md" type="submit" isLoading={createForm.processing}>
                            Simpan Agenda
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* MODAL: EDIT AGENDA */}
            <Modal
                isOpen={!!editingEvent}
                onClose={() => setEditingEvent(null)}
                title="Edit Agenda Kalender"
                description="Perbarui informasi kegiatan atau jadwal waktu."
                size="lg"
            >
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <Input
                        label="Judul Agenda / Kegiatan"
                        value={editForm.data.title}
                        onChange={(e) => editForm.setData('title', e.target.value)}
                        error={editForm.errors.title}
                        required
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Select
                            label="Kategori Agenda"
                            value={editForm.data.category}
                            onChange={(e) => editForm.setData('category', e.target.value)}
                            error={editForm.errors.category}
                            required
                        >
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </Select>

                        <Input
                            label="Lokasi / Ruangan"
                            value={editForm.data.location}
                            onChange={(e) => editForm.setData('location', e.target.value)}
                            error={editForm.errors.location}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            type="date"
                            label="Tanggal Mulai"
                            value={editForm.data.start_date}
                            onChange={(e) => editForm.setData('start_date', e.target.value)}
                            error={editForm.errors.start_date}
                            required
                        />

                        <Input
                            type="date"
                            label="Tanggal Selesai"
                            value={editForm.data.end_date}
                            onChange={(e) => editForm.setData('end_date', e.target.value)}
                            error={editForm.errors.end_date}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            type="time"
                            label="Jam Mulai"
                            value={editForm.data.start_time}
                            onChange={(e) => editForm.setData('start_time', e.target.value)}
                            error={editForm.errors.start_time}
                        />

                        <Input
                            type="time"
                            label="Jam Selesai"
                            value={editForm.data.end_time}
                            onChange={(e) => editForm.setData('end_time', e.target.value)}
                            error={editForm.errors.end_time}
                        />
                    </div>

                    <Textarea
                        label="Deskripsi / Catatan Tambahan"
                        rows={3}
                        value={editForm.data.description}
                        onChange={(e) => editForm.setData('description', e.target.value)}
                        error={editForm.errors.description}
                    />

                    <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                        <input
                            type="checkbox"
                            checked={editForm.data.is_public}
                            onChange={(e) => editForm.setData('is_public', e.target.checked)}
                            className="w-4 h-4 text-brand-600 rounded-md focus:ring-brand-500"
                        />
                        <div className="text-xs">
                            <span className="font-bold text-slate-800 block">Tampilkan di Kalender Publik</span>
                            <span className="text-slate-500">Jika tidak dicentang, hanya dapat dilihat oleh guru & staf admin.</span>
                        </div>
                    </label>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                        <Button variant="secondary" size="md" type="button" onClick={() => setEditingEvent(null)}>
                            Batal
                        </Button>
                        <Button variant="primary" size="md" type="submit" isLoading={editForm.processing}>
                            Perbarui Agenda
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* MODAL: KONFIRMASI HAPUS */}
            <Modal
                isOpen={!!deleteEventItem}
                onClose={() => setDeleteEventItem(null)}
                title="Konfirmasi Hapus Agenda"
                description={`Apakah Anda yakin ingin menghapus agenda "${deleteEventItem?.title}"?`}
                size="md"
                footer={
                    <>
                        <Button variant="secondary" size="md" onClick={() => setDeleteEventItem(null)}>
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
