'use client';

import React, { useState } from 'react';
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface ClientLayoutProps {
    children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !user && pathname !== '/login') {
            router.push('/login');
        }
    }, [user, isLoading, pathname, router]);

    if (isLoading) {
        return (
            <div className="h-screen w-full bg-[#050505] flex flex-col items-center justify-center space-y-4">
                <div className="w-8 h-8 rounded-full border-t-2 border-fuchsia-600 animate-spin" />
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Syncing_Identity...</div>
            </div>
        );
    }

    if (!user && pathname !== '/login') {
        return null; // Prevents flash of content before redirect
    }

    // If we are on login page, don't show sidebar/header
    if (pathname === '/login') {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen w-full bg-[#f8f8f8] dark:bg-[#050505] selection:bg-fuchsia-500/30 overflow-hidden">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#070708] relative">
                <Header onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-auto bg-background p-2 md:p-2 custom-scrollbar relative">
                    <div className="p-2 max-w-[1600px] mx-auto min-h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
