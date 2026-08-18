import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import BentoCard from '@/Components/BentoCard';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import {
    Clock,
    Lock,
    Phone,
    Mail,
    ArrowLeft,
    Calendar,
    Sparkles,
    AlertCircle,
} from 'lucide-react';

export default function RegistrationClosed({ settings = {} }) {
    const { school } = usePage().props;
    const schoolName = school?.name || 'SMK Triwijaya';

    return (
        <PublicLayout>
            <Head>
                <title>Pendaftaran Siswa Baru Ditutup</title>
                <meta
                    name="description"
                    content={`Informasi penutupan masa pendaftaran penerimaan peserta didik baru (PPDB) di ${schoolName}.`}
                />
            </Head>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-8">
                {/* Main Bento Closed Card */}
                <div className="bento-card p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
                    <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200/80 mx-auto flex items-center justify-center shadow-sm">
                        <Lock className="w-8 h-8" />
                    </div>

                    <div className="space-y-3 max-w-lg mx-auto">
                        <Badge variant="warning" size="md">
                            Status: Pendaftaran Sedang Ditutup
                        </Badge>
                        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                            Penerimaan Siswa Baru Belum Dibuka
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            Mohon maaf, sistem pendaftaran online untuk periode saat ini sedang ditutup atau belum memasuki jadwal gelombang pendaftaran resmi di {schoolName}.
                        </p>
                    </div>

                    {/* Timeline Bento Grid */}
                    {(settings.registration_start || settings.registration_end) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto pt-4 text-left">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Mulai Pendaftaran
                                </span>
                                <span className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5 mt-1">
                                    <Calendar className="w-4 h-4 text-brand-600" />
                                    {settings.registration_start || 'Segera Diumumkan'}
                                </span>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Batas Akhir Gelombang
                                </span>
                                <span className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5 mt-1">
                                    <Clock className="w-4 h-4 text-rose-600" />
                                    {settings.registration_end || 'Segera Diumumkan'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Contact & Help Info */}
                    <div className="pt-6 border-t border-slate-100 max-w-lg mx-auto space-y-3 text-xs text-slate-500">
                        <p>
                            Apabila Anda memerlukan informasi lebih lanjut mengenai jadwal pendaftaran gelombang berikutnya atau konsultasi penerimaan siswa pindahan, silakan hubungi sekretariat PPDB:
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4 text-slate-700 font-semibold">
                            <span className="flex items-center gap-1.5">
                                <Phone className="w-4 h-4 text-brand-600" /> {school?.phone || '+62 21 8765 4321'}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Mail className="w-4 h-4 text-brand-600" /> {school?.email || 'ppdb@smanusantara.sch.id'}
                            </span>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-center">
                        <Link href="/">
                            <Button variant="secondary" size="md" leftIcon={ArrowLeft} className="text-xs font-bold">
                                Kembali ke Beranda Sekolah
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
