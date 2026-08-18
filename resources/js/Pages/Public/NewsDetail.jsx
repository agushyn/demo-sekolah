import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import {
    ArrowLeft,
    Calendar,
    Clock,
    User,
    Share2,
    Bookmark,
    Newspaper,
    ChevronRight,
    Sparkles,
} from 'lucide-react';

export default function NewsDetail({ news, relatedNews = [] }) {
    const { school } = usePage().props;
    const schoolName = school?.name || 'SMK Triwijaya';

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: news.title,
                text: news.excerpt,
                url: window.location.href,
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Tautan berita berhasil disalin ke clipboard!');
        }
    };

    return (
        <PublicLayout>
            <Head>
                <title>{news.title}</title>
                <meta name="description" content={news.excerpt} />
                <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : `/berita/${news.slug}`} />
                <meta property="og:title" content={news.title} />
                <meta property="og:description" content={news.excerpt} />
                <meta property="og:image" content={news.thumbnail} />
                <meta property="og:type" content="article" />
            </Head>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
                {/* Top Navigation Breadcrumbs */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/berita"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-brand-600 transition-colors px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali ke Warta Sekolah</span>
                    </Link>

                    <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={Share2}
                        onClick={handleShare}
                        className="text-xs"
                    >
                        Bagikan
                    </Button>
                </div>

                {/* Article Header & Thumbnail Bento Card */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-6">
                    <div className="space-y-4 max-w-4xl">
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <Badge variant={news.badge_color || 'brand'} size="sm">
                                {news.category}
                            </Badge>
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" /> {news.date}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-slate-400" /> {news.read_time}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-slate-400" /> Ditulis oleh <strong>{news.author}</strong>
                            </span>
                        </div>

                        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                            {news.title}
                        </h1>

                        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
                            {news.excerpt}
                        </p>
                    </div>

                    {/* Featured Image */}
                    {news.thumbnail && (
                        <div className="rounded-2xl overflow-hidden aspect-video max-h-[480px] w-full bg-slate-100 border border-slate-200">
                            <img
                                src={news.thumbnail}
                                alt={news.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Article Content Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-4">
                        {/* Main Article Body */}
                        <div className="lg:col-span-8 space-y-6 text-sm sm:text-base text-slate-700 leading-relaxed">
                            {news.content.split('\n\n').map((paragraph, index) => (
                                <p key={index} className="leading-relaxed">
                                    {paragraph}
                                </p>
                            ))}

                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-500 mt-8">
                                <p>
                                    <strong>Publikasi Resmi:</strong> Artikel ini diterbitkan oleh Divisi Hubungan Masyarakat & Publikasi Digital {schoolName}.
                                </p>
                            </div>
                        </div>

                        {/* Sidebar: Related News Bento */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bento-card p-6 space-y-4">
                                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <Newspaper className="w-4 h-4 text-brand-600" />
                                    Berita Terkait Lainnya
                                </h3>

                                <div className="divide-y divide-slate-100 space-y-3">
                                    {relatedNews.map((rel) => (
                                        <Link
                                            key={rel.id}
                                            href={`/berita/${rel.slug}`}
                                            className="block pt-3 group"
                                        >
                                            <Badge variant={rel.badge_color || 'neutral'} size="sm" className="mb-1 text-[10px]">
                                                {rel.category}
                                            </Badge>
                                            <h4 className="text-xs font-bold text-slate-800 group-hover:text-brand-600 transition-colors leading-snug line-clamp-2">
                                                {rel.title}
                                            </h4>
                                            <span className="text-[10px] text-slate-400 mt-1 block">
                                                {rel.date}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
