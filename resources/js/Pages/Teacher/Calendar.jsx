import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import TeacherLayout from '@/Layouts/TeacherLayout';
import BentoCard from '@/Components/BentoCard';
import Badge from '@/Components/Badge';
import Input from '@/Components/Input';
import Button from '@/Components/Button';
import EmptyState from '@/Components/EmptyState';
import {
    Calendar as CalendarIcon,
    Search,
    Clock,
    MapPin,
    CalendarDays,
    Info,
    Sparkles,
    Shield,
    Users,
} from 'lucide-react';

export default function TeacherCalendar({ events = [], activeYear, categories = [], currentCategory = 'Semua' }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState('');

    const handleCategoryClick = (catId) => {
        router.get('/guru/kalender', {
            category: catId !== 'Semua' ? catId : undefined,
            search: search || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/guru/kalender', {
            category: currentCategory !== 'Semua' ? currentCategory : undefined,
            search: search || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <TeacherLayout title="Kalender & Jadwal Akademik Guru">
            <Head title="Kalender & Jadwal Akademik Guru — Portal Pendidik" />

            <div className="space-y-8 max-w-7xl mx-auto">
                {/* Header Banner */}
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-900 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10 space-y-2 max-w-2xl">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-emerald-200 text-xs font-semibold">
                            <CalendarDays className="w-3.5 h-3.5" />
                            <span>Tahun Ajaran {activeYear?.name || '2026/2027'} ({activeYear?.semester || 'Ganjil'})</span>
                        </div>
                        <h2 className="text-xl sm:text-3xl font-black tracking-tight">
                            Agenda & Jadwal Kegiatan Guru
                        </h2>
                        <p className="text-xs text-emerald-100 leading-relaxed">
                            Akses seluruh kalender pendidikan, jadwal rapat dewan guru, pekan ujian, serta agenda kegiatan sekolah.
                        </p>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="bento-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                        {categories.map((cat) => {
                            const isSelected = currentCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => handleCategoryClick(cat.id)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                        isSelected
                                            ? 'bg-emerald-600 text-white shadow-2xs'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            );
                        })}
                    </div>

                    {/* Search Box */}
                    <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-sm w-full">
                        <Input
                            placeholder="Cari agenda atau lokasi..."
                            leftIcon={Search}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full text-xs"
                        />
                        <Button type="submit" variant="secondary" size="md" className="shrink-0 text-xs">
                            Cari
                        </Button>
                    </form>
                </div>

                {/* Events Bento Grid */}
                {events.length === 0 ? (
                    <div className="bento-card p-12 text-center">
                        <EmptyState
                            icon={CalendarIcon}
                            title="Tidak Ada Agenda Pada Kategori Ini"
                            description="Pilih kategori lain untuk melihat agenda kegiatan guru dan sekolah."
                            actionLabel="Lihat Semua Agenda"
                            onAction={() => handleCategoryClick('Semua')}
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((evt) => (
                            <div
                                key={evt.id}
                                className="bento-card p-6 flex flex-col justify-between space-y-4 hover:-translate-y-1 hover:border-emerald-300 transition-all"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex flex-col items-center justify-center shrink-0 text-center">
                                            <span className="text-xs font-bold text-emerald-700 leading-none">{evt.month}</span>
                                            <span className="text-lg font-black text-emerald-950 leading-none mt-1">{evt.day}</span>
                                        </div>

                                        <div className="flex flex-col items-end gap-1">
                                            <Badge variant={evt.badge_color || 'emerald'} size="sm">
                                                {evt.category_label}
                                            </Badge>
                                            {!evt.is_public && (
                                                <Badge variant="neutral" size="sm" className="text-[10px]">
                                                    Internal Guru
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                                        {evt.title}
                                    </h3>

                                    {evt.description && (
                                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                                            {evt.description}
                                        </p>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{evt.formatted_time_range}</span>
                                    </div>
                                    {evt.location && (
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                            <span>{evt.location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </TeacherLayout>
    );
}
