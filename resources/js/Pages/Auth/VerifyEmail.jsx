import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import Alert from '@/Components/Alert';
import ThemeCustomizer from '@/Components/ThemeCustomizer';
import { MailCheck, Send, LogOut, ArrowLeft } from 'lucide-react';

export default function VerifyEmail({ status }) {
    const { school, auth } = usePage().props;

    const { post, processing } = useForm({});

    const schoolName = school?.name || 'SMK Triwijaya';

    const handleResend = (e) => {
        e.preventDefault();
        post('/email/verification-notification');
    };

    const handleLogout = (e) => {
        e.preventDefault();
        post('/logout');
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-between text-slate-800 subtle-mesh">
            <Head title="Verifikasi Alamat Email" />

            <header className="p-4 sm:p-6 max-w-7xl mx-auto w-full flex items-center justify-between">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-brand-600 transition-colors px-3 py-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Beranda</span>
                </Link>

                <div className="flex items-center gap-2">
                    <Badge variant="warning" size="sm" dot>
                        Verifikasi Diperlukan
                    </Badge>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
                <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center border border-amber-200 shadow-xs">
                        <MailCheck className="w-7 h-7" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                            Verifikasi Email Anda
                        </h1>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Terima kasih telah mendaftar! Sebelum memulai, silakan klik tautan verifikasi yang telah kami kirimkan ke alamat email <strong>{auth?.user?.email}</strong>.
                        </p>
                    </div>

                    {status === 'verification-link-sent' && (
                        <Alert variant="success" title="Tautan Baru Terkirim">
                            Tautan verifikasi baru telah berhasil dikirim ke alamat email Anda.
                        </Alert>
                    )}

                    <div className="space-y-3 pt-2">
                        <form onSubmit={handleResend}>
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                loading={processing}
                                leftIcon={Send}
                                className="w-full shadow-md font-bold text-sm"
                            >
                                Kirim Ulang Email Verifikasi
                            </Button>
                        </form>

                        <form onSubmit={handleLogout}>
                            <Button
                                type="submit"
                                variant="secondary"
                                size="md"
                                leftIcon={LogOut}
                                className="w-full text-xs font-semibold text-rose-600 hover:text-rose-700"
                            >
                                Keluar (Logout)
                            </Button>
                        </form>
                    </div>
                </div>
            </main>

            <footer className="p-4 sm:p-6 text-center text-xs text-slate-500">
                © {new Date().getFullYear()} {schoolName}. All rights reserved.
            </footer>

            <ThemeCustomizer />
        </div>
    );
}
