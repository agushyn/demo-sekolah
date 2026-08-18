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
    ArrowLeft,
    LogIn,
    Shield,
    BookOpen,
    Eye,
    EyeOff,
    Sparkles,
    UserCheck,
    Users,
} from 'lucide-react';

export default function Login() {
    const { school, flash } = usePage().props;
    const [selectedRole, setSelectedRole] = useState('student');
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        identifier: '',
        email: '',
        password: '',
        remember: false,
    });

    const schoolName = school?.name || 'SMK Triwijaya';

    const demoAccounts = [
        { id: 'super_admin', label: 'Super Admin', email: 'superadmin@schid.test', pass: 'password', icon: Shield },
        { id: 'admin', label: 'Admin', email: 'admin@schid.test', pass: 'password', icon: Shield },
        { id: 'teacher', label: 'Guru', email: 'teacher@schid.test', pass: 'password', icon: GraduationCap },
        { id: 'student', label: 'Siswa', email: 'student@schid.test', pass: 'password', icon: BookOpen },
        { id: 'parent', label: 'Orang Tua', email: 'parent@schid.test', pass: 'password', icon: Users },
    ];

    const roles = [
        { id: 'student', label: 'Siswa', icon: BookOpen, placeholder: 'Masukkan NISN atau Email Siswa' },
        { id: 'teacher', label: 'Guru / Staf', icon: GraduationCap, placeholder: 'Masukkan NIP atau Email Guru' },
        { id: 'admin', label: 'Admin', icon: Shield, placeholder: 'Masukkan Username / Email Admin' },
    ];

    const currentRole = roles.find((r) => r.id === selectedRole) || roles[0];

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    const applyDemoAccount = (account) => {
        setData((prev) => ({
            ...prev,
            identifier: account.email,
            email: account.email,
            password: account.pass,
        }));
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-between text-slate-800 subtle-mesh">
            <Head title="Masuk ke Portal" />

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
                        Sistem Otentikasi & RBAC
                    </Badge>
                </div>
            </header>

            {/* Main Login Bento Container */}
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
                <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6">
                    {/* Brand Header */}
                    <div className="text-center space-y-2">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white mx-auto flex items-center justify-center shadow-md shadow-brand-500/20">
                            <GraduationCap className="w-7 h-7" />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                            Masuk ke Portal
                        </h1>
                        <p className="text-xs text-slate-500">
                            {schoolName} • Portal Terpadu Multi-Peran
                        </p>
                    </div>

                    {/* Flash Status / Alerts */}
                    {flash?.status && (
                        <Alert variant="success" title="Informasi">
                            {flash.status}
                        </Alert>
                    )}

                    {flash?.success && (
                        <Alert variant="success" title="Berhasil">
                            {flash.success}
                        </Alert>
                    )}

                    {errors?.email && (
                        <Alert variant="danger" title="Gagal Masuk">
                            {errors.email}
                        </Alert>
                    )}

                    {/* Role Selector Bento Pill */}
                    <div className="p-1 bg-slate-100 rounded-2xl grid grid-cols-3 gap-1">
                        {roles.map((role) => {
                            const Icon = role.icon;
                            const isSelected = selectedRole === role.id;
                            return (
                                <button
                                    key={role.id}
                                    type="button"
                                    onClick={() => setSelectedRole(role.id)}
                                    className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        isSelected
                                            ? 'bg-white text-brand-700 shadow-xs'
                                            : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    <span>{role.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label={selectedRole === 'student' ? 'NISN / Email Siswa' : selectedRole === 'teacher' ? 'NIP / Email Guru' : 'Username / Email Admin'}
                            placeholder={currentRole.placeholder}
                            leftIcon={User}
                            value={data.identifier}
                            onChange={(e) => {
                                setData((prev) => ({
                                    ...prev,
                                    identifier: e.target.value,
                                    email: e.target.value,
                                }));
                            }}
                            error={errors.identifier}
                            required
                        />

                        <div>
                            <Input
                                label="Kata Sandi"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                leftIcon={Lock}
                                rightIcon={showPassword ? EyeOff : Eye}
                                onRightIconClick={() => setShowPassword(!showPassword)}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                error={errors.password}
                                required
                            />
                            <div className="flex items-center justify-between mt-2 text-xs">
                                <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                                    />
                                    <span>Ingat saya</span>
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-brand-600 hover:text-brand-700 font-semibold cursor-pointer"
                                >
                                    Lupa sandi?
                                </Link>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            loading={processing}
                            leftIcon={LogIn}
                            className="w-full shadow-md font-bold text-sm"
                        >
                            Masuk Sekarang
                        </Button>
                    </form>

                    {/* Quick Demo Switcher Bento Box */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                1-Click Demo Login
                            </span>
                            <span className="text-[10px] text-slate-400">Pass: password</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 pt-1">
                            {demoAccounts.map((acc) => (
                                <button
                                    key={acc.id}
                                    type="button"
                                    onClick={() => applyDemoAccount(acc)}
                                    className="py-1.5 px-2 bg-white hover:bg-brand-50 border border-slate-200/80 rounded-xl text-[11px] font-medium text-slate-700 hover:text-brand-700 transition-colors text-center truncate cursor-pointer shadow-2xs"
                                    title={`${acc.label} (${acc.email})`}
                                >
                                    {acc.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Register & Info Link */}
                    <div className="text-center pt-2 border-t border-slate-100">
                        <p className="text-xs text-slate-500">
                            Belum memiliki akun?{' '}
                            <Link href="/register" className="font-bold text-brand-600 hover:text-brand-700">
                                Daftar di sini
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
