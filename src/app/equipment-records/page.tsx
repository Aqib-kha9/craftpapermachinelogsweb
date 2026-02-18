'use client';

import React from 'react';
import {
    Settings,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Download,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { equipmentRecords, currentMachineSections, currentEquipmentNames } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { RecordModal } from '@/components/layout/RecordModal';
import Link from 'next/link';

export default function EquipmentRecordsPage() {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
            {/* Strategic Protocol Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800/50">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-600 shadow-[0_0_10px_rgba(168,85,247,0.8)] animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-600">Module 2: Equipment Logs</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white leading-none uppercase">
                        Equipment Records
                    </h1>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-premium flex items-center justify-center gap-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 w-full sm:w-auto"
                    >
                        <Plus size={16} />
                        <span>LOG MAINTENANCE</span>
                    </button>
                    <button className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-500 flex items-center justify-center">
                        <Download size={18} />
                    </button>
                </div>
            </div>

            {/* High-Precision Registry Table */}
            <div className="technical-panel overflow-hidden">
                <div className="p-5 border-b border-zinc-200 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-950/20 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-[10px] font-black opacity-30">$</div>
                        <input
                            type="text"
                            placeholder="SEARCH RECORDS..."
                            className="w-full bg-zinc-100/50 dark:bg-zinc-900/50 border border-transparent focus:border-zinc-400 dark:focus:border-zinc-600 rounded-[1px] px-8 py-2 text-[10px] font-bold uppercase tracking-widest focus:outline-none transition-all mono"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                            Filter
                        </button>
                        <div className="h-6 w-px bg-zinc-200 dark:border-zinc-800" />
                        <span className="text-[9px] font-black text-purple-500 uppercase tracking-widest px-2 py-1 bg-purple-500/5 border border-purple-500/10">
                            Tracking Active
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50 dark:bg-zinc-900/30 border-b border-zinc-200 dark:border-zinc-800/50">
                                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">ID</th>
                                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Machine Group / Section</th>
                                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Equipment / Part Name</th>
                                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Impact</th>
                                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Production (MT)</th>
                                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Date</th>
                                <th className="px-6 py-4 text-center text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Remark</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/50 font-medium">
                            {equipmentRecords.map((record) => (
                                <tr key={record.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors group">
                                    <td className="px-6 py-4 mono text-[11px] text-zinc-400 dark:text-zinc-600 whitespace-nowrap">
                                        <Link href={`/equipment-records/${record.id}`} className="hover:text-purple-600 transition-colors">
                                            EQ_STR_0{record.id}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/equipment-records/${record.id}`} className="flex items-center gap-3 group/link">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                                            <div className="text-[12px] font-black text-zinc-900 dark:text-zinc-200 uppercase tracking-tight group-hover/link:text-purple-600 transition-colors">
                                                {record.groupName}
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-black text-zinc-600 dark:text-zinc-400 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-[1px]">
                                            {record.equipmentName.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={cn(
                                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[1px] text-[9px] font-black uppercase tracking-widest",
                                            record.productionImpact === 'Yes' && "bg-red-500/10 text-red-600 border border-red-500/20",
                                            record.productionImpact === 'No' && "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
                                            record.productionImpact === 'Remark' && "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                        )}>
                                            {record.productionImpact === 'Yes' && 'Critical Impact'}
                                            {record.productionImpact === 'No' && 'No Downtime'}
                                            {record.productionImpact === 'Remark' && 'Needs Sync'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 mono text-[11px] font-black text-zinc-900 dark:text-zinc-300">
                                        {record.totalProduction.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 mono text-[10px] text-zinc-500 uppercase">
                                        {record.changeDate.replace('-', '.')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest line-clamp-1">
                                            {record.remark || 'N/A'}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Technical Foot Row */}
                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800/50 bg-zinc-50 dark:bg-zinc-900/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em]">Version: 2.4</span>
                        <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 sm:block hidden" />
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest sm:block hidden">Records are up to date</span>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button className="px-3 py-1 bg-zinc-900 dark:bg-zinc-800 text-white text-[9px] font-black uppercase tracking-widest w-full sm:w-auto">
                            EXPORT DATA
                        </button>
                    </div>
                </div>
            </div>

            {/* System Intelligence Banner */}
            <div className="p-6 technical-panel bg-zinc-900 border-none flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/5 flex items-center justify-center text-zinc-400 border border-white/10">
                        <AlertCircle size={18} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-1">Downtime Risk: Low</div>
                        <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mono">Accuracy: 99.98%</div>
                    </div>
                </div>
                <div className="hidden lg:flex gap-12">
                    <div className="text-right">
                        <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">ISO_PROTOCOL</div>
                        <div className="text-xs font-black text-white mt-1 mono">ST_0842_SEC</div>
                    </div>
                </div>
            </div>
            {/* Data Entry Modal */}
            <RecordModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Log Equipment Maintenance"
                fields={[
                    {
                        label: 'Machine Group / Section',
                        name: 'groupName',
                        type: 'select',
                        options: currentMachineSections,
                        placeholder: 'Select Group'
                    },
                    {
                        label: 'Equipment / Part Name',
                        name: 'equipmentName',
                        type: 'select',
                        options: currentEquipmentNames,
                        placeholder: 'Select Equipment'
                    },
                    {
                        label: 'Production Impact',
                        name: 'productionImpact',
                        type: 'select',
                        options: ['Yes', 'No', 'Remark'],
                        placeholder: 'Select Impact'
                    },
                    {
                        label: 'Production (at change)',
                        name: 'totalProduction',
                        type: 'number',
                        placeholder: 'Production in Metric Tons'
                    },
                    {
                        label: 'Change Date',
                        name: 'changeDate',
                        type: 'date'
                    },
                    {
                        label: 'Remark / Reason',
                        name: 'remark',
                        type: 'textarea',
                        placeholder: 'Reason for change'
                    },
                ]}
                onSubmit={(data) => {
                    console.log('New equipment record entry:', data);
                    setIsModalOpen(false);
                }}
            />
        </div>
    );
}
