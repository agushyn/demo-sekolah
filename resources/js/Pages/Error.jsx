import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ShieldAlert, AlertTriangle, FileQuestion, Clock, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import Button from '@/Components/Button';

export default function Error({ status = 404 }) {
    const errorConfigs = {
        403: {
            title: 'Akses Ditolak (403)',
            description: 'Anda tidak memiliki hak akses atau izin yang diperlukan untuk membuka halaman ini.',
            icon: ShieldAlert,
            color: 'text-rose-600 bg-rose-50 border-rose-200',
        },
        404: {
            title: 'Halaman Tidak Ditemukan (404)',
            description: 'Tautan yang Anda tuju mungkin sudah dipindahkan, dihapus, atau alamat URL salah ketik.',
            icon: FileQuestion,
            color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
        },
        419: {
            title: 'Sesi Telah Berakhir (419)',
            description: 'Sesi autentikasi Anda telah kedaluwarsa demi keamanan. Silakan muat ulang dan masuk kembali.',
            icon: Clock,
            color: 'text-amber-600 bg-amber-50 border-amber-200',
        },
        429: {
            title: 'Terlalu Banyak Permintaan (429)',
            description: 'Sistem mendeteksi terlalu banyak permintaan dalam waktu singkat. Mohon tunggu beberapa saat.',
            icon: RefreshCw,
            color: 'text-amber-600 bg-amber-50 border-amber-200',
        },
        500: {
            title: 'Terjadi Kendala Sistem (500)',
            description: 'Server kami sedang mengalami kendala teknis sementara. Tim kami telah mencatat peristiwa ini.',
            icon: AlertTriangle,
            color: 'text-rose-600 bg-rose-50 border-rose-200',
        },
        503: {
            title: 'Layanan Dalam Pemeliharaan (503)',
            description: 'Sistem sedang dalam proses pemeliharaan rutin. Kami akan segera kembali melayani Anda.',
            icon: Clock,
            color: 'text-brand-600 bg-brand-50 border-brand-200',
        },
    };

    const config = errorConfigs[status] || errorConfigs[404];
    const Icon = config.icon;

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
            <Head title={config.title} />

            <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-10 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center border shadow-xs">
                    <Icon className="w-8 h-8 text-indigo-600" />
                </div>

                <div className="space-y-2">
                    <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold">
                        HTTP ERROR {status}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        {config.title}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                        {config.description}
                    </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali Sebelumnya</span>
                    </button>

                    <Link href="/" className="w-full sm:w-auto">
                        <Button
                            type="button"
                            variant="primary"
                            size="md"
                            leftIcon={Home}
                            className="w-full text-xs font-bold shadow-md"
                        >
                            Ke Beranda
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
