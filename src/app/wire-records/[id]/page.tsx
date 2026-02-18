'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Layers,
    Calendar,
    Database,
    Clipboard,
    Activity,
    Clock,
    Download,
    Share2
} from 'lucide-react';
import { wireRecords } from '@/data/mockData';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function WireRecordDetail() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const record = wireRecords.find(r => r.id === id);

    if (!record) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <div className="text-zinc-400 font-black uppercase tracking-[0.3em]">Record Not Found</div>
                <button onClick={() => router.back()} className="btn-premium">Go Back</button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
            {/* Navigation Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="group flex items-center gap-3 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                    <div className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center group-hover:border-zinc-900 dark:group-hover:border-white transition-all">
                        <ArrowLeft size={16} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-all">Back to List</span>
                </button>

                <div className="flex gap-4">
                    <button className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-500">
                        <Share2 size={16} />
                    </button>
                    <button className="btn-premium flex items-center gap-3">
                        <Download size={16} />
                        <span>EXPORT_RECORD</span>
                    </button>
                </div>
            </div>

            {/* Title & Badge */}
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-fuchsia-600 shadow-[0_0_10px_rgba(192,38,211,0.5)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Registry Entry: RE_0{record.id}</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white leading-none uppercase">
                    {record.machineName} <span className="text-zinc-300 dark:text-zinc-700">/</span> {record.wireType}
                </h1>
            </div>

            {/* Detail Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* Main Technical View */}
                <div className="md:col-span-8 space-y-6">
                    <div className="technical-panel p-0 overflow-hidden">
                        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Database size={16} className="text-zinc-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">Full Registry Configuration</span>
                            </div>
                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest px-2 py-0.5 bg-emerald-500/5 border border-emerald-500/10">Verified_Ledger</span>
                        </div>

                        <div className="p-6 md:p-10 grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12 relative overflow-hidden">
                            {/* Background Aesthetic */}
                            <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-zinc-400 rotate-12">
                                <Layers size={200} />
                            </div>

                            <div className="space-y-8 relative z-10">
                                <div>
                                    <div className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                        <Clipboard size={10} /> Machine_Section
                                    </div>
                                    <div className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">{record.machineName}</div>
                                </div>
                                <div>
                                    <div className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                        <Activity size={10} /> Cumulative_Production
                                    </div>
                                    <div className="text-2xl font-black text-fuchsia-600 mono uppercase tracking-tight">
                                        {record.totalProduction.toLocaleString()} <span className="text-xs">MT</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8 relative z-10">
                                <div>
                                    <div className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                        <Layers size={10} /> Wire_Specification
                                    </div>
                                    <div className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">{record.wireType}</div>
                                </div>
                                <div>
                                    <div className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                        <Calendar size={10} /> Log_Timestamp
                                    </div>
                                    <div className="text-2xl font-black text-zinc-900 dark:text-white mono uppercase tracking-tight">
                                        {record.changeDate.replace('-', '.')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Remark Section */}
                        <div className="p-6 md:p-10 border-t border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/30 dark:bg-zinc-900/5">
                            <div className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">Observation_Remark</div>
                            <p className="text-xs md:text-sm font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed italic">
                                "{record.remark || 'No additional remarks recorded for this registry entry.'}"
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats / Info */}
                <div className="md:col-span-4 space-y-4">
                    <div className="technical-panel p-6 bg-zinc-900 text-white">
                        <div className="flex items-center gap-2 mb-6 text-zinc-500">
                            <Clock size={14} />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Live_Systems_Log</span>
                        </div>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center py-3 border-b border-white/5">
                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Protocol</span>
                                <span className="text-[10px] font-black uppercase mono">V6.0_STABLE</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-white/5">
                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Integrity</span>
                                <span className="text-[10px] font-black uppercase text-emerald-500 mono">100%_SECURE</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-white/5">
                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Hash</span>
                                <span className="text-[9px] font-black uppercase opacity-40 truncate ml-4 mono">7F-4B-92-A1-03</span>
                            </div>
                        </div>
                    </div>

                    <div className="technical-panel p-6">
                        <div className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">Production Impact</div>
                        <div className="flex items-end gap-2">
                            <div className="text-3xl font-black text-zinc-900 dark:text-white mono">150</div>
                            <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">MT/Day Base</div>
                        </div>
                        <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 mt-6 overflow-hidden">
                            <div className="w-[85%] h-full bg-fuchsia-600" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
