'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    Cpu,
    Database,
    Globe,
    User as UserIcon,
    Lock,
    AlertCircle,
    Fingerprint,
    ArrowRight
} from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import Image from 'next/image';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { user, login, isLoading: authLoading } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (!authLoading && user) {
            router.push('/');
        }
    }, [user, authLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                login(data.user.username);
                router.push('/');
            } else {
                setError(data.message === 'INVALID_CREDENTIALS' ? 'IDENTIFICATION_FAILED: RED_ALERT' : 'INTERNAL_LINK_ERROR');
            }
        } catch (err) {
            setError('HUB_TIMEOUT: AUTH_LINK_UNREACHABLE');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden selection:bg-primary/30">

            {/* LEFT COLUMN: BRANDING & IDENTITY */}
            <div className="hidden md:flex md:w-[50%] lg:w-[45%] border-r border-border relative flex-col justify-center p-12 overflow-hidden bg-background">
                {/* Subtle Decorative Grid */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                    style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, var(--foreground) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

                {/* Central Brand */}
                <div className="relative z-10 py-12 flex flex-col items-start">
                    <div className="w-16 h-16 rounded mb-8 relative">
                        <Image
                            src="/logo.png"
                            alt="Incohub Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <h1 className="text-6xl lg:text-7xl font-black tracking-tighter text-foreground leading-none">
                        INCO<span className="text-primary">HUB</span>
                    </h1>
                    <p className="max-w-xs text-zinc-500 text-sm mt-6 border-l-2 border-primary/30 pl-4 font-medium dark:text-zinc-400">
                        Professional machine parts record and lifecycle tracking system. Please sign in to continue.
                    </p>
                </div>
            </div>

            {/* RIGHT COLUMN: PROFESSIONAL LOGIN PANE */}
            <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-16 relative bg-background">

                {/* Module Controls */}
                <div className="absolute top-8 right-8">
                    <ThemeToggle />
                </div>

                {/* Mobile Identity (Visible on small screens) */}
                <div className="md:hidden flex flex-col items-center mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <div className="w-16 h-16 rounded bg-transparent flex items-center justify-center mb-6 relative">
                        <Image
                            src="/logo.png"
                            alt="Incohub Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground leading-none">
                        INCO<span className="text-primary">HUB</span>
                    </h1>
                </div>

                {/* Clean Login Panel */}
                <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-right-4 duration-700">

                    <div className="mb-8 lg:pl-1">
                        <h2 className="text-3xl font-black tracking-tight text-foreground uppercase leading-none">Welcome Back</h2>
                        <p className="text-sm text-zinc-500 mt-2 font-medium">Enter your credentials to access your account.</p>
                    </div>

                    <div className="technical-panel border-border shadow-xl">
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-5">
                                {/* Username */}
                                <div className="space-y-2 group">
                                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 group-focus-within:text-primary transition-colors block">
                                        Username
                                    </label>
                                    <div className="relative">
                                        <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Enter your username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full bg-zinc-50/50 dark:bg-zinc-950/30 border border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-sm px-11 py-3.5 text-sm font-medium text-foreground focus:outline-none transition-all placeholder:text-zinc-400 placeholder:font-normal"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-2 group">
                                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 group-focus-within:text-primary transition-colors block">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="password"
                                            required
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-zinc-50/50 dark:bg-zinc-950/30 border border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-sm px-11 py-3.5 text-sm font-medium text-foreground focus:outline-none transition-all placeholder:text-zinc-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-sm flex items-center gap-3 animate-in slide-in-from-top-2">
                                    <AlertCircle size={16} className="text-red-500 shrink-0" />
                                    <span className="text-xs font-semibold text-red-500 leading-none">{error}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn-premium h-12 rounded-sm flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 mt-4"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 rounded-full border-t-2 border-primary-foreground animate-spin" />
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
