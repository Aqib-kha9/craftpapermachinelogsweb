'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    History,
    Settings,
    Layers,
    LayoutDashboard,
    ClipboardList,
    ChevronRight,
    PieChart,
    LogOut,
    Database,
    FileSpreadsheet,
    ExternalLink, // Added ExternalLink
    Menu, // Consolidated from separate import
    X // Consolidated from separate import
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const sidebarItems = [
    {
        name: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
    },
    {
        name: 'Summary Dashboard',
        href: '/summary',
        icon: PieChart,
    },
    {
        name: 'Stock Records',
        href: '/stock-history',
        icon: ClipboardList,
        description: 'Production & Dispatch Logs'
    },
    {
        name: 'Bulk Import',
        href: '/bulk-import',
        icon: FileSpreadsheet,
        description: 'Fast Data Entry'
    },
    {
        name: 'External Sheets',
        href: '/sheets',
        icon: ExternalLink,
        description: 'Custom Shortcuts'
    },
    {
        name: 'Wire Records',
        href: '/wire-records',
        icon: Layers,
        description: 'Bottom/Press Wire Changes'
    },
    {
        name: 'Equipment Records',
        href: '/equipment-records',
        icon: Settings,
        description: 'Parts & Equipment Changes'
    },
    {
        name: 'All History',
        href: '/history',
        icon: History,
    },
    {
        name: 'Master Data',
        href: '/master-data',
        icon: Database,
        description: 'Manage System Definitions'
    },
    {
        name: 'System Vault',
        href: '/system',
        icon: Database,
        description: 'Backup & Recovery Control'
    },
];

import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/context/AuthContext';

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
                    onClick={onClose}
                />
            )}

            <aside className={cn(
                "fixed inset-y-0 left-0 w-64 lg:w-16 bg-sidebar border-r border-border z-50 transition-transform duration-300 lg:translate-x-0 lg:static lg:block",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full py-2 gap-2 lg:gap-2">
                    {/* Brand / Logo */}
                    <div className="flex items-center gap-4 px-6 lg:px-0 lg:justify-center lg:mb-0">
                        <Link href="/" className="lg:justify-center flex items-center gap-4">
                            <div className="w-10 h-10 rounded bg-transparent flex items-center justify-center shrink-0 overflow-hidden">
                                <Image
                                    src="/logo.png"
                                    alt="Incohub Logo"
                                    width={40}
                                    height={40}
                                    className="object-contain"
                                />
                            </div>
                            <div className="lg:hidden">
                                <div className="text-[12px] font-black uppercase tracking-widest text-foreground">Incohub</div>
                                <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter">Machine Records</div>
                            </div>
                        </Link>

                        <button onClick={onClose} className="lg:hidden ml-auto p-1 text-zinc-400">
                            <X size={20} />
                        </button>
                    </div>

                    <nav className="flex flex-col gap-2 lg:items-center px-4 lg:px-0">
                        {sidebarItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onClose}
                                    className={cn(
                                        "flex items-center gap-4 p-3 lg:p-0 lg:w-10 lg:h-10 lg:justify-center rounded transition-all duration-300 relative group",
                                        isActive
                                            ? "text-primary bg-primary/5"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Icon size={20} className={cn("shrink-0 transition-transform duration-300", isActive && "scale-110")} />

                                    <span className="lg:hidden text-[11px] font-black uppercase tracking-widest">
                                        {item.name}
                                    </span>

                                    {/* Desktop Tooltip */}
                                    <div className="hidden lg:block absolute left-[calc(100%+12px)] px-3 py-1.5 bg-sidebar-foreground text-sidebar text-[10px] font-black uppercase tracking-widest rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-2xl">
                                        {item.name}
                                        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-sidebar-foreground rotate-45 -z-10" />
                                    </div>

                                    {isActive && (
                                        <div className="absolute left-0 lg:-left-px top-1/2 -translate-y-1/2 w-[3px] lg:w-[2px] h-6 bg-primary shadow-[0_0_10px_var(--primary)]" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-auto pb-4 flex flex-col items-center gap-6 px-6 lg:px-0">
                        <div className="relative h-24 hidden lg:flex items-center">
                            <span className="[writing-mode:vertical-lr] rotate-180 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 dark:text-zinc-700">
                                INCO<span className="text-zinc-500">_HUB</span>
                            </span>
                        </div>

                        <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)] animate-pulse" />

                        <ThemeToggle minimal />
                    </div>
                </div>
            </aside>
        </>
    );
}
