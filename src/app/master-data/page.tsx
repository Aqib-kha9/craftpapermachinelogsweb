'use client';

import React, { useState, useEffect } from 'react';
import {
    Database,
    Plus,
    Search,
    Filter,
    Trash2,
    CheckCircle2,
    XCircle,
    RefreshCw,
    AlertCircle,
    Package,
    Settings,
    Layers,
    Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MasterDataRecord {
    id: string;
    category: string;
    value: string;
    isActive: boolean;
}

const CATEGORIES = [
    { id: 'MACHINE_SECTION', label: 'Machine Sections', icon: Settings },
    { id: 'EQUIPMENT_NAME', label: 'Equipment Parts', icon: Package },
    { id: 'WIRE_TYPE', label: 'Wire Types', icon: Layers },
    { id: 'PARTY_NAME', label: 'Party Names', icon: Users },
];

export default function MasterDataPage() {
    const [records, setRecords] = useState<MasterDataRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('MACHINE_SECTION');

    // New Record form state
    const [newValue, setNewValue] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const fetchRecords = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/master-data');
            if (res.ok) {
                const data = await res.json();
                setRecords(data);
            }
        } catch (error) {
            console.error('Failed to fetch master data', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const handleAddRecord = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newValue.trim()) return;

        setIsAdding(true);
        try {
            const res = await fetch('/api/master-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category: selectedCategory, value: newValue.trim() })
            });
            if (res.ok) {
                setNewValue('');
                fetchRecords();
            }
        } catch (error) {
            console.error('Failed to add master data', error);
        } finally {
            setIsAdding(false);
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/master-data/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus })
            });
            if (res.ok) {
                setRecords(records.map(r => r.id === id ? { ...r, isActive: !currentStatus } : r));
            }
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const handleDeleteRecord = async (id: string) => {
        if (!confirm('Are you sure you want to delete this record? This might affect existing records referencing this value.')) return;

        try {
            const res = await fetch(`/api/master-data/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setRecords(records.filter(r => r.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete master data', error);
        }
    };

    const filteredRecords = records.filter(r =>
        r.category === selectedCategory &&
        r.value.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800/50">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-white animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-600">Administrative Protocol: Master Registry</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white leading-none uppercase">
                        Master Data
                    </h1>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button onClick={fetchRecords} disabled={isLoading} className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-500">
                        <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                    </button>
                    <div className="technical-panel px-6 py-2 bg-zinc-50/50 dark:bg-zinc-900/40">
                        <div className="text-[8px] uppercase text-zinc-400 font-black tracking-[0.2em] mb-0.5">Integration</div>
                        <div className="text-sm font-black text-emerald-500 uppercase mono tracking-tighter">
                            {records.length} Definitions Alpha
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Categories Sidebar */}
                <div className="lg:col-span-1 space-y-2">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4 px-2">Data Segments</div>
                    {CATEGORIES.map(cat => {
                        const Icon = cat.icon;
                        const isActive = selectedCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={cn(
                                    "w-full flex items-center justify-between p-4 border transition-all text-left group",
                                    isActive
                                        ? "bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-zinc-900"
                                        : "bg-zinc-50/50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-600"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon size={16} className={cn("transition-transform", isActive && "scale-110")} />
                                    <span className="text-[11px] font-black uppercase tracking-widest">{cat.label}</span>
                                </div>
                                <div className={cn(
                                    "text-[9px] font-black mono",
                                    isActive ? "opacity-50" : "opacity-20"
                                )}>
                                    {records.filter(r => r.category === cat.id).length}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Add New Entry */}
                    <div className="technical-panel p-4 bg-zinc-50/50 dark:bg-zinc-900/20">
                        <form onSubmit={handleAddRecord} className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-grow relative">
                                <input
                                    type="text"
                                    placeholder={`ADD NEW ${CATEGORIES.find(c => c.id === selectedCategory)?.label.toUpperCase()}...`}
                                    value={newValue}
                                    onChange={(e) => setNewValue(e.target.value)}
                                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-4 py-3 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isAdding || !newValue.trim()}
                                className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] transform active:scale-95 transition-all disabled:opacity-50"
                            >
                                {isAdding ? 'EXECUTING...' : 'COMMIT_ENTRY'}
                            </button>
                        </form>
                    </div>

                    {/* Records Registry */}
                    <div className="technical-panel overflow-hidden border-t-4 border-t-zinc-900 dark:border-t-white">
                        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800/50 flex items-center justify-between">
                            <div className="relative w-full max-w-xs">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="text"
                                    placeholder="SEARCH ENTRIES..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-transparent pl-10 pr-4 py-2 text-[10px] font-bold uppercase tracking-widest focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="min-h-[400px]">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-[400px] text-[10px] font-black uppercase tracking-widest text-zinc-400 animate-pulse">
                                    Synchronizing Registry Data...
                                </div>
                            ) : filteredRecords.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-[400px] text-zinc-400 gap-4">
                                    <AlertCircle size={32} opacity={0.2} />
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em]">No Active Definitions Found</div>
                                </div>
                            ) : (
                                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                    {filteredRecords.map(record => (
                                        <div key={record.id} className="group flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-1.5 h-10 transition-colors",
                                                    record.isActive ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-800"
                                                )} />
                                                <div>
                                                    <div className={cn(
                                                        "text-[12px] font-black uppercase tracking-widest",
                                                        !record.isActive && "text-zinc-400 line-through"
                                                    )}>
                                                        {record.value}
                                                    </div>
                                                    <div className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                                                        REF_ID: {record.id.substring(0, 8).toUpperCase()}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleToggleActive(record.id, record.isActive)}
                                                    className={cn(
                                                        "p-2 transition-colors",
                                                        record.isActive
                                                            ? "text-emerald-500 hover:bg-emerald-500/10"
                                                            : "text-zinc-400 hover:bg-zinc-400/10"
                                                    )}
                                                    title={record.isActive ? "Deactivate" : "Activate"}
                                                >
                                                    {record.isActive ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteRecord(record.id)}
                                                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
