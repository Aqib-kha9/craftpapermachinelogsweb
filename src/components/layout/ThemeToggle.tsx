'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Palette, Check } from 'lucide-react';

const themes = [
    { id: 'light', name: 'Standard Light', color: '#ffffff', accent: '#c026d3', group: 'Basic' },
    { id: 'dark', name: 'Standard Dark', color: '#09090b', accent: '#d946ef', group: 'Basic' },
    { id: 'crimson-light', name: 'Crimson (Light)', color: '#fffafa', accent: '#e11d48', group: 'Crimson Luxury' },
    { id: 'crimson', name: 'Crimson (Dark)', color: '#1a050a', accent: '#e11d48', group: 'Crimson Luxury' },
    { id: 'midnight-light', name: 'Midnight (Light)', color: '#fafaff', accent: '#8b5cf6', group: 'Midnight Purple' },
    { id: 'midnight', name: 'Midnight (Dark)', color: '#0a051a', accent: '#8b5cf6', group: 'Midnight Purple' },
    { id: 'ocean-light', name: 'Oceanic (Light)', color: '#fafdff', accent: '#06b6d4', group: 'Oceanic Drift' },
    { id: 'ocean', name: 'Oceanic (Dark)', color: '#051a1a', accent: '#06b6d4', group: 'Oceanic Drift' },
    { id: 'amber-light', name: 'Amber (Light)', color: '#fffdfa', accent: '#f59e0b', group: 'Amber Forge' },
    { id: 'amber', name: 'Amber (Dark)', color: '#1a1205', accent: '#f59e0b', group: 'Amber Forge' },
];

interface ThemeToggleProps {
    minimal?: boolean;
}

export function ThemeToggle({ minimal }: ThemeToggleProps) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-8 h-8 rounded-[1px] bg-zinc-100 dark:bg-zinc-800 animate-pulse border border-zinc-200 dark:border-zinc-800" />
        );
    }

    const currentTheme = themes.find(t => t.id === theme) || themes[1];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "group relative flex items-center transition-all duration-300",
                    "bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800",
                    "hover:border-primary/50 hover:bg-white dark:hover:bg-zinc-900",
                    "rounded-[1px]",
                    minimal ? "p-2" : "px-2 py-1.5 gap-2"
                )}
                aria-label="Select theme"
            >
                <div className="relative w-4 h-4 flex items-center justify-center">
                    <Palette className="h-3.5 w-3.5 text-primary transition-transform group-hover:rotate-12" />
                </div>

                {!minimal && (
                    <div className="flex flex-col items-start leading-none pr-1">
                        <span className="text-[7px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-0.5">Vibe</span>
                        <span className="text-[8px] font-black text-foreground uppercase tracking-tighter mono group-hover:text-primary transition-colors">
                            {currentTheme.name}
                        </span>
                    </div>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-3 w-44 bg-white dark:bg-[#0c0c0d] border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-[2px] z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800/50 mb-1">
                            <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">Theme Registry</span>
                        </div>
                        <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                            {themes.map((t, i) => {
                                const showGroupLabel = i === 0 || t.group !== themes[i - 1].group;
                                return (
                                    <React.Fragment key={t.id}>
                                        {showGroupLabel && (
                                            <div className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900/50">
                                                <span className="text-[7px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">{t.group}</span>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => {
                                                setTheme(t.id);
                                                setIsOpen(false);
                                            }}
                                            className={cn(
                                                "w-full flex items-center justify-between px-3 py-2 transition-all text-left group/item",
                                                theme === t.id ? "bg-primary/5" : "hover:bg-zinc-50/50 dark:hover:bg-white/5"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-2.5 h-2.5 rounded-full border border-white/20 shadow-sm"
                                                    style={{ backgroundColor: t.id.includes('light') || t.id === 'light' ? t.accent : '#000' }}
                                                />
                                                <span className={cn(
                                                    "text-[9px] font-bold uppercase tracking-widest transition-colors",
                                                    theme === t.id ? "text-primary" : "text-zinc-500 group-hover/item:text-foreground"
                                                )}>
                                                    {t.name.split(' (')[1] ? t.name.split(' (')[1].replace(')', '') : t.name}
                                                </span>
                                            </div>
                                            {theme === t.id && <Check size={10} className="text-primary" />}
                                        </button>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
