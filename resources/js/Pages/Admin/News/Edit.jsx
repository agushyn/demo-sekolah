import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import BentoCard from '@/Components/BentoCard';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Textarea from '@/Components/Textarea';
import Select from '@/Components/Select';
import Alert from '@/Components/Alert';
import Badge from '@/Components/Badge';
import {
    ArrowLeft,
    Upload,
    Save,
    Clock,
    CheckCircle2,
    X,
    Eye,
} from 'lucide-react';

export default function EditNews({ news, categories = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        title: news.title || '',
        category_id: news.category_id || (categories[0]?.id ?? ''),
        excerpt: news.excerpt || '',
        content: news.content || '',
        thumbnail: null,
        status: news.status || 'published',
        is_featured: !!news.is_featured,
        published_at: news.published_at ? news.published_at.substring(0, 16) : '',
    });

    const [imagePreview, setImagePreview] = useState(news.thumbnail_url || null);

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('thumbnail', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveThumbnail = () => {
        setData('thumbnail', null);
        setImagePreview(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(`/admin/news/${news.id}`);
    };

    return (
        <AdminLayout title="Edit Berita">
            <Head title={`Edit: ${news.title} — Admin Portal`} />

            <div className="max-w-5xl mx-auto space-y-8">
                {/* Back Button & Header */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/admin/news"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-brand-600 transition-colors px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali ke Daftar Berita</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        {news.status === 'published' && (
                            <a
                                href={`/berita/${news.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:text-brand-600 text-xs font-semibold"
                            >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Lihat Artikel Publik</span>
                            </a>
                        )}
                        <Badge variant="brand" size="sm">
                            CMS Redaksi
                        </Badge>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Main Form Column (Span 8) */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="bento-card p-6 sm:p-8 space-y-5">
                                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                                    Edit Konten Berita
                                </h3>

                                <Input
                                    label="Judul Berita"
                                    placeholder="Judul Berita..."
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    error={errors.title}
                                    required
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Select
                                        label="Kategori Berita"
                                        value={data.category_id}
                                        onChange={(e) => setData('category_id', e.target.value)}
                                        error={errors.category_id}
                                        required
                                    >
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </Select>

                                    <div className="flex flex-col justify-end pb-1.5">
                                        <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/70 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={data.is_featured}
                                                onChange={(e) => setData('is_featured', e.target.checked)}
                                                className="w-4 h-4 text-brand-600 rounded-md focus:ring-brand-500"
                                            />
                                            <span className="text-xs font-semibold text-slate-700">
                                                Jadikan Berita Utama (Featured)
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                <Textarea
                                    label="Ringkasan Singkat (Excerpt)"
                                    placeholder="Ringkasan artikel..."
                                    rows={2}
                                    value={data.excerpt}
                                    onChange={(e) => setData('excerpt', e.target.value)}
                                    error={errors.excerpt}
                                    helper="Opsional. Jika dikosongkan, ringkasan akan digenerate otomatis dari isi konten."
                                />

                                <Textarea
                                    label="Isi Konten Berita Lengkap"
                                    placeholder="Paragraf berita..."
                                    rows={12}
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    error={errors.content}
                                    required
                                />
                            </div>
                        </div>

                        {/* Right Sidebar Form Column (Span 4) */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Thumbnail Upload Bento Card */}
                            <div className="bento-card p-6 space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Gambar Thumbnail
                                </h3>

                                {imagePreview ? (
                                    <div className="space-y-3">
                                        <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-100 border border-slate-200 group">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleRemoveThumbnail}
                                                className="absolute top-2 right-2 p-1.5 rounded-xl bg-slate-900/70 text-white hover:bg-rose-600 transition-colors"
                                                title="Ganti / Hapus Gambar"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <label className="block text-center text-xs font-semibold text-brand-600 hover:text-brand-700 cursor-pointer pt-1">
                                            <span>Unggah Gambar Pengganti</span>
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp,image/jpg"
                                                onChange={handleThumbnailChange}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                ) : (
                                    <label className="border-2 border-dashed border-slate-200 hover:border-brand-400 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-brand-50/20">
                                        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-2">
                                            <Upload className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-700">Pilih Berkas Foto</span>
                                        <span className="text-[11px] text-slate-400 mt-0.5">JPG, PNG, WebP (Maks 3MB)</span>
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp,image/jpg"
                                            onChange={handleThumbnailChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}

                                {errors.thumbnail && (
                                    <p className="text-xs text-rose-600 font-semibold">{errors.thumbnail}</p>
                                )}
                            </div>

                            {/* Publication Status Bento Card */}
                            <div className="bento-card p-6 space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Status Publikasi
                                </h3>

                                <div className="space-y-2">
                                    {[
                                        { id: 'published', label: 'Publikasikan Sekarang', desc: 'Langsung tayang di portal publik' },
                                        { id: 'draft', label: 'Simpan Sebagai Draft', desc: 'Hanya dapat dilihat oleh admin' },
                                        { id: 'scheduled', label: 'Jadwalkan Publikasi', desc: 'Tayang otomatis sesuai tanggal' },
                                    ].map((s) => (
                                        <label
                                            key={s.id}
                                            className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                                                data.status === s.id
                                                    ? 'bg-brand-50/70 border-brand-300 ring-1 ring-brand-400'
                                                    : 'bg-white border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="status"
                                                value={s.id}
                                                checked={data.status === s.id}
                                                onChange={(e) => setData('status', e.target.value)}
                                                className="w-4 h-4 text-brand-600 mt-0.5 focus:ring-brand-500"
                                            />
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-bold text-slate-900">{s.label}</p>
                                                <p className="text-[11px] text-slate-500">{s.desc}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                {data.status === 'scheduled' && (
                                    <div className="pt-2 animate-in fade-in duration-200">
                                        <Input
                                            type="datetime-local"
                                            label="Waktu Tayang"
                                            value={data.published_at}
                                            onChange={(e) => setData('published_at', e.target.value)}
                                            error={errors.published_at}
                                            required
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex flex-col gap-2">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    leftIcon={Save}
                                    isLoading={processing}
                                    className="w-full font-bold text-xs shadow-md shadow-brand-600/20"
                                >
                                    Perbarui Berita
                                </Button>

                                <Link href="/admin/news" className="w-full">
                                    <Button variant="secondary" size="md" className="w-full text-xs">
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
