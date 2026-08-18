import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import BentoCard from '@/Components/BentoCard';
import Badge from '@/Components/Badge';
import {
    Users,
    GraduationCap,
    BookOpen,
    UserCheck,
    Shield,
    Activity,
    CheckCircle2,
    Calendar,
    Sparkles,
    ArrowUpRight,
} from 'lucide-react';

export default function AdminDashboard({ stats = {}, recentUsers = [] }) {
    const { auth } = usePage().props;

    const totalUsers = stats.total_users ?? 0;
    const totalTeachers = stats.total_teachers ?? 0;
    const totalStudents = stats.total_students ?? 0;
    const totalParents = stats.total_parents ?? 0;
    const totalAdmins = stats.total_admins ?? 0;

    const getRoleBadgeVariant = (role) => {
        switch (role) {
            case 'super_admin':
                return 'brand';
            case 'admin':
                return 'indigo';
            case 'teacher':
                return 'emerald';
            case 'student':
                return 'sky';
            case 'parent':
                return 'amber';
            default:
                return 'neutral';
        }
    };

    return (
        <AdminLayout title="Dashboard Administrator">
            <Head title="Admin Dashboard" />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Welcome Bento Hero Banner */}
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-slate-900 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-2 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                <span>Portal Terpadu SCHID • Mode Administrasi</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                                Selamat Datang, {auth?.user?.name || 'Administrator'}!
                            </h2>
                            <p className="text-xs sm:text-sm text-brand-100/90 leading-relaxed">
                                Fondasi otentikasi, otorisasi RBAC (Role-Based Access Control), dan basis data profil guru, siswa, serta orang tua telah aktif.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Badge variant="emerald" size="lg" dot className="bg-emerald-500/20 text-emerald-100 border border-emerald-400/30">
                                Sistem Siap Operasional
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* 4 Core Statistics Bento Grid (Required by Prompt: User, Guru, Siswa, Ortu) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <BentoCard
                        colSpan="col-span-1"
                        icon={Users}
                        title={totalUsers.toLocaleString('id-ID')}
                        description="Total Seluruh Akun Pengguna"
                        badge="Semua User"
                    >
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                            <span>Admin/Staf: <strong>{totalAdmins}</strong></span>
                            <span className="text-brand-600 font-semibold">Aktif</span>
                        </div>
                    </BentoCard>

                    <BentoCard
                        colSpan="col-span-1"
                        icon={GraduationCap}
                        title={totalTeachers.toLocaleString('id-ID')}
                        description="Total Tenaga Pendidik (Guru)"
                        badge="Pendidik"
                    >
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                            <span>Status: Terdaftar</span>
                            <span className="text-emerald-600 font-semibold">100% Aktif</span>
                        </div>
                    </BentoCard>

                    <BentoCard
                        colSpan="col-span-1"
                        icon={BookOpen}
                        title={totalStudents.toLocaleString('id-ID')}
                        description="Total Peserta Didik (Siswa)"
                        badge="Siswa"
                    >
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                            <span>Tingkat: X, XI, XII</span>
                            <span className="text-sky-600 font-semibold">Reguler</span>
                        </div>
                    </BentoCard>

                    <BentoCard
                        colSpan="col-span-1"
                        icon={UserCheck}
                        title={totalParents.toLocaleString('id-ID')}
                        description="Total Orang Tua / Wali Murid"
                        badge="Wali Murid"
                    >
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                            <span>Terhubung ke Siswa</span>
                            <span className="text-amber-600 font-semibold">Terdaftar</span>
                        </div>
                    </BentoCard>
                </div>

                {/* Lower Bento Grid: Recent Users & Role Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Recent Users List */}
                    <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Pengguna Terdaftar Terkini</h3>
                                    <p className="text-xs text-slate-500">Daftar akun pengguna terbaru di basis data</p>
                                </div>
                            </div>
                            <Badge variant="brand" size="sm">
                                {recentUsers.length} Terkini
                            </Badge>
                        </div>

                        <div className="divide-y divide-slate-100 overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                        <th className="pb-3 px-2">Nama Pengguna</th>
                                        <th className="pb-3 px-2">Email</th>
                                        <th className="pb-3 px-2">Peran (Role)</th>
                                        <th className="pb-3 px-2 text-right">Tanggal Dibuat</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {recentUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3 px-2 font-bold text-slate-800">
                                                {user.name}
                                            </td>
                                            <td className="py-3 px-2 text-slate-500 font-mono text-[11px]">
                                                {user.email}
                                            </td>
                                            <td className="py-3 px-2">
                                                <Badge variant={getRoleBadgeVariant(user.role)} size="sm">
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-2 text-right text-slate-400 text-[11px]">
                                                {user.created_at}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* RBAC Security & Matrix Status Bento Card */}
                    <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Keamanan & RBAC</h3>
                                <p className="text-xs text-slate-500">Matriks Hak Akses Aktif</p>
                            </div>
                        </div>

                        <div className="space-y-2.5 pt-2">
                            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <div className="text-xs">
                                    <p className="font-bold text-slate-800">Middleware Protection</p>
                                    <p className="text-slate-500 text-[11px]">
                                        Route <code>/admin</code> hanya dapat diakses role <strong>super_admin</strong> & <strong>admin</strong>.
                                    </p>
                                </div>
                            </div>

                            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <div className="text-xs">
                                    <p className="font-bold text-slate-800">Multi-Guard Isolation</p>
                                    <p className="text-slate-500 text-[11px]">
                                        Siswa diisolasi ke <code>/dashboard</code> dan Guru diisolasi ke <code>/guru/dashboard</code>.
                                    </p>
                                </div>
                            </div>

                            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <div className="text-xs">
                                    <p className="font-bold text-slate-800">Database Seed Ready</p>
                                    <p className="text-slate-500 text-[11px]">
                                        5 Role standar, 22 permissions granular, dan 5 akun dummy siap uji.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
