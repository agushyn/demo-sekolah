import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import {
    CreditCard,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Clock,
    Wifi,
    WifiOff,
    HardDrive,
    Radio,
    Settings as SettingsIcon,
    LayoutDashboard,
    Volume2,
    VolumeX,
    RefreshCw
} from 'lucide-react';

export default function Kiosk({ schoolName, device, supabaseConfigured, supabaseEnabled, pendingSyncCount = 0 }) {
    // Current live time & date
    const [currentTime, setCurrentTime] = useState(new Date());
    const [rfidInput, setRfidInput] = useState('');
    const [scanState, setScanState] = useState('idle'); // 'idle' | 'processing' | 'success' | 'already' | 'error'
    const [scanResult, setScanResult] = useState(null);
    const [supabaseStatus, setSupabaseStatus] = useState(supabaseConfigured ? 'online' : 'offline');
    const [pendingCount, setPendingCount] = useState(pendingSyncCount);
    const [totalToday, setTotalToday] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(true);

    const inputRef = useRef(null);
    const resetTimerRef = useRef(null);
    const lastScanTimeRef = useRef(0);

    // Audio synthesizer using Web Audio API for crisp, instant chimes
    const playChime = useCallback((type) => {
        if (!soundEnabled) return;
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const now = ctx.currentTime;

            if (type === 'success') {
                // Happy chord: 523Hz (C5) -> 659Hz (E5) -> 784Hz (G5)
                [523.25, 659.25, 783.99].forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + i * 0.08);
                    gain.gain.setValueAtTime(0.2, now + i * 0.08);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now + i * 0.08);
                    osc.stop(now + i * 0.08 + 0.4);
                });
            } else if (type === 'already') {
                // Info chime: 440Hz -> 554Hz
                [440, 554.37].forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, now + i * 0.1);
                    gain.gain.setValueAtTime(0.15, now + i * 0.1);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now + i * 0.1);
                    osc.stop(now + i * 0.1 + 0.35);
                });
            } else {
                // Error low tone
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(220, now);
                osc.frequency.exponentialRampToValueAtTime(110, now + 0.3);
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.4);
            }
        } catch (e) {
            // Audio context blocked or unsupported
        }
    }, [soundEnabled]);

    // Update real-time clock every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Keep hidden input focused continuously for RFID keyboard wedge reader
    useEffect(() => {
        const focusInput = () => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        };

        focusInput();
        const focusInterval = setInterval(focusInput, 1500);
        window.addEventListener('click', focusInput);

        return () => {
            clearInterval(focusInterval);
            window.removeEventListener('click', focusInput);
        };
    }, []);

    // Poll status & pending queue every 15 seconds
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await axios.get('/attendance/status');
                if (res.data) {
                    setSupabaseStatus(res.data.supabase_online ? 'online' : 'offline');
                    setPendingCount(res.data.pending_sync || 0);
                    setTotalToday(res.data.total_today || 0);
                }
            } catch (e) {
                setSupabaseStatus('offline');
            }
        };

        checkStatus();
        const statusTimer = setInterval(checkStatus, 15000);
        return () => clearInterval(statusTimer);
    }, []);

    // Handle RFID scan submission
    const handleScan = async (uidToScan) => {
        const rawUid = uidToScan || rfidInput;
        const cleanedUid = rawUid.replace(/[^a-zA-Z0-9]/g, '').trim();

        if (!cleanedUid) return;

        // Debounce: prevent same card double tap within 1.5 seconds
        const now = Date.now();
        if (now - lastScanTimeRef.current < 1200) {
            setRfidInput('');
            return;
        }
        lastScanTimeRef.current = now;

        setRfidInput('');
        setScanState('processing');

        if (resetTimerRef.current) {
            clearTimeout(resetTimerRef.current);
        }

        try {
            const response = await axios.post('/attendance/scan', {
                rfid_uid: cleanedUid,
            });

            const data = response.data;
            setScanResult(data);

            if (data.type === 'success') {
                setScanState('success');
                setTotalToday(prev => prev + 1);
                playChime('success');
            } else if (data.type === 'already_attended') {
                setScanState('already');
                playChime('already');
            } else {
                setScanState('error');
                playChime('error');
            }
        } catch (err) {
            setScanResult({
                title: 'TERJADI KENDALA KIOSK',
                message: 'Gagal memproses kartu RFID. Silakan coba kembali.',
                rfid_uid: cleanedUid,
            });
            setScanState('error');
            playChime('error');
        }

        // Auto reset back to idle after 3.2 seconds
        resetTimerRef.current = setTimeout(() => {
            setScanState('idle');
            setScanResult(null);
            if (inputRef.current) inputRef.current.focus();
        }, 3200);
    };

    const onKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleScan(rfidInput);
        }
    };

    // Format current time & Indonesian date
    const timeString = currentTime.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });

    const dateString = currentTime.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <div className="min-h-screen h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between select-none overflow-hidden font-sans relative">
            <Head title={`Kiosk Absensi RFID — ${schoolName}`} />

            {/* Hidden autofocus input for RFID USB Keyboard Reader */}
            <input
                ref={inputRef}
                type="text"
                value={rfidInput}
                onChange={(e) => setRfidInput(e.target.value)}
                onKeyDown={onKeyDown}
                className="absolute -top-96 left-0 opacity-0 pointer-events-none"
                autoFocus
                autoComplete="off"
            />

            {/* Background Ambient Glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl animate-pulse" />
            </div>

            {/* TOP HEADER */}
            <header className="relative z-10 px-6 sm:px-10 py-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md">
                <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/20">
                        <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
                            {schoolName}
                        </h1>
                        <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                            <span>Sistem Absensi Kartu RFID</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-cyan-400 font-mono">{device?.id}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Audio Chime Toggle */}
                    <button
                        type="button"
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                            soundEnabled
                                ? 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white'
                                : 'bg-rose-950/40 border-rose-800 text-rose-400'
                        }`}
                        title={soundEnabled ? 'Suara Aktif' : 'Suara Senyap'}
                    >
                        {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </button>

                    {/* Dashboard / Log Link */}
                    <Link
                        href="/attendance/dashboard"
                        className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold"
                        title="Dashboard & Log Presensi"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        <span className="hidden sm:inline">Dashboard</span>
                    </Link>

                    {/* Settings Link */}
                    <Link
                        href="/attendance/settings"
                        className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold"
                        title="Pengaturan Kiosk & Supabase"
                    >
                        <SettingsIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Settings</span>
                    </Link>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-4xl mx-auto w-full">
                {/* IDLE STATE */}
                {scanState === 'idle' && (
                    <div className="w-full flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
                        {/* Digital Clock & Date */}
                        <div className="space-y-1">
                            <div className="text-6xl sm:text-8xl font-black tracking-tight text-white font-mono drop-shadow-md">
                                {timeString}
                            </div>
                            <div className="text-base sm:text-xl font-bold text-slate-400 capitalize tracking-wide">
                                {dateString}
                            </div>
                        </div>

                        {/* Interactive RFID Tap Area */}
                        <div
                            onClick={() => inputRef.current?.focus()}
                            className="group relative w-72 sm:w-84 h-56 rounded-3xl bg-slate-900/90 border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 p-6 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all hover:scale-102 shadow-2xl shadow-cyan-500/10"
                        >
                            {/* Pulse ripples */}
                            <div className="absolute inset-0 rounded-3xl bg-cyan-500/5 animate-ping opacity-30" />

                            <div className="w-20 h-20 rounded-2xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <CreditCard className="w-10 h-10 text-cyan-400 animate-bounce" />
                            </div>

                            <div className="space-y-1 text-center">
                                <h3 className="text-base sm:text-lg font-black text-white tracking-tight uppercase">
                                    Tempelkan Kartu RFID
                                </h3>
                                <p className="text-xs text-slate-400 font-medium">
                                    Dekatkan kartu pada sensor reader
                                </p>
                            </div>
                        </div>

                        {/* Manual / Virtual Scan Bar (for testing/input without physical reader) */}
                        <div className="w-full max-w-sm pt-2 flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Input RFID manual (misal: 04A1B2C3)..."
                                value={rfidInput}
                                onChange={(e) => setRfidInput(e.target.value)}
                                onKeyDown={onKeyDown}
                                className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 font-mono outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => handleScan(rfidInput)}
                                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs rounded-xl transition-colors cursor-pointer shrink-0"
                            >
                                Tap
                            </button>
                        </div>
                    </div>
                )}

                {/* PROCESSING STATE */}
                {scanState === 'processing' && (
                    <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center space-y-4 animate-in zoom-in-95 duration-150">
                        <RefreshCw className="w-12 h-12 text-cyan-400 animate-spin mx-auto" />
                        <h3 className="text-xl font-black text-white">Memproses Kartu...</h3>
                        <p className="text-xs text-slate-400">Mencocokkan UID dengan data siswa</p>
                    </div>
                )}

                {/* SUCCESS STATE */}
                {scanState === 'success' && scanResult && (
                    <div className="w-full max-w-lg bg-emerald-950/40 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl shadow-emerald-500/20 animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mx-auto text-emerald-400">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>

                        <div className="space-y-1">
                            <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider">
                                ✓ {scanResult.title || 'ABSENSI BERHASIL'}
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                {scanResult.student_name}
                            </h2>
                            <p className="text-sm font-bold text-emerald-200">
                                NIS: {scanResult.nis} • Kelas: {scanResult.class_name}
                            </p>
                        </div>

                        {/* Status Chip & Time */}
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-900/90 border border-emerald-500/30">
                            <span className={`text-xs font-black px-2.5 py-1 rounded-lg uppercase ${
                                scanResult.status === 'late' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
                            }`}>
                                {scanResult.status_label}
                            </span>
                            <span className="text-lg font-black font-mono text-white">
                                {scanResult.attendance_time}
                            </span>
                        </div>

                        {/* Auto-reset Progress Bar */}
                        <div className="w-full bg-emerald-950 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-emerald-400 h-full w-full animate-[progress_3s_linear_forwards]" />
                        </div>
                    </div>
                )}

                {/* ALREADY ATTENDED STATE */}
                {scanState === 'already' && scanResult && (
                    <div className="w-full max-w-lg bg-amber-950/40 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl shadow-amber-500/20 animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mx-auto text-amber-400">
                            <AlertCircle className="w-10 h-10" />
                        </div>

                        <div className="space-y-1">
                            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-wider">
                                ! {scanResult.title || 'SUDAH ABSEN'}
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                {scanResult.student_name}
                            </h2>
                            <p className="text-sm font-bold text-amber-200">
                                NIS: {scanResult.nis} • Kelas: {scanResult.class_name}
                            </p>
                        </div>

                        <div className="px-4 py-2 rounded-xl bg-slate-900/90 border border-amber-500/30 text-xs font-semibold text-slate-300">
                            {scanResult.message}
                        </div>

                        <div className="w-full bg-amber-950 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-amber-400 h-full w-full animate-[progress_3s_linear_forwards]" />
                        </div>
                    </div>
                )}

                {/* ERROR / UNREGISTERED STATE */}
                {scanState === 'error' && scanResult && (
                    <div className="w-full max-w-lg bg-rose-950/40 border-2 border-rose-500/50 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl shadow-rose-500/20 animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center mx-auto text-rose-400">
                            <XCircle className="w-10 h-10" />
                        </div>

                        <div className="space-y-1">
                            <span className="inline-block px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-black uppercase tracking-wider">
                                ✕ {scanResult.title || 'KARTU TIDAK TERDAFTAR'}
                            </span>
                            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                {scanResult.message}
                            </h2>
                            {scanResult.rfid_uid && (
                                <p className="text-xs font-mono text-slate-400">
                                    UID: <span className="text-rose-300 font-bold">{scanResult.rfid_uid}</span>
                                </p>
                            )}
                        </div>

                        <div className="w-full bg-rose-950 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-rose-400 h-full w-full animate-[progress_3s_linear_forwards]" />
                        </div>
                    </div>
                )}
            </main>

            {/* BOTTOM STATUS BAR */}
            <footer className="relative z-10 px-6 sm:px-10 py-3.5 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-slate-400">
                <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                    {/* Supabase status */}
                    <div className="flex items-center gap-2">
                        {supabaseStatus === 'online' ? (
                            <Wifi className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                        <span>
                            Supabase:{' '}
                            <span className={supabaseStatus === 'online' ? 'text-emerald-400' : 'text-amber-400'}>
                                {supabaseStatus === 'online' ? '● ONLINE' : '● OFFLINE (Lokal Disimpan)'}
                            </span>
                        </span>
                    </div>

                    {/* RFID Reader status */}
                    <div className="flex items-center gap-2">
                        <Radio className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>
                            Reader: <span className="text-emerald-400">● TERHUBUNG</span>
                        </span>
                    </div>

                    {/* Pending sync queue counter */}
                    {pendingCount > 0 && (
                        <div className="flex items-center gap-1.5 text-amber-400 bg-amber-950/40 border border-amber-800/60 px-2.5 py-1 rounded-lg">
                            <HardDrive className="w-3.5 h-3.5" />
                            <span>{pendingCount} Antrean Sync</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4 text-slate-400 font-medium">
                    <span>
                        Hadir Hari Ini: <span className="text-white font-bold">{totalToday}</span>
                    </span>
                    <span>•</span>
                    <span className="text-slate-300">
                        {device?.name || 'Gerbang Utama'} ({device?.id || 'KIOSK-001'})
                    </span>
                </div>
            </footer>
        </div>
    );
}
