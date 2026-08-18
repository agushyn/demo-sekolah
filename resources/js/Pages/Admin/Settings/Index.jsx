import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import BentoCard from '@/Components/BentoCard';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import {
    Settings,
    Clock,
    Cloud,
    Database,
    Layers,
    Save,
    CheckCircle2,
    AlertCircle,
    Key,
    Globe,
    Zap,
    Server,
    Shield,
    School,
    Sliders,
    RefreshCw,
    Activity,
    Check,
} from 'lucide-react';

export default function SettingsIndex({ settings = {}, providerStatus = {} }) {
    const { school } = usePage().props;
    const [activeTab, setActiveTab] = useState('attendance'); // 'attendance', 'school', 'system'

    // Form State for Attendance Settings
    const { data, setData, post, processing, errors } = useForm({
        attendance_driver: settings.attendance_driver || 'internal',
        attendance_base_url: settings.attendance_base_url || '',
        attendance_api_key: settings.attendance_api_key || '',
        supabase_url: settings.supabase_url || '',
        supabase_key: settings.supabase_key || '',
        supabase_table: settings.supabase_table || 'attendances',
        attendance_timeout: settings.attendance_timeout || 15,
        sync_interval_minutes: settings.sync_interval_minutes || 30,
    });

    // Test Connection State
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);

    const handleSaveAttendance = (e) => {
        e.preventDefault();
        post('/admin/settings/attendance', {
            preserveScroll: true,
        });
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestResult(null);

        try {
            const response = await fetch('/admin/settings/attendance/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    attendance_driver: data.attendance_driver,
                    attendance_base_url: data.attendance_base_url,
                    attendance_api_key: data.attendance_api_key,
                    supabase_url: data.supabase_url,
                    supabase_key: data.supabase_key,
                    supabase_table: data.supabase_table,
                    attendance_timeout: data.attendance_timeout,
                }),
            });

            const result = await response.json();
            setTestResult(result);
        } catch (error) {
            setTestResult({
                status: 'error',
                message: 'Gagal melakukan tes koneksi: ' + error.message,
            });
        } finally {
            setIsTesting(false);
        }
    };

    const tabs = [
        { id: 'attendance', label: 'Presensi API & Supabase', icon: Clock },
        { id: 'school', label: 'Profil Lembaga Sekolah', icon: School },
        { id: 'system', label: 'Informasi Server & Sistem', icon: Server },
    ];

    return (
        <AdminLayout title="Pengaturan Sistem">
            <Head title="Pengaturan Sistem & Presensi API" />

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Banner */}
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-2 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200">
                                <Settings className="w-3.5 h-3.5 text-indigo-400" />
                                <span>Konfigurasi Terpusat Sistem Sekolah</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                                Pengaturan Sistem & Integrasi Presensi
                            </h1>
                            <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed font-normal">
                                Atur konektivitas database presensi cloud (Supabase / REST API), parameter sistem, dan preferensi operasional sekolah tanpa perlu mengubah berkas .env server.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Badge variant={providerStatus.is_configured ? 'emerald' : 'indigo'} size="md">
                                Driver Aktif: {data.attendance_driver.toUpperCase()}
                            </Badge>
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
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* TAB 1: PRESENSI & SUPABASE API */}
                {activeTab === 'attendance' && (
                    <form onSubmit={handleSaveAttendance} className="bento-card p-6 sm:p-8 bg-white space-y-8 shadow-sm">
                        {/* Header */}
                        <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <h3 className="text-lg font-black text-slate-900">
                                    Konfigurasi Driver Presensi & Cloud Sync
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Pilih sumber data presensi harian siswa dan masukkan kredensial API yang tersimpan di basis data aplikasi.
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    leftIcon={Zap}
                                    isLoading={isTesting}
                                    onClick={handleTestConnection}
                                    className="text-xs font-bold"
                                >
                                    Uji Koneksi
                                </Button>
                            </div>
                        </div>

                        {/* Test Result Banner */}
                        {testResult && (
                            <div className={`p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in duration-200 ${
                                testResult.status === 'success'
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                    : 'bg-rose-50 border-rose-200 text-rose-900'
                            }`}>
                                {testResult.status === 'success' ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                                )}
                                <div className="text-xs space-y-0.5">
                                    <p className="font-bold">
                                        {testResult.status === 'success' ? 'Tes Koneksi Berhasil!' : 'Tes Koneksi Gagal'}
                                        {testResult.latency_ms > 0 && ` (Latency: ${testResult.latency_ms} ms)`}
                                    </p>
                                    <p className="text-slate-700">{testResult.message}</p>
                                </div>
                            </div>
                        )}

                        {/* Driver Selector Cards */}
                        <div className="space-y-3">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                1. Pilih Driver / Sumber Data Presensi
                            </label>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Option 1: Internal */}
                                <div
                                    onClick={() => setData('attendance_driver', 'internal')}
                                    className={`p-5 rounded-3xl border-2 transition-all cursor-pointer space-y-3 ${
                                        data.attendance_driver === 'internal'
                                            ? 'border-brand-600 bg-brand-50/50 shadow-md ring-2 ring-brand-500/20'
                                            : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
                                            <Database className="w-5 h-5" />
                                        </div>
                                        {data.attendance_driver === 'internal' && (
                                            <Badge variant="brand" size="xs">Aktif Dipilih</Badge>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-black text-slate-900">Database Internal</h4>
                                        <p className="text-[11px] text-slate-500 leading-relaxed">
                                            Input presensi manual oleh admin/guru langsung ke basis data lokal Laravel.
                                        </p>
                                    </div>
                                </div>

                                {/* Option 2: Supabase */}
                                <div
                                    onClick={() => setData('attendance_driver', 'supabase')}
                                    className={`p-5 rounded-3xl border-2 transition-all cursor-pointer space-y-3 ${
                                        data.attendance_driver === 'supabase'
                                            ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
                                            : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                                            <Layers className="w-5 h-5" />
                                        </div>
                                        {data.attendance_driver === 'supabase' && (
                                            <Badge variant="emerald" size="xs">Aktif Dipilih</Badge>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-black text-slate-900">Supabase Cloud API</h4>
                                        <p className="text-[11px] text-slate-500 leading-relaxed">
                                            Sinkronisasi real-time dengan PostgreSQL database tabel presensi di cloud Supabase.
                                        </p>
                                    </div>
                                </div>

                                {/* Option 3: External REST API */}
                                <div
                                    onClick={() => setData('attendance_driver', 'external_api')}
                                    className={`p-5 rounded-3xl border-2 transition-all cursor-pointer space-y-3 ${
                                        data.attendance_driver === 'external_api'
                                            ? 'border-amber-600 bg-amber-50/50 shadow-md ring-2 ring-amber-500/20'
                                            : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                                            <Cloud className="w-5 h-5" />
                                        </div>
                                        {data.attendance_driver === 'external_api' && (
                                            <Badge variant="amber" size="xs">Aktif Dipilih</Badge>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-black text-slate-900">External REST API</h4>
                                        <p className="text-[11px] text-slate-500 leading-relaxed">
                                            Integrasi HTTP REST endpoint aplikasi presensi / mesin fingerprint eksternal.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Driver Specific Form Fields */}
                        {data.attendance_driver === 'supabase' && (
                            <div className="p-6 rounded-3xl bg-emerald-50/60 border border-emerald-200 space-y-4">
                                <div className="flex items-center gap-2 text-xs font-black text-emerald-950 uppercase tracking-wider">
                                    <Layers className="w-4 h-4 text-emerald-600" />
                                    <span>Parameter Kredensial Supabase Cloud</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1 sm:col-span-2">
                                        <label className="block text-xs font-bold text-slate-700">
                                            Supabase Project URL <span className="text-rose-500">*</span>
                                        </label>
                                        <Input
                                            placeholder="https://xyzcompany.supabase.co"
                                            leftIcon={Globe}
                                            value={data.supabase_url}
                                            onChange={(e) => setData('supabase_url', e.target.value)}
                                            error={errors.supabase_url}
                                            className="text-xs font-mono"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-xs font-bold text-slate-700">
                                            Supabase Anon Key / Service Role Secret <span className="text-rose-500">*</span>
                                        </label>
                                        <Input
                                            type="password"
                                            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                                            leftIcon={Key}
                                            value={data.supabase_key}
                                            onChange={(e) => setData('supabase_key', e.target.value)}
                                            error={errors.supabase_key}
                                            className="text-xs font-mono"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-xs font-bold text-slate-700">
                                            Nama Tabel Presensi di Supabase
                                        </label>
                                        <Input
                                            placeholder="attendances"
                                            value={data.supabase_table}
                                            onChange={(e) => setData('supabase_table', e.target.value)}
                                            error={errors.supabase_table}
                                            className="text-xs font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {data.attendance_driver === 'external_api' && (
                            <div className="p-6 rounded-3xl bg-amber-50/60 border border-amber-200 space-y-4">
                                <div className="flex items-center gap-2 text-xs font-black text-amber-950 uppercase tracking-wider">
                                    <Cloud className="w-4 h-4 text-amber-600" />
                                    <span>Parameter REST API Presensi Eksternal</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1 sm:col-span-2">
                                        <label className="block text-xs font-bold text-slate-700">
                                            Base Endpoint URL <span className="text-rose-500">*</span>
                                        </label>
                                        <Input
                                            placeholder="https://api.presensi-sekolah.id/v1"
                                            leftIcon={Globe}
                                            value={data.attendance_base_url}
                                            onChange={(e) => setData('attendance_base_url', e.target.value)}
                                            error={errors.attendance_base_url}
                                            className="text-xs font-mono"
                                        />
                                    </div>

                                    <div className="space-y-1 sm:col-span-2">
                                        <label className="block text-xs font-bold text-slate-700">
                                            Bearer Token / API Secret Key <span className="text-rose-500">*</span>
                                        </label>
                                        <Input
                                            type="password"
                                            placeholder="Bearer token atau API Key presensi eksternal..."
                                            leftIcon={Key}
                                            value={data.attendance_api_key}
                                            onChange={(e) => setData('attendance_api_key', e.target.value)}
                                            error={errors.attendance_api_key}
                                            className="text-xs font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* General Sync Settings */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
                                <Sliders className="w-3.5 h-3.5 text-slate-600" />
                                <span>2. Parameter Sinkronisasi & Timeout</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-slate-700">
                                        Timeout Request (Detik)
                                    </label>
                                    <Input
                                        type="number"
                                        min="3"
                                        max="60"
                                        value={data.attendance_timeout}
                                        onChange={(e) => setData('attendance_timeout', e.target.value)}
                                        error={errors.attendance_timeout}
                                        className="text-xs"
                                    />
                                    <span className="text-[10px] text-slate-400">Waktu maksimal menunggu respons API sebelum fallback.</span>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-slate-700">
                                        Interval Auto-Sync Terjadwal (Menit)
                                    </label>
                                    <Input
                                        type="number"
                                        min="5"
                                        max="1440"
                                        value={data.sync_interval_minutes}
                                        onChange={(e) => setData('sync_interval_minutes', e.target.value)}
                                        error={errors.sync_interval_minutes}
                                        className="text-xs"
                                    />
                                    <span className="text-[10px] text-slate-400">Jadwal cron polling data presensi siswa.</span>
                                </div>
                            </div>
                        </div>

                        {/* Save Bar */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                            <Button
                                type="submit"
                                variant="primary"
                                size="md"
                                isLoading={processing}
                                leftIcon={Save}
                                className="font-bold"
                            >
                                Simpan Konfigurasi Presensi
                            </Button>
                        </div>
                    </form>
                )}

                {/* TAB 2: PROFIL SEKOLAH */}
                {activeTab === 'school' && (
                    <div className="bento-card p-6 sm:p-8 bg-white space-y-6">
                        <div className="pb-4 border-b border-slate-100">
                            <h3 className="text-lg font-black text-slate-900">
                                Profil Pokok Lembaga Pendidikan
                            </h3>
                            <p className="text-xs text-slate-500">
                                Informasi umum sekolah yang ditampilkan pada dokumen resmi dan portal publik
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                <span className="text-[10px] font-bold uppercase text-slate-400">Nama Sekolah Resmi</span>
                                <p className="font-bold text-slate-900">{school?.name || 'SMK Triwijaya'}</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                <span className="text-[10px] font-bold uppercase text-slate-400">Akreditasi & NPSN</span>
                                <p className="font-bold text-slate-900">Akreditasi A (Unggul) • NPSN: 20104567</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                <span className="text-[10px] font-bold uppercase text-slate-400">Email Tata Usaha</span>
                                <p className="font-mono font-bold text-slate-900">info@schid.sch.id</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                <span className="text-[10px] font-bold uppercase text-slate-400">Telepon / Hotline</span>
                                <p className="font-mono font-bold text-slate-900">+62 21 555-0199</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 3: SERVER & INFORMASI */}
                {activeTab === 'system' && (
                    <div className="bento-card p-6 sm:p-8 bg-white space-y-6">
                        <div className="pb-4 border-b border-slate-100">
                            <h3 className="text-lg font-black text-slate-900">
                                Status Lingkungan Server & Framework
                            </h3>
                            <p className="text-xs text-slate-500">
                                Informasi teknis runtime sistem informasi sekolah
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                <span className="text-[10px] font-bold uppercase text-slate-400">PHP Version</span>
                                <p className="font-mono font-bold text-slate-900">PHP 8.3.x</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                <span className="text-[10px] font-bold uppercase text-slate-400">Laravel Framework</span>
                                <p className="font-mono font-bold text-slate-900">Laravel v13.x</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                <span className="text-[10px] font-bold uppercase text-slate-400">Frontend Stack</span>
                                <p className="font-bold text-slate-900">Inertia.js + React 19 + Tailwind CSS</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
