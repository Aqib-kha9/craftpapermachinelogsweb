'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    ClipboardList,
    ShieldCheck,
    Lock,
    User as UserIcon,
    ArrowRight,
    AlertCircle,
    Cpu,
    Globe,
    Database,
    Fingerprint
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

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
        <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#050505] flex flex-col md:flex-row overflow-hidden selection:bg-fuchsia-500/30">

            {/* LEFT COLUMN: BRANDING & IDENTITY (DASHBOARD STYLE) */}
            <div className="hidden md:flex md:w-[50%] lg:w-[45%] bg-zinc-900 border-r border-zinc-800 relative flex-col justify-between p-12 overflow-hidden">
                {/* Subtle Decorative Grid */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />

                {/* Top Section: System Stats */}
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 shadow-[0_0_10px_fuchsia]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">System_Initialization_Link</span>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {[
                            { icon: Cpu, label: 'Kernel_Status', val: 'STABLE_V4.1' },
                            { icon: Database, label: 'Registry_Integrity', val: 'VERIFIED' },
                            { icon: Globe, label: 'Network_Access', val: 'ENCRYPTED' }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-sm hover:border-fuchsia-500/20 transition-colors">
                                <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-zinc-500">
                                    <item.icon size={16} />
                                </div>
                                <div>
                                    <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1">{item.label}</div>
                                    <div className="text-[11px] font-black text-white uppercase tracking-wider">{item.val}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Central Brand */}
                <div className="relative z-10 py-12">
                    <h1 className="text-6xl lg:text-7xl font-black tracking-tighter text-white leading-none">
                        INCO<br />
                        <span className="text-fuchsia-600">HUB</span>
                    </h1>
                    <p className="max-w-xs text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed mt-6 border-l-2 border-fuchsia-600/30 pl-4">
                        Professional machine parts record and lifecycle tracking system.
                        Proprietary registry of Incohub technical operations.
                    </p>
                </div>

                {/* Bottom Metadata */}
                <div className="relative z-10">
                    <div className="flex flex-col gap-4">
                        <div className="h-px w-12 bg-zinc-800" />
                        <div className="flex items-center justify-between text-[9px] font-black text-zinc-600 uppercase tracking-[0.5em]">
                            <span>Registry_Auth_Module</span>
                            <span>©_2026</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: PROFESSIONAL LOGIN PANE */}
            <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-16 relative">

                {/* Module Controls */}
                <div className="absolute top-8 right-8">
                    <ThemeToggle />
                </div>

                {/* Mobile Identity (Visible on small screens) */}
                <div className="md:hidden flex flex-col items-center mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <div className="w-12 h-12 rounded bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-900 mb-6">
                        <ClipboardList size={24} />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white leading-none uppercase">
                        INCO<span className="text-fuchsia-600">HUB</span>
                    </h1>
                </div>

                {/* Clean Login Panel (Matching Dashboard Style) */}
                <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-right-4 duration-700">

                    <div className="mb-10 lg:pl-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-[1px] w-6 bg-zinc-200 dark:bg-zinc-800" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600 underline decoration-fuchsia-500/50 underline-offset-4">Security_Checkpoint</span>
                        </div>
                        <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white uppercase leading-none">Initialize</h2>
                    </div>

                    <div className="technical-panel bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 shadow-xl lg:shadow-2xl">
                        <div className="p-1 px-4 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800/50 flex items-center justify-between">
                            <span className="text-[8px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">Entry_Authorization_V4</span>
                            <div className="flex gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 lg:p-10 space-y-8">
                            <div className="space-y-6">
                                {/* Operator ID Field */}
                                <div className="space-y-2 group">
                                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-600 group-focus-within:text-fuchsia-600 transition-colors">
                                        <span>Operator_Identification</span>
                                    </div>
                                    <div className="relative">
                                        <UserIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-700 group-focus-within:text-fuchsia-600 transition-colors" />
                                        <input
                                            type="text"
                                            required
                                            placeholder="ENTER ID..."
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 focus:border-fuchsia-500/50 rounded-sm px-12 py-4 text-[11px] font-black tracking-widest text-zinc-900 dark:text-white focus:outline-none transition-all uppercase placeholder:text-zinc-300 dark:placeholder:text-zinc-800"
                                        />
                                    </div>
                                </div>

                                {/* Security Key Field */}
                                <div className="space-y-2 group">
                                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-600 group-focus-within:text-fuchsia-600 transition-colors">
                                        <span>Security_Protocol_Key</span>
                                    </div>
                                    <div className="relative">
                                        <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-700 group-focus-within:text-fuchsia-600 transition-colors" />
                                        <input
                                            type="password"
                                            required
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 focus:border-fuchsia-500/50 rounded-sm px-12 py-4 text-[11px] font-black tracking-widest text-zinc-900 dark:text-white focus:outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-sm flex items-center gap-3 animate-in slide-in-from-top-2">
                                    <AlertCircle size={14} className="text-red-500 shrink-0" />
                                    <span className="text-[9px] font-black text-red-500 uppercase tracking-widest leading-none">{error}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn-premium h-14 rounded-sm flex items-center justify-center gap-3 transition-all duration-300 active:scale-95"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 rounded-full border-t-2 border-white animate-spin" />
                                ) : (
                                    <>
                                        <Fingerprint size={20} />
                                        <span>AUTHORIZE_ENTRANCE</span>
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/10 border-t border-zinc-200 dark:border-zinc-800/50 flex items-center justify-between text-[7px] font-black text-zinc-400 dark:text-zinc-700 uppercase tracking-[0.4em]">
                            <span>System_Hash: 8820_X</span>
                            <span>ISO_27001_COMPLIANT</span>
                        </div>
                    </div>

                    {/* Form Links/Footer */}
                    <div className="mt-12 flex justify-between items-center px-2 opacity-50">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-emerald-500" />
                            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Auth_Hub_Linked</span>
                        </div>
                        <div className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">
                            ST_0842_SEC
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
