import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import BentoCard from '@/Components/BentoCard';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import Textarea from '@/Components/Textarea';
import Alert from '@/Components/Alert';
import {
    ArrowLeft,
    User,
    Users,
    FileText,
    Download,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    Shield,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Save,
} from 'lucide-react';

export default function RegistrationShow({ registration }) {
    const { flash } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        status: registration.status || 'pending',
        admin_notes: registration.admin_notes || '',
    });

    const handleStatusSubmit = (e) => {
        e.preventDefault();
        post(`/admin/registrations/${registration.id}/status`);
    };

    const documents = registration.documents || [];

    return (
        <AdminLayout title={`Detail Pendaftar: ${registration.registration_number}`}>
            <Head title={`Pendaftar: ${registration.full_name} (${registration.registration_number}) — Admin Portal`} />

            <div className="max-w-6xl mx-auto space-y-8">
                {/* Flash Alert */}
                {flash?.success && (
                    <Alert variant="success" title="Berhasil!">
                        {flash.success}
                    </Alert>
                )}

                {/* Back Button & Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <Link
                        href="/admin/registrations"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-brand-600 transition-colors px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs w-fit"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali ke Daftar PPDB</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Status Saat Ini:</span>
                        <Badge variant={registration.status_badge || 'warning'} size="md" dot>
                            {registration.status_label}
                        </Badge>
                    </div>
                </div>

                {/* Main Dossier Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Student & Parent Details (Span 8) */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Header Bento */}
                        <div className="bento-card p-6 sm:p-8 space-y-4 bg-gradient-to-br from-brand-900 to-slate-900 text-white">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <span className="text-xs text-brand-300 font-mono font-bold tracking-wider uppercase block">
                                        Nomor Registrasi PPDB
                                    </span>
                                    <h1 className="text-2xl sm:text-3xl font-black text-amber-300 font-mono tracking-wide mt-0.5">
                                        {registration.registration_number}
                                    </h1>
                                </div>
                                <span className="text-xs text-brand-200">
                                    Daftar: {registration.formatted_created_at}
                                </span>
                            </div>

                            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-brand-100 border-t border-brand-800/80">
                                <span>Nama: <strong className="text-white">{registration.full_name}</strong></span>
                                <span>•</span>
                                <span>NIK: <strong className="font-mono text-white">{registration.nik}</strong></span>
                                {registration.nisn && (
                                    <>
                                        <span>•</span>
                                        <span>NISN: <strong className="font-mono text-white">{registration.nisn}</strong></span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Student Details Bento Card */}
                        <div className="bento-card p-6 sm:p-8 space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                                <User className="w-4 h-4 text-brand-600" />
                                Data Calon Peserta Didik
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div>
                                    <span className="text-slate-400 block">Tempat, Tanggal Lahir</span>
                                    <span className="font-bold text-slate-800">{registration.birth_place}, {registration.formatted_birth_date}</span>
                                </div>

                                <div>
                                    <span className="text-slate-400 block">Jenis Kelamin</span>
                                    <span className="font-bold text-slate-800">{registration.gender_label}</span>
                                </div>

                                <div>
                                    <span className="text-slate-400 block">Nomor WhatsApp / HP</span>
                                    <span className="font-bold text-slate-800">{registration.phone}</span>
                                </div>

                                <div>
                                    <span className="text-slate-400 block">Alamat Email</span>
                                    <span className="font-bold text-slate-800">{registration.email}</span>
                                </div>

                                <div className="sm:col-span-2">
                                    <span className="text-slate-400 block">Alamat Domisili Siswa</span>
                                    <p className="font-semibold text-slate-800 mt-0.5 leading-relaxed">
                                        {registration.address}
                                        {registration.village && `, Kel. ${registration.village}`}
                                        {registration.district && `, Kec. ${registration.district}`}
                                        {registration.regency && `, ${registration.regency}`}
                                        {registration.province && `, Prov. ${registration.province}`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Parent Details Bento Card */}
                        <div className="bento-card p-6 sm:p-8 space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                                <Users className="w-4 h-4 text-purple-600" />
                                Data Orang Tua / Wali
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div>
                                    <span className="text-slate-400 block">Nama Ayah Kandung</span>
                                    <span className="font-bold text-slate-800">{registration.father_name}</span>
                                </div>

                                <div>
                                    <span className="text-slate-400 block">Nama Ibu Kandung</span>
                                    <span className="font-bold text-slate-800">{registration.mother_name}</span>
                                </div>

                                <div>
                                    <span className="text-slate-400 block">No Telepon Orang Tua</span>
                                    <span className="font-bold text-slate-800">{registration.parent_phone}</span>
                                </div>

                                <div>
                                    <span className="text-slate-400 block">Pekerjaan Orang Tua</span>
                                    <span className="font-bold text-slate-800">{registration.parent_occupation || '-'}</span>
                                </div>

                                {registration.parent_address && (
                                    <div className="sm:col-span-2">
                                        <span className="text-slate-400 block">Alamat Domisili Orang Tua</span>
                                        <p className="font-semibold text-slate-800 mt-0.5">{registration.parent_address}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Documents Bento Card */}
                        <div className="bento-card p-6 sm:p-8 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-emerald-600" />
                                    Dokumen Persyaratan Privat ({documents.length})
                                </h3>
                                <Badge variant="neutral" size="sm">Private Storage</Badge>
                            </div>

                            {documents.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">Tidak ada berkas terlampir.</p>
                            ) : (
                                <div className="space-y-3">
                                    {documents.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4"
                                        >
                                            <div className="space-y-0.5 min-w-0">
                                                <span className="text-xs font-bold text-slate-900 block truncate">
                                                    {doc.type_label}
                                                </span>
                                                <p className="text-[11px] text-slate-500 truncate">
                                                    {doc.original_name} • {doc.formatted_file_size}
                                                </p>
                                            </div>

                                            <a
                                                href={`/admin/registrations/${registration.id}/documents/${doc.id}/download`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-brand-700 hover:bg-brand-50 hover:border-brand-300 transition-colors text-xs font-bold shrink-0 shadow-2xs"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                                <span>Unduh</span>
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Verification Action Panel (Span 4) */}
                    <div className="lg:col-span-4 space-y-6">
                        <form onSubmit={handleStatusSubmit} className="bento-card p-6 space-y-5">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-brand-600" />
                                Keputusan Verifikasi
                            </h3>

                            {/* Status Option Radios */}
                            <div className="space-y-2">
                                {[
                                    { id: 'pending', label: 'Menunggu Verifikasi', color: 'text-amber-600' },
                                    { id: 'review', label: 'Sedang Ditinjau', color: 'text-brand-600' },
                                    { id: 'accepted', label: 'Diterima (Lolos)', color: 'text-emerald-600' },
                                    { id: 'rejected', label: 'Ditolak (Tidak Lolos)', color: 'text-rose-600' },
                                ].map((opt) => (
                                    <label
                                        key={opt.id}
                                        className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                                            data.status === opt.id
                                                ? 'bg-brand-50/70 border-brand-300 ring-1 ring-brand-400'
                                                : 'bg-white border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="status"
                                            value={opt.id}
                                            checked={data.status === opt.id}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                                        />
                                        <span className={`text-xs font-bold ${opt.color}`}>{opt.label}</span>
                                    </label>
                                ))}
                            </div>

                            {/* Admin Notes Textarea */}
                            <Textarea
                                label="Catatan Verifikasi Admin"
                                placeholder="Masukkan alasan penerimaan, kekurangan berkas, atau catatan evaluasi..."
                                rows={4}
                                value={data.admin_notes}
                                onChange={(e) => setData('admin_notes', e.target.value)}
                                error={errors.admin_notes}
                                helper="Catatan ini dapat dicantumkan pada notifikasi atau tanda bukti peserta."
                            />

                            {/* Review History Info */}
                            {registration.reviewed_at && (
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1">
                                    <p>Diverifikasi oleh: <strong>{registration.reviewer?.name || 'Administrator'}</strong></p>
                                    <p>Waktu: {registration.reviewed_at}</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                leftIcon={Save}
                                isLoading={processing}
                                className="w-full font-bold text-xs shadow-md shadow-brand-600/20"
                            >
                                Simpan Keputusan
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
