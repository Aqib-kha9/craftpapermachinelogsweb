'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Settings,
    Calendar,
    Database,
    AlertCircle,
    Activity,
    Clock,
    Download,
    Share2,
    CheckCircle2,
    Info
} from 'lucide-react';
import { equipmentRecords } from '@/data/mockData';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function EquipmentRecordDetail() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const record = equipmentRecords.find(r => r.id === id);

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
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-all">Back to Audit</span>
                </button>

                <div className="flex gap-4">
                    <button className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-500">
                        <Share2 size={16} />
                    </button>
                    <button className="btn-premium flex items-center gap-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900">
                        <Download size={16} />
                        <span>EXPORT_AUDIT_LOG</span>
                    </button>
                </div>
            </div>

            {/* Title & Badge */}
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-600 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Strategic Audit: EQ_STR_0{record.id}</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white leading-none uppercase">
                    {record.groupName} <span className="text-zinc-300 dark:text-zinc-700">/</span> {record.equipmentName}
                </h1>
            </div>

            {/* Detail Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* Main Technical View */}
                <div className="md:col-span-8 space-y-6">
                    <div className="technical-panel p-0 overflow-hidden border-purple-500/10">
                        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Settings size={16} className="text-purple-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">Maintenance Log Detail</span>
                            </div>
                            <div className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-[1px] text-[9px] font-black uppercase tracking-widest",
                                record.productionImpact === 'Yes' && "bg-red-500/10 text-red-600 border border-red-500/20",
                                record.productionImpact === 'No' && "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
                                record.productionImpact === 'Remark' && "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                            )}>
                                Impact: {record.productionImpact === 'Yes' ? 'Critical' : record.productionImpact === 'No' ? 'None' : 'Moderate'}
                            </div>
                        </div>

                        <div className="p-6 md:p-10 grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12 relative overflow-hidden">
                            {/* Background Aesthetic */}
                            <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-purple-500 -rotate-12">
                                <Settings size={200} />
                            </div>

                            <div className="space-y-8 relative z-10">
                                <div>
                                    <div className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                        <Info size={10} /> Machine_Group
                                    </div>
                                    <div className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">{record.groupName}</div>
                                </div>
                                <div>
                                    <div className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                        <Activity size={10} /> Production_at_Change
                                    </div>
                                    <div className="text-2xl font-black text-zinc-900 dark:text-white mono uppercase tracking-tight">
                                        {record.totalProduction.toLocaleString()} <span className="text-xs text-zinc-400">MT</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8 relative z-10">
                                <div>
                                    <div className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                        <CheckCircle2 size={10} /> Equipment_Part
                                    </div>
                                    <div className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">{record.equipmentName}</div>
                                </div>
                                <div>
                                    <div className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                        <Calendar size={10} /> Audit_Stamp
                                    </div>
                                    <div className="text-2xl font-black text-zinc-900 dark:text-white mono uppercase tracking-tight">
                                        {record.changeDate.replace('-', '.')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Remark Section */}
                        <div className="p-6 md:p-10 border-t border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/30 dark:bg-zinc-900/5">
                            <div className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">Maintenance_Notes</div>
                            <p className="text-xs md:text-sm font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                {record.remark || 'No detailed maintenance notes were provided for this log entry.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats / Info */}
                <div className="md:col-span-4 space-y-4">
                    <div className="technical-panel p-6 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-2 mb-6 text-zinc-400">
                            <AlertCircle size={14} />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Operational_Risk</span>
                        </div>
                        <div className="flex items-center gap-4 py-4 px-6 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 mb-6">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-lg font-black text-zinc-900 dark:text-white mono uppercase">Level_Low</span>
                        </div>
                        <div className="text-[10px] font-medium text-zinc-400 leading-relaxed uppercase tracking-wider mb-6">
                            The change was performed during scheduled maintenance. No unexpected downtime was reported.
                        </div>

                        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
                            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2 mb-2">
                                <Clock size={12} /> Downtime Recorded
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-amber-600 dark:text-amber-500 mono">{record.downtimeMinutes || 0}</span>
                                <span className="text-[10px] font-black text-amber-600/50 uppercase tracking-widest">MINUTES</span>
                            </div>
                        </div>
                    </div>

                    <div className="technical-panel p-8 flex flex-col items-center justify-center text-center space-y-4 border-dashed border-zinc-200 dark:border-zinc-800 bg-transparent">
                        <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center text-zinc-400">
                            <Download size={20} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">PDF Snapshot</div>
                            <div className="text-[8px] font-medium text-zinc-400 uppercase tracking-widest mt-1">2.4 MB Log Signature</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
