'use client';

import React from 'react';
import {
    Layers,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Download,
    Calendar,
    ClipboardList
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { wireRecords, currentMachineSections } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { RecordModal } from '@/components/layout/RecordModal';
import Link from 'next/link';

export default function WireRecordsPage() {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
            {/* Module Protocol Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800/50">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-600 shadow-[0_0_10px_rgba(192,38,211,0.8)] animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-600">Module 1: Production Records</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white leading-none">
                        WIRE SYSTEMS
                    </h1>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-premium flex items-center justify-center gap-3 w-full sm:w-auto"
                    >
                        <Plus size={16} />
                        <span>ADD NEW ENTRY</span>
                    </button>
                    <button className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-500 flex items-center justify-center">
                        <Download size={18} />
                    </button>
                </div>
            </div>

            {/* Calibration Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {[
                    { label: 'Total Records', value: wireRecords.length, unit: 'LOGS' },
                    { label: 'Last Updated', value: '15.02.26', unit: 'UTC' },
                    { label: 'Next Scheduled', value: '02.03.26', unit: 'EXP', highlight: true },
                    { label: 'System Stability', value: '99.98', unit: '%' },
                ].map((stat, i) => (
                    <div key={i} className="technical-panel p-5 bg-zinc-50/30 dark:bg-zinc-900/10">
                        <div className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] mb-2">{stat.label}</div>
                        <div className={cn("text-2xl font-black mono flex items-baseline gap-1", stat.highlight ? "text-fuchsia-600" : "text-zinc-900 dark:text-white")}>
                            {stat.value}
                            <span className="text-[10px] font-black opacity-40">{stat.unit}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* High-Precision Ledger Table */}
            <div className="technical-panel overflow-hidden">
                <div className="p-5 border-b border-zinc-200 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-950/20 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-[10px] font-black opacity-30">$</div>
                        <input
                            type="text"
                            placeholder="SEARCH RECORDS..."
                            className="w-full bg-zinc-100/50 dark:bg-zinc-900/50 border border-transparent focus:border-fuchsia-500/30 rounded-[1px] px-8 py-2 text-[10px] font-bold uppercase tracking-widest focus:outline-none transition-all mono"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                            Filter
                        </button>
                        <div className="h-6 w-px bg-zinc-200 dark:border-zinc-800" />
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest px-2 py-1 bg-emerald-500/5 border border-emerald-500/10">
                            Connected
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50 dark:bg-zinc-900/30 border-b border-zinc-200 dark:border-zinc-800/50">
                                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">ID</th>
                                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Machine Section</th>
                                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Wire Type</th>
                                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Production (MT)</th>
                                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Date</th>
                                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Remark</th>
                                <th className="px-6 py-4 text-center text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/50 font-medium">
                            {wireRecords.map((record) => (
                                <tr key={record.id} className="hover:bg-fuchsia-500/5 dark:hover:bg-fuchsia-500/5 transition-colors group">
                                    <td className="px-6 py-4 mono text-[11px] text-zinc-400 dark:text-zinc-600 whitespace-nowrap">
                                        <Link href={`/wire-records/${record.id}`} className="hover:text-fuchsia-600 transition-colors">
                                            RE_0{record.id}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/wire-records/${record.id}`} className="text-[12px] font-black text-zinc-900 dark:text-zinc-200 uppercase tracking-tight hover:text-fuchsia-600 transition-colors cursor-pointer block">
                                            {record.machineName}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-black text-fuchsia-600 dark:text-fuchsia-400 py-0.5 border-b border-fuchsia-600/20">
                                            {record.wireType.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 mono text-[11px] font-black text-zinc-900 dark:text-zinc-300">
                                        {record.totalProduction.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 mono text-[10px] text-zinc-500 uppercase">
                                        {record.changeDate.replace('-', '.')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest leading-tight line-clamp-1 max-w-[150px]">
                                            {record.remark || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                            <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-500/80 uppercase tracking-widest">VERIFIED</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800/50 bg-zinc-50 dark:bg-zinc-900/20 flex items-center justify-between">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em]">Page navigation: lines 1 to 80</span>
                    <div className="flex gap-2">
                        <button className="p-1 px-3 border border-zinc-200 dark:border-zinc-800 text-[9px] font-black text-zinc-500 hover:text-zinc-900 dark:hover:text-white uppercase transition-colors">Prev</button>
                        <button className="p-1 px-3 border border-zinc-200 dark:border-zinc-800 text-[9px] font-black text-zinc-500 hover:text-zinc-900 dark:hover:text-white uppercase transition-colors">Next</button>
                    </div>
                </div>
            </div>
            {/* Data Entry Modal */}
            <RecordModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Log New Wire Change"
                fields={[
                    {
                        label: 'Machine Section',
                        name: 'machineName',
                        type: 'select',
                        options: currentMachineSections,
                        placeholder: 'Select Section'
                    },
                    {
                        label: 'Wire Type / Name',
                        name: 'wireType',
                        type: 'text',
                        placeholder: 'e.g. HEW-200 Primary'
                    },
                    {
                        label: 'Total Production (MT)',
                        name: 'totalProduction',
                        type: 'number',
                        placeholder: 'Enter cumulative production'
                    },
                    {
                        label: 'Change Date',
                        name: 'changeDate',
                        type: 'date'
                    },
                    {
                        label: 'Remark',
                        name: 'remark',
                        type: 'textarea',
                        placeholder: 'Optional notes'
                    },
                ]}
                onSubmit={(data) => {
                    console.log('New wire record entries:', data);
                    setIsModalOpen(false);
                    // In a real app, this would update database or state
                }}
            />
        </div>
    );
}
