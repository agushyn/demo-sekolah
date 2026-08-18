import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    Sliders,
    Newspaper,
    Calendar,
    UserCheck,
    Users,
    BookOpen,
    MessageSquare,
    Settings,
    Bell,
    Search,
    Menu,
    X,
    LogOut,
    GraduationCap,
    ChevronRight,
    Shield,
    Heart,
    Clock,
} from 'lucide-react';
import Badge from '../Components/Badge';
import Button from '../Components/Button';
import ThemeCustomizer from '../Components/ThemeCustomizer';

export default function AdminLayout({ children, title = 'Administrator Portal' }) {
    const { school, auth } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const { url } = usePage();

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/admin', active: url === '/admin' },
        { label: 'Hero Slider', icon: Sliders, href: '/admin/hero-slides', active: url.startsWith('/admin/hero-slides') },
        { label: 'Berita & Warta', icon: Newspaper, href: '/admin/news', active: url.startsWith('/admin/news') },
        { label: 'Kalender Akademik', icon: Calendar, href: '/admin/calendar', active: url.startsWith('/admin/calendar') || url.startsWith('/admin/kalender') },
        { label: 'Pendaftaran (PPDB)', icon: UserCheck, href: '/admin/registrations', active: url.startsWith('/admin/registrations') || url.startsWith('/admin/pendaftaran') },
        { label: 'Guru & Staf', icon: Users, href: '/admin/guru-staff', active: url.startsWith('/admin/guru') },
        { label: 'Data Siswa & Kelas', icon: GraduationCap, href: '/admin/students', active: url.startsWith('/admin/students') || url.startsWith('/admin/siswa') },
        { label: 'Presensi Siswa (API)', icon: Clock, href: '/admin/attendances', active: url.startsWith('/admin/attendances') || url.startsWith('/admin/presensi') },
        { label: 'Akun Orang Tua', icon: Heart, href: '/admin/parents', active: url.startsWith('/admin/parents') || url.startsWith('/admin/orang-tua') },
        { label: 'Ruang Kelas & Mapel', icon: BookOpen, href: '/admin/kelas', active: url.startsWith('/admin/kelas') },
        { label: 'Moderasi Forum', icon: MessageSquare, href: '/admin/forum', active: url.startsWith('/admin/forum') },
        { label: 'Pengaturan Sistem', icon: Settings, href: '/admin/settings', active: url.startsWith('/admin/settings') },
    ];

    return (
        <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
            {/* Desktop Bento Sidebar (Fixed & Non-scrolling with page) */}
            <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 w-72 h-screen bg-white border-r border-slate-200/90 select-none">
                {/* Brand Header */}
                <div className="h-20 px-6 flex items-center gap-3 border-b border-slate-100 shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-sm shadow-brand-500/20">
                        <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-900 tracking-tight leading-tight">
                            {school?.name || 'SMK Triwijaya'}
                        </h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <Shield className="w-3 h-3 text-brand-600" />
                            <span className="text-[11px] font-semibold text-brand-600 uppercase tracking-wider">
                                Administrator
                            </span>
                        </div>
                    </div>
                </div>

                {/* Sidebar Navigation (Scrolls independently if menu overflows) */}
                <div className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
                    <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Menu Utama
                    </p>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.active;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                                    isActive
                                        ? 'bg-brand-50 text-brand-700 shadow-xs border border-brand-200/60'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                                    <span>{item.label}</span>
                                </div>
                                {item.badge && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-brand-600 text-white">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                        <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                            {auth?.user?.name ? auth.user.name.substring(0, 2).toUpperCase() : 'AD'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">
                                {auth?.user?.name || 'Administrator'}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">{auth?.user?.email || 'admin@schid.test'}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => router.post('/logout')}
                            title="Keluar (Logout)"
                            className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden flex">
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className="relative flex flex-col w-72 bg-white h-full z-10 p-4 shadow-2xl">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center">
                                    <GraduationCap className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-sm text-slate-900">Admin Panel</span>
                            </div>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
                            >
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
                                        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-600"
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

            {/* Main Content Area (Offset by sidebar width on desktop) */}
            <div className="lg:pl-72 flex flex-col min-h-screen w-full min-w-0">
                {/* Topbar */}
                <header className="h-20 bg-white/95 backdrop-blur-xs border-b border-slate-200/90 px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-20">
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
                        <Link href="/">
                            <Button variant="secondary" size="sm" className="hidden sm:inline-flex text-xs">
                                Lihat Website Publik
                            </Button>
                        </Link>
                        <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />
                        <button
                            type="button"
                            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            aria-label="Notifikasi"
                        >
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
                        </button>
                    </div>
                </header>

                {/* Content Body */}
                <main className="flex-1 p-4 sm:p-8">{children}</main>
            </div>

            <ThemeCustomizer />
        </div>
    );
}
