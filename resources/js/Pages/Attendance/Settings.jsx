import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import axios from 'axios';
import {
    ArrowLeft,
    Save,
    HardDrive,
    Clock,
    Radio,
    Globe,
    CheckCircle2,
    XCircle,
    RefreshCw,
    Shield,
    Database
} from 'lucide-react';
import Button from '@/Components/Button';

export default function Settings({ settings = {}, totalCachedStudents = 0, lastSyncAt }) {
    const { data, setData, post, processing, errors } = useForm({
        kiosk_device_id: settings.kiosk_device_id || 'KIOSK-001',
        kiosk_device_name: settings.kiosk_device_name || 'Gerbang Utama',
        kiosk_location: settings.kiosk_location || 'Gerbang Depan',
        attendance_start_time: settings.attendance_start_time || '07:00',
        attendance_late_threshold: settings.attendance_late_threshold || '07:15',
        attendance_sync_enabled: settings.attendance_sync_enabled ?? false,
        supabase_url: settings.supabase_url || '',
        supabase_key: settings.supabase_key || '',
        supabase_attendance_table: settings.supabase_attendance_table || 'student_attendance',
        school_api_url: settings.school_api_url || '',
        school_api_token: settings.school_api_token || '',
        auto_sync_interval: settings.auto_sync_interval || 30,
    });

    const [testResult, setTestResult] = useState(null);
    const [isTesting, setIsTesting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/attendance/settings');
    };

    const handleTestSupabase = async () => {
        setIsTesting(true);
        setTestResult(null);
        try {
            const res = await axios.post('/attendance/test-supabase');
            setTestResult(res.data);
        } catch (err) {
            setTestResult({
                success: false,
                message: 'Gagal menghubungi endpoint uji coba Supabase.',
            });
        } finally {
            setIsTesting(false);
        }
    };

    const handleSyncStudents = () => {
        setIsSyncing(true);
        router.post('/attendance/sync-students', {}, {
            onFinish: () => setIsSyncing(false),
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-12">
            <Head title="Pengaturan Kiosk Presensi & Supabase" />

            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/attendance"
                            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                            title="Kembali ke Mode Kiosk"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                                Pengaturan Kiosk Presensi
                            </h1>
                            <p className="text-xs text-slate-500 font-medium hidden sm:block">
                                Konfigurasi perangkat lokal, aturan waktu, dan koneksi Supabase
                            </p>
                        </div>
                    </div>

                    <Link href="/attendance">
                        <Button variant="secondary" size="sm" className="text-xs font-bold">
                            Buka Kiosk
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* SECTION 1: PERANGKAT KIOSK */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                            <Radio className="w-5 h-5 text-indigo-600" />
                            <div>
                                <h3 className="text-sm font-black text-slate-900">Identitas Perangkat Kiosk</h3>
                                <p className="text-xs text-slate-500">ID dan nama mesin absensi lokal yang tercatat pada log</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Device ID
                                </label>
                                <input
                                    type="text"
                                    value={data.kiosk_device_id}
                                    onChange={(e) => setData('kiosk_device_id', e.target.value)}
                                    placeholder="KIOSK-001"
                                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 font-mono font-bold focus:border-indigo-500 outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Nama Perangkat
                                </label>
                                <input
                                    type="text"
                                    value={data.kiosk_device_name}
                                    onChange={(e) => setData('kiosk_device_name', e.target.value)}
                                    placeholder="Gerbang Utama"
                                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 font-semibold focus:border-indigo-500 outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Lokasi Mesin
                                </label>
                                <input
                                    type="text"
                                    value={data.kiosk_location}
                                    onChange={(e) => setData('kiosk_location', e.target.value)}
                                    placeholder="Lobi Depan"
                                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 font-semibold focus:border-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: ATURAN WAKTU PRESENSI */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                            <Clock className="w-5 h-5 text-amber-600" />
                            <div>
                                <h3 className="text-sm font-black text-slate-900">Aturan Waktu & Keterlambatan</h3>
                                <p className="text-xs text-slate-500">Ambang batas penentuan status Hadir Tepat Waktu atau Terlambat (Zona Waktu: Asia/Jakarta)</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Jam Mulai Masuk Sekolah
                                </label>
                                <input
                                    type="time"
                                    value={data.attendance_start_time}
                                    onChange={(e) => setData('attendance_start_time', e.target.value)}
                                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 font-mono font-bold focus:border-indigo-500 outline-none"
                                    required
                                />
                                <p className="text-[10px] text-slate-400 mt-1">Siswa yang scan sebelum jam ini berstatus Hadir</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Batas Akhir Toleransi (Terlambat)
                                </label>
                                <input
                                    type="time"
                                    value={data.attendance_late_threshold}
                                    onChange={(e) => setData('attendance_late_threshold', e.target.value)}
                                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 font-mono font-bold focus:border-indigo-500 outline-none"
                                    required
                                />
                                <p className="text-[10px] text-slate-400 mt-1">Siswa yang scan setelah jam ini otomatis berstatus Terlambat</p>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: SUPABASE INTEGRATION */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                                <HardDrive className="w-5 h-5 text-cyan-600" />
                                <div>
                                    <h3 className="text-sm font-black text-slate-900">Integrasi Cloud Supabase</h3>
                                    <p className="text-xs text-slate-500">Tujuan penyimpanan transaksi absensi cloud (Tersimpan aman & terenkripsi)</p>
                                </div>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.attendance_sync_enabled}
                                    onChange={(e) => setData('attendance_sync_enabled', e.target.checked)}
                                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                />
                                <span className="text-xs font-bold text-slate-700">Aktifkan Sync</span>
                            </label>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Supabase Project URL
                                </label>
                                <input
                                    type="url"
                                    value={data.supabase_url}
                                    onChange={(e) => setData('supabase_url', e.target.value)}
                                    placeholder="https://xyzcompany.supabase.co"
                                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 font-mono focus:border-indigo-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Supabase API Key (Anon / Service)
                                    </label>
                                    <input
                                        type="password"
                                        value={data.supabase_key}
                                        onChange={(e) => setData('supabase_key', e.target.value)}
                                        placeholder="••••••••••••••••"
                                        className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 font-mono focus:border-indigo-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Nama Tabel Presensi
                                    </label>
                                    <input
                                        type="text"
                                        value={data.supabase_attendance_table}
                                        onChange={(e) => setData('supabase_attendance_table', e.target.value)}
                                        placeholder="student_attendance"
                                        className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 font-mono font-bold focus:border-indigo-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Live Test Connection */}
                            <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    leftIcon={Radio}
                                    loading={isTesting}
                                    onClick={handleTestSupabase}
                                    className="text-xs font-bold"
                                >
                                    Uji Koneksi Supabase
                                </Button>

                                {testResult && (
                                    <div className={`flex items-center gap-1.5 text-xs font-bold ${
                                        testResult.success ? 'text-emerald-600' : 'text-rose-600'
                                    }`}>
                                        {testResult.success ? (
                                            <CheckCircle2 className="w-4 h-4" />
                                        ) : (
                                            <XCircle className="w-4 h-4" />
                                        )}
                                        <span>{testResult.message}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: SCHOOL MANAGEMENT MASTER SYNC */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                                <Database className="w-5 h-5 text-emerald-600" />
                                <div>
                                    <h3 className="text-sm font-black text-slate-900">Sinkronisasi Master Siswa</h3>
                                    <p className="text-xs text-slate-500">Cache lokal: {totalCachedStudents} Siswa tersinkron</p>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                leftIcon={RefreshCw}
                                loading={isSyncing}
                                onClick={handleSyncStudents}
                                className="text-xs font-bold"
                            >
                                Sync Sekarang
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    School Management API URL (Opsional)
                                </label>
                                <input
                                    type="url"
                                    value={data.school_api_url}
                                    onChange={(e) => setData('school_api_url', e.target.value)}
                                    placeholder="Kosongkan jika berjalan di server yang sama"
                                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 font-mono focus:border-indigo-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    API Bearer Token
                                </label>
                                <input
                                    type="password"
                                    value={data.school_api_token}
                                    onChange={(e) => setData('school_api_token', e.target.value)}
                                    placeholder="••••••••••••••••"
                                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 font-mono focus:border-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SAVE BUTTON */}
                    <div className="flex justify-end pt-2">
                        <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            leftIcon={Save}
                            loading={processing}
                            className="text-xs font-bold shadow-md px-6"
                        >
                            Simpan Pengaturan
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    );
}
