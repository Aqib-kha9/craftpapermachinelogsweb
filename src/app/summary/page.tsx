import React from 'react';
import { Layers, Activity, Clock, FileBarChart, CalendarDays } from 'lucide-react';
import { wireRecords, equipmentRecords } from '@/data/mockData';
import Link from 'next/link';

export default function SummaryPage() {
    // Calculate simple KPI metrics
    const totalWireChanges = wireRecords.length;
    const totalEquipmentChanges = equipmentRecords.length;
    const totalDowntimeMinutes = equipmentRecords.reduce((sum, record) => sum + (record.downtimeMinutes || 0), 0);

    const metrics = [
        {
            title: "Total Wire Changes",
            value: totalWireChanges,
            unit: "LOGS",
            icon: <Layers size={24} className="text-zinc-300 dark:text-zinc-600 group-hover:text-fuchsia-500 transition-colors" />,
            colorClass: "text-fuchsia-600"
        },
        {
            title: "Equipment Maintenance",
            value: totalEquipmentChanges,
            unit: "LOGS",
            icon: <Activity size={24} className="text-zinc-300 dark:text-zinc-600 group-hover:text-purple-500 transition-colors" />,
            colorClass: "text-purple-600"
        },
        {
            title: "Total Downtime",
            value: totalDowntimeMinutes,
            unit: "MIN",
            icon: <Clock size={24} className="text-zinc-300 dark:text-zinc-600 group-hover:text-amber-500 transition-colors" />,
            colorClass: "text-amber-500"
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800/50">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-600">Executive Dashboard</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white leading-none uppercase">
                        Monthly Summary
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <div className="technical-panel px-4 py-2 flex items-center gap-3 bg-zinc-50/50 dark:bg-zinc-900/40">
                        <CalendarDays size={14} className="text-zinc-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-300">
                            Current Period
                        </span>
                    </div>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-8">
                {metrics.map((metric, i) => (
                    <div key={i} className="technical-panel p-6 md:p-8 bg-white/50 dark:bg-zinc-950/20 backdrop-blur-xl group hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-default">
                        <div className="flex justify-between items-start mb-8">
                            <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-[2px] border border-zinc-100 dark:border-zinc-800/50 group-hover:scale-110 transition-transform">
                                {metric.icon}
                            </div>
                            <span className="text-[8px] font-black tracking-[0.3em] text-zinc-300 dark:text-zinc-800 uppercase">
                                KPI_0{i + 1}
                            </span>
                        </div>
                        <div className={`text-5xl md:text-6xl font-black mono mb-2 tracking-tighter ${metric.colorClass}`}>
                            {metric.value}
                        </div>
                        <div className="flex items-end justify-between">
                            <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                                {metric.title}
                            </div>
                            <div className="text-[9px] font-black text-zinc-300 dark:text-zinc-700">{metric.unit}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Detailed Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Recent Activity Feed */}
                <div className="technical-panel p-6 bg-white/50 dark:bg-zinc-950/20 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">Recent System Activity</h3>
                        <Activity size={14} className="text-zinc-300 dark:text-zinc-700" />
                    </div>
                    <div className="space-y-4">
                        {[...wireRecords, ...equipmentRecords]
                            .sort((a, b) => new Date(b.changeDate).getTime() - new Date(a.changeDate).getTime())
                            .slice(0, 4)
                            .map((record, i) => {
                                const isWire = 'wireType' in record;
                                return (
                                    <div key={i} className="flex gap-4 p-3 border border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                        <div className={`p-2 h-fit ${isWire ? 'bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-600' : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600'}`}>
                                            {isWire ? <Layers size={14} /> : <Activity size={14} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">
                                                    {isWire ? record.machineName : record.groupName}
                                                </span>
                                                <span className="text-[9px] font-black text-zinc-400 mono">{record.changeDate}</span>
                                            </div>
                                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                                {isWire ? `Wire Changed: ${record.wireType}` : `Equipment Maintenance: ${record.equipmentName}`}
                                            </div>
                                            {record.remark && (
                                                <div className="text-[9px] font-medium text-zinc-400 border-l-2 border-zinc-200 dark:border-zinc-800 pl-2">
                                                    "{record.remark}"
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>

                {/* Section Breakdown */}
                <div className="technical-panel p-6 bg-white/50 dark:bg-zinc-950/20 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">Maintenance by Section</h3>
                        <Layers size={14} className="text-zinc-300 dark:text-zinc-700" />
                    </div>
                    <div className="space-y-4">
                        {Array.from(new Set([...wireRecords.map(r => r.machineName), ...equipmentRecords.map(r => r.groupName)])).map((section, i) => {
                            const wireCount = wireRecords.filter(r => r.machineName === section).length;
                            const eqCount = equipmentRecords.filter(r => r.groupName === section).length;
                            const total = wireCount + eqCount;
                            const percentage = Math.round((total / (wireRecords.length + equipmentRecords.length)) * 100);

                            return (
                                <div key={i} className="mb-4 last:mb-0">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-300">{section}</span>
                                        <div className="flex gap-3 text-[9px] font-black text-zinc-400 uppercase">
                                            <span>W: {wireCount}</span>
                                            <span>E: {eqCount}</span>
                                        </div>
                                    </div>
                                    <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden flex">
                                        <div className="h-full bg-fuchsia-500" style={{ width: `${(wireCount / total) * percentage}%` }} />
                                        <div className="h-full bg-purple-500" style={{ width: `${(eqCount / total) * percentage}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800/50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/history" className="technical-panel p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
                    <div className="flex items-center gap-3">
                        <FileBarChart size={16} className="text-zinc-400 group-hover:text-emerald-500 transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-300">Full Report</span>
                    </div>
                    <span className="text-[10px] text-zinc-300 group-hover:text-emerald-500 transition-colors">→</span>
                </Link>
                <Link href="/wire-records" className="technical-panel p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
                    <div className="flex items-center gap-3">
                        <Layers size={16} className="text-zinc-400 group-hover:text-fuchsia-500 transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-300">Wires</span>
                    </div>
                    <span className="text-[10px] text-zinc-300 group-hover:text-fuchsia-500 transition-colors">→</span>
                </Link>
                <Link href="/equipment-records" className="technical-panel p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
                    <div className="flex items-center gap-3">
                        <Activity size={16} className="text-zinc-400 group-hover:text-purple-500 transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-300">Equipment</span>
                    </div>
                    <span className="text-[10px] text-zinc-300 group-hover:text-purple-500 transition-colors">→</span>
                </Link>
            </div>
        </div>
    );
}
