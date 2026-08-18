import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import BentoCard from '@/Components/BentoCard';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Textarea from '@/Components/Textarea';
import Select from '@/Components/Select';
import Badge from '@/Components/Badge';
import Alert from '@/Components/Alert';
import {
    UserCheck,
    User,
    Users,
    FileText,
    Upload,
    CheckCircle2,
    Shield,
    Calendar,
    Phone,
    Mail,
    AlertCircle,
    Info,
    Sparkles,
} from 'lucide-react';

export default function RegistrationIndex({ settings = {} }) {
    const { school, errors } = usePage().props;
    const schoolName = school?.name || 'SMK Triwijaya';

    const { data, setData, post, processing } = useForm({
        // Data Siswa
        full_name: '',
        nik: '',
        nisn: '',
        birth_place: '',
        birth_date: '',
        gender: 'L',
        address: '',
        province: 'DKI Jakarta',
        regency: 'Jakarta Selatan',
        district: '',
        village: '',
        phone: '',
        email: '',

        // Data Orang Tua
        father_name: '',
        mother_name: '',
        parent_phone: '',
        parent_occupation: '',
        parent_address: '',

        // Dokumen
        doc_kk: null,
        doc_birth_certificate: null,
        doc_diploma: null,
        doc_photo: null,
        doc_additional: null,

        // Persetujuan
        agreement: false,
    });

    const [uploadedFileNames, setUploadedFileNames] = useState({
        doc_kk: '',
        doc_birth_certificate: '',
        doc_diploma: '',
        doc_photo: '',
        doc_additional: '',
    });

    const handleFileChange = (field, e) => {
        const file = e.target.files[0];
        if (file) {
            setData(field, file);
            setUploadedFileNames((prev) => ({
                ...prev,
                [field]: `${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/pendaftaran');
    };

    return (
        <PublicLayout>
            <Head>
                <title>Formulir Pendaftaran Siswa Baru (PPDB Online)</title>
                <meta
                    name="description"
                    content={`Formulir pendaftaran online penerimaan peserta didik baru (PPDB) tahun ajaran 2026/2027 di ${schoolName}.`}
                />
            </Head>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
                {/* Header Banner Bento */}
                <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-brand-700 via-brand-800 to-slate-900 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 space-y-4 max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
                            <UserCheck className="w-3.5 h-3.5 text-amber-300" />
                            <span>PPDB Online TA 2026/2027</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                            Pendaftaran Siswa Baru
                        </h1>
                        <p className="text-xs sm:text-sm text-brand-100 leading-relaxed">
                            Lengkapi seluruh data calon peserta didik, data orang tua/wali, serta unggah dokumen persyaratan resmi untuk memulai proses seleksi masuk di {schoolName}.
                        </p>
                    </div>
                </div>

                {/* Validation Errors Notice */}
                {Object.keys(errors).length > 0 && (
                    <Alert variant="danger" title="Terdapat Kesalahan Pengisian Formulir">
                        <p className="text-xs">
                            Mohon periksa kembali kolom formulir yang diberi tanda merah di bawah ini.
                        </p>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* SECTION 1: DATA CALON SISWA */}
                    <div className="bento-card p-6 sm:p-8 space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-black text-sm">
                                1
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-slate-900">Data Calon Peserta Didik</h2>
                                <p className="text-xs text-slate-500">Informasi identitas pribadi calon siswa sesuai akta & KK.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <Input
                                label="Nama Lengkap Siswa"
                                placeholder="Contoh: Aditya Pratama Putra"
                                value={data.full_name}
                                onChange={(e) => setData('full_name', e.target.value)}
                                error={errors.full_name}
                                required
                            />

                            <Input
                                label="Nomor Induk Kependudukan (NIK)"
                                placeholder="16 digit angka NIK dari KK"
                                maxLength={16}
                                value={data.nik}
                                onChange={(e) => setData('nik', e.target.value)}
                                error={errors.nik}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            <Input
                                label="NISN (Opsional)"
                                placeholder="10 digit NISN SMP/MTs"
                                maxLength={10}
                                value={data.nisn}
                                onChange={(e) => setData('nisn', e.target.value)}
                                error={errors.nisn}
                            />

                            <Input
                                label="Tempat Lahir"
                                placeholder="Kota / Kabupaten"
                                value={data.birth_place}
                                onChange={(e) => setData('birth_place', e.target.value)}
                                error={errors.birth_place}
                                required
                            />

                            <Input
                                type="date"
                                label="Tanggal Lahir"
                                value={data.birth_date}
                                onChange={(e) => setData('birth_date', e.target.value)}
                                error={errors.birth_date}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            <Select
                                label="Jenis Kelamin"
                                value={data.gender}
                                onChange={(e) => setData('gender', e.target.value)}
                                error={errors.gender}
                                required
                            >
                                <option value="L">Laki-laki</option>
                                <option value="P">Perempuan</option>
                            </Select>

                            <Input
                                label="Nomor WhatsApp / HP Siswa"
                                placeholder="0812xxxxxxxx"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                error={errors.phone}
                                required
                            />

                            <Input
                                type="email"
                                label="Alamat Email Siswa"
                                placeholder="email@gmail.com"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                error={errors.email}
                                required
                            />
                        </div>

                        <Textarea
                            label="Alamat Tempat Tinggal Lengkap"
                            placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan..."
                            rows={3}
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            error={errors.address}
                            required
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <Input
                                label="Provinsi"
                                placeholder="DKI Jakarta"
                                value={data.province}
                                onChange={(e) => setData('province', e.target.value)}
                                error={errors.province}
                            />

                            <Input
                                label="Kota / Kabupaten"
                                placeholder="Jakarta Selatan"
                                value={data.regency}
                                onChange={(e) => setData('regency', e.target.value)}
                                error={errors.regency}
                            />

                            <Input
                                label="Kecamatan"
                                placeholder="Kebayoran Baru"
                                value={data.district}
                                onChange={(e) => setData('district', e.target.value)}
                                error={errors.district}
                            />

                            <Input
                                label="Kelurahan / Desa"
                                placeholder="Gunung"
                                value={data.village}
                                onChange={(e) => setData('village', e.target.value)}
                                error={errors.village}
                            />
                        </div>
                    </div>

                    {/* SECTION 2: DATA ORANG TUA / WALI */}
                    <div className="bento-card p-6 sm:p-8 space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-sm">
                                2
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-slate-900">Data Orang Tua / Wali</h2>
                                <p className="text-xs text-slate-500">Informasi kontak orang tua atau wali penanggung jawab.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <Input
                                label="Nama Lengkap Ayah Kandung"
                                placeholder="Nama Lengkap Ayah"
                                value={data.father_name}
                                onChange={(e) => setData('father_name', e.target.value)}
                                error={errors.father_name}
                                required
                            />

                            <Input
                                label="Nama Lengkap Ibu Kandung"
                                placeholder="Nama Lengkap Ibu"
                                value={data.mother_name}
                                onChange={(e) => setData('mother_name', e.target.value)}
                                error={errors.mother_name}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <Input
                                label="Nomor Telepon / WA Orang Tua"
                                placeholder="08xxxxxxxxxx"
                                value={data.parent_phone}
                                onChange={(e) => setData('parent_phone', e.target.value)}
                                error={errors.parent_phone}
                                required
                            />

                            <Input
                                label="Pekerjaan Orang Tua / Wali"
                                placeholder="Contoh: Karyawan Swasta / PNS / Wiraswasta"
                                value={data.parent_occupation}
                                onChange={(e) => setData('parent_occupation', e.target.value)}
                                error={errors.parent_occupation}
                            />
                        </div>

                        <Textarea
                            label="Alamat Domisili Orang Tua (Opsional jika sama dengan siswa)"
                            placeholder="Kosongkan jika alamat orang tua sama dengan siswa..."
                            rows={2}
                            value={data.parent_address}
                            onChange={(e) => setData('parent_address', e.target.value)}
                            error={errors.parent_address}
                        />
                    </div>

                    {/* SECTION 3: UNGGAH DOKUMEN PERSYARATAN */}
                    <div className="bento-card p-6 sm:p-8 space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-sm">
                                3
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-slate-900">Unggah Berkas Dokumen Persyaratan</h2>
                                <p className="text-xs text-slate-500">
                                    Berkas disimpan dengan enkripsi di <strong>Private Storage</strong> aman. Format: PDF, JPG, PNG (Maks 3MB/berkas).
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* KK Upload */}
                            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-800">Scan Kartu Keluarga (KK) *</span>
                                    <Badge variant="brand" size="sm">Wajib</Badge>
                                </div>
                                <label className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-dashed border-brand-300 bg-white hover:bg-brand-50/30 cursor-pointer transition-colors text-center">
                                    <Upload className="w-4 h-4 text-brand-600 shrink-0" />
                                    <span className="text-xs font-semibold text-brand-700 truncate">
                                        {uploadedFileNames.doc_kk || 'Pilih Berkas KK (PDF/Gambar)'}
                                    </span>
                                    <input
                                        type="file"
                                        accept=".pdf,image/jpeg,image/png,image/jpg"
                                        onChange={(e) => handleFileChange('doc_kk', e)}
                                        className="hidden"
                                    />
                                </label>
                                {errors.doc_kk && <p className="text-xs text-rose-600 font-semibold">{errors.doc_kk}</p>}
                            </div>

                            {/* Akta Kelahiran Upload */}
                            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-800">Scan Akta Kelahiran *</span>
                                    <Badge variant="brand" size="sm">Wajib</Badge>
                                </div>
                                <label className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-dashed border-brand-300 bg-white hover:bg-brand-50/30 cursor-pointer transition-colors text-center">
                                    <Upload className="w-4 h-4 text-brand-600 shrink-0" />
                                    <span className="text-xs font-semibold text-brand-700 truncate">
                                        {uploadedFileNames.doc_birth_certificate || 'Pilih Berkas Akta (PDF/Gambar)'}
                                    </span>
                                    <input
                                        type="file"
                                        accept=".pdf,image/jpeg,image/png,image/jpg"
                                        onChange={(e) => handleFileChange('doc_birth_certificate', e)}
                                        className="hidden"
                                    />
                                </label>
                                {errors.doc_birth_certificate && (
                                    <p className="text-xs text-rose-600 font-semibold">{errors.doc_birth_certificate}</p>
                                )}
                            </div>

                            {/* Pas Foto Upload */}
                            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-800">Pas Foto 3x4 Berwarna *</span>
                                    <Badge variant="brand" size="sm">Wajib</Badge>
                                </div>
                                <label className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-dashed border-brand-300 bg-white hover:bg-brand-50/30 cursor-pointer transition-colors text-center">
                                    <Upload className="w-4 h-4 text-brand-600 shrink-0" />
                                    <span className="text-xs font-semibold text-brand-700 truncate">
                                        {uploadedFileNames.doc_photo || 'Pilih Pas Foto (JPG/PNG)'}
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg"
                                        onChange={(e) => handleFileChange('doc_photo', e)}
                                        className="hidden"
                                    />
                                </label>
                                {errors.doc_photo && (
                                    <p className="text-xs text-rose-600 font-semibold">{errors.doc_photo}</p>
                                )}
                            </div>

                            {/* Ijazah / SKL Upload */}
                            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-800">Scan Ijazah / SKL SMP</span>
                                    <Badge variant="neutral" size="sm">Opsional / Susulan</Badge>
                                </div>
                                <label className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-dashed border-slate-300 bg-white hover:bg-slate-50 cursor-pointer transition-colors text-center">
                                    <Upload className="w-4 h-4 text-slate-500 shrink-0" />
                                    <span className="text-xs font-semibold text-slate-600 truncate">
                                        {uploadedFileNames.doc_diploma || 'Pilih Berkas Ijazah (PDF/Gambar)'}
                                    </span>
                                    <input
                                        type="file"
                                        accept=".pdf,image/jpeg,image/png,image/jpg"
                                        onChange={(e) => handleFileChange('doc_diploma', e)}
                                        className="hidden"
                                    />
                                </label>
                                {errors.doc_diploma && (
                                    <p className="text-xs text-rose-600 font-semibold">{errors.doc_diploma}</p>
                                )}
                            </div>
                        </div>

                        {/* Dokumen Tambahan / Prestasi */}
                        <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800">Dokumen Prestasi / Piagam Sertifikat Tambahan</span>
                                <Badge variant="purple" size="sm">Jalur Prestasi</Badge>
                            </div>
                            <label className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-dashed border-slate-300 bg-white hover:bg-slate-50 cursor-pointer transition-colors text-center">
                                <Upload className="w-4 h-4 text-slate-500 shrink-0" />
                                <span className="text-xs font-semibold text-slate-600 truncate">
                                    {uploadedFileNames.doc_additional || 'Pilih Sertifikat / Piagam (PDF/Gambar)'}
                                </span>
                                <input
                                    type="file"
                                    accept=".pdf,image/jpeg,image/png,image/jpg"
                                    onChange={(e) => handleFileChange('doc_additional', e)}
                                    className="hidden"
                                />
                            </label>
                            {errors.doc_additional && (
                                <p className="text-xs text-rose-600 font-semibold">{errors.doc_additional}</p>
                            )}
                        </div>
                    </div>

                    {/* SECTION 4: PERNYATAAN & PERSETUJUAN */}
                    <div className="bento-card p-6 sm:p-8 space-y-5">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-sm">
                                4
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-slate-900">Pernyataan & Persetujuan</h2>
                                <p className="text-xs text-slate-500">Konfirmasi kebenaran data dan kesanggupan mengikuti tata tertib.</p>
                            </div>
                        </div>

                        <label className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 cursor-pointer hover:bg-amber-50 transition-colors">
                            <input
                                type="checkbox"
                                checked={data.agreement}
                                onChange={(e) => setData('agreement', e.target.checked)}
                                className="w-4 h-4 text-brand-600 rounded-md mt-0.5 focus:ring-brand-500"
                                required
                            />
                            <div className="text-xs text-slate-700 space-y-1">
                                <span className="font-bold text-slate-900 block">
                                    Saya menyatakan bahwa seluruh data dan dokumen yang saya unggah adalah benar dan dapat dipertanggungjawabkan secara hukum.
                                </span>
                                <span className="text-slate-500 block">
                                    Apabila di kemudian hari ditemukan pemalsuan data, maka pihak sekolah berhak membatalkan status penerimaan calon siswa.
                                </span>
                            </div>
                        </label>

                        {errors.agreement && (
                            <p className="text-xs text-rose-600 font-semibold">{errors.agreement}</p>
                        )}
                    </div>

                    {/* SUBMIT BUTTON */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Shield className="w-4 h-4 text-emerald-600" />
                            <span>Data pendaftaran Anda terlindungi dengan standar enkripsi SCHID.</span>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            isLoading={processing}
                            className="w-full sm:w-auto font-black text-xs shadow-lg shadow-brand-600/25 px-8"
                        >
                            Kirim Formulir Pendaftaran Sekarang
                        </Button>
                    </div>
                </form>
            </div>
        </PublicLayout>
    );
}
