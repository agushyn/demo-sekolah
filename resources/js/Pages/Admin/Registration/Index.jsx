import React, { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import BentoCard from '@/Components/BentoCard';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Alert from '@/Components/Alert';
import Pagination from '@/Components/Pagination';
import Modal from '@/Components/Modal';
import {
    UserCheck,
    Users,
    Clock,
    CheckCircle2,
    XCircle,
    Search,
    Download,
    Eye,
    Settings,
    Calendar,
    FileSpreadsheet,
    Sparkles,
    Shield,
    Info,
    ChevronRight,
} from 'lucide-react';

export default function RegistrationAdminIndex({ registrations, stats = {}, settings = {}, filters = {} }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    // Settings Form
    const settingsForm = useForm({
        registration_enabled: !!settings.registration_enabled,
        registration_start: settings.registration_start || '',
        registration_end: settings.registration_end || '',
        registration_announcement: settings.registration_announcement || 'Info PPDB 2026/2027',
        registration_announcement_text: settings.registration_announcement_text || 'Pendaftaran Siswa Baru Gelombang I Telah Dibuka!',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/registrations', {
            search: search || undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleStatusFilterChange = (status) => {
        setStatusFilter(status);
        router.get('/admin/registrations', {
            search: search || undefined,
            status: status !== 'all' ? status : undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSettingsSubmit = (e) => {
        e.preventDefault();
        settingsForm.post('/admin/registrations/settings', {
            onSuccess: () => setIsSettingsModalOpen(false),
        });
    };

    const dataList = registrations?.data || [];
    const paginationLinks = registrations?.links || [];

    return (
        <AdminLayout title="Manajemen PPDB Online">
            <Head title="Manajemen Pendaftaran Siswa Baru (PPDB) — Admin Portal" />

            <div className="space-y-8 max-w-7xl mx-auto">
                {/* Flash Notice */}
                {flash?.success && (
                    <Alert variant="success" title="Berhasil!">
                        {flash.success}
                    </Alert>
                )}

                {/* Top Header & Settings Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                Penerimaan Peserta Didik Baru (PPDB)
                            </h2>
                            {settings.registration_enabled ? (
                                <Badge variant="success" size="sm" dot>Sistem Dibuka</Badge>
                            ) : (
                                <Badge variant="danger" size="sm" dot>Sistem Ditutup</Badge>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Kelola berkas calon siswa baru, verifikasi dokumen persyaratan, dan seleksi penerimaan.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <a
                            href="/admin/registrations/export-csv"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors shadow-2xs"
                        >
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                            <span>Ekspor CSV</span>
                        </a>

                        <Button
                            variant="secondary"
                            size="md"
                            leftIcon={Settings}
                            onClick={() => setIsSettingsModalOpen(true)}
                            className="text-xs font-bold shadow-2xs"
                        >
                            Pengaturan PPDB
                        </Button>
                    </div>
                </div>

                {/* 1. BENTO KPI STATS */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bento-card p-5 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Pendaftar</span>
                            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                                <Users className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats.total || 0}</p>
                        <p className="text-[11px] text-slate-500">Semua berkas masuk</p>
                    </div>

                    <div className="bento-card p-5 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Menunggu</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                <Clock className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-amber-600">{stats.pending || 0}</p>
                        <p className="text-[11px] text-slate-500">Belum diverifikasi</p>
                    </div>

                    <div className="bento-card p-5 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">Ditinjau</span>
                            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                                <Search className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-brand-700">{stats.review || 0}</p>
                        <p className="text-[11px] text-slate-500">Pemeriksaan berkas</p>
                    </div>

                    <div className="bento-card p-5 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Diterima</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-emerald-600">{stats.accepted || 0}</p>
                        <p className="text-[11px] text-slate-500">Lolos seleksi masuk</p>
                    </div>

                    <div className="bento-card p-5 space-y-1 col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Ditolak</span>
                            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                                <XCircle className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-rose-600">{stats.rejected || 0}</p>
                        <p className="text-[11px] text-slate-500">Tidak memenuhi syarat</p>
                    </div>
                </div>

                {/* 2. FILTER & SEARCH BAR */}
                <div className="bento-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Status Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                        {[
                            { id: 'all', label: 'Semua Status' },
                            { id: 'pending', label: 'Menunggu' },
                            { id: 'review', label: 'Ditinjau' },
                            { id: 'accepted', label: 'Diterima' },
                            { id: 'rejected', label: 'Ditolak' },
                        ].map((s) => (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => handleStatusFilterChange(s.id)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                    statusFilter === s.id
                                        ? 'bg-brand-600 text-white shadow-2xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                                }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-sm w-full">
                        <Input
                            placeholder="Cari No Reg / Nama / NIK..."
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

                {/* 3. REGISTRATIONS TABLE */}
                <div className="bento-card overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                                    <th className="py-3.5 px-4">No. Pendaftaran</th>
                                    <th className="py-3.5 px-4">Nama Lengkap & Kontak</th>
                                    <th className="py-3.5 px-4">NIK & Gender</th>
                                    <th className="py-3.5 px-4">Status Verifikasi</th>
                                    <th className="py-3.5 px-4">Waktu Daftar</th>
                                    <th className="py-3.5 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {dataList.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-10 text-center text-slate-400">
                                            Tidak ada data pendaftaran yang sesuai kriteria pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    dataList.map((reg) => (
                                        <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3 px-4 font-mono font-bold text-brand-700 whitespace-nowrap">
                                                {reg.registration_number}
                                            </td>

                                            <td className="py-3 px-4 max-w-xs">
                                                <div className="space-y-0.5">
                                                    <p className="font-bold text-slate-900 leading-snug">{reg.full_name}</p>
                                                    <p className="text-[11px] text-slate-500">{reg.phone} • {reg.email}</p>
                                                </div>
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <div className="space-y-0.5">
                                                    <p className="font-mono text-slate-800">{reg.nik}</p>
                                                    <p className="text-[11px] text-slate-400">{reg.gender_label}</p>
                                                </div>
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <Badge variant={reg.status_badge || 'warning'} size="sm" dot>
                                                    {reg.status_label}
                                                </Badge>
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                                                {reg.formatted_created_at}
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap text-right">
                                                <Link
                                                    href={`/admin/registrations/${reg.id}`}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors font-bold text-xs"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>Detail & Berkas</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {paginationLinks.length > 3 && (
                        <div className="p-4 border-t border-slate-100 flex justify-center">
                            <Pagination links={paginationLinks} />
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL: PENGATURAN SISTEM PPDB */}
            <Modal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                title="Pengaturan Sistem PPDB Online"
                description="Atur status penerimaan pendaftaran online dan batas waktu gelombang."
                size="md"
            >
                <form onSubmit={handleSettingsSubmit} className="space-y-4">
                    <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                        <div>
                            <span className="text-xs font-bold text-slate-900 block">Status Pendaftaran Online</span>
                            <span className="text-[11px] text-slate-500">
                                {settingsForm.data.registration_enabled
                                    ? 'Pendaftaran aktif dan formulir dapat diakses publik.'
                                    : 'Pendaftaran ditutup dan menampilkan halaman informasi.'}
                            </span>
                        </div>
                        <input
                            type="checkbox"
                            checked={settingsForm.data.registration_enabled}
                            onChange={(e) => settingsForm.setData('registration_enabled', e.target.checked)}
                            className="w-5 h-5 text-brand-600 rounded-md focus:ring-brand-500"
                        />
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            type="date"
                            label="Tanggal Mulai Gelombang"
                            value={settingsForm.data.registration_start}
                            onChange={(e) => settingsForm.setData('registration_start', e.target.value)}
                            error={settingsForm.errors.registration_start}
                        />

                        <Input
                            type="date"
                            label="Batas Akhir Gelombang"
                            value={settingsForm.data.registration_end}
                            onChange={(e) => settingsForm.setData('registration_end', e.target.value)}
                            error={settingsForm.errors.registration_end}
                        />
                    </div>

                    <div className="space-y-4 pt-2 border-t border-slate-100">
                        <Input
                            label="Label Pengumuman Top Bar"
                            placeholder="cth. Info PPDB 2026/2027"
                            value={settingsForm.data.registration_announcement}
                            onChange={(e) => settingsForm.setData('registration_announcement', e.target.value)}
                            error={settingsForm.errors.registration_announcement}
                        />

                        <Input
                            label="Teks Informasi Pengumuman Top Bar"
                            placeholder="cth. Pendaftaran Siswa Baru Gelombang I Telah Dibuka!"
                            value={settingsForm.data.registration_announcement_text}
                            onChange={(e) => settingsForm.setData('registration_announcement_text', e.target.value)}
                            error={settingsForm.errors.registration_announcement_text}
                        />
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                        <Button variant="secondary" size="md" type="button" onClick={() => setIsSettingsModalOpen(false)}>
                            Batal
                        </Button>
                        <Button variant="primary" size="md" type="submit" isLoading={settingsForm.processing}>
                            Simpan Pengaturan
                        </Button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
