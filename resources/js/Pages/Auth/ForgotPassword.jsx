import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Input from '@/Components/Input';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import Alert from '@/Components/Alert';
import ThemeCustomizer from '@/Components/ThemeCustomizer';
import { KeyRound, Mail, ArrowLeft, Send } from 'lucide-react';

export default function ForgotPassword({ status }) {
    const { school } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const schoolName = school?.name || 'SMK Triwijaya';

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/forgot-password');
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-between text-slate-800 subtle-mesh">
            <Head title="Lupa Kata Sandi" />

            {/* Top Bar */}
            <header className="p-4 sm:p-6 max-w-7xl mx-auto w-full flex items-center justify-between">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-brand-600 transition-colors px-3 py-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Halaman Masuk</span>
                </Link>

                <div className="flex items-center gap-2">
                    <Badge variant="brand" size="sm" dot>
                        Pemulihan Akun
                    </Badge>
                </div>
            </header>

            {/* Main Container */}
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
                <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6">
                    <div className="text-center space-y-2">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white mx-auto flex items-center justify-center shadow-md shadow-brand-500/20">
                            <KeyRound className="w-7 h-7" />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                            Lupa Kata Sandi?
                        </h1>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Masukkan email terdaftar Anda. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi.
                        </p>
                    </div>

                    {status && (
                        <Alert variant="success" title="Tautan Terkirim">
                            {status}
                        </Alert>
                    )}

                    {errors?.email && (
                        <Alert variant="danger" title="Gagal Memproses">
                            {errors.email}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Alamat Email Terdaftar"
                            type="email"
                            placeholder="nama@email.com"
                            leftIcon={Mail}
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            error={errors.email}
                            required
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            loading={processing}
                            leftIcon={Send}
                            className="w-full shadow-md font-bold text-sm"
                        >
                            Kirim Tautan Reset
                        </Button>
                    </form>

                    <div className="text-center pt-2 border-t border-slate-100">
                        <p className="text-xs text-slate-500">
                            Ingat kata sandi Anda?{' '}
                            <Link href="/login" className="font-bold text-brand-600 hover:text-brand-700">
                                Masuk ke Portal
                            </Link>
                        </p>
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
