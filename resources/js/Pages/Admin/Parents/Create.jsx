import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Input from '@/Components/Input';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import {
    Users,
    UserPlus,
    ArrowLeft,
    Heart,
    Lock,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    Shield,
    GraduationCap,
    Search,
    Check,
} from 'lucide-react';

export default function CreateParent({ availableStudents = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        relationship_type: 'Ayah',
        phone: '',
        nik: '',
        occupation: '',
        address: '',
        student_ids: [],
    });

    const [studentSearch, setStudentSearch] = useState('');

    const filteredStudents = availableStudents.filter((s) => {
        const query = studentSearch.toLowerCase().trim();
        return (
            !query ||
            s.name.toLowerCase().includes(query) ||
            (s.nisn && s.nisn.includes(query)) ||
            (s.nis && s.nis.includes(query)) ||
            (s.grade_level && s.grade_level.toLowerCase().includes(query))
        );
    });

    const toggleStudent = (studentId) => {
        if (data.student_ids.includes(studentId)) {
            setData(
                'student_ids',
                data.student_ids.filter((id) => id !== studentId)
            );
        } else {
            setData('student_ids', [...data.student_ids, studentId]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/parents');
    };

    return (
        <AdminLayout title="Tambah Akun Orang Tua / Wali">
            <Head title="Tambah Akun Orang Tua" />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Top Action Bar */}
                <div className="flex items-center justify-between">
                    <Link href="/admin/parents">
                        <Button variant="secondary" size="sm" leftIcon={ArrowLeft} className="text-xs">
                            Kembali ke Daftar Wali
                        </Button>
                    </Link>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                        <Heart className="w-3.5 h-3.5 text-amber-600" />
                        <span>Pendaftaran Akun Wali Murid</span>
                    </div>
                </div>

                {/* Form Card */}
                <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-8">
                    {/* Header */}
                    <div className="space-y-1 pb-4 border-b border-slate-100">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">
                            Informasi Akun Orang Tua
                        </h2>
                        <p className="text-xs text-slate-500">
                            Isi kredensial login dan data kontak wali, kemudian pilih siswa yang akan dihubungkan.
                        </p>
                    </div>

                    {/* Section 1: Kredensial Login & Identitas */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                            <Shield className="w-4 h-4 text-amber-600" />
                            <span>1. Data Akun & Login</span>
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700">
                                    Nama Lengkap Orang Tua / Wali <span className="text-rose-500">*</span>
                                </label>
                                <Input
                                    placeholder="Contoh: Hendra Wijaya, S.E."
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    error={errors.name}
                                    className="text-xs"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700">
                                    Hubungan dengan Siswa <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={data.relationship_type}
                                    onChange={(e) => setData('relationship_type', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 focus:border-brand-500 focus:outline-hidden"
                                    required
                                >
                                    <option value="Ayah">Ayah Kandung</option>
                                    <option value="Ibu">Ibu Kandung</option>
                                    <option value="Wali">Wali / Keluarga</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700">
                                    Email Login <span className="text-rose-500">*</span>
                                </label>
                                <Input
                                    type="email"
                                    placeholder="orangtua@domain.com"
                                    leftIcon={Mail}
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    error={errors.email}
                                    className="text-xs"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700">
                                    Password Login <span className="text-rose-500">*</span>
                                </label>
                                <Input
                                    type="password"
                                    placeholder="Minimal 8 karakter"
                                    leftIcon={Lock}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    error={errors.password}
                                    className="text-xs"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Data Kontak & Profil */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                            <Phone className="w-4 h-4 text-amber-600" />
                            <span>2. Kontak & Biodata</span>
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700">
                                    Nomor Telepon / WhatsApp <span className="text-rose-500">*</span>
                                </label>
                                <Input
                                    placeholder="Contoh: 081234567890"
                                    leftIcon={Phone}
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    error={errors.phone}
                                    className="text-xs"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700">
                                    Nomor Induk Kependudukan (NIK)
                                </label>
                                <Input
                                    placeholder="16 digit NIK KTP"
                                    value={data.nik}
                                    onChange={(e) => setData('nik', e.target.value)}
                                    error={errors.nik}
                                    className="text-xs"
                                />
                            </div>

                            <div className="space-y-1 sm:col-span-2">
                                <label className="block text-xs font-bold text-slate-700">
                                    Pekerjaan / Profesi
                                </label>
                                <Input
                                    placeholder="Contoh: Wiraswasta / Pegawai Negeri / Karyawan Swasta"
                                    leftIcon={Briefcase}
                                    value={data.occupation}
                                    onChange={(e) => setData('occupation', e.target.value)}
                                    error={errors.occupation}
                                    className="text-xs"
                                />
                            </div>

                            <div className="space-y-1 sm:col-span-2">
                                <label className="block text-xs font-bold text-slate-700">
                                    Alamat Domisili
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Alamat lengkap tempat tinggal orang tua..."
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-800 focus:border-brand-500 focus:outline-hidden"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Hubungkan Siswa / Anak */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                                    <span>3. Hubungkan ke Siswa / Anak</span>
                                </h3>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Pilih satu atau beberapa anak yang dinaungi oleh orang tua ini ({data.student_ids.length} siswa terpilih).
                                </p>
                            </div>

                            <div className="max-w-xs w-full">
                                <Input
                                    placeholder="Cari siswa atau NISN..."
                                    leftIcon={Search}
                                    value={studentSearch}
                                    onChange={(e) => setStudentSearch(e.target.value)}
                                    className="text-xs py-1.5"
                                />
                            </div>
                        </div>

                        {/* List Siswa */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                            {filteredStudents.length === 0 ? (
                                <div className="sm:col-span-2 p-6 text-center text-xs text-slate-400">
                                    Tidak ada siswa yang cocok dengan pencarian.
                                </div>
                            ) : (
                                filteredStudents.map((student) => {
                                    const isSelected = data.student_ids.includes(student.id);

                                    return (
                                        <div
                                            key={student.id}
                                            onClick={() => toggleStudent(student.id)}
                                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                                isSelected
                                                    ? 'bg-white border-brand-500 ring-2 ring-brand-500/20 shadow-xs'
                                                    : 'bg-white border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-900 truncate">
                                                    {student.name}
                                                </p>
                                                <p className="text-[10px] text-slate-500 font-mono truncate">
                                                    NISN: {student.nisn || '-'} • Kelas: {student.grade_level}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                {student.has_parent && !isSelected && (
                                                    <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                                                        Ada Wali Lain
                                                    </span>
                                                )}
                                                <div
                                                    className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors ${
                                                        isSelected
                                                            ? 'bg-brand-600 text-white border-brand-600'
                                                            : 'border-slate-300 bg-slate-50'
                                                    }`}
                                                >
                                                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                        <Link href="/admin/parents">
                            <Button type="button" variant="secondary" size="md">
                                Batal
                            </Button>
                        </Link>

                        <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            isLoading={processing}
                            leftIcon={UserPlus}
                        >
                            Simpan Akun Orang Tua
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
