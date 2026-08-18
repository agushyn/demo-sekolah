import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import BentoCard from '@/Components/BentoCard';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import {
    CheckCircle2,
    Printer,
    ArrowLeft,
    Calendar,
    User,
    FileText,
    Shield,
    Phone,
    Mail,
    Sparkles,
} from 'lucide-react';

export default function RegistrationSuccess({ registration }) {
    const { school } = usePage().props;
    const schoolName = school?.name || 'SMK Triwijaya';

    const handlePrint = () => {
        window.print();
    };

    return (
        <PublicLayout>
            <Head>
                <title>Bukti Pendaftaran Berhasil — PPDB Online</title>
                <meta
                    name="description"
                    content={`Tanda bukti penyerahan formulir pendaftaran peserta didik baru ${schoolName}.`}
                />
            </Head>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
                {/* Main Proof Card */}
                <div className="bento-card p-6 sm:p-10 space-y-8 bg-white border border-slate-200/90 shadow-xl relative overflow-hidden">
                    {/* Top Status Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-7 h-7" />
                            </div>
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block">
                                    Pendaftaran Berhasil Dikirim
                                </span>
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                    Tanda Bukti Pendaftaran Siswa Baru
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                leftIcon={Printer}
                                onClick={handlePrint}
                                className="text-xs font-bold hidden sm:inline-flex"
                            >
                                Cetak Tanda Bukti
                            </Button>
                        </div>
                    </div>

                    {/* Registration Number Hero Banner */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-700 via-brand-800 to-slate-900 text-white space-y-2 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
                        <div>
                            <span className="text-xs font-semibold text-brand-200 uppercase tracking-wider block">
                                Nomor Pendaftaran Resmi
                            </span>
                            <span className="text-2xl sm:text-3xl font-black tracking-wider text-amber-300 font-mono">
                                {registration.registration_number}
                            </span>
                        </div>
                        <div className="pt-2 sm:pt-0">
                            <Badge variant="warning" size="md" className="bg-white/20 text-white border-white/20">
                                Status: {registration.status_label}
                            </Badge>
                        </div>
                    </div>

                    {/* Summary Data Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
                            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-2">
                                Identitas Calon Siswa
                            </h3>
                            <div className="space-y-2 text-slate-600">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Nama Lengkap:</span>
                                    <strong className="text-slate-900">{registration.full_name}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">NIK:</span>
                                    <span className="font-mono text-slate-900">{registration.nik}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">NISN:</span>
                                    <span className="font-mono text-slate-900">{registration.nisn || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Tempat, Tgl Lahir:</span>
                                    <span className="text-slate-900">{registration.birth_place}, {registration.formatted_birth_date}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Jenis Kelamin:</span>
                                    <span className="text-slate-900">{registration.gender_label}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
                            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-2">
                                Data Orang Tua & Waktu
                            </h3>
                            <div className="space-y-2 text-slate-600">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Nama Ayah:</span>
                                    <strong className="text-slate-900">{registration.father_name}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Nama Ibu:</span>
                                    <strong className="text-slate-900">{registration.mother_name}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">No HP Orang Tua:</span>
                                    <span className="text-slate-900">{registration.parent_phone}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Email Siswa:</span>
                                    <span className="text-slate-900">{registration.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Waktu Pendaftaran:</span>
                                    <span className="text-slate-900">{registration.formatted_created_at}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Next Steps Roadmap */}
                    <div className="p-6 rounded-2xl bg-brand-50/50 border border-brand-100 space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-900 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-brand-600" />
                            Petunjuk Tahapan Selanjutnya
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div className="p-3.5 rounded-xl bg-white border border-brand-200/60 space-y-1">
                                <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-[10px]">1</span>
                                <p className="font-bold text-slate-900 pt-1">Verifikasi Berkas</p>
                                <p className="text-[11px] text-slate-500">Panitia PPDB memeriksa kelengkapan berkas fisik & dokumen dalam 1-3 hari kerja.</p>
                            </div>

                            <div className="p-3.5 rounded-xl bg-white border border-brand-200/60 space-y-1">
                                <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-[10px]">2</span>
                                <p className="font-bold text-slate-900 pt-1">Asesmen Minat Bakat</p>
                                <p className="text-[11px] text-slate-500">Jadwal tes diagnostik & wawancara akan dikirimkan via WhatsApp atau email.</p>
                            </div>

                            <div className="p-3.5 rounded-xl bg-white border border-brand-200/60 space-y-1">
                                <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-[10px]">3</span>
                                <p className="font-bold text-slate-900 pt-1">Pengumuman & Daftar Ulang</p>
                                <p className="text-[11px] text-slate-500">Hasil kelulusan resmi dapat dicek melalui portal sekolah dengan nomor pendaftaran.</p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                        <Link href="/">
                            <Button variant="secondary" size="md" leftIcon={ArrowLeft} className="text-xs font-bold">
                                Kembali ke Beranda Sekolah
                            </Button>
                        </Link>

                        <div className="text-xs text-slate-400 text-center sm:text-right">
                            Simpan nomor pendaftaran ini sebagai rujukan informasi seleksi.
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
