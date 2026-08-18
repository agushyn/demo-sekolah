import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import Badge from '@/Components/Badge';
import Input from '@/Components/Input';
import Button from '@/Components/Button';
import Pagination from '@/Components/Pagination';
import EmptyState from '@/Components/EmptyState';
import {
    Newspaper,
    Search,
    Clock,
    User,
    Calendar,
    ChevronRight,
    ArrowRight,
    Sparkles,
} from 'lucide-react';

export default function News({ newsList, featuredArticle, categories = [], currentCategory = 'Semua', searchQuery = '' }) {
    const { school } = usePage().props;
    const [search, setSearch] = useState(searchQuery);

    const schoolName = school?.name || 'SMK Triwijaya';

    // Support both paginated object and direct array
    const articles = newsList?.data || (Array.isArray(newsList) ? newsList : []);
    const links = newsList?.links || [];

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/berita', {
            category: currentCategory !== 'Semua' ? currentCategory : undefined,
            search: search || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleCategoryClick = (cat) => {
        router.get('/berita', {
            category: cat !== 'Semua' ? cat : undefined,
            search: search || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const regularArticles = featuredArticle
        ? articles.filter((n) => n.id !== featuredArticle.id)
        : articles;

    return (
        <PublicLayout>
            <Head>
                <title>Warta & Berita Sekolah Terkini</title>
                <meta
                    name="description"
                    content={`Kumpulan berita terbaru, pengumuman resmi, prestasi siswa, dan agenda kegiatan di ${schoolName}.`}
                />
            </Head>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
                {/* Header Bento Banner */}
                <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-brand-700 via-brand-800 to-slate-900 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 space-y-4 max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
                            <Newspaper className="w-3.5 h-3.5 text-amber-300" />
                            <span>Pusat Informasi & Publikasi</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                            Warta & Kabar Sekolah Terkini
                        </h1>
                        <p className="text-xs sm:text-sm text-brand-100 leading-relaxed">
                            Dapatkan liputan prestasi siswa, informasi akademik, pengumuman sekolah, dan inovasi pendidikan di {schoolName}.
                        </p>
                    </div>
                </div>

                {/* Filter & Search Bento Bar */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                        {categories.map((cat) => {
                            const isSelected = currentCategory === cat;
                            return (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => handleCategoryClick(cat)}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                        isSelected
                                            ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/25'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                                    }`}
                                >
                                    {cat}
                                </button>
                            );
                        })}
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md w-full">
                        <Input
                            placeholder="Cari berita atau pengumuman..."
                            leftIcon={Search}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full text-xs"
                        />
                        <Button type="submit" variant="primary" size="md" className="shrink-0 text-xs">
                            Cari
                        </Button>
                    </form>
                </div>

                {/* FEATURED NEWS BENTO (If Available and on First Page) */}
                {featuredArticle && currentCategory === 'Semua' && !searchQuery && (
                    <section aria-label="Berita Utama">
                        <Link
                            href={`/berita/${featuredArticle.slug}`}
                            className="bento-card group grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8 hover:border-brand-300 transition-all overflow-hidden"
                        >
                            <div className="lg:col-span-6 rounded-2xl overflow-hidden bg-slate-100 aspect-video lg:aspect-auto h-64 lg:h-full relative">
                                <img
                                    src={featuredArticle.thumbnail}
                                    alt={featuredArticle.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-4 left-4">
                                    <Badge variant="brand" size="sm">
                                        Berita Utama
                                    </Badge>
                                </div>
                            </div>

                            <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-xs text-slate-400">
                                        <Badge variant={featuredArticle.badge_color || 'brand'} size="sm">
                                            {featuredArticle.category}
                                        </Badge>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" /> {featuredArticle.date}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" /> {featuredArticle.read_time}
                                        </span>
                                    </div>

                                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 group-hover:text-brand-600 transition-colors leading-snug">
                                        {featuredArticle.title}
                                    </h2>

                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                        {featuredArticle.excerpt}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                                    <span className="text-slate-500 font-medium">Oleh {featuredArticle.author}</span>
                                    <span className="font-bold text-brand-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                        Baca Lengkap <ArrowRight className="w-4 h-4" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </section>
                )}

                {/* REGULAR NEWS GRID */}
                <section aria-label="Daftar Artikel">
                    {articles.length === 0 ? (
                        <EmptyState
                            icon={Newspaper}
                            title="Tidak Ada Berita Ditemukan"
                            description="Coba ubah kata kunci pencarian atau pilih kategori berita lain."
                            actionLabel="Reset Pencarian"
                            onAction={() => handleCategoryClick('Semua')}
                        />
                    ) : (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {(currentCategory === 'Semua' && !searchQuery ? regularArticles : articles).map((news) => (
                                    <Link
                                        key={news.id}
                                        href={`/berita/${news.slug}`}
                                        className="bento-card group flex flex-col justify-between overflow-hidden hover:-translate-y-1 transition-all"
                                    >
                                        <div className="aspect-video w-full overflow-hidden bg-slate-100">
                                            <img
                                                src={news.thumbnail}
                                                alt={news.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>

                                        <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                                            <div className="space-y-2.5">
                                                <div className="flex items-center justify-between">
                                                    <Badge variant={news.badge_color || 'brand'} size="sm">
                                                        {news.category}
                                                    </Badge>
                                                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {news.read_time}
                                                    </span>
                                                </div>

                                                <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors leading-snug line-clamp-2">
                                                    {news.title}
                                                </h3>

                                                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                                                    {news.excerpt}
                                                </p>
                                            </div>

                                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                                                <span>{news.date}</span>
                                                <span className="font-semibold text-brand-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                                    Baca <ChevronRight className="w-3.5 h-3.5" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Pagination */}
                            {links.length > 3 && (
                                <div className="flex justify-center pt-6">
                                    <Pagination links={links} />
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </PublicLayout>
    );
}
