import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import BentoCard from '@/Components/BentoCard';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Textarea from '@/Components/Textarea';
import Badge from '@/Components/Badge';
import {
    ArrowLeft,
    Upload,
    Image as ImageIcon,
    Save,
    Clock,
    Sparkles,
    CheckCircle2,
    X,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Layers,
    Sliders,
} from 'lucide-react';

export default function CreateHeroSlide({ nextSortOrder = 1 }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        subtitle: '',
        description: '',
        image: null,
        button_text: '',
        button_url: '',
        secondary_button_text: '',
        secondary_button_url: '',
        text_position: 'left',
        overlay_type: 'gradient',
        sort_order: nextSortOrder,
        duration: 5000,
        is_active: true,
    });

    const [imagePreview, setImagePreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setData('image', null);
        setImagePreview(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/hero-slides');
    };

    return (
        <AdminLayout title="Tambah Slide Hero Baru">
            <Head title="Tambah Slide Hero — Admin Portal" />

            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header Navigation */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/admin/hero-slides"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Daftar Slide
                    </Link>

                    <Badge variant="brand" size="sm">
                        Slide #{data.sort_order}
                    </Badge>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Main Content Fields (Col 8) */}
                        <div className="lg:col-span-8 space-y-6">
                            <BentoCard
                                icon={Sliders}
                                title="Informasi Utama Slide"
                                description="Judul, sub-judul, dan deskripsi promosi yang ditampilkan pada hero banner."
                            >
                                <div className="space-y-4 pt-2">
                                    <Input
                                        label="Judul Slide"
                                        placeholder="cth. Membentuk Generasi Cerdas, Berkarakter & Berdaya Saing Global"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        error={errors.title}
                                        required
                                    />

                                    <Input
                                        label="Sub-judul / Tagline (Opsional)"
                                        placeholder="cth. Portal Pendidikan Modern 2026/2027"
                                        value={data.subtitle}
                                        onChange={(e) => setData('subtitle', e.target.value)}
                                        error={errors.subtitle}
                                    />

                                    <Textarea
                                        label="Deskripsi Slide (Opsional)"
                                        placeholder="Tuliskan ringkasan informasi atau ajakan..."
                                        rows={3}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        error={errors.description}
                                    />
                                </div>
                            </BentoCard>

                            {/* Tombol CTA */}
                            <BentoCard
                                icon={Sparkles}
                                title="Tombol Aksi (CTA)"
                                description="Tautan navigasi tombol utama dan kedua pada slide."
                            >
                                <div className="space-y-4 pt-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Input
                                            label="Teks Tombol Utama"
                                            placeholder="cth. Daftar Siswa Baru"
                                            value={data.button_text}
                                            onChange={(e) => setData('button_text', e.target.value)}
                                            error={errors.button_text}
                                        />
                                        <Input
                                            label="URL / Rute Tombol Utama"
                                            placeholder="cth. /pendaftaran"
                                            value={data.button_url}
                                            onChange={(e) => setData('button_url', e.target.value)}
                                            error={errors.button_url}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Input
                                            label="Teks Tombol Kedua (Opsional)"
                                            placeholder="cth. Profil Sekolah"
                                            value={data.secondary_button_text}
                                            onChange={(e) => setData('secondary_button_text', e.target.value)}
                                            error={errors.secondary_button_text}
                                        />
                                        <Input
                                            label="URL / Rute Tombol Kedua"
                                            placeholder="cth. /profil"
                                            value={data.secondary_button_url}
                                            onChange={(e) => setData('secondary_button_url', e.target.value)}
                                            error={errors.secondary_button_url}
                                        />
                                    </div>
                                </div>
                            </BentoCard>

                            {/* Upload Gambar Background */}
                            <BentoCard
                                icon={ImageIcon}
                                title="Gambar Latar Belakang (Background)"
                                description="Unggah foto kegiatan atau lingkungan sekolah (format JPG, PNG, WebP, SVG maks 5MB)."
                            >
                                <div className="space-y-4 pt-2">
                                    {imagePreview ? (
                                        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-56 object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="absolute top-3 right-3 p-2 bg-rose-600/90 text-white rounded-xl hover:bg-rose-700 transition-colors shadow-lg cursor-pointer"
                                                title="Hapus gambar"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-brand-400 rounded-2xl p-8 cursor-pointer bg-slate-50/50 hover:bg-brand-50/20 transition-all">
                                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-500 mb-3">
                                                <Upload className="w-6 h-6 text-brand-600" />
                                            </div>
                                            <p className="text-xs font-bold text-slate-800">
                                                Klik untuk unggah atau seret file ke sini
                                            </p>
                                            <p className="text-[11px] text-slate-400 mt-1">
                                                PNG, JPG, WebP, SVG hingga 5MB (Rekomendasi rasio 16:9)
                                            </p>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageChange}
                                            />
                                        </label>
                                    )}
                                    {errors.image && <p className="text-xs text-rose-600">{errors.image}</p>}
                                </div>
                            </BentoCard>
                        </div>

                        {/* Sidebar Configuration Fields (Col 4) */}
                        <div className="lg:col-span-4 space-y-6">
                            <BentoCard
                                icon={Layers}
                                title="Tampilan & Tata Letak"
                                description="Pengaturan posisi teks dan lapisan filter overlay."
                            >
                                <div className="space-y-4 pt-2">
                                    {/* Text Position */}
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 block mb-2">
                                            Posisi Teks
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { key: 'left', label: 'Kiri', icon: AlignLeft },
                                                { key: 'center', label: 'Tengah', icon: AlignCenter },
                                                { key: 'right', label: 'Kanan', icon: AlignRight },
                                            ].map((pos) => {
                                                const Icon = pos.icon;
                                                const isSelected = data.text_position === pos.key;
                                                return (
                                                    <button
                                                        key={pos.key}
                                                        type="button"
                                                        onClick={() => setData('text_position', pos.key)}
                                                        className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                                            isSelected
                                                                ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-xs'
                                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        <Icon className="w-4 h-4 mb-1" />
                                                        {pos.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Overlay Type */}
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 block mb-2">
                                            Tipe Overlay
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { key: 'gradient', label: 'Gradient' },
                                                { key: 'dark', label: 'Gelap' },
                                                { key: 'light', label: 'Terang' },
                                            ].map((ov) => {
                                                const isSelected = data.overlay_type === ov.key;
                                                return (
                                                    <button
                                                        key={ov.key}
                                                        type="button"
                                                        onClick={() => setData('overlay_type', ov.key)}
                                                        className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                                            isSelected
                                                                ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-xs'
                                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        {ov.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Sort Order */}
                                    <Input
                                        type="number"
                                        label="Nomor Urutan Slide"
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                        error={errors.sort_order}
                                        required
                                    />

                                    {/* Duration */}
                                    <div>
                                        <Input
                                            type="number"
                                            step="500"
                                            min="1000"
                                            max="60000"
                                            label="Durasi Tampil (Milidetik)"
                                            value={data.duration}
                                            onChange={(e) => setData('duration', parseInt(e.target.value) || 5000)}
                                            error={errors.duration}
                                            helperText={`${data.duration / 1000} detik per pergantian slide`}
                                            required
                                        />
                                        <div className="flex items-center gap-1.5 mt-2">
                                            {[3000, 5000, 7000, 10000].map((ms) => (
                                                <button
                                                    key={ms}
                                                    type="button"
                                                    onClick={() => setData('duration', ms)}
                                                    className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-colors cursor-pointer ${
                                                        data.duration === ms
                                                            ? 'bg-brand-600 text-white border-brand-600'
                                                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    {ms / 1000}s
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Is Active Status */}
                                    <div className="pt-2 border-t border-slate-100">
                                        <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer hover:bg-slate-100 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={data.is_active}
                                                onChange={(e) => setData('is_active', e.target.checked)}
                                                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300 cursor-pointer"
                                            />
                                            <div>
                                                <span className="text-xs font-bold text-slate-800 block">
                                                    Status Publikasi Aktif
                                                </span>
                                                <span className="text-[11px] text-slate-500 block">
                                                    Slide ini akan langsung tayang pada carousel homepage.
                                                </span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </BentoCard>

                            {/* Submit Card */}
                            <div className="bento-card p-5 bg-white border border-slate-200/80 shadow-xs space-y-3">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    leftIcon={Save}
                                    isLoading={processing}
                                    className="w-full shadow-md shadow-brand-600/25"
                                >
                                    Simpan Slide Baru
                                </Button>
                                <Link href="/admin/hero-slides" className="block">
                                    <Button variant="secondary" size="md" className="w-full">
                                        Batal
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
