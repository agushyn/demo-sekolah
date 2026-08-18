import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    Video,
    FileText,
    BookMarked,
    Calendar,
    MessageSquare,
    User,
    Menu,
    X,
    LogOut,
    GraduationCap,
    Bell,
    Sparkles,
} from 'lucide-react';
import ThemeCustomizer from '../Components/ThemeCustomizer';

export default function StudentLayout({ children, title = 'Portal Siswa' }) {
    const { school, auth } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const { url } = usePage();

    const navItems = [
        { label: 'Dashboard Siswa', icon: LayoutDashboard, href: '/dashboard', active: url === '/dashboard' },
        { label: 'Kelas & Jadwal', icon: Video, href: '/kelas', active: url.startsWith('/kelas') },
        { label: 'Tugas & Ujian', icon: FileText, href: '/tugas', active: url.startsWith('/tugas') },
        { label: 'Materi Belajar', icon: BookMarked, href: '/materi', active: url.startsWith('/materi') },
        { label: 'Kalender Sekolah', icon: Calendar, href: '/kalender', active: url.startsWith('/kalender') },
        { label: 'Forum Diskusi', icon: MessageSquare, href: '/forum', active: url.startsWith('/forum') },
    ];

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="min-h-screen flex bg-slate-100 text-slate-800 font-sans">
            {/* Student Sidebar */}
            <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200/90 shrink-0 select-none">
                <div className="h-20 px-6 flex items-center gap-3 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-700 text-white flex items-center justify-center shadow-sm">
                        <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-900 tracking-tight leading-tight">
                            {school?.name || 'SMK Triwijaya'}
                        </h2>
                        <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                            <Sparkles className="w-3 h-3" /> Portal Siswa Aktif
                        </span>
                    </div>
                </div>

                <div className="p-4 mx-4 my-4 rounded-2xl bg-gradient-to-br from-sky-600 to-indigo-800 text-white shadow-sm">
                    <p className="text-[11px] text-sky-100 uppercase tracking-wider font-semibold">Peserta Didik</p>
                    <h3 className="text-sm font-bold mt-0.5 truncate">{auth?.user?.name || 'Siswa Terdaftar'}</h3>
                    <p className="text-xs text-sky-200 mt-1 truncate">{auth?.user?.email}</p>
                </div>

                <div className="flex-1 px-4 overflow-y-auto space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.active;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                                    isActive
                                        ? 'bg-sky-50 text-sky-700 shadow-xs border border-sky-200/60'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                                    <span>{item.label}</span>
                                </div>
                                {item.badge && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-white">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar (Logout)</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Drawer */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden flex">
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className="relative flex flex-col w-72 bg-white h-full z-10 p-4 shadow-2xl">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                            <span className="font-bold text-sm text-slate-900">Menu Siswa</span>
                            <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg text-slate-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-1 flex-1 overflow-y-auto">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-600"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className="w-4 h-4 text-slate-400" />
                                            <span>{item.label}</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-20 bg-white border-b border-slate-200/90 px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{title}</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="text-xs font-medium text-slate-500 hover:text-brand-600 hidden sm:block"
                        >
                            Ke Beranda Sekolah
                        </Link>
                        <button
                            type="button"
                            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                        >
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-8 overflow-y-auto">{children}</main>
            </div>

            <ThemeCustomizer />
        </div>
    );
}
