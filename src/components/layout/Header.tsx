'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home, Bell, Menu } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '@/lib/utils';

interface HeaderProps {
    onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const pathname = usePathname();
    const paths = pathname.split('/').filter(Boolean);

    return (
        <header className="h-14 shrink-0 bg-white dark:bg-[#070708] border-b border-zinc-200 dark:border-zinc-800/50 z-40 px-4 md:px-8">
            <div className="h-full flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 -ml-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                        <Menu size={20} />
                    </button>

                    <div className="hidden sm:flex items-center gap-1.5 text-zinc-400 dark:text-zinc-600">
                        <Home size={14} className="hover:text-fuchsia-500 transition-colors cursor-pointer" />
                        <ChevronRight size={12} className="opacity-30" />
                    </div>
                    <nav className="flex items-center gap-2">
                        {paths.length === 0 ? (
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-zinc-400">Home</span>
                        ) : (
                            paths.map((path, i) => (
                                <React.Fragment key={path}>
                                    <span className={cn(
                                        "text-[10px] font-black uppercase tracking-[0.2em]",
                                        i === paths.length - 1 ? "text-fuchsia-600 px-1.5 py-0.5 bg-fuchsia-500/5 rounded-[1px]" : "text-zinc-400",
                                        i < paths.length - 2 && "hidden md:inline-block"
                                    )}>
                                        {isNaN(Number(path)) ? path.replace('-', ' ') : `Record #${path}`}
                                    </span>
                                    {i < paths.length - 1 && <ChevronRight size={12} className={cn(
                                        "text-zinc-200 dark:text-zinc-800",
                                        i < paths.length - 2 && "hidden md:inline-block"
                                    )} />}
                                </React.Fragment>
                            ))
                        )}
                    </nav>
                </div>

                <div className="flex items-center gap-6">
                    {/* Command Console Input - Hidden on very small screens */}
                    <div className="relative group hidden lg:block">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-[10px] font-black opacity-50">$</div>
                        <input
                            type="text"
                            placeholder="SEARCH RECORDS..."
                            className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 rounded-[2px] px-8 py-1.5 text-[9px] font-bold uppercase tracking-widest focus:outline-none focus:border-fuchsia-500/50 transition-all w-36 focus:w-48 mono"
                        />
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-2 sm:gap-4 border-r border-zinc-200 dark:border-zinc-800 pr-4 sm:pr-6">
                            <ThemeToggle />
                            <button className="relative text-zinc-400 hover:text-fuchsia-500 transition-colors">
                                <Bell size={16} />
                                <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-fuchsia-600 rounded-full" />
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <div className="text-[9px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-400 leading-none">Administrator</div>
                                <div className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter mt-1 mono">System Admin</div>
                            </div>
                            <div className="w-8 h-8 rounded-[2px] bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden text-[10px] font-black">
                                AQ
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
