import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Users,
    CheckCircle2,
    Clock,
    HardDrive,
    RefreshCw,
    Maximize2,
    Settings as SettingsIcon,
    Filter,
    Calendar,
    Search,
    Radio,
    ChevronLeft,
    ChevronRight,
    ArrowLeft
} from 'lucide-react';
import Button from '@/Components/Button';

export default function Dashboard({ logs, stats, classes = [], filters = {}, lastSyncAt }) {
    const [selectedDate, setSelectedDate] = useState(filters.date || '');
    const [selectedClass, setSelectedClass] = useState(filters.class_id || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedSync, setSelectedSync] = useState(filters.sync_status || '');
    const [isSyncing, setIsSyncing] = useState(false);
    const [isRetrying, setIsRetrying] = useState(false);

    const applyFilters = () => {
        router.get('/attendance/dashboard', {
            date: selectedDate,
            class_id: selectedClass,
            status: selectedStatus,
            sync_status: selectedSync,
        }, { preserveState: true, replace: true });
    };

    const handleSyncStudents = () => {
        setIsSyncing(true);
        router.post('/attendance/sync-students', {}, {
            onFinish: () => setIsSyncing(false),
        });
    };

    const handleRetrySync = () => {
        setIsRetrying(true);
        router.post('/attendance/retry-sync', {}, {
            onFinish: () => setIsRetrying(false),
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            <Head title="Dashboard Presensi RFID & Kiosk" />

            {/* Top Navigation */}
            <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/attendance"
                            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                            title="Kembali ke Mode Kiosk"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <Radio className="w-5 h-5 text-indigo-600" />
                                <span>Dashboard Presensi RFID</span>
                            </h1>
                            <p className="text-xs text-slate-500 font-medium hidden sm:block">
                                Monitoring kehadiran siswa dan antrean sinkronisasi Supabase
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link href="/attendance/settings">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                leftIcon={SettingsIcon}
                                className="text-xs font-bold"
                            >
                                Settings
                            </Button>
                        </Link>

                        <Link href="/attendance">
                            <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                leftIcon={Maximize2}
                                className="text-xs font-bold shadow-sm"
                            >
                                Buka Kiosk
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* BENTO STATS CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {/* Total Siswa di Cache */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Siswa Terdaftar</p>
                            <h3 className="text-2xl font-black text-slate-900">{stats?.total_students || 0}</h3>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                                {lastSyncAt ? `Sync: ${lastSyncAt}` : 'Belum sync'}
                            </p>
                        </div>
                    </div>

                    {/* Hadir Hari Ini */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hadir Hari Ini</p>
                            <h3 className="text-2xl font-black text-slate-900">{stats?.today_total || 0}</h3>
                            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                                {stats?.today_present || 0} Tepat Waktu
                            </p>
                        </div>
                    </div>

                    {/* Terlambat */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Terlambat</p>
                            <h3 className="text-2xl font-black text-slate-900">{stats?.today_late || 0}</h3>
                            <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Melewati batas jam masuk</p>
                        </div>
                    </div>

                    {/* Pending Sync Supabase */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 shrink-0">
                            <HardDrive className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Antrean Supabase</p>
                            <h3 className="text-2xl font-black text-slate-900">{stats?.pending_sync || 0}</h3>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                                {stats?.synced_count || 0} Tersinkron
                            </p>
                        </div>
                    </div>
                </div>

                {/* ACTION BAR & SYNC TRIGGERS */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            leftIcon={RefreshCw}
                            loading={isSyncing}
                            onClick={handleSyncStudents}
                            className="text-xs font-bold w-full sm:w-auto"
                        >
                            Sync Data Siswa
                        </Button>

                        {stats?.pending_sync > 0 && (
                            <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                leftIcon={HardDrive}
                                loading={isRetrying}
                                onClick={handleRetrySync}
                                className="text-xs font-bold w-full sm:w-auto bg-amber-600 hover:bg-amber-500"
                            >
                                Kirim Ulang Antrean ({stats.pending_sync})
                            </Button>
                        )}
                    </div>

                    {/* Filter Controls */}
                    <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 font-medium outline-none focus:border-indigo-500"
                        />

                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 font-medium outline-none focus:border-indigo-500"
                        >
                            <option value="">Semua Kelas</option>
                            {classes.map((cls) => (
                                <option key={cls.class_id} value={cls.class_id}>
                                    {cls.class_name}
                                </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            onClick={applyFilters}
                            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            <span>Filter</span>
                        </button>
                    </div>
                </div>

                {/* ATTENDANCE LOG TABLE */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-sm font-black text-slate-900">
                            Log Transaksi Presensi Kiosk
                        </h3>
                        <span className="text-xs font-semibold text-slate-400">
                            Total {logs?.total || 0} Catatan
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                                <tr>
                                    <th className="px-4 py-3">#</th>
                                    <th className="px-4 py-3">Siswa</th>
                                    <th className="px-4 py-3">Kelas</th>
                                    <th className="px-4 py-3">Waktu Scan</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">RFID UID</th>
                                    <th className="px-4 py-3">Perangkat</th>
                                    <th className="px-4 py-3">Supabase Sync</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                {logs?.data && logs.data.length > 0 ? (
                                    logs.data.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-4 py-3 text-slate-400">
                                                {(logs.current_page - 1) * logs.per_page + idx + 1}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-slate-900">{item.student_name}</div>
                                                <div className="text-[10px] text-slate-400 font-mono">NIS: {item.nis || '-'}</div>
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-slate-800">
                                                {item.class_name || '-'}
                                            </td>
                                            <td className="px-4 py-3 font-mono font-bold text-slate-900">
                                                <div>{item.attendance_time}</div>
                                                <div className="text-[10px] text-slate-400 font-sans font-normal">{item.attendance_date}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                                    item.status === 'present'
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                }`}>
                                                    {item.status_label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                                                {item.rfid_uid || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 text-[11px]">
                                                {item.device_name} ({item.device_id})
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                                    item.sync_status === 'synced'
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        : item.sync_status === 'pending'
                                                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                        item.sync_status === 'synced' ? 'bg-emerald-500' : 'bg-amber-500'
                                                    }`} />
                                                    {item.sync_status_label}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center py-10 text-slate-400 text-xs">
                                            Belum ada catatan presensi pada filter ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {logs?.links && logs.links.length > 3 && (
                        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-slate-500">
                                Halaman {logs.current_page} dari {logs.last_page}
                            </span>
                            <div className="flex items-center gap-1">
                                {logs.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${
                                            link.active
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : link.url
                                                ? 'text-slate-700 hover:bg-slate-50 border-slate-200'
                                                : 'text-slate-300 border-slate-100 cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
