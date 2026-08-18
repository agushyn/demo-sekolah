import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import Accordion from '@/Components/Accordion';
import Badge from '@/Components/Badge';
import Input from '@/Components/Input';
import Button from '@/Components/Button';
import {
    HelpCircle,
    Search,
    MessageCircleQuestion,
    Sparkles,
    ArrowRight,
    Phone,
    BookOpen,
    GraduationCap,
} from 'lucide-react';

export default function Faq({ faqCategories = [] }) {
    const { school } = usePage().props;
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Semua');

    const schoolName = school?.name || 'SMK Triwijaya';

    const allCategories = ['Semua', ...faqCategories.map((c) => c.category)];

    const filteredCategories = faqCategories.map((cat) => {
        if (selectedCategory !== 'Semua' && cat.category !== selectedCategory) {
            return { ...cat, items: [] };
        }

        const query = search.toLowerCase();
        const filteredItems = cat.items.filter((item) => {
            return (
                item.q.toLowerCase().includes(query) ||
                item.a.toLowerCase().includes(query)
            );
        });

        return {
            ...cat,
            items: filteredItems,
        };
    }).filter((cat) => cat.items.length > 0);

    return (
        <PublicLayout>
            <Head>
                <title>Tanya Jawab & FAQ</title>
                <meta
                    name="description"
                    content={`Pertanyaan yang sering diajukan seputar pendaftaran PPDB, kurikulum belajar, fasilitas, dan portal digital di ${schoolName}.`}
                />
            </Head>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
                {/* Header Bento Banner */}
                <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-brand-700 via-brand-800 to-slate-900 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 space-y-4 max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
                            <HelpCircle className="w-3.5 h-3.5 text-amber-300" />
                            <span>Pusat Bantuan & Tanya Jawab</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                            Pertanyaan Umum (FAQ)
                        </h1>
                        <p className="text-xs sm:text-sm text-brand-100 leading-relaxed">
                            Temukan jawaban cepat untuk pertanyaan umum mengenai proses pendaftaran siswa baru, kurikulum, fasilitas, dan akses portal.
                        </p>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                        {allCategories.map((cat) => {
                            const isSelected = selectedCategory === cat;
                            return (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat)}
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

                    <div className="max-w-md w-full">
                        <Input
                            placeholder="Cari pertanyaan..."
                            leftIcon={Search}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full text-xs"
                        />
                    </div>
                </div>

                {/* FAQ Groups with Accordions */}
                <div className="space-y-8">
                    {filteredCategories.length === 0 ? (
                        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 space-y-3">
                            <MessageCircleQuestion className="w-12 h-12 text-slate-300 mx-auto" />
                            <h3 className="text-base font-bold text-slate-800">Pertanyaan Tidak Ditemukan</h3>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                Tidak ada FAQ yang cocok dengan kata kunci "{search}". Silakan ajukan pertanyaan langsung melalui formulir kontak.
                            </p>
                            <Link href="/kontak" className="inline-block pt-2">
                                <Button variant="primary" size="md">
                                    Hubungi Layanan Informasi
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        filteredCategories.map((cat, idx) => (
                            <div key={idx} className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-6 bg-brand-600 rounded-full" />
                                    <h2 className="text-lg font-bold text-slate-900">{cat.category}</h2>
                                    <Badge variant="brand" size="sm">
                                        {cat.items.length} Pertanyaan
                                    </Badge>
                                </div>

                                <Accordion items={cat.items} />
                            </div>
                        ))
                    )}
                </div>

                {/* Still Have Questions Bento Banner */}
                <div className="bento-card p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="space-y-2 max-w-2xl">
                        <h3 className="text-xl font-bold">Belum Menemukan Jawaban yang Anda Cari?</h3>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                            Hubungi staf layanan informasi kami melalui WhatsApp atau kirimkan pertanyaan melalui form kontak resmi sekolah.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <Link href="/kontak">
                            <Button variant="primary" size="md" leftIcon={Phone} className="bg-brand-500 hover:bg-brand-400 font-bold text-xs">
                                Hubungi Kami
                            </Button>
                        </Link>
                        <Link href="/profil">
                            <Button variant="secondary" size="md" className="bg-white/10 text-white hover:bg-white/20 border-white/10 text-xs">
                                Pelajari Profil Sekolah
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
