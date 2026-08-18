import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Input from '@/Components/Input';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import Alert from '@/Components/Alert';
import ThemeCustomizer from '@/Components/ThemeCustomizer';
import { Lock, Mail, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function ResetPassword({ token, email }) {
    const { school } = usePage().props;
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email || '',
        password: '',
        password_confirmation: '',
    });

    const schoolName = school?.name || 'SMK Triwijaya';

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/reset-password', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-between text-slate-800 subtle-mesh">
            <Head title="Atur Ulang Kata Sandi" />

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
                        Atur Ulang Sandi
                    </Badge>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
                <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6">
                    <div className="text-center space-y-2">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white mx-auto flex items-center justify-center shadow-md shadow-brand-500/20">
                            <Lock className="w-7 h-7" />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                            Kata Sandi Baru
                        </h1>
                        <p className="text-xs text-slate-500">
                            Silakan masukkan kata sandi baru untuk akun Anda.
                        </p>
                    </div>

                    {errors?.email && (
                        <Alert variant="danger" title="Kesalahan Email">
                            {errors.email}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Email"
                            type="email"
                            placeholder="nama@email.com"
                            leftIcon={Mail}
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            error={errors.email}
                            required
                        />

                        <Input
                            label="Kata Sandi Baru"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Minimal 8 karakter"
                            leftIcon={Lock}
                            rightIcon={showPassword ? EyeOff : Eye}
                            onRightIconClick={() => setShowPassword(!showPassword)}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            error={errors.password}
                            required
                        />

                        <Input
                            label="Konfirmasi Sandi Baru"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Ulangi kata sandi baru"
                            leftIcon={Lock}
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            error={errors.password_confirmation}
                            required
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            loading={processing}
                            leftIcon={CheckCircle2}
                            className="w-full shadow-md font-bold text-sm mt-2"
                        >
                            Simpan Kata Sandi Baru
                        </Button>
                    </form>
                </div>
            </main>

            <footer className="p-4 sm:p-6 text-center text-xs text-slate-500">
                © {new Date().getFullYear()} {schoolName}. All rights reserved.
            </footer>

            <ThemeCustomizer />
        </div>
    );
}
