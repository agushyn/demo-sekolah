import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import BentoCard from '@/Components/BentoCard';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import EmptyState from '@/Components/EmptyState';
import {
    Users,
    UserCheck,
    UserX,
    UserPlus,
    Search,
    Edit3,
    Trash2,
    Phone,
    Mail,
    GraduationCap,
    Heart,
    Shield,
    Sparkles,
    AlertCircle,
} from 'lucide-react';

export default function ParentsIndex({ parents, stats = {}, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [deletingParent, setDeletingParent] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get(
            '/admin/parents',
            { search },
            { preserveState: true, replace: true }
        );
    };

    const confirmDelete = (parent) => {
        setDeletingParent(parent);
    };

    const handleDelete = () => {
        if (!deletingParent) return;

        setIsDeleting(true);
        router.delete(`/admin/parents/${deletingParent.id}`, {
            onSuccess: () => setDeletingParent(null),
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <AdminLayout title="Manajemen Akun Orang Tua / Wali Siswa">
            <Head title="Kelola Akun Orang Tua" />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Header Banner */}
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-600 via-amber-700 to-slate-900 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-2 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-amber-100">
                                <Heart className="w-3.5 h-3.5 text-amber-200" />
                                <span>Kolaborasi Orang Tua & Sekolah</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                                Akun Orang Tua & Wali Murid
                            </h1>
                            <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed font-normal">
                                Buat akun login untuk orang tua siswa, kelola profil kontak, dan tautkan ke akun putra-putri mereka untuk pemantauan nilai, tugas, dan presensi.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link href="/admin/parents/create">
                                <Button
                                    variant="primary"
                                    size="md"
                                    leftIcon={UserPlus}
                                    className="bg-white text-amber-900 hover:bg-amber-50 border-none font-bold shadow-md"
                                >
                                    Tambah Akun Wali
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 4 Bento Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <BentoCard
                        colSpan="col-span-1"
                        icon={Users}
                        badge="Total Akun Wali"
                        title={stats.total?.toLocaleString('id-ID') ?? '0'}
                        description="Akun orang tua terdaftar"
                        iconColor="text-amber-600 bg-amber-50 border-amber-200"
                    />

                    <BentoCard
                        colSpan="col-span-1"
                        icon={UserCheck}
                        badge="Memiliki Anak"
                        title={stats.with_students?.toLocaleString('id-ID') ?? '0'}
                        description="Terhubung minimal 1 siswa aktif"
                        iconColor="text-emerald-600 bg-emerald-50 border-emerald-200"
                    />

                    <BentoCard
                        colSpan="col-span-1"
                        icon={UserX}
                        badge="Belum Ditautkan"
                        title={stats.without_students?.toLocaleString('id-ID') ?? '0'}
                        description="Akun wali tanpa siswa terhubung"
                        iconColor="text-rose-600 bg-rose-50 border-rose-200"
                    />

                    <BentoCard
                        colSpan="col-span-1"
                        icon={GraduationCap}
                        badge="Siswa Tercover"
                        title={stats.total_students_linked?.toLocaleString('id-ID') ?? '0'}
                        description="Total anak dengan akun wali"
                        iconColor="text-indigo-600 bg-indigo-50 border-indigo-200"
                    />
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 space-y-4">
                    <form onSubmit={handleSearchSubmit} className="flex gap-3">
                        <div className="flex-1">
                            <Input
                                placeholder="Cari nama orang tua, email, telepon, NIK, atau nama anak..."
                                leftIcon={Search}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full text-xs"
                            />
                        </div>
                        <Button type="submit" variant="secondary" size="md">
                            Cari
                        </Button>
                    </form>
                </div>

                {/* Parents Table */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
                    {parents.data.length === 0 ? (
                        <EmptyState
                            icon={Users}
                            title="Akun Orang Tua Tidak Ditemukan"
                            description={search ? `Tidak ada akun wali yang cocok dengan kata kunci "${search}".` : 'Belum ada akun orang tua yang terdaftar.'}
                            actionLabel="Tambah Akun Orang Tua"
                            onAction={() => router.visit('/admin/parents/create')}
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                                        <th className="py-3.5 px-4">Nama & Akun Login</th>
                                        <th className="py-3.5 px-4">Hubungan</th>
                                        <th className="py-3.5 px-4">Kontak & NIK</th>
                                        <th className="py-3.5 px-4">Anak / Siswa Terhubung</th>
                                        <th className="py-3.5 px-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {parents.data.map((parent) => {
                                        const children = parent.students || [];

                                        return (
                                            <tr key={parent.id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-black text-xs border border-amber-100 shrink-0">
                                                            {parent.user?.name ? parent.user.name.charAt(0).toUpperCase() : 'W'}
                                                        </div>
                                                        <div>
                                                            <p className="font-extrabold text-slate-900 line-clamp-1">
                                                                {parent.user?.name || 'Orang Tua'}
                                                            </p>
                                                            <p className="text-[11px] text-slate-500 font-mono truncate">
                                                                {parent.user?.email || '-'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <Badge variant="amber" size="sm">
                                                        {parent.relationship_type || 'Wali'}
                                                    </Badge>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <div className="space-y-0.5">
                                                        <p className="text-slate-800 font-semibold">
                                                            {parent.phone || '-'}
                                                        </p>
                                                        {parent.nik && (
                                                            <p className="text-[11px] text-slate-400 font-mono">
                                                                NIK: {parent.nik}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    {children.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {children.map((child) => (
                                                                <span
                                                                    key={child.id}
                                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-800 font-bold text-[11px]"
                                                                >
                                                                    <GraduationCap className="w-3 h-3 text-indigo-500" />
                                                                    <span>{child.user?.name || 'Siswa'}</span>
                                                                    <span className="text-[10px] text-indigo-400 font-mono">
                                                                        ({child.classes?.[0]?.name || child.nisn || '-'})
                                                                    </span>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <Badge variant="neutral" size="sm">
                                                            Belum Ada Anak
                                                        </Badge>
                                                    )}
                                                </td>

                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Link href={`/admin/parents/${parent.id}/edit`}>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                leftIcon={Edit3}
                                                                className="text-slate-600 hover:text-brand-600"
                                                            >
                                                                Edit
                                                            </Button>
                                                        </Link>

                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            leftIcon={Trash2}
                                                            onClick={() => confirmDelete(parent)}
                                                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                                        >
                                                            Hapus
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {parents.links && parents.links.length > 3 && (
                        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                                Menampilkan {parents.from || 0} - {parents.to || 0} dari {parents.total} wali
                            </span>
                            <div className="flex items-center gap-1">
                                {parents.links.map((link, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => link.url && router.visit(link.url, { preserveState: true })}
                                        disabled={!link.url || link.active}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                                            link.active
                                                ? 'bg-amber-600 text-white'
                                                : link.url
                                                ? 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                                                : 'text-slate-300 cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Konfirmasi Hapus */}
            {deletingParent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900">
                                    Hapus Akun Orang Tua?
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Akun: <strong>{deletingParent.user?.name}</strong>
                                </p>
                            </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                            Tindakan ini akan menghapus akun login orang tua. Siswa yang terhubung tidak akan terhapus, namun status hubungan wali pada siswa tersebut akan dilepas (*unlinked*).
                        </p>

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => setDeletingParent(null)}
                                disabled={isDeleting}
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                variant="danger"
                                size="sm"
                                isLoading={isDeleting}
                                onClick={handleDelete}
                            >
                                Ya, Hapus Akun
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
