import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Input from '@/Components/Input';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import Alert from '@/Components/Alert';
import ThemeCustomizer from '@/Components/ThemeCustomizer';
import {
    GraduationCap,
    Lock,
    User,
    Mail,
    ArrowLeft,
    UserPlus,
    BookOpen,
    Users,
    Phone,
    Eye,
    EyeOff,
    CheckCircle2,
} from 'lucide-react';

export default function Register() {
    const { school } = usePage().props;
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        role: 'student',
        nisn: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    const schoolName = school?.name || 'SMK Triwijaya';

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/register', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-between text-slate-800 subtle-mesh">
            <Head title="Registrasi Akun" />

            {/* Top Bar */}
            <header className="p-4 sm:p-6 max-w-7xl mx-auto w-full flex items-center justify-between">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-brand-600 transition-colors px-3 py-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Beranda</span>
                </Link>

                <div className="flex items-center gap-2">
                    <Badge variant="brand" size="sm" dot>
                        Pendaftaran Akun Pengguna
                    </Badge>
                </div>
            </header>

            {/* Main Register Container */}
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
                <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6">
                    {/* Brand Header */}
                    <div className="text-center space-y-2">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white mx-auto flex items-center justify-center shadow-md shadow-brand-500/20">
                            <UserPlus className="w-7 h-7" />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                            Daftar Akun Baru
                        </h1>
                        <p className="text-xs text-slate-500">
                            {schoolName} • Buat akun Siswa atau Orang Tua/Wali
                        </p>
                    </div>

                    {/* Role Selection Pill */}
                    <div className="p-1 bg-slate-100 rounded-2xl grid grid-cols-2 gap-1">
                        <button
                            type="button"
                            onClick={() => setData('role', 'student')}
                            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                data.role === 'student'
                                    ? 'bg-white text-brand-700 shadow-xs'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <BookOpen className="w-4 h-4" />
                            <span>Sebagai Siswa</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setData('role', 'parent')}
                            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                data.role === 'parent'
                                    ? 'bg-white text-brand-700 shadow-xs'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <Users className="w-4 h-4" />
                            <span>Sebagai Orang Tua</span>
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Nama Lengkap"
                            placeholder="Contoh: Aditya Pratama"
                            leftIcon={User}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            error={errors.name}
                            required
                        />

                        <Input
                            label="Alamat Email Aktif"
                            type="email"
                            placeholder="nama@email.com"
                            leftIcon={Mail}
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            error={errors.email}
                            required
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {data.role === 'student' && (
                                <Input
                                    label="NISN (10 Digit)"
                                    placeholder="Contoh: 0051234567"
                                    leftIcon={GraduationCap}
                                    value={data.nisn}
                                    onChange={(e) => setData('nisn', e.target.value)}
                                    error={errors.nisn}
                                />
                            )}
                            <Input
                                label="Nomor WhatsApp/HP"
                                placeholder="Contoh: 08123456789"
                                leftIcon={Phone}
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                error={errors.phone}
                                className={data.role !== 'student' ? 'sm:col-span-2' : ''}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Kata Sandi"
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
                                label="Konfirmasi Sandi"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Ulangi kata sandi"
                                leftIcon={Lock}
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                error={errors.password_confirmation}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            loading={processing}
                            leftIcon={UserPlus}
                            className="w-full shadow-md font-bold text-sm mt-2"
                        >
                            Daftar Akun Sekarang
                        </Button>
                    </form>

                    {/* Bottom link */}
                    <div className="text-center pt-2 border-t border-slate-100">
                        <p className="text-xs text-slate-500">
                            Sudah memiliki akun?{' '}
                            <Link href="/login" className="font-bold text-brand-600 hover:text-brand-700">
                                Masuk di sini
                            </Link>
                        </p>
                    </div>
                </div>
            </main>

            {/* Bottom Footer */}
            <footer className="p-4 sm:p-6 text-center text-xs text-slate-500">
                © {new Date().getFullYear()} {schoolName}. All rights reserved.
            </footer>

            <ThemeCustomizer />
        </div>
    );
}
