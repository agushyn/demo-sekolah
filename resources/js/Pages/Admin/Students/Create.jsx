import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import {
    Users,
    ArrowLeft,
    UserPlus,
    School,
    Heart,
    Lock,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Save,
    Sparkles,
} from 'lucide-react';

export default function StudentCreate({ classes = [], academicYears = [], parents = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        nisn: '',
        nis: '',
        gender: 'L',
        birth_place: '',
        birth_date: '',
        phone: '',
        address: '',
        class_id: classes[0]?.id ? String(classes[0].id) : '',
        parent_id: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/students');
    };

    return (
        <AdminLayout title="Tambah Siswa Baru">
            <Head title="Tambah Akun Siswa" />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Top Nav */}
                <div className="flex items-center justify-between">
                    <Link href="/admin/students">
                        <Button variant="secondary" size="sm" leftIcon={ArrowLeft} className="text-xs">
                            Kembali ke Daftar Siswa
                        </Button>
                    </Link>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Pendaftaran Akun Siswa Baru</span>
                    </div>
                </div>

                {/* Form Card */}
                <form onSubmit={handleSubmit} className="bento-card p-6 sm:p-8 bg-white space-y-8 shadow-sm">
                    {/* Header */}
                    <div className="pb-4 border-b border-slate-100 space-y-1">
                        <h2 className="text-xl font-black text-slate-900">
                            Formulir Akun & Biodata Siswa
                        </h2>
                        <p className="text-xs text-slate-500">
                            Sistem akan secara otomatis membuat akun login siswa, profil data pokok, dan enrollment rombel aktif.
                        </p>
                    </div>

                    {/* Section 1: Akun Login */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
                            <Lock className="w-3.5 h-3.5 text-brand-600" />
                            <span>1. Kredensial Akun Login</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1 sm:col-span-2">
                                <label className="block text-xs font-bold text-slate-700">
                                    Nama Lengkap Siswa <span className="text-rose-500">*</span>
                                </label>
                                <Input
                                    placeholder="Contoh: Muhammad Rizky Pratama"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    error={errors.name}
                                    required
                                    className="text-xs"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700">
                                    Email Akun Login <span className="text-rose-500">*</span>
                                </label>
                                <Input
                                    type="email"
                                    placeholder="rizky.pratama@schid.test"
                                    leftIcon={Mail}
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    error={errors.email}
                                    required
                                    className="text-xs"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700">
                                    Password (Opsional)
                                </label>
                                <Input
                                    type="password"
                                    placeholder="Default: password"
                                    leftIcon={Lock}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    error={errors.password}
                                    className="text-xs"
                                />
                                <span className="text-[10px] text-slate-400">Kosongkan jika ingin menggunakan password bawaan "password".</span>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Data Pokok & Identitas Siswa */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
                            <Users className="w-3.5 h-3.5 text-indigo-600" />
                            <span>2. Data Pokok & Identitas Siswa</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700">
                                    NISN (Nomor Induk Siswa Nasional)
                                </label>
                                <Input
                                    placeholder="Contoh: 0051234589"
                                    value={data.nisn}
                                    onChange={(e) => setData('nisn', e.target.value)}
                                    error={errors.nisn}
                                    className="text-xs font-mono"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700">
                                    NIS (Nomor Induk Sekolah)
                                </label>
                                <Input
                                    placeholder="Contoh: 20261015"
                                    value={data.nis}
                                    onChange={(e) => setData('nis', e.target.value)}
                                    error={errors.nis}
                                    className="text-xs font-mono"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700">
                                    Jenis Kelamin <span className="text-rose-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setData('gender', 'L')}
                                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                            data.gender === 'L'
                                                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        Laki-laki (L)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setData('gender', 'P')}
                                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                            data.gender === 'P'
                                                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        Perempuan (P)
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700">
                                    Nomor Telepon / WhatsApp Siswa
                                </label>
                                <Input
                                    placeholder="081234567890"
                                    leftIcon={Phone}
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    error={errors.phone}
                                    className="text-xs font-mono"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700">
                                    Tempat Lahir
                                </label>
                                <Input
                                    placeholder="Contoh: Jakarta"
                                    value={data.birth_place}
                                    onChange={(e) => setData('birth_place', e.target.value)}
                                    error={errors.birth_place}
                                    className="text-xs"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700">
                                    Tanggal Lahir
                                </label>
                                <input
                                    type="date"
                                    value={data.birth_date}
                                    onChange={(e) => setData('birth_date', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-800 focus:border-brand-500 focus:outline-hidden"
                                />
                                {errors.birth_date && (
                                    <p className="text-[11px] text-rose-500">{errors.birth_date}</p>
                                )}
                            </div>

                            <div className="space-y-1 sm:col-span-2">
                                <label className="block text-xs font-bold text-slate-700">
                                    Alamat Domisili Siswa
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Jl. Mawar No. 12, RT 01/RW 02, Jakarta Selatan..."
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-brand-500 focus:outline-hidden"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Penempatan Kelas & Akun Orang Tua */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
                            <School className="w-3.5 h-3.5 text-emerald-600" />
                            <span>3. Penempatan Rombel & Hubungan Wali</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700">
                                    Rombongan Belajar (Kelas) <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={data.class_id}
                                    onChange={(e) => setData('class_id', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-800 focus:border-brand-500 focus:outline-hidden"
                                    required
                                >
                                    <option value="">-- Pilih Kelas Siswa --</option>
                                    {classes.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} (Tingkat {c.grade_level}) • {c.academic_year?.name || '2026/2027'}
                                        </option>
                                    ))}
                                </select>
                                {errors.class_id && (
                                    <p className="text-[11px] text-rose-500">{errors.class_id}</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700">
                                    Hubungkan ke Akun Orang Tua (Opsional)
                                </label>
                                <select
                                    value={data.parent_id}
                                    onChange={(e) => setData('parent_id', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-800 focus:border-brand-500 focus:outline-hidden"
                                >
                                    <option value="">-- Belum Dihubungkan / Tanpa Wali --</option>
                                    {parents.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} ({p.relationship_type || 'Wali'}) • {p.phone}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <Link href="/admin/students">
                            <Button type="button" variant="secondary" size="md">
                                Batal
                            </Button>
                        </Link>

                        <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            isLoading={processing}
                            leftIcon={Save}
                            className="font-bold"
                        >
                            Simpan & Daftarkan Siswa
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
