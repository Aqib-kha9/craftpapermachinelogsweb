'use client';

import React from 'react';
import {
    History,
    Search,
    Download,
    Filter,
    ArrowUpRight,
    Activity,
    Database,
    Shield
} from 'lucide-react';
import { wireRecords, equipmentRecords } from '@/data/mockData';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function HistoryPage() {
    // Merge and sort records by date (descending)
    const combinedHistory = [
        ...wireRecords.map(r => ({ ...r, type: 'WIRE_CHANGE', zone: r.machineName, detail: r.wireType })),
        ...equipmentRecords.map(r => ({ ...r, type: 'EQUIPMENT_MAINTENANCE', zone: r.groupName, detail: r.equipmentName }))
    ].sort((a, b) => new Date(b.changeDate).getTime() - new Date(a.changeDate).getTime());

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
            {/* Archive Protocol Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800/50">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-white animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-600">System History: Version 4.1</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white leading-none uppercase">
                        All History
                    </h1>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="technical-panel px-6 py-2 flex-1 md:flex-none bg-zinc-50/50 dark:bg-zinc-900/40">
                        <div className="text-[8px] uppercase text-zinc-400 font-black tracking-[0.2em] mb-0.5">Database</div>
                        <div className="text-sm font-black text-emerald-500 uppercase mono tracking-tighter">Connected</div>
                    </div>
                    <button className="btn-premium flex items-center justify-center gap-3 w-full sm:w-auto">
                        <Download size={16} />
                        <span>EXPORT HISTORY</span>
                    </button>
                </div>
            </div>

            {/* Registry Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="technical-panel p-6">
                    <div className="flex justify-between items-start mb-6">
                        <Database size={16} className="text-zinc-300 dark:text-zinc-700" />
                        <span className="text-[8px] font-black tracking-[0.3em] text-zinc-300 dark:text-zinc-800">STATS 01</span>
                    </div>
                    <div className="text-3xl font-black text-zinc-900 dark:text-white mono mb-1">{combinedHistory.length}</div>
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Total Records</div>
                </div>
                <div className="technical-panel p-6">
                    <div className="flex justify-between items-start mb-6">
                        <Activity size={16} className="text-zinc-300 dark:text-zinc-700" />
                        <span className="text-[8px] font-black tracking-[0.3em] text-zinc-300 dark:text-zinc-800">STATS 02</span>
                    </div>
                    <div className="text-3xl font-black text-zinc-900 dark:text-white mono mb-1">0.054<span className="text-xs uppercase ml-1 opacity-40">ms</span></div>
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Response Time</div>
                </div>
                <div className="technical-panel p-6">
                    <div className="flex justify-between items-start mb-6">
                        <Shield size={16} className="text-zinc-300 dark:text-zinc-700" />
                        <span className="text-[8px] font-black tracking-[0.3em] text-zinc-300 dark:text-zinc-800">STATS 03</span>
                    </div>
                    <div className="text-3xl font-black text-zinc-900 dark:text-white mono mb-1">256<span className="text-xs uppercase ml-1 opacity-40">bit</span></div>
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Encrypted Connection</div>
                </div>
            </div>

            {/* Full Protocol Table */}
            <div className="technical-panel overflow-hidden">
                <div className="p-5 border-b border-zinc-200 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-950/20 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-[10px] font-black opacity-30">$</div>
                        <input
                            type="text"
                            placeholder="SEARCH HISTORY..."
                            className="w-full bg-zinc-100/50 dark:bg-zinc-900/50 border border-transparent focus:border-zinc-400 dark:focus:border-zinc-600 rounded-[1px] px-8 py-2 text-[10px] font-bold uppercase tracking-widest focus:outline-none transition-all mono"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                            Filter
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50 dark:bg-zinc-900/30 border-b border-zinc-200 dark:border-zinc-800/50">
                                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Type</th>
                                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Section</th>
                                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Description</th>
                                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Date</th>
                                <th className="px-6 py-4 text-center text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/50 font-medium">
                            {combinedHistory.map((entry, i) => (
                                <tr key={i} className="hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 transition-colors group cursor-pointer">
                                    <td className="px-6 py-4">
                                        <div className={cn(
                                            "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-[1px] inline-block",
                                            entry.type === 'WIRE_CHANGE'
                                                ? "bg-fuchsia-500/5 text-fuchsia-600 border border-fuchsia-500/10"
                                                : "bg-purple-500/5 text-purple-600 border border-purple-500/10"
                                        )}>
                                            {entry.type.replace('_', ' ')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-black text-[12px] text-zinc-900 dark:text-zinc-200 uppercase tracking-tight">
                                        {entry.zone}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest leading-tight">
                                            {entry.detail}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 mono text-[11px] text-zinc-500 dark:text-zinc-600 uppercase">
                                        {entry.changeDate.replace(/-/g, '.')}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Link
                                            href={entry.type === 'WIRE_CHANGE' ? `/wire-records/${entry.id}` : `/equipment-records/${entry.id}`}
                                            className="p-1 px-2 border border-zinc-200 dark:border-zinc-800 text-zinc-300 dark:text-zinc-800 group-hover:text-fuchsia-600 group-hover:border-fuchsia-500/30 transition-all inline-block"
                                        >
                                            <ArrowUpRight size={14} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Status */}
                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800/50 bg-zinc-50 dark:bg-zinc-900/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em]">All records are up to date</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
