'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home, Bell, Menu, LogOut, User, Settings as SettingsIcon, ChevronDown, Search, Loader2, Layers, Cpu, CornerDownLeft, RefreshCcw } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface HeaderProps {
    onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const pathname = usePathname();
    const router = useRouter();
    const paths = pathname.split('/').filter(Boolean);
    const { logout } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Notification State
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch Notifications
    const fetchNotifications = async () => {
        setIsRefreshing(true);
        try {
            const res = await fetch('/api/notifications', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (err) {
            console.error('Telemetery fetch failed');
        } finally {
            setIsRefreshing(false);
        }
    };

    // Mark all as read
    const markAsRead = async () => {
        try {
            const res = await fetch('/api/notifications', { method: 'PATCH' });
            if (res.ok) {
                // Optimistic update
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            }
        } catch (err) {
            console.error('Status sync failed');
        }
    };

    // Manual synchronization only - no autocalls
    useEffect(() => {
        fetchNotifications();

        // Listen for global sync events from other pages
        const handleGlobalSync = () => {
            fetchNotifications();
        };
        document.addEventListener('sync_telemetry', handleGlobalSync);

        return () => document.removeEventListener('sync_telemetry', handleGlobalSync);
    }, []);

    // Debounced Search Effect
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                setIsSearchLoading(true);
                try {
                    const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
                    const data = await res.json();
                    setSearchResults(data);
                    setIsSearchOpen(true);
                } catch (err) {
                    console.error('Search fetch failed');
                } finally {
                    setIsSearchLoading(false);
                }
            } else {
                setSearchResults([]);
                setIsSearchOpen(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Handle click outside to close search
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
                    {/* Command Console Input */}
                    <div className="relative group hidden lg:block" ref={searchRef}>
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-[10px] font-black opacity-50">
                            {isSearchLoading ? <Loader2 size={10} className="animate-spin text-fuchsia-500" /> : <Search size={12} />}
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => searchQuery.length >= 2 && setIsSearchOpen(true)}
                            placeholder="SEARCH_REGISTRY..."
                            className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 rounded-[2px] px-8 py-1.5 text-[9px] font-bold uppercase tracking-widest focus:outline-none focus:border-fuchsia-500/50 transition-all w-48 focus:w-64 focus:bg-white dark:focus:bg-zinc-900 mono"
                        />

                        {/* Search Results Dropdown */}
                        {isSearchOpen && (searchResults.length > 0 || searchQuery.length >= 2) && (
                            <div className="absolute top-[calc(100%+8px)] left-0 w-[320px] bg-white dark:bg-[#0c0c0d] border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-[2px] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-2 border-b border-zinc-100 dark:border-zinc-800/50 flex justify-between items-center">
                                    <span className="text-[8px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">Command_Response_Logs</span>
                                    <span className="text-[8px] font-black text-fuchsia-500 uppercase tracking-tighter">Hits: {searchResults.length}</span>
                                </div>

                                <div className="max-h-[350px] overflow-y-auto">
                                    {searchResults.length > 0 ? (
                                        <div className="py-2">
                                            {searchResults.map((result) => (
                                                <Link
                                                    key={`${result.type}-${result.id}`}
                                                    href={result.href}
                                                    onClick={() => {
                                                        setIsSearchOpen(false);
                                                        setSearchQuery('');
                                                    }}
                                                    className="flex items-center gap-4 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-white/5 transition-all group/res"
                                                >
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-[2px] flex items-center justify-center shrink-0 border transition-colors",
                                                        result.type === 'wire'
                                                            ? "bg-fuchsia-500/5 border-fuchsia-500/10 text-fuchsia-500"
                                                            : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500"
                                                    )}>
                                                        {result.type === 'wire' ? <Layers size={14} /> : <Cpu size={14} />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-[10px] font-black text-zinc-900 dark:text-zinc-200 uppercase tracking-widest truncate group-hover/res:text-fuchsia-500 transition-colors">
                                                            {result.title}
                                                        </div>
                                                        <div className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter mt-0.5 truncate mono">
                                                            [{result.type.toUpperCase()}] :: {result.subtitle}
                                                        </div>
                                                    </div>
                                                    <CornerDownLeft size={10} className="text-zinc-300 dark:text-zinc-800 opacity-0 group-hover/res:opacity-100 transition-opacity" />
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 rounded-full border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-300 dark:text-zinc-800">
                                                <Search size={18} />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">No_Matches_Found</div>
                                                <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">Registry query returned null result</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/10 border-t border-zinc-100 dark:border-zinc-800/50 flex justify-between items-center text-[7px] font-black text-zinc-400 dark:text-zinc-700 uppercase tracking-[0.2em]">
                                    <span>Press Entry to navigate</span>
                                    <span>Incohub Engine V4.1</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-2 sm:gap-4 border-r border-zinc-200 dark:border-zinc-800 pr-4 sm:pr-6">
                            <ThemeToggle />

                            {/* Notification Engine */}
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setIsNotificationsOpen(!isNotificationsOpen);
                                        if (!isNotificationsOpen) markAsRead();
                                    }}
                                    className={cn(
                                        "relative text-zinc-400 hover:text-fuchsia-500 transition-colors",
                                        isNotificationsOpen && "text-fuchsia-500"
                                    )}
                                >
                                    <Bell size={16} />
                                    {notifications.some(n => !n.isRead) && (
                                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-fuchsia-600 rounded-full border border-white dark:border-[#070708] animate-pulse" />
                                    )}
                                </button>

                                {isNotificationsOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setIsNotificationsOpen(false)}
                                        />
                                        <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#0c0c0d] border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-[2px] z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                            <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-900/30 border-b border-zinc-100 dark:border-zinc-800/50 flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-[10px] font-black text-zinc-900 dark:text-zinc-300 uppercase tracking-widest">System_Alert_Feed</div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            fetchNotifications();
                                                        }}
                                                        disabled={isRefreshing}
                                                        className="text-zinc-400 hover:text-fuchsia-500 transition-colors"
                                                    >
                                                        <RefreshCcw size={10} className={cn(isRefreshing && "animate-spin")} />
                                                    </button>
                                                </div>
                                                <div className="text-[8px] font-bold text-fuchsia-500 bg-fuchsia-500/10 px-1.5 py-0.5 rounded-[1px] uppercase tracking-tighter mono">SECURED</div>
                                            </div>

                                            <div className="max-h-[400px] overflow-y-auto">
                                                {notifications.length > 0 ? (
                                                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                                        {notifications.map((n) => (
                                                            <div key={n.id} className={cn(
                                                                "px-4 py-4 hover:bg-zinc-50 dark:hover:bg-white/5 transition-all relative group",
                                                                !n.isRead && "bg-fuchsia-500/[0.02]"
                                                            )}>
                                                                {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-fuchsia-600" />}
                                                                <div className="flex items-start gap-3">
                                                                    <div className={cn(
                                                                        "mt-0.5 w-1.5 h-1.5 rounded-full shrink-0",
                                                                        n.type === 'SUCCESS' ? "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" :
                                                                            n.type === 'ALERT' ? "bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]" :
                                                                                "bg-fuchsia-600"
                                                                    )} />
                                                                    <div className="space-y-1">
                                                                        <div className="text-[10px] font-black text-zinc-900 dark:text-zinc-200 uppercase tracking-widest leading-none">
                                                                            {n.title}
                                                                        </div>
                                                                        <p className="text-[9px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest leading-relaxed">
                                                                            {n.message}
                                                                        </p>
                                                                        <div className="text-[7px] font-bold text-zinc-400 dark:text-zinc-700 uppercase tracking-widest mono">
                                                                            {new Date(n.createdAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="py-12 text-center flex flex-col items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-300 dark:text-zinc-800">
                                                            <Bell size={18} />
                                                        </div>
                                                        <div className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">No_Active_Alerts</div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-2 border-t border-zinc-100 dark:border-zinc-800/50 bg-zinc-50 dark:bg-zinc-900/30 text-center">
                                                <button className="text-[8px] font-black text-zinc-400 hover:text-fuchsia-600 dark:text-zinc-600 dark:hover:text-fuchsia-400 uppercase tracking-[0.2em] transition-colors">
                                                    View All Telemetry
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-3 pl-2 sm:pl-4 group"
                            >
                                <div className="text-right hidden sm:block">
                                    <div className="text-[9px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-400 leading-none group-hover:text-fuchsia-600 transition-colors">Administrator</div>
                                    <div className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter mt-1 mono">System Admin</div>
                                </div>
                                <div className="w-8 h-8 rounded-[2px] bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden text-[10px] font-black relative">
                                    AQ
                                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border-2 border-white dark:border-[#070708] rounded-full" />
                                </div>
                                <ChevronDown size={12} className={cn("text-zinc-400 transition-transform duration-300", isProfileOpen && "rotate-180")} />
                            </button>

                            {/* Profile Dropdown */}
                            {isProfileOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setIsProfileOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#0c0c0d] border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-[2px] z-20 py-2 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/50 mb-1">
                                            <div className="text-[10px] font-black text-zinc-900 dark:text-zinc-300 uppercase tracking-widest">Operator Context</div>
                                            <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-tight mt-1 mono">ID: INCO_HUB_ADMIN</div>
                                        </div>

                                        {/* <button className="w-full flex items-center gap-3 px-4 py-2.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5 transition-all text-left">
                                            <User size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Account_Settings</span>
                                        </button>

                                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5 transition-all text-left">
                                            <SettingsIcon size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Preferences</span>
                                        </button> */}

                                        <div className="h-px bg-zinc-100 dark:bg-zinc-800/50 my-1 mx-4" />

                                        <button
                                            onClick={logout}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-500/5 transition-all text-left group"
                                        >
                                            <LogOut size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Terminate_Session</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
