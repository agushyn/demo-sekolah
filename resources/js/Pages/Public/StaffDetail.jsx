import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import BentoCard from '@/Components/BentoCard';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import {
    Users,
    GraduationCap,
    Briefcase,
    Mail,
    Phone,
    BookOpen,
    ArrowLeft,
    Sparkles,
    Award,
    CheckCircle2,
    Calendar,
    ChevronRight,
    MapPin,
    Shield,
} from 'lucide-react';

export default function StaffDetail({ staff, relatedStaff = [] }) {
    const { school } = usePage().props;
    const schoolName = school?.name || 'SMK Triwijaya';

    return (
        <PublicLayout>
            <Head>
                <title>{`${staff.name} | Guru & Staff | ${schoolName}`}</title>
                <meta
                    name="description"
                    content={`Profil ${staff.name}, ${staff.position} di ${schoolName}. ${staff.bio ? staff.bio.substring(0, 150) : ''}`}
                />
            </Head>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
                {/* Breadcrumbs & Back Button */}
                <div className="flex items-center justify-between">
                    <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Link href="/" className="hover:text-brand-600">Beranda</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <Link href="/guru" className="hover:text-brand-600">Guru & Staf</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-none">{staff.name}</span>
                    </nav>

                    <Link href="/guru">
                        <Button variant="secondary" size="sm" leftIcon={ArrowLeft} className="text-xs">
                            Kembali ke Direktori
                        </Button>
                    </Link>
                </div>

                {/* Main Bento Profile Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Photo & Contact Info */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bento-card p-6 bg-white space-y-6 text-center">
                            {/* Photo with frame */}
                            <div className="relative aspect-3/4 max-w-[260px] mx-auto rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200/80 shadow-md">
                                <img
                                    src={staff.photo_url}
                                    alt={staff.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(staff.name)}&background=1e40af&color=ffffff&size=512`;
                                    }}
                                />
                            </div>

                            {/* Name & Position */}
                            <div className="space-y-1">
                                <Badge
                                    variant={staff.category === 'teacher' ? 'brand' : 'indigo'}
                                    size="md"
                                    className="mb-2"
                                >
                                    {staff.category_label}
                                </Badge>
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                    {staff.name}
                                </h1>
                                <p className="text-xs sm:text-sm font-semibold text-brand-600">
                                    {staff.position}
                                </p>
                                {staff.employee_number && (
                                    <p className="text-[11px] font-mono text-slate-400">
                                        NIP/NUPTK: {staff.employee_number}
                                    </p>
                                )}
                            </div>

                            {/* Contact Box (If exists) */}
                            {(staff.email || staff.phone) && (
                                <div className="pt-4 border-t border-slate-100 space-y-3 text-left">
                                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                        Informasi Kontak
                                    </h3>

                                    {staff.email && (
                                        <div className="flex items-center gap-2.5 text-xs text-slate-600">
                                            <div className="p-2 rounded-lg bg-brand-50 text-brand-600 shrink-0">
                                                <Mail className="w-4 h-4" />
                                            </div>
                                            <span className="truncate">{staff.email}</span>
                                        </div>
                                    )}

                                    {staff.phone && (
                                        <div className="flex items-center gap-2.5 text-xs text-slate-600">
                                            <div className="p-2 rounded-lg bg-brand-50 text-brand-600 shrink-0">
                                                <Phone className="w-4 h-4" />
                                            </div>
                                            <span>{staff.phone}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Detailed Credentials & Bio */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Highlights Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {staff.subject && (
                                <BentoCard
                                    colSpan="col-span-1"
                                    icon={BookOpen}
                                    badge="Bidang Keahlian"
                                    title="Mata Pelajaran"
                                    description={staff.subject}
                                    iconColor="text-brand-600 bg-brand-50 border-brand-200"
                                />
                            )}

                            {staff.education && (
                                <BentoCard
                                    colSpan="col-span-1"
                                    icon={GraduationCap}
                                    badge="Kualifikasi"
                                    title="Pendidikan Terakhir"
                                    description={staff.education}
                                    iconColor="text-emerald-600 bg-emerald-50 border-emerald-200"
                                />
                            )}

                            {staff.department && (
                                <BentoCard
                                    colSpan="col-span-1"
                                    icon={Briefcase}
                                    badge="Organisasi"
                                    title="Unit / Divisi"
                                    description={staff.department}
                                    iconColor="text-indigo-600 bg-indigo-50 border-indigo-200"
                                />
                            )}

                            <BentoCard
                                colSpan="col-span-1"
                                icon={Shield}
                                badge="Status"
                                title="Institusi"
                                description={schoolName}
                                iconColor="text-amber-600 bg-amber-50 border-amber-200"
                            />
                        </div>

                        {/* Bio & Pengalaman Card */}
                        <div className="bento-card p-6 sm:p-8 bg-white space-y-4">
                            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-brand-600" />
                                <span>Profil & Dedikasi</span>
                            </h2>

                            <div className="prose prose-slate text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3">
                                {staff.bio ? (
                                    <p className="whitespace-pre-line">{staff.bio}</p>
                                ) : (
                                    <p className="italic text-slate-400">
                                        Pendidik berdedikasi tinggi dalam membimbing, menginspirasi, dan mengoptimalkan potensi peserta didik di {schoolName}.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Related Colleagues */}
                        {relatedStaff.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-900">
                                    Rekan {staff.category_label} Lainnya
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {relatedStaff.map((colleague) => (
                                        <Link
                                            key={colleague.id}
                                            href={`/guru/${colleague.slug}`}
                                            className="bento-card p-4 bg-white flex items-center gap-3 hover:border-brand-300 hover:-translate-y-0.5 transition-all"
                                        >
                                            <img
                                                src={colleague.photo_url}
                                                alt={colleague.name}
                                                className="w-10 h-10 rounded-xl object-cover shrink-0 bg-slate-100"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(colleague.name)}&background=1e40af&color=ffffff&size=128`;
                                                }}
                                            />
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-900 truncate">
                                                    {colleague.name}
                                                </p>
                                                <p className="text-[11px] text-slate-500 truncate">
                                                    {colleague.position}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
