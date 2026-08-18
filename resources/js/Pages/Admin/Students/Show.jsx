import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import BentoCard from '@/Components/BentoCard';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import EmptyState from '@/Components/EmptyState';
import {
    Users,
    ArrowLeft,
    School,
    GraduationCap,
    Calendar,
    Award,
    Heart,
    Edit3,
    Clock,
    CheckCircle2,
    FileText,
    History,
    Phone,
    Mail,
    MapPin,
    Shield,
    Sparkles,
    User,
    Layers,
    Save,
    AlertCircle,
} from 'lucide-react';

export default function StudentShow({
    student,
    classes = [],
    academicYears = [],
    recentAttendances = [],
    attendanceStats = {},
}) {
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'personal', 'class', 'history', 'attendance', 'parent'

    // Individual Class Change Modal State
    const [isChangeClassOpen, setIsChangeClassOpen] = useState(false);
    const { data, setData, put, processing, errors, reset } = useForm({
        to_class_id: student.classes?.[0]?.id ? String(student.classes[0].id) : (classes[0]?.id ? String(classes[0].id) : ''),
        academic_year_id: student.classes?.[0]?.academic_year_id ? String(student.classes[0].academic_year_id) : (academicYears[0]?.id ? String(academicYears[0].id) : ''),
        notes: '',
    });

    const activeClass = student.classes?.[0];
    const classHistoryList = student.class_history || [];
    const auditLogsList = student.audit_logs || [];

    const handleClassSubmit = (e) => {
        e.preventDefault();
        put(`/admin/students/${student.id}/class`, {
            onSuccess: () => {
                setIsChangeClassOpen(false);
                reset();
            },
        });
    };

    const tabs = [
        { id: 'overview', label: 'Ringkasan', icon: Layers },
        { id: 'personal', label: 'Data Pribadi', icon: User },
        { id: 'class', label: 'Kelas & Rombel', icon: School },
        { id: 'history', label: 'Riwayat Kelas', icon: History, count: classHistoryList.length },
        { id: 'attendance', label: 'Presensi', icon: Calendar, count: recentAttendances.length },
        { id: 'parent', label: 'Orang Tua / Wali', icon: Heart },
    ];

    return (
        <AdminLayout title={`Detail Siswa: ${student.user?.name || 'Siswa'}`}>
            <Head title={`Detail Siswa - ${student.user?.name || 'Siswa'}`} />

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Top Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <Link href="/admin/students">
                        <Button variant="secondary" size="sm" leftIcon={ArrowLeft} className="text-xs">
                            Kembali ke Daftar Siswa
                        </Button>
                    </Link>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            leftIcon={Edit3}
                            onClick={() => setIsChangeClassOpen(true)}
                            className="text-xs font-bold"
                        >
                            Ubah Kelas Siswa
                        </Button>
                    </div>
                </div>

                {/* Header Banner */}
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-800 via-indigo-900 to-slate-950 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-inner">
                                {student.user?.name ? student.user.name.charAt(0).toUpperCase() : 'S'}
                            </div>

                            <div className="space-y-1">
                                <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-semibold text-indigo-200">
                                    <GraduationCap className="w-3.5 h-3.5" />
                                    <span>NISN: {student.nisn || '-'} • NIS: {student.nis || '-'}</span>
                                </div>
                                <h1 className="text-xl sm:text-3xl font-black tracking-tight">
                                    {student.user?.name || 'Nama Siswa'}
                                </h1>
                                <p className="text-xs sm:text-sm text-indigo-200 font-medium">
                                    {activeClass?.name ? `Kelas: ${activeClass.name}` : student.grade_level || 'Belum Ada Rombel'} • Tahun Ajaran: {activeClass?.academic_year?.name || '2026/2027'}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="emerald" size="md">
                                Siswa Aktif
                            </Badge>
                            {student.parent ? (
                                <Badge variant="amber" size="md">
                                    Wali: {student.parent.user?.name}
                                </Badge>
                            ) : (
                                <Badge variant="neutral" size="md">
                                    Belum Ada Wali
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
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
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
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

                {/* TAB 1: OVERVIEW */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* 4 Overview Bento Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <BentoCard
                                colSpan="col-span-1"
                                icon={School}
                                badge="Rombel Aktif"
                                title={activeClass?.name || student.grade_level || 'Tingkat X'}
                                description={`Tahun Ajaran ${activeClass?.academic_year?.name || '2026/2027'}`}
                                iconColor="text-indigo-600 bg-indigo-50 border-indigo-200"
                            />

                            <BentoCard
                                colSpan="col-span-1"
                                icon={Calendar}
                                badge="Presensi"
                                title={attendanceStats.attendance_rate || '100%'}
                                description={`${attendanceStats.present || 0} Hari Hadir dari ${attendanceStats.total_days || 0} hari`}
                                iconColor="text-emerald-600 bg-emerald-50 border-emerald-200"
                            />

                            <BentoCard
                                colSpan="col-span-1"
                                icon={History}
                                badge="Riwayat Kelas"
                                title={`${classHistoryList.length} Periode`}
                                description="Histori kenaikan & mutasi rombel"
                                iconColor="text-amber-600 bg-amber-50 border-amber-200"
                            />

                            <BentoCard
                                colSpan="col-span-1"
                                icon={Heart}
                                badge="Orang Tua / Wali"
                                title={student.parent?.user?.name || 'Belum Terhubung'}
                                description={student.parent?.phone || 'Hubungkan akun wali'}
                                iconColor="text-rose-600 bg-rose-50 border-rose-200"
                            />
                        </div>

                        {/* Quick Data Highlights */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-6 bento-card p-6 bg-white space-y-4">
                                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                    <User className="w-4 h-4 text-brand-600" />
                                    <span>Identitas Singkat</span>
                                </h3>

                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between py-2 border-b border-slate-100">
                                        <span className="text-slate-500">Nama Lengkap</span>
                                        <span className="font-bold text-slate-900">{student.user?.name}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-slate-100">
                                        <span className="text-slate-500">NISN / NIS</span>
                                        <span className="font-mono font-bold text-slate-900">{student.nisn || '-'} / {student.nis || '-'}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-slate-100">
                                        <span className="text-slate-500">Email Akun</span>
                                        <span className="font-mono text-slate-700">{student.user?.email}</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="text-slate-500">Jenis Kelamin</span>
                                        <span className="font-semibold text-slate-900">{student.gender === 'L' ? 'Laki-laki' : (student.gender === 'P' ? 'Perempuan' : '-')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-6 bento-card p-6 bg-white space-y-4">
                                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                    <School className="w-4 h-4 text-indigo-600" />
                                    <span>Wali Kelas & Akademik</span>
                                </h3>

                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between py-2 border-b border-slate-100">
                                        <span className="text-slate-500">Wali Kelas</span>
                                        <span className="font-bold text-slate-900">{activeClass?.homeroom_teacher?.user?.name || 'Pendidik Pengampu'}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-slate-100">
                                        <span className="text-slate-500">Telepon Wali Kelas</span>
                                        <span className="font-mono text-slate-700">{activeClass?.homeroom_teacher?.phone || '-'}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-slate-100">
                                        <span className="text-slate-500">Tahun Ajaran Aktif</span>
                                        <span className="font-bold text-indigo-700">{activeClass?.academic_year?.name || '2026/2027'}</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="text-slate-500">Status Enrollment</span>
                                        <Badge variant="emerald" size="xs">Aktif di Kelas</Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: DATA PRIBADI */}
                {activeTab === 'personal' && (
                    <div className="bento-card p-6 sm:p-8 bg-white space-y-6">
                        <div className="pb-4 border-b border-slate-100">
                            <h3 className="text-lg font-black text-slate-900">
                                Biodata & Identitas Siswa
                            </h3>
                            <p className="text-xs text-slate-500">
                                Data resmi siswa terdaftar pada database pokok pendidikan
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                <span className="text-[10px] font-bold uppercase text-slate-400">Nama Lengkap</span>
                                <p className="text-xs font-bold text-slate-900">{student.user?.name}</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                <span className="text-[10px] font-bold uppercase text-slate-400">Email Akun Login</span>
                                <p className="text-xs font-mono font-bold text-slate-900">{student.user?.email}</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                <span className="text-[10px] font-bold uppercase text-slate-400">Nomor Induk Siswa Nasional (NISN)</span>
                                <p className="text-xs font-mono font-bold text-slate-900">{student.nisn || '-'}</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                <span className="text-[10px] font-bold uppercase text-slate-400">Nomor Induk Siswa (NIS)</span>
                                <p className="text-xs font-mono font-bold text-slate-900">{student.nis || '-'}</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                <span className="text-[10px] font-bold uppercase text-slate-400">Jenis Kelamin</span>
                                <p className="text-xs font-bold text-slate-900">{student.gender === 'L' ? 'Laki-laki' : (student.gender === 'P' ? 'Perempuan' : '-')}</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                <span className="text-[10px] font-bold uppercase text-slate-400">Tempat & Tanggal Lahir</span>
                                <p className="text-xs font-bold text-slate-900">
                                    {student.birth_place ? `${student.birth_place}, ` : ''}{student.birth_date ? new Date(student.birth_date).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'}
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                <span className="text-[10px] font-bold uppercase text-slate-400">Nomor Telepon / WA Siswa</span>
                                <p className="text-xs font-mono font-bold text-slate-900">{student.phone || '-'}</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                <span className="text-[10px] font-bold uppercase text-slate-400">Kelas & Rombel Terdaftar</span>
                                <p className="text-xs font-bold text-indigo-700">{activeClass?.name || student.grade_level}</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 sm:col-span-2">
                                <span className="text-[10px] font-bold uppercase text-slate-400">Alamat Tempat Tinggal</span>
                                <p className="text-xs font-medium text-slate-800 leading-relaxed">
                                    {student.address || 'Belum mengisi alamat domisili lengkap.'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 3: KELAS & ROMBEL */}
                {activeTab === 'class' && (
                    <div className="bento-card p-6 sm:p-8 bg-white space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">
                                    Status Kelas & Rombongan Belajar
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Informasi penempatan kelas aktif serta tombol perubahan kelas individual
                                </p>
                            </div>

                            <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                leftIcon={Edit3}
                                onClick={() => setIsChangeClassOpen(true)}
                                className="text-xs"
                            >
                                Ubah Kelas Siswa
                            </Button>
                        </div>

                        <div className="p-6 rounded-3xl bg-indigo-50 border border-indigo-100 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                                    Kelas Aktif Saat Ini
                                </span>
                                <Badge variant="emerald" size="md">
                                    Status: Terdaftar Aktif
                                </Badge>
                            </div>

                            <div className="space-y-1">
                                <h4 className="text-2xl font-black text-indigo-950">
                                    {activeClass?.name || student.grade_level || 'Belum Ditentukan'}
                                </h4>
                                <p className="text-xs text-indigo-700 font-medium">
                                    Tahun Ajaran: <strong>{activeClass?.academic_year?.name || '2026/2027'} ({activeClass?.academic_year?.semester || 'Ganjil'})</strong>
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-indigo-200/60 text-xs">
                                <div>
                                    <span className="text-indigo-600 font-semibold">Wali Kelas Pengampu:</span>
                                    <p className="font-bold text-indigo-900 mt-0.5">
                                        {activeClass?.homeroom_teacher?.user?.name || 'Pendidik'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-indigo-600 font-semibold">Tingkat Jenjang:</span>
                                    <p className="font-bold text-indigo-900 mt-0.5">
                                        Kelas Tingkat {activeClass?.grade_level || '10'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 4: RIWAYAT KELAS & AUDIT LOG */}
                {activeTab === 'history' && (
                    <div className="space-y-6">
                        {/* Timeline Riwayat Enrollment */}
                        <div className="bento-card p-6 sm:p-8 bg-white space-y-6">
                            <div className="pb-4 border-b border-slate-100">
                                <h3 className="text-lg font-black text-slate-900">
                                    Timeline Riwayat Kelas Siswa
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Histori lengkap kenaikan jenjang, tahun ajaran, dan status enrollment siswa
                                </p>
                            </div>

                            {classHistoryList.length === 0 ? (
                                <p className="text-xs text-slate-400 py-6 text-center">
                                    Belum ada catatan riwayat kelas tersimpan untuk siswa ini.
                                </p>
                            ) : (
                                <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                                    {classHistoryList.map((item, idx) => (
                                        <div key={item.id} className="relative flex items-start gap-4 pl-8">
                                            <div className={`absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full border-2 bg-white ${
                                                item.status === 'active' ? 'border-emerald-500 ring-4 ring-emerald-100' : 'border-slate-400'
                                            }`} />

                                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 w-full space-y-2">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-sm font-black text-slate-900">
                                                            {item.class_room?.name || 'Rombel'}
                                                        </h4>
                                                        <Badge variant={item.badge_variant} size="xs">
                                                            {item.status_label}
                                                        </Badge>
                                                    </div>
                                                    <span className="text-[11px] font-mono text-slate-500">
                                                        Tahun Ajaran: {item.academic_year?.name || '-'}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-600">
                                                    <span>Periode: <strong>{item.start_date ? new Date(item.start_date).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-'}</strong> s/d <strong>{item.end_date ? new Date(item.end_date).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : 'Sekarang (Aktif)'}</strong></span>
                                                    {item.class_room?.homeroom_teacher && (
                                                        <span>Wali Kelas: <strong>{item.class_room.homeroom_teacher.user?.name}</strong></span>
                                                    )}
                                                </div>

                                                {item.notes && (
                                                    <p className="text-[11px] text-slate-500 italic bg-white p-2.5 rounded-xl border border-slate-200/60">
                                                        Catatan: "{item.notes}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Audit Log Table */}
                        <div className="bento-card p-6 sm:p-8 bg-white space-y-4">
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-indigo-600" />
                                <span>Audit Trail Perubahan Kelas</span>
                            </h3>

                            {auditLogsList.length === 0 ? (
                                <p className="text-xs text-slate-400 py-4 text-center">
                                    Belum ada aktivitas mutasi/perubahan kelas tercatat.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                                                <th className="py-2.5 px-3">Waktu</th>
                                                <th className="py-2.5 px-3">Aksi</th>
                                                <th className="py-2.5 px-3">Dari Kelas</th>
                                                <th className="py-2.5 px-3">Ke Kelas</th>
                                                <th className="py-2.5 px-3">Oleh Admin</th>
                                                <th className="py-2.5 px-3">Catatan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {auditLogsList.map((log) => (
                                                <tr key={log.id} className="hover:bg-slate-50">
                                                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                                                        {new Date(log.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                                    </td>
                                                    <td className="py-2.5 px-3">
                                                        <Badge variant="indigo" size="xs">
                                                            {log.action_label}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                                                        {log.from_class?.name || '-'}
                                                    </td>
                                                    <td className="py-2.5 px-3 font-semibold text-brand-700">
                                                        {log.to_class?.name || '-'}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-slate-600">
                                                        {log.performer?.name || 'Administrator'}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-slate-500 italic max-w-xs truncate">
                                                        {log.notes || '-'}
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

                {/* TAB 5: PRESENSI */}
                {activeTab === 'attendance' && (
                    <div className="space-y-6">
                        {/* Attendance Summary */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                                <span className="text-[10px] font-bold text-emerald-600 uppercase">Hadir</span>
                                <p className="text-2xl font-black text-emerald-800">{attendanceStats.present || 0} Hari</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-center space-y-1">
                                <span className="text-[10px] font-bold text-indigo-600 uppercase">Izin</span>
                                <p className="text-2xl font-black text-indigo-800">{attendanceStats.permission || 0} Hari</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-1">
                                <span className="text-[10px] font-bold text-amber-600 uppercase">Sakit</span>
                                <p className="text-2xl font-black text-amber-800">{attendanceStats.sick || 0} Hari</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-1">
                                <span className="text-[10px] font-bold text-rose-600 uppercase">Alpa</span>
                                <p className="text-2xl font-black text-rose-800">{attendanceStats.absent || 0} Hari</p>
                            </div>
                        </div>

                        {/* Recent Attendance Log */}
                        <div className="bento-card p-6 sm:p-8 bg-white space-y-4">
                            <h3 className="text-base font-black text-slate-900">
                                Log Riwayat Kehadiran Siswa
                            </h3>

                            {recentAttendances.length === 0 ? (
                                <p className="text-xs text-slate-400 py-6 text-center">
                                    Belum ada catatan presensi tercatat untuk siswa ini.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                                                <th className="py-2.5 px-3">Tanggal</th>
                                                <th className="py-2.5 px-3">Status</th>
                                                <th className="py-2.5 px-3">Masuk / Pulang</th>
                                                <th className="py-2.5 px-3">Sumber Data</th>
                                                <th className="py-2.5 px-3">Catatan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {recentAttendances.map((att) => (
                                                <tr key={att.id}>
                                                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                                                        {new Date(att.date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                                    </td>
                                                    <td className="py-2.5 px-3">
                                                        <Badge variant={att.badge_variant} size="xs">
                                                            {att.status_label}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-2.5 px-3 font-mono text-slate-600">
                                                        {att.check_in || '-'} / {att.check_out || '-'}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-slate-500">
                                                        {att.source_label || att.source}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-slate-500 italic">
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

                {/* TAB 6: PARENT / WALI */}
                {activeTab === 'parent' && (
                    <div className="bento-card p-6 sm:p-8 bg-white space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">
                                    Akun Orang Tua / Wali Murid
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Informasi akun wali yang terhubung untuk pemantauan portal orang tua
                                </p>
                            </div>

                            {student.parent && (
                                <Link href={`/admin/parents/${student.parent.id}/edit`}>
                                    <Button variant="secondary" size="sm" leftIcon={Edit3} className="text-xs">
                                        Edit Akun Wali
                                    </Button>
                                </Link>
                            )}
                        </div>

                        {student.parent ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-1">
                                    <span className="text-[10px] font-bold uppercase text-amber-700">Nama Orang Tua / Wali</span>
                                    <p className="text-xs font-black text-slate-900">{student.parent.user?.name}</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                    <span className="text-[10px] font-bold uppercase text-slate-400">Hubungan Keluarga</span>
                                    <Badge variant="amber" size="sm">{student.parent.relationship_type || 'Wali'}</Badge>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                    <span className="text-[10px] font-bold uppercase text-slate-400">Nomor Telepon / WA</span>
                                    <p className="text-xs font-mono font-bold text-slate-900">{student.parent.phone || '-'}</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                    <span className="text-[10px] font-bold uppercase text-slate-400">Email Akun Login</span>
                                    <p className="text-xs font-mono font-bold text-slate-900">{student.parent.user?.email || '-'}</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                    <span className="text-[10px] font-bold uppercase text-slate-400">Nomor Induk Kependudukan (NIK)</span>
                                    <p className="text-xs font-mono font-bold text-slate-900">{student.parent.nik || '-'}</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                    <span className="text-[10px] font-bold uppercase text-slate-400">Pekerjaan</span>
                                    <p className="text-xs font-bold text-slate-900">{student.parent.occupation || '-'}</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 sm:col-span-2">
                                    <span className="text-[10px] font-bold uppercase text-slate-400">Alamat Tempat Tinggal Wali</span>
                                    <p className="text-xs text-slate-800">{student.parent.address || 'Alamat sama dengan domisili siswa.'}</p>
                                </div>
                            </div>
                        ) : (
                            <EmptyState
                                icon={Heart}
                                title="Belum Ada Akun Wali Terhubung"
                                description="Siswa ini belum memiliki akun orang tua/wali yang ditautkan di sistem."
                                actionLabel="Tautkan atau Buat Akun Wali"
                                onAction={() => router.visit('/admin/parents/create')}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Modal Ubah Kelas Individual */}
            {isChangeClassOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
                                <School className="w-3.5 h-3.5" />
                                <span>Mutasi / Ganti Kelas Siswa</span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900">
                                Ubah Kelas Siswa Individual
                            </h3>
                            <p className="text-xs text-slate-500">
                                Siswa: <strong>{student.user?.name}</strong> • Kelas Saat Ini: <strong>{activeClass?.name || student.grade_level}</strong>
                            </p>
                        </div>

                        <form onSubmit={handleClassSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700">
                                    Kelas / Rombel Tujuan <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={data.to_class_id}
                                    onChange={(e) => setData('to_class_id', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-800 focus:border-brand-500 focus:outline-hidden"
                                    required
                                >
                                    {classes.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} (Tingkat {c.grade_level}) • {c.academic_year?.name || '2026/2027'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700">
                                    Tahun Ajaran
                                </label>
                                <select
                                    value={data.academic_year_id}
                                    onChange={(e) => setData('academic_year_id', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-800 focus:border-brand-500 focus:outline-hidden"
                                >
                                    {academicYears.map((ay) => (
                                        <option key={ay.id} value={ay.id}>
                                            {ay.name} ({ay.semester}) {ay.is_active ? '• Aktif' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700">
                                    Catatan Alasan Perubahan (Audit Log)
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Contoh: Pindah peminatan dari MIPA 1 ke MIPA 2 berdasarkan permohonan siswa..."
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-800 focus:border-brand-500 focus:outline-hidden"
                                />
                            </div>

                            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                                ℹ️ Sistem akan mengarsipkan enrollment lama dan membuat status enrollment aktif baru serta mencatat audit log.
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setIsChangeClassOpen(false)}
                                    disabled={processing}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="sm"
                                    isLoading={processing}
                                    leftIcon={Save}
                                >
                                    Simpan Perubahan Kelas
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
