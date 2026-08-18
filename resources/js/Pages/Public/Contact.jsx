import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import BentoCard from '@/Components/BentoCard';
import Badge from '@/Components/Badge';
import Input from '@/Components/Input';
import Textarea from '@/Components/Textarea';
import Button from '@/Components/Button';
import Alert from '@/Components/Alert';
import {
    MapPin,
    Phone,
    Mail,
    Clock,
    Send,
    MessageSquare,
    Sparkles,
    CheckCircle2,
    ExternalLink,
    Building,
} from 'lucide-react';

export default function Contact({ contactInfo }) {
    const { school } = usePage().props;
    const schoolName = school?.name || 'SMK Triwijaya';

    const [formSubmitted, setFormSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormSubmitted(true);
        setFormData({
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: '',
        });
    };

    return (
        <PublicLayout>
            <Head>
                <title>Kontak & Lokasi Kampus</title>
                <meta
                    name="description"
                    content={`Hubungi layanan administrasi, sekretariat PPDB, dan kunjungi lokasi kampus ${schoolName}.`}
                />
            </Head>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
                {/* Header Bento Banner */}
                <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-brand-700 via-brand-800 to-slate-900 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 space-y-4 max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
                            <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
                            <span>Layanan Informasi & Konsultasi</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                            Hubungi & Kunjungi Sekolah
                        </h1>
                        <p className="text-xs sm:text-sm text-brand-100 leading-relaxed">
                            Kami siap melayani kebutuhan informasi pendaftaran, administrasi akademik, kemitraan, dan konsultasi pendidikan Anda.
                        </p>
                    </div>
                </div>

                {/* Contact Bento Info Grid */}
                <div className="bento-grid">
                    <BentoCard
                        colSpan="col-span-12 md:col-span-6 lg:col-span-4"
                        icon={MapPin}
                        title="Alamat Kampus"
                        description={contactInfo?.address || 'Jl. Pendidikan No. 45, Kebayoran Baru, Jakarta Selatan, DKI Jakarta 12180'}
                    >
                        <div className="mt-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                            <span className="font-bold text-slate-800 block mb-1">Akses Transportasi:</span>
                            <span>Dekat Stasiun MRT Blok M dan Halte TransJakarta Koridor 1.</span>
                        </div>
                    </BentoCard>

                    <BentoCard
                        colSpan="col-span-12 md:col-span-6 lg:col-span-4"
                        icon={Phone}
                        title="Hotline & WhatsApp"
                        description="Layanan telepon kantor tata usaha dan helpdesk PPDB online."
                        iconColor="text-emerald-700 bg-emerald-50 border-emerald-200"
                    >
                        <div className="mt-3 space-y-2 text-xs">
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="text-slate-500">Telepon TU</span>
                                <span className="font-bold text-slate-800">{contactInfo?.phone || '+62 21 8765 4321'}</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900">
                                <span className="font-medium">WhatsApp PPDB</span>
                                <span className="font-bold">{contactInfo?.whatsapp || '+62 812 3456 7890'}</span>
                            </div>
                        </div>
                    </BentoCard>

                    <BentoCard
                        colSpan="col-span-12 md:col-span-6 lg:col-span-4"
                        icon={Clock}
                        title="Jam Pelayanan"
                        description="Waktu operasional sekretariat dan kunjungan tamu sekolah."
                        iconColor="text-amber-600 bg-amber-50 border-amber-200"
                    >
                        <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                            <div className="flex items-center justify-between py-1 border-b border-slate-100">
                                <span>Senin - Kamis</span>
                                <span className="font-semibold text-slate-800">07:00 - 15:30 WIB</span>
                            </div>
                            <div className="flex items-center justify-between py-1 border-b border-slate-100">
                                <span>Jumat</span>
                                <span className="font-semibold text-slate-800">07:00 - 15:00 WIB</span>
                            </div>
                            <div className="flex items-center justify-between py-1">
                                <span>Sabtu & Minggu</span>
                                <Badge variant="neutral" size="sm">Libur Layanan</Badge>
                            </div>
                        </div>
                    </BentoCard>
                </div>

                {/* Lower Layout: Interactive Message Form & Google Maps Placeholder */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Contact Form Bento */}
                    <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold text-slate-900">Kirim Pesan atau Pertanyaan</h2>
                            <p className="text-xs text-slate-500">
                                Tim administrasi kami akan merespons melalui email dalam waktu 1x24 jam kerja.
                            </p>
                        </div>

                        {formSubmitted && (
                            <Alert variant="success" title="Pesan Berhasil Terkirim!">
                                Terima kasih telah menghubungi kami. Pesan Anda telah diterima oleh bagian administrasi {schoolName}.
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Nama Lengkap"
                                    placeholder="Contoh: Budi Santoso"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Alamat Email"
                                    type="email"
                                    placeholder="nama@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Nomor Telepon / WhatsApp"
                                    placeholder="081234567890"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                                <Input
                                    label="Subjek Pesan"
                                    placeholder="Contoh: Informasi PPDB / Legalisir"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    required
                                />
                            </div>

                            <Textarea
                                label="Isi Pesan"
                                placeholder="Tuliskan detail pertanyaan atau pesan Anda di sini..."
                                rows={4}
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                required
                            />

                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                leftIcon={Send}
                                className="w-full sm:w-auto font-bold text-xs shadow-md"
                            >
                                Kirim Pesan Sekarang
                            </Button>
                        </form>
                    </div>

                    {/* Google Maps Visual Placeholder Bento */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4 flex-1 flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Building className="w-5 h-5 text-brand-600" />
                                        <h3 className="text-base font-bold text-slate-900">Peta Lokasi Kampus</h3>
                                    </div>
                                    <Badge variant="brand" size="sm">
                                        Jakarta Selatan
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Gedung Utama SMK Triwijaya berlokasi strategis di pusat kota dengan akses transportasi publik yang mudah.
                                </p>
                            </div>

                            {/* Stylized Maps Visual Frame */}
                            <div className="rounded-2xl border border-slate-200 bg-slate-100 p-6 flex flex-col items-center justify-center text-center space-y-3 min-h-[220px] relative overflow-hidden">
                                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:16px_16px]" />
                                <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/30 relative z-10">
                                    <MapPin className="w-6 h-6 animate-bounce" />
                                </div>
                                <div className="relative z-10">
                                    <p className="font-bold text-xs text-slate-900">{schoolName}</p>
                                    <p className="text-[11px] text-slate-500 max-w-xs mt-0.5">
                                        {contactInfo?.address}
                                    </p>
                                </div>
                                <a
                                    href="https://maps.google.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="relative z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-brand-600 hover:text-brand-700 shadow-2xs transition-colors"
                                >
                                    <span>Buka di Google Maps</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </div>

                            <div className="p-3 bg-brand-50/60 rounded-2xl border border-brand-100 text-xs text-brand-800 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                                <span>Tersedia area parkir kendaraan luas dan pos keamanan 24 jam.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
