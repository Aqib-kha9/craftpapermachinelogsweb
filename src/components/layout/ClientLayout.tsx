'use client';

import React, { useState } from 'react';
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

interface ClientLayoutProps {
    children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen w-full bg-[#f8f8f8] dark:bg-[#050505] selection:bg-fuchsia-500/30 overflow-hidden">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#070708] relative">
                <Header onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto custom-scrollbar border-t border-zinc-200 dark:border-zinc-800/50">
                    <div className="p-4 max-w-[1600px] mx-auto min-h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
