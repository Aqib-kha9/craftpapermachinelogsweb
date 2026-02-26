'use client';

import React, { useState, useEffect } from 'react';
import { ExternalLink, Plus, Trash2, Link as LinkIcon, AlertCircle, Database, Globe, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface SheetLink {
    id: string;
    label: string;
    url: string;
    createdAt: string;
}

export default function ExternalSheetsPage() {
    const [links, setLinks] = useState<SheetLink[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [newLabel, setNewLabel] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [error, setError] = useState('');

    const fetchLinks = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/sheet-links');
            if (res.ok) {
                const data = await res.json();
                setLinks(data);
            }
        } catch (err) {
            console.error('Failed to fetch links', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLinks();
    }, []);

    const handleAddLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLabel.trim() || !newUrl.trim()) {
            setError('Please provide both a name and a valid URL.');
            return;
        }

        let finalUrl = newUrl.trim();
        if (!/^https?:\/\//i.test(finalUrl)) {
            finalUrl = `https://${finalUrl}`;
        }

        setIsAdding(true);
        setError('');

        try {
            const res = await fetch('/api/sheet-links', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ label: newLabel.trim(), url: finalUrl })
            });

            if (res.ok) {
                setNewLabel('');
                setNewUrl('');
                setIsFormOpen(false);
                fetchLinks();
            } else {
                const errorData = await res.json();
                setError(errorData.error || 'Failed to add link');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsAdding(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm('Are you sure you want to remove this connection?')) return;

        try {
            const res = await fetch(`/api/sheet-links?id=${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setLinks(prev => prev.filter(link => link.id !== id));
            }
        } catch (err) {
            console.error('Failed to delete link', err);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsFormOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out mx-auto pb-20">
            {/* Absolute background glow */}
            <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />

            {/* Header Section */}
            <div className="relative overflow-hidden technical-panel p-4 md:p-8 mb-4 bg-zinc-50 dark:bg-zinc-950 border-zinc-200/50 dark:border-zinc-800/50">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transition-transform duration-1000 scale-150 rotate-12 origin-top-right">
                    <LinkIcon size={300} className="text-primary" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_12px_var(--primary)]" />
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">External Integrations</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground leading-none uppercase mb-4 shadow-sm">
                            Command Center
                        </h1>
                        <p className="text-sm text-zinc-500 font-medium max-w-xl leading-relaxed">
                            Centralized routing hub for all external data matrices, interconnected spreadsheets, and third-party operational dashboards.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-foreground text-background font-bold tracking-widest uppercase text-[11px] overflow-hidden transition-transform active:scale-95 shadow-xl hover:shadow-primary/20"
                    >
                        <span className="absolute inset-0 w-full h-full bg-primary opacity-0 group-hover:opacity-10 transition-opacity" />
                        <span className="absolute bottom-0 left-0 w-full h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                        <Plus size={16} className="group-hover:rotate-180 transition-transform duration-500 text-primary" />
                        <span>Deploy Node</span>
                    </button>
                </div>
            </div>

            {/* Main Grid Canvas */}
            <div className="relative min-h-[400px]">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <Database size={40} className="text-primary animate-pulse opacity-50" />
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Syncing Matrix...</div>
                        </div>
                    </div>
                ) : links.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col items-center justify-center text-zinc-400 space-y-6">
                            <div className="p-8 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-full bg-background/50 backdrop-blur-sm">
                                <LinkIcon size={40} className="hover:scale-110 transition-transform duration-500 opacity-20" />
                            </div>
                            <p className="text-[12px] font-black uppercase tracking-[0.2em] text-center text-zinc-500">
                                Sector empty.<br />
                                <span className="text-zinc-400/50 text-[10px]">Awaiting node deployment.</span>
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10 p-1">
                        {links.map((link) => {
                            let domain = link.url;
                            try { domain = new URL(link.url).hostname.replace('www.', ''); } catch (e) { }

                            return (
                                <div key={link.id} className="group relative h-full">
                                    <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-sm -z-10" />

                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="relative flex flex-col h-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/50 p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_12px_40px_rgba(var(--primary-rgb),0.12)] group-hover:-translate-y-1"
                                    >
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-border flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/30 group-hover:text-primary transition-colors text-zinc-500 shadow-sm">
                                                <Globe size={18} />
                                            </div>
                                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-transparent text-zinc-300 dark:text-zinc-700 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 transform group-hover:-translate-y-1 group-hover:translate-x-1">
                                                <ArrowUpRight size={16} />
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-black text-foreground tracking-tight mb-3 group-hover:text-primary transition-colors line-clamp-2 pr-4">
                                            {link.label}
                                        </h3>

                                        <div className="mt-auto pt-4 border-t border-border/50">
                                            <div className="text-[10px] font-mono text-zinc-500 truncate max-w-[90%]">
                                                {domain}
                                            </div>
                                        </div>
                                    </a>

                                    {/* Quick Action Delete */}
                                    <button
                                        onClick={(e) => handleDelete(e, link.id)}
                                        className="absolute top-4 right-16 w-8 h-8 flex items-center justify-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-red-500 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full opacity-0 group-hover:opacity-100 hover:scale-110 transition-all z-20 shadow-md"
                                        title="Disconnect node"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Deployment Modal Overlay */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => setIsFormOpen(false)}
                    />
                    {/* Modal Content */}
                    <div className="w-full max-w-lg bg-background border border-border/50 shadow-2xl relative z-10 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent" />

                        <div className="p-8 md:p-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 text-primary">
                                        <LinkIcon size={18} />
                                    </div>
                                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Deploy Node</h2>
                                </div>
                                <button
                                    onClick={() => setIsFormOpen(false)}
                                    className="p-2 text-zinc-400 hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                </button>
                            </div>

                            <form onSubmit={handleAddLink} className="space-y-6">
                                <div>
                                    <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                                        <span className="text-primary font-mono">01.</span> Display Alias
                                    </label>
                                    <input
                                        type="text"
                                        value={newLabel}
                                        onChange={(e) => setNewLabel(e.target.value)}
                                        placeholder="e.g. Master Production Sheet"
                                        className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-border px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-foreground placeholder:text-zinc-400"
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                                        <span className="text-primary font-mono">02.</span> Ext. Stream URL
                                    </label>
                                    <input
                                        type="text"
                                        value={newUrl}
                                        onChange={(e) => setNewUrl(e.target.value)}
                                        placeholder="https://docs.google.com/..."
                                        className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-border px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-foreground font-mono placeholder:text-zinc-400"
                                    />
                                </div>

                                {error && (
                                    <div className="flex items-start gap-2 text-[10px] font-bold text-red-500 uppercase tracking-widest p-3 bg-red-500/10 border border-red-500/20 rounded-sm">
                                        <AlertCircle size={14} className="shrink-0 mt-0.5" /> <span>{error}</span>
                                    </div>
                                )}

                                <div className="pt-6 mt-4 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsFormOpen(false)}
                                        className="flex-[1] px-6 py-4 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors uppercase tracking-widest text-[10px] font-black"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isAdding}
                                        className="flex-[2] group relative inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground font-black tracking-widest uppercase text-[10px] overflow-hidden transition-transform active:scale-95 disabled:opacity-50"
                                    >
                                        <span className="absolute inset-0 w-full h-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {isAdding ? 'Initializing...' : 'Establish Connection'}
                                        <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
