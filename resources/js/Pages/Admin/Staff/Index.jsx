import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import BentoCard from '@/Components/BentoCard';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Alert from '@/Components/Alert';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import EmptyState from '@/Components/EmptyState';
import {
    Users,
    UserCheck,
    UserX,
    GraduationCap,
    Briefcase,
    Plus,
    Search,
    Edit2,
    Trash2,
    Power,
    CheckCircle2,
    XCircle,
    Eye,
    Mail,
    Phone,
    BookOpen,
    Sparkles,
    Shield,
    ChevronRight,
} from 'lucide-react';

export default function StaffIndex({ staff, stats = {}, filters = {} }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/guru-staff', {
            search: search || undefined,
            category: categoryFilter !== 'all' ? categoryFilter : undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleCategoryChange = (cat) => {
        setCategoryFilter(cat);
        router.get('/admin/guru-staff', {
            search: search || undefined,
            category: cat !== 'all' ? cat : undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleStatusChange = (st) => {
        setStatusFilter(st);
        router.get('/admin/guru-staff', {
            search: search || undefined,
            category: categoryFilter !== 'all' ? categoryFilter : undefined,
            status: st !== 'all' ? st : undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleToggleActive = (member) => {
        router.post(`/admin/guru-staff/${member.id}/toggle-active`, {}, {
            preserveScroll: true,
        });
    };

    const confirmDelete = (member) => {
        setSelectedStaff(member);
        setDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (!selectedStaff) return;
        router.delete(`/admin/guru-staff/${selectedStaff.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModalOpen(false);
                setSelectedStaff(null);
            },
        });
    };

    const staffList = staff?.data || [];

    return (
        <AdminLayout title="Manajemen Guru & Staf">
            <Head title="Manajemen Direktori Guru & Staf — Admin Portal" />

            <div className="space-y-8 max-w-7xl mx-auto">
                {/* Flash Messages */}
                {flash?.success && (
                    <Alert variant="success" title="Berhasil!">
                        {flash.success}
                    </Alert>
                )}

                {/* Header & Add Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                            <Users className="w-6 h-6 text-brand-600" />
                            <span>Direktori Guru & Staf Kependidikan</span>
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Kelola profil tenaga pendidik, pimpinan sekolah, dan staf administrasi untuk ditampilkan di website publik.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/guru" target="_blank" className="hidden sm:inline-flex">
                            <Button variant="secondary" size="md" leftIcon={Eye} className="text-xs">
                                Lihat Publik
                            </Button>
                        </Link>
                        <Link href="/admin/guru-staff/create">
                            <Button variant="primary" size="md" leftIcon={Plus} className="shadow-sm font-semibold text-xs">
                                Tambah Guru / Staf
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Bento Statistics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <BentoCard
                        colSpan="col-span-1"
                        icon={Users}
                        badge="Database"
                        title="Total Guru & Staf"
                        description="Seluruh personil tercatat"
                        iconColor="text-brand-600 bg-brand-50 border-brand-200"
                    >
                        <div className="text-3xl font-black text-slate-900 pt-2">
                            {stats.total || 0}
                        </div>
                    </BentoCard>

                    <BentoCard
                        colSpan="col-span-1"
                        icon={GraduationCap}
                        badge="Pendidik"
                        title="Guru Aktif"
                        description="Tampil di direktori guru"
                        iconColor="text-emerald-600 bg-emerald-50 border-emerald-200"
                    >
                        <div className="text-3xl font-black text-emerald-600 pt-2">
                            {stats.active_teachers || 0}
                        </div>
                    </BentoCard>

                    <BentoCard
                        colSpan="col-span-1"
                        icon={Briefcase}
                        badge="Kependidikan"
                        title="Staf Aktif"
                        description="Tampil di direktori staf"
                        iconColor="text-indigo-600 bg-indigo-50 border-indigo-200"
                    >
                        <div className="text-3xl font-black text-indigo-600 pt-2">
                            {stats.active_staff || 0}
                        </div>
                    </BentoCard>

                    <BentoCard
                        colSpan="col-span-1"
                        icon={UserX}
                        badge="Arsip"
                        title="Nonaktif"
                        description="Disembunyikan dari publik"
                        iconColor="text-rose-600 bg-rose-50 border-rose-200"
                    >
                        <div className="text-3xl font-black text-rose-600 pt-2">
                            {stats.inactive || 0}
                        </div>
                    </BentoCard>
                </div>

                {/* Filter Tabs & Search Bar */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Category Tabs */}
                        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/60">
                            {[
                                { id: 'all', label: 'Semua Personil' },
                                { id: 'teacher', label: 'Dewan Guru' },
                                { id: 'staff', label: 'Staf & TU' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => handleCategoryChange(tab.id)}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        categoryFilter === tab.id
                                            ? 'bg-white text-brand-700 shadow-2xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Search & Status Filters */}
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <select
                                value={statusFilter}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="w-full sm:w-auto px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                            >
                                <option value="all">Semua Status</option>
                                <option value="active">Aktif Saja</option>
                                <option value="inactive">Nonaktif Saja</option>
                            </select>

                            <form onSubmit={handleSearch} className="w-full sm:w-72 relative">
                                <Input
                                    type="text"
                                    placeholder="Cari nama, jabatan, mapel, NIP..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    leftIcon={Search}
                                    className="text-xs"
                                />
                            </form>
                        </div>
                    </div>
                </div>

                {/* Staff List Table / Bento Grid */}
                {staffList.length === 0 ? (
                    <EmptyState
                        icon={Users}
                        title="Belum Ada Data Guru & Staf"
                        description={search || categoryFilter !== 'all' ? 'Tidak ditemukan personil dengan filter yang dipilih.' : 'Mulai tambahkan personil dewan guru dan staf kependidikan sekolah.'}
                        actionLabel={search || categoryFilter !== 'all' ? 'Reset Filter' : 'Tambah Guru / Staf'}
                        onAction={() => {
                            if (search || categoryFilter !== 'all' || statusFilter !== 'all') {
                                setSearch('');
                                setCategoryFilter('all');
                                setStatusFilter('all');
                                router.get('/admin/guru-staff');
                            } else {
                                router.get('/admin/guru-staff/create');
                            }
                        }}
                    />
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                        <th className="py-3.5 px-4 sm:px-6">Urutan</th>
                                        <th className="py-3.5 px-4 sm:px-6">Personil & Foto</th>
                                        <th className="py-3.5 px-4 sm:px-6">Kategori & Jabatan</th>
                                        <th className="py-3.5 px-4 sm:px-6">Mata Pelajaran / Unit</th>
                                        <th className="py-3.5 px-4 sm:px-6">Kontak</th>
                                        <th className="py-3.5 px-4 sm:px-6 text-center">Status</th>
                                        <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs">
                                    {staffList.map((member) => (
                                        <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                                            {/* Sort Order */}
                                            <td className="py-4 px-4 sm:px-6 font-mono font-bold text-slate-500">
                                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-xs">
                                                    #{member.sort_order}
                                                </span>
                                            </td>

                                            {/* Name & Photo */}
                                            <td className="py-4 px-4 sm:px-6">
                                                <div className="flex items-center gap-3.5">
                                                    <img
                                                        src={member.photo_url}
                                                        alt={member.name}
                                                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0 bg-slate-100"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=1e40af&color=ffffff&size=128`;
                                                        }}
                                                    />
                                                    <div>
                                                        <span className="font-extrabold text-slate-900 block hover:text-brand-600 transition-colors">
                                                            {member.name}
                                                        </span>
                                                        <span className="text-[11px] text-slate-400 font-mono">
                                                            {member.employee_number ? `NIP/NUPTK: ${member.employee_number}` : 'NIP: -'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Category & Position */}
                                            <td className="py-4 px-4 sm:px-6">
                                                <div className="space-y-1">
                                                    <Badge
                                                        variant={member.category === 'teacher' ? 'brand' : 'indigo'}
                                                        size="sm"
                                                    >
                                                        {member.category === 'teacher' ? 'Guru' : 'Staf / TU'}
                                                    </Badge>
                                                    <p className="font-semibold text-slate-800 text-xs">
                                                        {member.position}
                                                    </p>
                                                </div>
                                            </td>

                                            {/* Subject / Department */}
                                            <td className="py-4 px-4 sm:px-6">
                                                <div className="space-y-0.5">
                                                    {member.subject ? (
                                                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                                                            <BookOpen className="w-3.5 h-3.5 text-brand-500" />
                                                            {member.subject}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400">-</span>
                                                    )}
                                                    {member.department && (
                                                        <p className="text-[11px] text-slate-500">
                                                            Unit: {member.department}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Contact */}
                                            <td className="py-4 px-4 sm:px-6">
                                                <div className="space-y-1 text-[11px] text-slate-500">
                                                    {member.email ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <Mail className="w-3 h-3 text-slate-400" />
                                                            <span>{member.email}</span>
                                                        </div>
                                                    ) : null}
                                                    {member.phone ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <Phone className="w-3 h-3 text-slate-400" />
                                                            <span>{member.phone}</span>
                                                        </div>
                                                    ) : null}
                                                    {!member.email && !member.phone && (
                                                        <span className="text-slate-400">-</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Status Toggle */}
                                            <td className="py-4 px-4 sm:px-6 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleActive(member)}
                                                    className="inline-flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
                                                    title="Klik untuk mengubah status aktif"
                                                >
                                                    {member.is_active ? (
                                                        <Badge variant="success" size="sm" dot>
                                                            Aktif
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="danger" size="sm" dot>
                                                            Nonaktif
                                                        </Badge>
                                                    )}
                                                </button>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-4 px-4 sm:px-6 text-right">
                                                <div className="inline-flex items-center gap-1.5">
                                                    <Link
                                                        href={`/admin/guru-staff/${member.id}/edit`}
                                                        className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors"
                                                        title="Edit Data"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        onClick={() => confirmDelete(member)}
                                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                                                        title="Hapus Data"
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

                        {/* Pagination */}
                        {staff?.links && (
                            <div className="p-4 border-t border-slate-100">
                                <Pagination links={staff.links} />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* DELETE CONFIRMATION MODAL */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Hapus Data Guru / Staf"
                description="Tindakan ini akan menghapus data personil secara permanen dari direktori."
                size="sm"
            >
                <div className="space-y-4 pt-2">
                    <p className="text-xs text-slate-600">
                        Apakah Anda yakin ingin menghapus data <strong>{selectedStaff?.name}</strong> ({selectedStaff?.position})?
                    </p>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button variant="secondary" size="md" onClick={() => setDeleteModalOpen(false)}>
                            Batal
                        </Button>
                        <Button variant="danger" size="md" onClick={handleDelete} leftIcon={Trash2}>
                            Ya, Hapus Data
                        </Button>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}
