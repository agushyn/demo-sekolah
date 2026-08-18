import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    GraduationCap,
    BookOpen,
    UploadCloud,
    ClipboardCheck,
    Calendar,
    MessageSquare,
    User,
    Menu,
    X,
    LogOut,
    Bell,
    Award,
} from 'lucide-react';
import ThemeCustomizer from '../Components/ThemeCustomizer';

export default function TeacherLayout({ children, title = 'Portal Guru' }) {
    const { school, auth } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const { url } = usePage();

    const navItems = [
        { label: 'Dashboard Guru', icon: LayoutDashboard, href: '/guru/dashboard', active: url === '/guru/dashboard' },
        { label: 'Kalender & Jadwal', icon: Calendar, href: '/guru/kalender', active: url.startsWith('/guru/kalender') },
        { label: 'Kelas Saya', icon: BookOpen, href: '/guru/kelas', active: url.startsWith('/guru/kelas') },
        { label: 'Kelola Materi', icon: UploadCloud, href: '/guru/materi', active: url.startsWith('/guru/materi') },
        { label: 'Penugasan Siswa', icon: ClipboardCheck, href: '/guru/tugas', active: url.startsWith('/guru/tugas') },
        { label: 'Nilai & Pengumpulan', icon: Award, href: '/guru/pengumpulan', active: url.startsWith('/guru/pengumpulan') },
        { label: 'Forum Diskusi', icon: MessageSquare, href: '/forum', active: url.startsWith('/forum') },
    ];

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="min-h-screen flex bg-slate-100 text-slate-800 font-sans">
            {/* Teacher Sidebar */}
            <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200/90 shrink-0 select-none">
                <div className="h-20 px-6 flex items-center gap-3 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                        <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-900 tracking-tight leading-tight">
                            {school?.name || 'SMK Triwijaya'}
                        </h2>
                        <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                            <Award className="w-3 h-3" /> Portal Pendidik
                        </span>
                    </div>
                </div>

                <div className="p-4 mx-4 my-4 rounded-2xl bg-gradient-to-br from-emerald-700 to-slate-900 text-white shadow-sm">
                    <p className="text-[11px] text-emerald-200 uppercase tracking-wider font-semibold">Tenaga Pendidik</p>
                    <h3 className="text-sm font-bold mt-0.5 truncate">{auth?.user?.name || 'Guru Pengampu'}</h3>
                    <p className="text-xs text-emerald-300 mt-1 truncate">{auth?.user?.email}</p>
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
                                        ? 'bg-emerald-50 text-emerald-700 shadow-xs border border-emerald-200/60'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                                    <span>{item.label}</span>
                                </div>
                                {item.badge && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-600 text-white">
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
                            <span className="font-bold text-sm text-slate-900">Menu Guru</span>
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
                                        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
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
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-8 overflow-y-auto">{children}</main>
            </div>

            <ThemeCustomizer />
        </div>
    );
}
