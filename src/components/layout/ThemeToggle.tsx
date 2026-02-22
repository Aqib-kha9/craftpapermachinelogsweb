'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
    minimal?: boolean;
}

export function ThemeToggle({ minimal }: ThemeToggleProps) {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-8 h-8 rounded-[1px] bg-zinc-100 dark:bg-zinc-800 animate-pulse border border-zinc-200 dark:border-zinc-800" />
        );
    }

    return (
        <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className={cn(
                "group relative flex items-center transition-all duration-300",
                "bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800",
                "hover:border-fuchsia-500/30 hover:bg-white dark:hover:bg-zinc-900",
                "rounded-[1px]",
                minimal ? "p-2" : "px-2 py-1.5 gap-2"
            )}
            aria-label="Toggle theme"
        >
            <div className="relative w-4 h-4 flex items-center justify-center">
                <Sun className="h-3.5 w-3.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
                <Moon className="absolute h-3.5 w-3.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-fuchsia-500" />
            </div>

            {!minimal && (
                <div className="flex flex-col items-start leading-none pr-1">
                    <span className="text-[7px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-0.5">Mode</span>
                    <span className="text-[8px] font-black text-zinc-900 dark:text-zinc-200 uppercase tracking-tighter mono group-hover:text-fuchsia-500 transition-colors">
                        {resolvedTheme?.toUpperCase()}
                    </span>
                </div>
            )}
        </button>
    );
}
