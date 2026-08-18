import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    GraduationCap,
    Menu,
    X,
    LogIn,
    LogOut,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Newspaper,
    BookOpen,
    UserCheck,
    Award,
    HelpCircle,
    ChevronRight,
    Users,
    Sparkles,
} from 'lucide-react';
import Button from '../Components/Button';
import Badge from '../Components/Badge';
import ThemeCustomizer from '../Components/ThemeCustomizer';

export default function PublicLayout({ children }) {
    const { school, auth, ppdb } = usePage().props;
    const { url } = usePage();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const schoolName = school?.name || 'SMK Triwijaya';
    const schoolTagline = school?.tagline || 'Membentuk Generasi Cerdas & Berkarakter';
    const isPpdbOpen = !!ppdb?.isOpen;

    const navItems = [
        { label: 'Beranda', href: '/', icon: BookOpen, active: url === '/' },
        { label: 'Profil', href: '/profil', icon: Award, active: url.startsWith('/profil') },
        { label: 'Berita', href: '/berita', icon: Newspaper, active: url.startsWith('/berita') },
        { label: 'Kalender', href: '/kalender', icon: Calendar, active: url.startsWith('/kalender') },
        ...(isPpdbOpen ? [{ label: 'Pendaftaran PPDB', href: '/pendaftaran', icon: UserCheck, active: url.startsWith('/pendaftaran') }] : []),
        { label: 'Guru & Staf', href: '/guru', icon: Users, active: url.startsWith('/guru') },
        { label: 'Kontak', href: '/kontak', icon: Phone, active: url.startsWith('/kontak') },
        { label: 'FAQ', href: '/faq', icon: HelpCircle, active: url.startsWith('/faq') },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 subtle-mesh">
            {/* Top PPDB Announcement Bar - Only visible when PPDB is active */}
            {isPpdbOpen && (
                <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-brand-900 text-white text-xs py-2 px-4 border-b border-brand-700/50">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                            <Badge variant="brand" size="sm" className="bg-white/20 text-white border-white/20 py-0.5">
                                {ppdb?.announcement || 'Info PPDB 2026/2027'}
                            </Badge>
                            <span className="text-slate-200 text-[11px] sm:text-xs">
                                {ppdb?.announcementText || 'Pendaftaran Siswa Baru Gelombang I Telah Dibuka!'}
                            </span>
                            <Link
                                href="/pendaftaran"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-300 hover:text-white underline underline-offset-2 ml-1"
                            >
                                <span>Lihat Informasi PPDB</span>
                                <ChevronRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="hidden md:flex items-center gap-4 text-slate-300 text-xs">
                            <span className="flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-brand-300" />
                                {school?.phone || '+62 21 8765 4321'}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-brand-300" />
                                {school?.email || 'info@smatriwijaya.sch.id'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Header / Navbar */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo & School Name */}
                        <Link href="/" className="flex items-center gap-3.5 group">

                            <img src="/storage/images/logo.png" alt="Logo" className="w-16 h-16" />

                            <div className="flex flex-col">
                                <span className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight group-hover:text-brand-600 transition-colors">
                                    {schoolName}
                                </span>
                                <span className="text-[11px] text-slate-500 font-medium tracking-wide">
                                    Portal Resmi & Pembelajaran Terpadu
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden xl:flex items-center gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${item.active
                                        ? 'bg-brand-50 text-brand-700 shadow-2xs border border-brand-200/60'
                                        : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Action Buttons */}
                        <div className="hidden sm:flex items-center gap-3">
                            {auth?.user ? (
                                <div className="flex items-center gap-2">
                                    <Link href={auth.user.dashboard_url || '/dashboard'}>
                                        <Button
                                            variant="primary"
                                            size="md"
                                            leftIcon={LogIn}
                                            className="shadow-sm font-semibold text-xs"
                                        >
                                            Dashboard ({auth.user.name.split(' ')[0]})
                                        </Button>
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => router.post('/logout')}
                                        className="p-2 text-xs font-semibold text-slate-500 hover:text-rose-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                                        title="Keluar"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <Link href="/login">
                                    <Button
                                        variant="primary"
                                        size="md"
                                        leftIcon={LogIn}
                                        className="shadow-sm font-semibold text-xs"
                                    >
                                        Masuk Portal
                                    </Button>
                                </Link>
                            )}
                        </div>

                        {/* Mobile Hamburger Toggle */}
                        <div className="flex items-center gap-2 xl:hidden">
                            <Link href="/login" className="sm:hidden">
                                <Button variant="primary" size="sm" leftIcon={LogIn}>
                                    Masuk
                                </Button>
                            </Link>
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                                aria-label="Menu navigasi"
                            >
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-slate-700" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Drawer */}
                {mobileMenuOpen && (
                    <div className="xl:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top duration-200 shadow-xl">
                        <div className="space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${item.active
                                            ? 'bg-brand-50 text-brand-700'
                                            : 'text-slate-700 hover:bg-slate-50 hover:text-brand-600'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <Icon className={`w-4 h-4 ${item.active ? 'text-brand-600' : 'text-slate-400'}`} />
                                            <span>{item.label}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300" />
                                    </Link>
                                );
                            })}
                        </div>
                        <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                            {auth?.user ? (
                                <Link
                                    href={auth.user.dashboard_url || '/dashboard'}
                                    className="w-full"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <Button variant="primary" size="md" leftIcon={LogIn} className="w-full text-xs">
                                        Buka Dashboard ({auth.user.name})
                                    </Button>
                                </Link>
                            ) : (
                                <Link href="/login" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="primary" size="md" leftIcon={LogIn} className="w-full text-xs">
                                        Masuk ke Portal Sekolah
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content Area */}
            <main className="flex-1 w-full">{children}</main>

            {/* Public Footer */}
            <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
                        {/* School Info */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center">
                                    <GraduationCap className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white tracking-tight">{schoolName}</h3>
                                    <p className="text-xs text-slate-400">Akreditasi {school?.accreditation || 'A (Unggul)'}</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                                {schoolTagline}. Platform digital modern terpadu untuk pembelajaran, administrasi, dan informasi sekolah.
                            </p>
                            <div className="flex items-center gap-2 pt-2">
                                <Badge variant="brand" size="sm" className="bg-brand-950 text-brand-300 border-brand-800">
                                    NPSN: 20108976
                                </Badge>
                                <Badge variant="success" size="sm" className="bg-emerald-950 text-emerald-300 border-emerald-800">
                                    Sekolah Penggerak
                                </Badge>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Halaman Utama</h4>
                            <ul className="space-y-2 text-xs">
                                <li><Link href="/" className="hover:text-white transition-colors">Beranda</Link></li>
                                <li><Link href="/profil" className="hover:text-white transition-colors">Profil Sekolah</Link></li>
                                <li><Link href="/berita" className="hover:text-white transition-colors">Berita & Warta</Link></li>
                                <li><Link href="/kalender" className="hover:text-white transition-colors">Kalender Akademik</Link></li>
                                <li><Link href="/guru" className="hover:text-white transition-colors">Guru & Staf</Link></li>
                                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ & Tanya Jawab</Link></li>
                            </ul>
                        </div>

                        {/* Portal Access */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Layanan Portal</h4>
                            <ul className="space-y-2 text-xs">
                                <li><Link href="/login" className="hover:text-white transition-colors">Ruang Kelas Virtual</Link></li>
                                <li><Link href="/login" className="hover:text-white transition-colors">Pengumpulan Tugas</Link></li>
                                <li><Link href="/login" className="hover:text-white transition-colors">Forum Diskusi Siswa</Link></li>
                                <li><Link href="/login" className="hover:text-white transition-colors">Portal Administrasi Guru</Link></li>
                                <li><Link href="/login" className="hover:text-white transition-colors">Dashboard Administrator</Link></li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Kontak & Lokasi</h4>
                            <div className="space-y-2.5 text-xs text-slate-400">
                                <p className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                                    <span>{school?.address || 'JL. Padat Karya No.2, Ciadeg, Kec. Cigombong, Kabupaten Bogor, Jawa Barat 16740'}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                                    <span>{school?.phone || '0813-8333-3751'}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                                    <span>{school?.email || 'info@smatriwijaya.sch.id'}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                        <p>© {new Date().getFullYear()} {schoolName}. Hak Cipta Dilindungi Undang-Undang.</p>
                        <p className="flex items-center gap-2">
                            <span>Dibangun dengan Laravel 13, React & Bento UI</span>
                        </p>
                    </div>
                </div>
            </footer>

            {/* Live Theme Customizer Tool */}
            <ThemeCustomizer />
        </div>
    );
}
