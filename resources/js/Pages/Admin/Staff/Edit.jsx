import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import BentoCard from '@/Components/BentoCard';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Badge from '@/Components/Badge';
import {
    Users,
    GraduationCap,
    Briefcase,
    ArrowLeft,
    Upload,
    Image as ImageIcon,
    Save,
    Sparkles,
    Check,
    Eye,
} from 'lucide-react';

export default function StaffEdit({ staff }) {
    const [photoPreview, setPhotoPreview] = useState(staff.photo_url || null);

    const { data, setData, post, processing, errors } = useForm({
        _method: 'POST',
        name: staff.name || '',
        employee_number: staff.employee_number || '',
        position: staff.position || '',
        category: staff.category || 'teacher',
        department: staff.department || '',
        subject: staff.subject || '',
        education: staff.education || '',
        bio: staff.bio || '',
        email: staff.email || '',
        phone: staff.phone || '',
        photo: null,
        sort_order: staff.sort_order ?? 0,
        is_active: !!staff.is_active,
    });

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('photo', file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(`/admin/guru-staff/${staff.id}`);
    };

    return (
        <AdminLayout title={`Edit: ${staff.name}`}>
            <Head title={`Edit Data: ${staff.name} — Admin Portal`} />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/admin/guru-staff">
                            <Button variant="secondary" size="sm" leftIcon={ArrowLeft}>
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">
                                Edit Data Personil
                            </h2>
                            <p className="text-xs text-slate-500">
                                Memperbarui informasi untuk {staff.name} ({staff.position})
                            </p>
                        </div>
                    </div>

                    <Link href={`/guru/${staff.slug}`} target="_blank">
                        <Button variant="secondary" size="sm" leftIcon={Eye} className="text-xs">
                            Lihat di Web
                        </Button>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 1. Kategori & Identitas Utama */}
                    <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <Users className="w-4 h-4 text-brand-600" />
                            <span>1. Kategori & Identitas Utama</span>
                        </h3>

                        {/* Category Selector */}
                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-2">
                                Kategori Personil <span className="text-rose-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setData('category', 'teacher')}
                                    className={`p-4 rounded-xl border flex items-center gap-3 transition-all cursor-pointer text-left ${
                                        data.category === 'teacher'
                                            ? 'bg-brand-50/80 border-brand-500 ring-2 ring-brand-500/20 text-brand-900'
                                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                                        data.category === 'teacher' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                        <GraduationCap className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="font-bold text-xs block">Tenaga Pendidik (Guru)</span>
                                        <span className="text-[11px] text-slate-500">Dewan guru mata pelajaran & pengajar kelas.</span>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setData('category', 'staff')}
                                    className={`p-4 rounded-xl border flex items-center gap-3 transition-all cursor-pointer text-left ${
                                        data.category === 'staff'
                                            ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-900'
                                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                                        data.category === 'staff' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                        <Briefcase className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="font-bold text-xs block">Tenaga Kependidikan (Staf / TU)</span>
                                        <span className="text-[11px] text-slate-500">Tata usaha, administrasi, IT, dan operasional.</span>
                                    </div>
                                </button>
                            </div>
                            {errors.category && <p className="text-xs text-rose-500 mt-1">{errors.category}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Nama Lengkap & Gelar *"
                                placeholder="cth. Drs. H. Bambang Suryono, M.Pd."
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                error={errors.name}
                                required
                            />

                            <Input
                                label="NIP / NUPTK / NIK"
                                placeholder="cth. 19780512 200501 1 003"
                                value={data.employee_number}
                                onChange={(e) => setData('employee_number', e.target.value)}
                                error={errors.employee_number}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Jabatan / Posisi *"
                                placeholder="cth. Kepala Sekolah / Guru Matematika / Staf TU"
                                value={data.position}
                                onChange={(e) => setData('position', e.target.value)}
                                error={errors.position}
                                required
                            />

                            {data.category === 'teacher' ? (
                                <Input
                                    label="Mata Pelajaran yang Diampu"
                                    placeholder="cth. Matematika Peminatan & Wajib"
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    error={errors.subject}
                                />
                            ) : (
                                <Input
                                    label="Unit / Divisi Kerja"
                                    placeholder="cth. Bagian Tata Usaha & Sarpras"
                                    value={data.department}
                                    onChange={(e) => setData('department', e.target.value)}
                                    error={errors.department}
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Pendidikan Terakhir"
                                placeholder="cth. S2 Pendidikan Matematika — Universitas Negeri Jakarta"
                                value={data.education}
                                onChange={(e) => setData('education', e.target.value)}
                                error={errors.education}
                            />

                            {data.category === 'teacher' && (
                                <Input
                                    label="Unit / Bagian Tambahan (Opsional)"
                                    placeholder="cth. Kurikulum / Kesiswaan / Humas"
                                    value={data.department}
                                    onChange={(e) => setData('department', e.target.value)}
                                    error={errors.department}
                                />
                            )}
                        </div>
                    </div>

                    {/* 2. Foto Profil Personil */}
                    <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-brand-600" />
                            <span>2. Foto Profil</span>
                        </h3>

                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            {/* Image Preview */}
                            <div className="w-32 h-36 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center overflow-hidden shrink-0 shadow-inner">
                                {photoPreview ? (
                                    <img
                                        src={photoPreview}
                                        alt={staff.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-center p-3 text-slate-400">
                                        <Users className="w-8 h-8 mx-auto mb-1 opacity-50" />
                                        <span className="text-[10px] block">Belum ada foto</span>
                                    </div>
                                )}
                            </div>

                            {/* Upload Controls */}
                            <div className="space-y-2 flex-1 w-full">
                                <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-50 border border-brand-200 text-brand-700 font-bold text-xs hover:bg-brand-100 transition-colors cursor-pointer shadow-2xs">
                                    <Upload className="w-4 h-4" />
                                    <span>Ganti File Foto (JPG, PNG, WebP)</span>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handlePhotoChange}
                                        className="hidden"
                                    />
                                </label>
                                <p className="text-[11px] text-slate-500">
                                    Unggah foto baru jika ingin mengganti foto saat ini. Format JPG, PNG, atau WebP max 3MB.
                                </p>
                                {errors.photo && <p className="text-xs text-rose-500">{errors.photo}</p>}
                            </div>
                        </div>
                    </div>

                    {/* 3. Kontak & Bio Singkat */}
                    <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-brand-600" />
                            <span>3. Kontak & Profil Singkat</span>
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                type="email"
                                label="Alamat Email Publik"
                                placeholder="cth. bambang.suryono@smanusantara.sch.id"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                error={errors.email}
                            />

                            <Input
                                label="Nomor Telepon / WhatsApp"
                                placeholder="cth. +62 812-3456-7890"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                error={errors.phone}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1.5">
                                Bio & Deskripsi Singkat
                            </label>
                            <textarea
                                rows={4}
                                placeholder="Tuliskan pengalaman mengajar, dedikasi, atau pesan inspiratif..."
                                value={data.bio}
                                onChange={(e) => setData('bio', e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder:text-slate-400"
                            />
                            {errors.bio && <p className="text-xs text-rose-500 mt-1">{errors.bio}</p>}
                        </div>
                    </div>

                    {/* 4. Pengaturan Tampilan & Urutan */}
                    <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <Users className="w-4 h-4 text-brand-600" />
                            <span>4. Pengaturan Tampilan & Urutan</span>
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                            <Input
                                type="number"
                                label="Nomor Urutan Tampil (Sort Order)"
                                placeholder="cth. 1 (Kepala Sekolah), 2 (Wakasek)"
                                value={data.sort_order}
                                onChange={(e) => setData('sort_order', e.target.value)}
                                error={errors.sort_order}
                                helper="Urutan lebih kecil (misal 1, 2) akan tampil paling atas di direktori publik."
                            />

                            <label className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                                <div>
                                    <span className="text-xs font-bold text-slate-900 block">Status Publikasi</span>
                                    <span className="text-[11px] text-slate-500">
                                        {data.is_active ? 'Aktif dan tampil di direktori publik' : 'Disembunyikan dari direktori publik'}
                                    </span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="w-5 h-5 text-brand-600 rounded-md focus:ring-brand-500 cursor-pointer"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Form Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                        <Link href="/admin/guru-staff">
                            <Button variant="secondary" size="md">
                                Batal
                            </Button>
                        </Link>
                        <Button
                            variant="primary"
                            size="md"
                            type="submit"
                            leftIcon={Save}
                            isLoading={processing}
                            className="shadow-sm font-bold text-xs"
                        >
                            Simpan Perubahan
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
