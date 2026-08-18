import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import BentoCard from '@/Components/BentoCard';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import EmptyState from '@/Components/EmptyState';
import {
    Clock,
    Calendar,
    CheckCircle2,
    AlertCircle,
    UserCheck,
    RefreshCw,
    Search,
    Filter,
    Plus,
    Cloud,
    Database,
    Shield,
    FileText,
    Sparkles,
    Users,
    Download,
    FileSpreadsheet,
    Layers,
} from 'lucide-react';

export default function AttendanceIndex({
    attendances,
    summary = {},
    classes = [],
    academicYears = [],
    apiStatus = {},
    filters = {},
}) {
    const [date, setDate] = useState(filters.date || new Date().toISOString().split('T')[0]);
    const [classId, setClassId] = useState(filters.class_id || 'all');
    const [source, setSource] = useState(filters.source || 'all');
    const [status, setStatus] = useState(filters.status || 'all');

    const [isSyncing, setIsSyncing] = useState(false);

    // Modal Entry State
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [modalStudentId, setModalStudentId] = useState('');
    const [modalDate, setModalDate] = useState(date);
    const [modalStatus, setModalStatus] = useState('present');
    const [modalCheckIn, setModalCheckIn] = useState('07:15');
    const [modalCheckOut, setModalCheckOut] = useState('15:30');
    const [modalNotes, setModalNotes] = useState('');
    const [modalClassId, setModalClassId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFilterChange = (newDate, newClass, newSource, newStatus) => {
        router.get(
            '/admin/attendances',
            {
                date: newDate !== undefined ? newDate : date,
                class_id: newClass !== undefined ? newClass : classId,
                source: newSource !== undefined ? newSource : source,
                status: newStatus !== undefined ? newStatus : status,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleSync = () => {
        setIsSyncing(true);
        router.post(
            '/admin/attendances/sync',
            { date: date },
            {
                onFinish: () => setIsSyncing(false),
            }
        );
    };

    const handleExport = () => {
        const query = new URLSearchParams({
            date: date,
            class_id: classId,
            source: source,
            status: status,
        }).toString();

        window.location.href = `/admin/attendances/export?${query}`;
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (!modalStudentId) return;

        setIsSubmitting(true);
        router.post(
            '/admin/attendances',
            {
                student_id: modalStudentId,
                date: modalDate,
                status: modalStatus,
                check_in: modalCheckIn,
                check_out: modalCheckOut,
                notes: modalNotes,
                class_id: modalClassId || null,
            },
            {
                onSuccess: () => {
                    setIsManualModalOpen(false);
                    setModalNotes('');
                },
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    return (
        <AdminLayout title="Manajemen Presensi Siswa (API Ready & Export)">
            <Head title="Presensi Siswa" />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Header Banner */}
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-2 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200">
                                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                                <span>Attendance Management & Multi-Provider Sync (Supabase / REST)</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                                Rekap & Sinkronisasi Presensi Siswa
                            </h1>
                            <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
                                Pantau kehadiran harian, unduh laporan presensi ke format Excel (.xlsx) berdasarkan kelas, dan sinkronkan dengan cloud database Supabase atau API eksternal.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                            <Button
                                type="button"
                                variant="secondary"
                                size="md"
                                leftIcon={Download}
                                onClick={handleExport}
                                className="bg-white/15 text-white hover:bg-white/25 border-white/20 font-bold backdrop-blur-md text-xs"
                            >
                                Export Excel (.xlsx)
                            </Button>

                            <Button
                                type="button"
                                variant="primary"
                                size="md"
                                leftIcon={RefreshCw}
                                isLoading={isSyncing}
                                onClick={handleSync}
                                className="bg-indigo-600 hover:bg-indigo-700 font-bold text-xs shadow-md"
                            >
                                Sinkronkan Presensi API
                            </Button>
                        </div>
                    </div>
                </div>

                {/* API Status Notice Banner */}
                <div className={`p-4 sm:p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${apiStatus.is_configured
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : 'bg-indigo-50/80 border-indigo-200 text-indigo-950'
                    }`}>
                    <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${apiStatus.is_configured ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'
                            }`}>
                            {apiStatus.driver === 'supabase' ? <Layers className="w-5 h-5" /> : (apiStatus.is_configured ? <Cloud className="w-5 h-5" /> : <Database className="w-5 h-5" />)}
                        </div>
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <h4 className="text-xs font-black uppercase tracking-wider">
                                    {apiStatus.provider_name}
                                </h4>
                                <Badge variant={apiStatus.is_configured ? 'emerald' : 'indigo'} size="xs">
                                    {apiStatus.is_configured ? `Driver: ${apiStatus.driver.toUpperCase()} Siap` : 'Internal Database Ready'}
                                </Badge>
                            </div>
                            <p className="text-xs font-medium text-slate-700 leading-relaxed">
                                {apiStatus.message}
                            </p>
                        </div>
                    </div>

                    <a href="/admin/settings">
                        <Button variant="secondary" size="lg" className="text-xs font-bold shrink-0 bg-white">
                            Pengaturan API
                        </Button>
                    </a>
                </div>

                {/* 4 Summary Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <BentoCard
                        colSpan="col-span-1"
                        icon={CheckCircle2}
                        badge="Hadir"
                        title={`${summary.present || 0} Siswa`}
                        description={`Tingkat Kehadiran: ${summary.attendance_rate || '100%'}`}
                        iconColor="text-emerald-600 bg-emerald-50 border-emerald-200"
                    />

                    <BentoCard
                        colSpan="col-span-1"
                        icon={Calendar}
                        badge="Izin"
                        title={`${summary.permission || 0} Siswa`}
                        description="Surat dispensasi / izin resmi"
                        iconColor="text-indigo-600 bg-indigo-50 border-indigo-200"
                    />

                    <BentoCard
                        colSpan="col-span-1"
                        icon={AlertCircle}
                        badge="Sakit"
                        title={`${summary.sick || 0} Siswa`}
                        description="Keterangan surat dokter/kesehatan"
                        iconColor="text-amber-600 bg-amber-50 border-amber-200"
                    />

                    <BentoCard
                        colSpan="col-span-1"
                        icon={Clock}
                        badge="Alpa"
                        title={`${summary.absent || 0} Siswa`}
                        description="Tanpa keterangan kehadiran"
                        iconColor="text-rose-600 bg-rose-50 border-rose-200"
                    />
                </div>

                {/* Filters & Date Bar */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-3 space-y-1">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase">Tanggal</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => {
                                    setDate(e.target.value);
                                    handleFilterChange(e.target.value, classId, source, status);
                                }}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-brand-500 focus:outline-hidden"
                            />
                        </div>

                        <div className="sm:col-span-3 space-y-1">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase">Kelas / Rombel</label>
                            <select
                                value={classId}
                                onChange={(e) => {
                                    setClassId(e.target.value);
                                    handleFilterChange(date, e.target.value, source, status);
                                }}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-brand-500 focus:outline-hidden"
                            >
                                <option value="all">Semua Rombel</option>
                                {classes.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="sm:col-span-3 space-y-1">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase">Sumber Data</label>
                            <select
                                value={source}
                                onChange={(e) => {
                                    setSource(e.target.value);
                                    handleFilterChange(date, classId, e.target.value, status);
                                }}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-brand-500 focus:outline-hidden"
                            >
                                <option value="all">Semua Sumber</option>
                                <option value="manual">Manual (Admin / Guru)</option>
                                <option value="internal">Internal Sekolah</option>
                                <option value="external_api">API Eksternal / Supabase</option>
                            </select>
                        </div>

                        <div className="sm:col-span-3 space-y-1">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase">Status Kehadiran</label>
                            <select
                                value={status}
                                onChange={(e) => {
                                    setStatus(e.target.value);
                                    handleFilterChange(date, classId, source, e.target.value);
                                }}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-brand-500 focus:outline-hidden"
                            >
                                <option value="all">Semua Status</option>
                                <option value="present">Hadir</option>
                                <option value="permission">Izin</option>
                                <option value="sick">Sakit</option>
                                <option value="absent">Alpa</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Attendances Table */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
                    {attendances.data.length === 0 ? (
                        <EmptyState
                            icon={Clock}
                            title="Belum Ada Data Presensi pada Tanggal Ini"
                            description={`Tidak ada rekaman kehadiran untuk tanggal ${new Date(date).toLocaleDateString('id-ID', { dateStyle: 'long' })}.`}
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                                        <th className="py-3.5 px-4">Siswa</th>
                                        <th className="py-3.5 px-4">Kelas</th>
                                        <th className="py-3.5 px-4">Waktu (Check-In / Out)</th>
                                        <th className="py-3.5 px-4">Status</th>
                                        <th className="py-3.5 px-4">Sumber Data</th>
                                        <th className="py-3.5 px-4">Dicatat Oleh / Catatan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {attendances.data.map((att) => (
                                        <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-xs border border-indigo-100 shrink-0">
                                                        {att.student?.user?.name ? att.student.user.name.charAt(0).toUpperCase() : 'S'}
                                                    </div>
                                                    <div>
                                                        <span className="font-extrabold text-slate-900 block">
                                                            {att.student?.user?.name || 'Siswa'}
                                                        </span>
                                                        <span className="text-[11px] font-mono text-slate-500">
                                                            NISN: {att.student?.nisn || '-'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-3 px-4">
                                                <Badge variant="indigo" size="sm">
                                                    {att.class_room?.name || att.student?.classes?.[0]?.name || '-'}
                                                </Badge>
                                            </td>

                                            <td className="py-3 px-4 font-mono text-slate-700">
                                                {att.check_in || '07:00'} - {att.check_out || '15:00'}
                                            </td>

                                            <td className="py-3 px-4">
                                                <Badge variant={att.badge_variant} size="sm">
                                                    {att.status_label}
                                                </Badge>
                                            </td>

                                            <td className="py-3 px-4">
                                                <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                                    {att.source_label || att.source}
                                                </span>
                                            </td>

                                            <td className="py-3 px-4 text-slate-500 text-xs">
                                                <p className="font-medium text-slate-700">
                                                    {att.recorder?.name || 'Sistem Otomatis'}
                                                </p>
                                                {att.notes && (
                                                    <p className="text-[11px] text-slate-400 italic truncate max-w-xs">
                                                        "{att.notes}"
                                                    </p>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {attendances.links && attendances.links.length > 3 && (
                        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                                Menampilkan {attendances.from || 0} - {attendances.to || 0} dari {attendances.total} data
                            </span>
                            <div className="flex items-center gap-1">
                                {attendances.links.map((link, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => link.url && router.visit(link.url, { preserveState: true })}
                                        disabled={!link.url || link.active}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${link.active
                                            ? 'bg-brand-600 text-white'
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
        </AdminLayout>
    );
}
