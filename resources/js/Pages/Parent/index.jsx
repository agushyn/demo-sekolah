import React, { useState } from 'react';
import { Head, usePage, router, Link } from '@inertiajs/react';
import BentoCard from '@/Components/BentoCard';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import ThemeCustomizer from '@/Components/ThemeCustomizer';
import EmptyState from '@/Components/EmptyState';
import {
    Users,
    Calendar,
    Award,
    GraduationCap,
    Sparkles,
    LogOut,
    BookOpen,
    CheckCircle2,
    Clock,
    AlertCircle,
    FileText,
    School,
    Phone,
    Mail,
    MapPin,
    Heart,
    Shield,
    ChevronRight,
    Bell,
    Layers,
    User,
    Activity,
    Info,
} from 'lucide-react';

export default function ParentDashboard({
    parentProfile,
    childrenList = [],
    selectedChild = null,
    upcomingEvents = [],
    latestNews = [],
    schoolInfo = {},
}) {
    const { auth, school } = usePage().props;
    const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'grades', 'assignments', 'attendance', 'announcements', 'school_info'

    const handleLogout = () => {
        router.post('/logout');
    };

    const handleSwitchChild = (childId) => {
        router.get(
            '/parent/dashboard',
            { child_id: childId },
            { preserveState: true, preserveScroll: true }
        );
    };

    const tabs = [
        { id: 'profile', label: 'Profil Anak', icon: User },
        { id: 'grades', label: 'Nilai & Rapor', icon: Award, count: selectedChild?.grades?.length },
        { id: 'assignments', label: 'Tugas Kelas', icon: FileText, count: selectedChild?.assignments?.length },
        { id: 'attendance', label: 'Presensi & Kehadiran', icon: Calendar },
        { id: 'announcements', label: 'Pengumuman & Agenda', icon: Bell, count: upcomingEvents?.length },
        { id: 'school_info', label: 'Informasi Sekolah', icon: School },
    ];

    return (
        <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col justify-between">
            <Head title={`Portal Orang Tua | ${school?.name || 'SMK Triwijaya'}`} />

            {/* Topbar */}
            <header className="h-20 bg-white border-b border-slate-200/90 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm shadow-amber-500/20">
                        <Heart className="w-5 h-5 fill-white/30 text-white" />
                    </div>
                    <div>
                        <h1 className="text-base font-black text-slate-900 tracking-tight leading-tight">
                            Portal Orang Tua / Wali
                        </h1>
                        <p className="text-xs text-slate-500 font-medium">
                            {school?.name || 'SMK Triwijaya'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex flex-col text-right">
                        <span className="text-xs font-black text-slate-900">
                            {auth?.user?.name || 'Wali Murid'}
                        </span>
                        <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">
                            {parentProfile?.relationship_type || 'Orang Tua / Wali'}
                        </span>
                    </div>

                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        leftIcon={LogOut}
                        onClick={handleLogout}
                        className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    >
                        Keluar
                    </Button>
                </div>
            </header>

            {/* Content Body */}
            <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
                {/* Child Switcher Bar (If multiple children or single) */}
                {childrenList.length > 0 && (
                    <div className="bg-white rounded-3xl border border-slate-200/90 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                                <GraduationCap className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-900">
                                    Pilih Data Putra/Putri Anda:
                                </p>
                                <p className="text-[11px] text-slate-500">
                                    {childrenList.length} siswa terhubung dengan akun ini
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {childrenList.map((child) => {
                                const isCurrent = selectedChild?.id === child.id;
                                return (
                                    <button
                                        key={child.id}
                                        type="button"
                                        onClick={() => handleSwitchChild(child.id)}
                                        className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                                            isCurrent
                                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                    >
                                        <span>{child.name}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                                            isCurrent ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-600'
                                        }`}>
                                            {child.class_name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Welcome Bento Banner */}
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-600 via-amber-700 to-slate-900 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-2 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-amber-100">
                                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                                <span>Pemantauan Perkembangan Akademik Siswa</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                                Selamat Datang, {auth?.user?.name || 'Bapak/Ibu'}!
                            </h2>
                            <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed font-normal">
                                Pantau kehadiran kelas, capaian nilai penugasan, batas waktu tugas, serta pengumuman resmi sekolah secara transparan untuk putra/putri Anda.
                            </p>
                        </div>

                        {selectedChild && (
                            <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                                <div className="w-10 h-10 rounded-xl bg-white text-amber-800 font-black flex items-center justify-center text-sm shadow-sm">
                                    {selectedChild.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-black text-white line-clamp-1">{selectedChild.name}</p>
                                    <p className="text-[11px] text-amber-200 font-mono">
                                        NISN: {selectedChild.nisn || '-'} • {selectedChild.class?.name || selectedChild.grade_level}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4 Core Stat Cards (If child is connected) */}
                {selectedChild ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <BentoCard
                            colSpan="col-span-1"
                            icon={Award}
                            badge="Rata-rata Nilai"
                            title={selectedChild.stats.average_score > 0 ? `${selectedChild.stats.average_score}` : '-'}
                            description={`Dari ${selectedChild.stats.graded_count} penugasan yang telah dinilai`}
                            iconColor="text-amber-600 bg-amber-50 border-amber-200"
                        />

                        <BentoCard
                            colSpan="col-span-1"
                            icon={Calendar}
                            badge="Kehadiran"
                            title={selectedChild.stats.attendance_rate || '100%'}
                            description="Tingkat presensi kehadiran semester aktif"
                            iconColor="text-emerald-600 bg-emerald-50 border-emerald-200"
                        />

                        <BentoCard
                            colSpan="col-span-1"
                            icon={FileText}
                            badge="Tugas Aktif"
                            title={`${selectedChild.stats.pending_assignments}`}
                            description="Tugas kelas yang belum dikumpulkan"
                            iconColor="text-indigo-600 bg-indigo-50 border-indigo-200"
                        />

                        <BentoCard
                            colSpan="col-span-1"
                            icon={School}
                            badge="Wali Kelas"
                            title={selectedChild.class?.homeroom_teacher || 'Pendidik'}
                            description={`Kelas: ${selectedChild.class?.name || selectedChild.grade_level}`}
                            iconColor="text-brand-600 bg-brand-50 border-brand-200"
                        />
                    </div>
                ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 text-center space-y-2">
                        <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
                        <h3 className="text-base font-bold text-amber-900">Belum Ada Siswa yang Terhubung</h3>
                        <p className="text-xs text-amber-700 max-w-md mx-auto">
                            Akun orang tua Anda belum ditautkan ke data siswa. Silakan hubungi pihak tata usaha atau admin sekolah untuk menghubungkan akun ke data putra/putri Anda.
                        </p>
                    </div>
                )}

                {/* Tab Navigation Controls */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-2 overflow-x-auto">
                    <div className="flex items-center gap-1.5 min-w-max">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                                        isActive
                                            ? 'bg-slate-900 text-white shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                                    <span>{tab.label}</span>
                                    {tab.count !== undefined && tab.count > 0 && (
                                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                                            isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                                        }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content 1: Profil Anak */}
                {activeTab === 'profile' && selectedChild && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Identitas Siswa */}
                        <div className="lg:col-span-8 bento-card p-6 sm:p-8 bg-white space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900">
                                        Data Identitas Siswa
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Biodata resmi terdaftar di database pokok pendidikan sekolah
                                    </p>
                                </div>
                                <Badge variant="emerald" size="md">
                                    Siswa Aktif
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nama Lengkap</span>
                                    <p className="text-xs font-extrabold text-slate-900">{selectedChild.name}</p>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">NISN / NIS</span>
                                    <p className="text-xs font-extrabold text-slate-900 font-mono">
                                        {selectedChild.nisn || '-'} / {selectedChild.nis || '-'}
                                    </p>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Jenis Kelamin</span>
                                    <p className="text-xs font-extrabold text-slate-900">{selectedChild.gender}</p>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tempat & Tanggal Lahir</span>
                                    <p className="text-xs font-extrabold text-slate-900">
                                        {selectedChild.birth_place ? `${selectedChild.birth_place}, ` : ''}{selectedChild.birth_date || '-'}
                                    </p>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 sm:col-span-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Alamat Tempat Tinggal</span>
                                    <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                                        {selectedChild.address || 'Alamat sesuai data pendaftaran orang tua.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Info Akademik & Wali Kelas */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bento-card p-6 bg-white space-y-4">
                                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                    <School className="w-4 h-4 text-brand-600" />
                                    <span>Kelas & Rombongan Belajar</span>
                                </h3>

                                <div className="space-y-3">
                                    <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-1">
                                        <span className="text-[10px] font-bold uppercase text-indigo-500">Kelas Aktif</span>
                                        <p className="text-base font-black text-indigo-900">
                                            {selectedChild.class?.name || selectedChild.grade_level}
                                        </p>
                                        <p className="text-[11px] text-indigo-700 font-medium">
                                            Tahun Ajaran: {selectedChild.class?.academic_year || '2026/2027'}
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                                        <span className="text-[10px] font-bold uppercase text-slate-400">Wali Kelas</span>
                                        <p className="text-xs font-extrabold text-slate-900">
                                            {selectedChild.class?.homeroom_teacher || 'Pendidik'}
                                        </p>
                                        {selectedChild.class?.homeroom_phone && selectedChild.class.homeroom_phone !== '-' && (
                                            <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
                                                <Phone className="w-3.5 h-3.5 text-brand-600" />
                                                <span className="font-mono">{selectedChild.class.homeroom_phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Content 2: Nilai & Rapor */}
                {activeTab === 'grades' && selectedChild && (
                    <div className="bento-card p-6 sm:p-8 bg-white space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">
                                    Rekam Jejak Capaian Nilai Penugasan
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Nilai tugas dari LMS Ruang Kelas Virtual yang telah diperiksa oleh dewan guru
                                </p>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-2xl">
                                <Award className="w-5 h-5 text-amber-600" />
                                <div>
                                    <span className="text-[10px] font-bold text-amber-700 uppercase">Rata-rata Nilai</span>
                                    <p className="text-lg font-black text-amber-900">{selectedChild.stats.average_score || '-'}</p>
                                </div>
                            </div>
                        </div>

                        {selectedChild.grades.length === 0 ? (
                            <EmptyState
                                icon={Award}
                                title="Belum Ada Nilai Tugas"
                                description="Belum ada penugasan yang selesai dinilai oleh dewan guru untuk siswa ini."
                            />
                        ) : (
                            <div className="space-y-4">
                                {selectedChild.grades.map((grade) => (
                                    <div
                                        key={grade.id}
                                        className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:shadow-xs transition-all space-y-3"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div>
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[11px] font-bold mb-1">
                                                    <BookOpen className="w-3 h-3 text-indigo-600" />
                                                    <span>{grade.subject_name}</span>
                                                </div>
                                                <h4 className="text-sm font-black text-slate-900">
                                                    {grade.assignment_title}
                                                </h4>
                                            </div>

                                            <div className="flex items-center gap-2 self-start sm:self-auto">
                                                <div className="text-right">
                                                    <span className="text-2xl font-black text-emerald-600">
                                                        {grade.score}
                                                    </span>
                                                    <span className="text-xs text-slate-400 font-bold">
                                                        /{grade.max_score}
                                                    </span>
                                                </div>
                                                <Badge variant="emerald" size="sm">
                                                    Dinilai
                                                </Badge>
                                            </div>
                                        </div>

                                        {grade.feedback && (
                                            <div className="p-3 rounded-xl bg-white border border-slate-200/60 text-xs text-slate-700 italic flex items-start gap-2">
                                                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                                <div>
                                                    <span className="font-bold text-slate-800 not-italic">Catatan Guru ({grade.grader_name}): </span>
                                                    <span>"{grade.feedback}"</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                                            <span>Dikumpulkan: {grade.submitted_at}</span>
                                            <span>Dinilai: {grade.graded_at}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab Content 3: Tugas Kelas */}
                {activeTab === 'assignments' && selectedChild && (
                    <div className="bento-card p-6 sm:p-8 bg-white space-y-6">
                        <div className="pb-4 border-b border-slate-100">
                            <h3 className="text-lg font-black text-slate-900">
                                Daftar Tugas & Batas Pengumpulan
                            </h3>
                            <p className="text-xs text-slate-500">
                                Status pengerjaan tugas akademik dari setiap mata pelajaran aktif
                            </p>
                        </div>

                        {selectedChild.assignments.length === 0 ? (
                            <EmptyState
                                icon={FileText}
                                title="Tidak Ada Tugas Aktif"
                                description="Seluruh penugasan kelas telah selesai atau belum ada tugas baru yang diterbitkan."
                            />
                        ) : (
                            <div className="space-y-4">
                                {selectedChild.assignments.map((asg) => {
                                    const isSubmitted = Boolean(asg.submission);
                                    const isGraded = asg.submission?.status === 'graded';

                                    return (
                                        <div
                                            key={asg.id}
                                            className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:shadow-xs transition-all space-y-3"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <div>
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-brand-50 text-brand-700 text-[11px] font-bold mb-1">
                                                        <BookOpen className="w-3 h-3 text-brand-600" />
                                                        <span>{asg.subject_name}</span>
                                                    </div>
                                                    <h4 className="text-sm font-black text-slate-900">
                                                        {asg.title}
                                                    </h4>
                                                </div>

                                                <div>
                                                    {isGraded ? (
                                                        <Badge variant="emerald" size="sm">
                                                            Nilai: {asg.submission.score}
                                                        </Badge>
                                                    ) : isSubmitted ? (
                                                        <Badge variant="indigo" size="sm">
                                                            Sudah Dikumpulkan
                                                        </Badge>
                                                    ) : asg.is_overdue ? (
                                                        <Badge variant="rose" size="sm">
                                                            Terlewat Deadline
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="amber" size="sm" dot>
                                                            Belum Dikumpulkan
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {asg.description && (
                                                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                                                    {asg.description}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>Tenggat Waktu: <strong>{asg.deadline}</strong></span>
                                                </div>
                                                {isSubmitted && (
                                                    <span className="text-emerald-700 font-semibold">
                                                        Waktu Pengumpulan: {asg.submission.submitted_at}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab Content 4: Kehadiran / Presensi */}
                {activeTab === 'attendance' && selectedChild && (
                    <div className="space-y-6">
                        {/* Attendance Stats Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                                <span className="text-[10px] font-bold text-emerald-600 uppercase">Hadir</span>
                                <p className="text-2xl font-black text-emerald-800">
                                    {selectedChild.attendance_summary.present} Hari
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-center space-y-1">
                                <span className="text-[10px] font-bold text-indigo-600 uppercase">Izin</span>
                                <p className="text-2xl font-black text-indigo-800">
                                    {selectedChild.attendance_summary.permission} Hari
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-1">
                                <span className="text-[10px] font-bold text-amber-600 uppercase">Sakit</span>
                                <p className="text-2xl font-black text-amber-800">
                                    {selectedChild.attendance_summary.sick} Hari
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-1">
                                <span className="text-[10px] font-bold text-rose-600 uppercase">Alpa / Tanpa Ket</span>
                                <p className="text-2xl font-black text-rose-800">
                                    {selectedChild.attendance_summary.absent} Hari
                                </p>
                            </div>
                        </div>

                        {/* Recent Attendance Log Table */}
                        <div className="bento-card p-6 sm:p-8 bg-white space-y-4">
                            <h3 className="text-base font-black text-slate-900">
                                Riwayat Presensi Harian Terbaru
                            </h3>

                            {selectedChild.recent_attendances.length === 0 ? (
                                <div className="p-8 text-center text-xs text-slate-400">
                                    Belum ada log presensi tercatat untuk siswa ini. Kehadiran dihitung 100% aktif.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                                                <th className="py-2.5 px-3">Hari & Tanggal</th>
                                                <th className="py-2.5 px-3">Kelas</th>
                                                <th className="py-2.5 px-3">Status</th>
                                                <th className="py-2.5 px-3">Catatan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {selectedChild.recent_attendances.map((att) => (
                                                <tr key={att.id}>
                                                    <td className="py-3 px-3 font-semibold text-slate-900">
                                                        {att.day_name}, {att.date}
                                                    </td>
                                                    <td className="py-3 px-3 text-slate-600">
                                                        {att.class_name}
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        <Badge
                                                            variant={
                                                                att.status === 'present'
                                                                    ? 'emerald'
                                                                    : att.status === 'permission'
                                                                    ? 'indigo'
                                                                    : att.status === 'sick'
                                                                    ? 'amber'
                                                                    : 'rose'
                                                            }
                                                            size="sm"
                                                        >
                                                            {att.status_label}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 px-3 text-slate-500 italic">
                                                        {att.notes || '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tab Content 5: Pengumuman & Agenda */}
                {activeTab === 'announcements' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Kalender Akademik & Agenda */}
                        <div className="lg:col-span-6 bento-card p-6 sm:p-8 bg-white space-y-4">
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-brand-600" />
                                <span>Agenda & Kalender Sekolah</span>
                            </h3>

                            {upcomingEvents.length === 0 ? (
                                <p className="text-xs text-slate-400 py-6 text-center">
                                    Tidak ada agenda mendatang dalam waktu dekat.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {upcomingEvents.map((ev) => (
                                        <div
                                            key={ev.id}
                                            className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1"
                                        >
                                            <div className="flex items-center justify-between">
                                                <Badge variant="brand" size="xs">
                                                    {ev.category_name}
                                                </Badge>
                                                <span className="text-[11px] font-mono text-slate-500">
                                                    {ev.formatted_date}
                                                </span>
                                            </div>
                                            <h4 className="text-xs font-extrabold text-slate-900 pt-1">
                                                {ev.title}
                                            </h4>
                                            {ev.description && (
                                                <p className="text-[11px] text-slate-600 line-clamp-2">
                                                    {ev.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Warta & Pengumuman Sekolah */}
                        <div className="lg:col-span-6 bento-card p-6 sm:p-8 bg-white space-y-4">
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <Bell className="w-5 h-5 text-amber-600" />
                                <span>Warta & Pengumuman Resmi</span>
                            </h3>

                            {latestNews.length === 0 ? (
                                <p className="text-xs text-slate-400 py-6 text-center">
                                    Belum ada pengumuman warta terbaru.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {latestNews.map((news) => (
                                        <Link
                                            key={news.id}
                                            href={`/berita/${news.slug}`}
                                            className="p-4 rounded-2xl bg-slate-50 border border-slate-100 block hover:border-brand-300 hover:bg-white transition-all space-y-1 group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] text-slate-400 font-mono">
                                                    {news.date}
                                                </span>
                                                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-transform" />
                                            </div>
                                            <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                                                {news.title}
                                            </h4>
                                            <p className="text-[11px] text-slate-500 line-clamp-2">
                                                {news.excerpt}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tab Content 6: Informasi Sekolah */}
                {activeTab === 'school_info' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-8 bento-card p-6 sm:p-8 bg-white space-y-6">
                            <div className="space-y-1 pb-4 border-b border-slate-100">
                                <h3 className="text-lg font-black text-slate-900">
                                    Profil & Saluran Informasi Sekolah
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Layanan informasi resmi bagi seluruh orang tua dan wali murid
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kepala Sekolah</span>
                                    <p className="text-xs font-black text-slate-900">{schoolInfo.principal_name}</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status Akreditasi</span>
                                    <p className="text-xs font-black text-emerald-700">{schoolInfo.accreditation}</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kurikulum Nasional</span>
                                    <p className="text-xs font-bold text-slate-800">{schoolInfo.curriculum}</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nomor Pokok Sekolah (NPSN)</span>
                                    <p className="text-xs font-mono font-bold text-slate-800">{schoolInfo.npsn}</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 sm:col-span-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Alamat Kampus Sekolah</span>
                                    <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                                        {schoolInfo.address}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-6">
                            <div className="bento-card p-6 bg-white space-y-4">
                                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-emerald-600" />
                                    <span>Kontak Layanan Orang Tua</span>
                                </h3>

                                <div className="space-y-3">
                                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-1">
                                        <span className="text-[10px] font-bold uppercase text-emerald-700">Telepon / WhatsApp Tata Usaha</span>
                                        <p className="text-xs font-mono font-bold text-emerald-900">{schoolInfo.phone}</p>
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-brand-50 border border-brand-100 space-y-1">
                                        <span className="text-[10px] font-bold uppercase text-brand-700">Email Resmi</span>
                                        <p className="text-xs font-mono font-bold text-brand-900">{schoolInfo.email}</p>
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                        <span className="text-[10px] font-bold uppercase text-slate-400">Jam Layanan Tata Usaha</span>
                                        <p className="text-xs font-medium text-slate-700">{schoolInfo.office_hours}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <footer className="p-4 sm:p-6 text-center text-xs text-slate-500 bg-white border-t border-slate-200/80">
                © {new Date().getFullYear()} {school?.name || 'SMK Triwijaya'}. Portal Komunikasi Terpadu Sekolah & Orang Tua.
            </footer>

            <ThemeCustomizer />
        </div>
    );
}
