import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import Badge from '@/Components/Badge';
import Input from '@/Components/Input';
import Button from '@/Components/Button';
import EmptyState from '@/Components/EmptyState';
import {
    Users,
    GraduationCap,
    Briefcase,
    Mail,
    Phone,
    BookOpen,
    Search,
    Award,
    Sparkles,
    CheckCircle2,
    ChevronRight,
    ArrowRight,
    Crown,
} from 'lucide-react';

export default function Teachers({ staff = [], stats = {}, currentCategory = 'all', currentSearch = '' }) {
    const { school } = usePage().props;
    const [search, setSearch] = useState(currentSearch || '');
    const [activeTab, setActiveTab] = useState(currentCategory || 'all');

    const schoolName = school?.name || 'SMK Triwijaya';

    // Client-side filtering for fast interaction
    const filteredStaff = staff.filter((member) => {
        const query = search.toLowerCase().trim();
        const matchesQuery =
            !query ||
            member.name.toLowerCase().includes(query) ||
            (member.position && member.position.toLowerCase().includes(query)) ||
            (member.subject && member.subject.toLowerCase().includes(query)) ||
            (member.department && member.department.toLowerCase().includes(query)) ||
            (member.employee_number && member.employee_number.toLowerCase().includes(query));

        const matchesCategory =
            activeTab === 'all' || member.category === activeTab;

        return matchesQuery && matchesCategory;
    });

    // Pimpinan Sekolah (Sort order <= 2 or position includes Kepala / Wakil)
    const leadershipStaff = filteredStaff.filter(
        (s) => s.sort_order <= 2 || s.position.toLowerCase().includes('kepala')
    );

    const teachersList = filteredStaff.filter((s) => s.category === 'teacher');
    const staffList = filteredStaff.filter((s) => s.category === 'staff');

    return (
        <PublicLayout>
            <Head>
                <title>{`Guru & Staff | ${schoolName}`}</title>
                <meta
                    name="description"
                    content={`Kenali dewan guru dan tenaga kependidikan profesional bersertifikasi di ${schoolName}.`}
                />
            </Head>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
                {/* Header Bento Banner */}
                <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-brand-800 via-brand-900 to-slate-950 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 space-y-4 max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-brand-200">
                            <GraduationCap className="w-4 h-4 text-brand-300" />
                            <span>Direktori Pendidik & Tenaga Kependidikan</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                            Pendidik Berdedikasi & Staf Profesional
                        </h1>
                        <p className="text-xs sm:text-base text-slate-300 leading-relaxed font-normal">
                            Kenali para pendidik dan tenaga kependidikan berintegritas tinggi yang berkomitmen membimbing dan mengantarkan putra-putri Anda menuju prestasi global.
                        </p>
                    </div>
                </div>

                {/* Filter Tabs & Search Bar */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Category Selector Tabs */}
                        <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60">
                            <button
                                type="button"
                                onClick={() => setActiveTab('all')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    activeTab === 'all'
                                        ? 'bg-white text-brand-700 shadow-2xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Semua Personil ({stats.total || staff.length})
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('teacher')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    activeTab === 'teacher'
                                        ? 'bg-white text-brand-700 shadow-2xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Dewan Guru ({stats.teachers || teachersList.length})
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('staff')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    activeTab === 'staff'
                                        ? 'bg-white text-brand-700 shadow-2xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Staf & TU ({stats.staff || staffList.length})
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="max-w-md w-full">
                            <Input
                                placeholder="Cari nama, jabatan, mata pelajaran..."
                                leftIcon={Search}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full text-xs"
                            />
                        </div>
                    </div>
                </div>

                {/* Empty State */}
                {filteredStaff.length === 0 ? (
                    <EmptyState
                        icon={Users}
                        title={activeTab === 'staff' ? 'Data Staf Belum Tersedia' : activeTab === 'teacher' ? 'Data Guru Belum Tersedia' : 'Personil Tidak Ditemukan'}
                        description={search ? `Tidak ada guru atau staf yang cocok dengan kata kunci "${search}".` : 'Data guru dan staf akan segera diperbarui oleh pihak sekolah.'}
                        actionLabel={search ? 'Reset Pencarian' : undefined}
                        onAction={() => setSearch('')}
                    />
                ) : (
                    <div className="space-y-12">
                        {/* Section Pimpinan Sekolah (Jika di tab Semua dan belum ada filter pencarian spesifik) */}
                        {activeTab === 'all' && !search && leadershipStaff.length > 0 && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                                        <Crown className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 tracking-tight">
                                            Pimpinan Sekolah
                                        </h2>
                                        <p className="text-xs text-slate-500">
                                            Jajaran Kepala Sekolah dan Wakil Kepala Sekolah
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {leadershipStaff.map((member) => (
                                        <StaffCard key={member.id} member={member} isFeatured />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Regular Grid Personil */}
                        <div className="space-y-6">
                            {activeTab === 'all' && !search && (
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                                        Seluruh Dewan Guru & Staf
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Urutan profil pendidik dan tenaga kependidikan
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredStaff.map((member) => (
                                    <StaffCard key={member.id} member={member} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}

function StaffCard({ member, isFeatured = false }) {
    return (
        <div
            className={`bento-card p-5 flex flex-col justify-between space-y-4 hover:-translate-y-1 hover:border-brand-300 transition-all duration-200 bg-white group ${
                isFeatured ? 'ring-2 ring-amber-400/30 border-amber-200 bg-gradient-to-b from-amber-50/20 to-white' : ''
            }`}
        >
            <div className="space-y-4">
                {/* Photo & Badge */}
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-inner">
                    <img
                        src={member.photo_url}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=1e40af&color=ffffff&size=256`;
                        }}
                    />
                    <div className="absolute top-3 left-3">
                        <Badge
                            variant={member.category === 'teacher' ? 'brand' : 'indigo'}
                            size="sm"
                            className="shadow-sm backdrop-blur-md"
                        >
                            {member.category_label}
                        </Badge>
                    </div>

                    {isFeatured && (
                        <div className="absolute top-3 right-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/90 text-white text-[10px] font-bold shadow-sm backdrop-blur-md">
                                <Crown className="w-3 h-3" />
                                Pimpinan
                            </span>
                        </div>
                    )}
                </div>

                {/* Info Text */}
                <div className="space-y-1.5">
                    <Link
                        href={`/guru/${member.slug}`}
                        className="text-base font-extrabold text-slate-900 hover:text-brand-600 transition-colors line-clamp-1 block"
                    >
                        {member.name}
                    </Link>

                    <p className="text-xs font-semibold text-brand-700 line-clamp-1">
                        {member.position}
                    </p>

                    {member.subject && (
                        <div className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                            <BookOpen className="w-3 h-3 text-brand-500" />
                            <span>{member.subject}</span>
                        </div>
                    )}

                    {member.education && (
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                            {member.education}
                        </p>
                    )}
                </div>
            </div>

            {/* Card Action Link */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                    {member.employee_number ? `NIP: ${member.employee_number}` : ''}
                </span>

                <Link
                    href={`/guru/${member.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 group-hover:text-brand-700 hover:underline"
                >
                    <span>Profil</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                </Link>
            </div>
        </div>
    );
}
