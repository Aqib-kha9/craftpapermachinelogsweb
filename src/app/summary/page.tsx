'use client';

import React from 'react';
import { Layers, Activity, Clock, FileBarChart, CalendarDays, TrendingUp, AlertTriangle, BarChart2, ShieldAlert, RefreshCw } from 'lucide-react';
import { currentMachineTotalProduction } from '@/data/mockData';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface WireRecord {
    id: string;
    machineName: string;
    wireType: string;
    partyName: string;
    productionAtInstallation: number;
    productionAtRemoval: number | null;
    wireLifeMT: number | null;
    expectedLifeMT: number | null;
    changeDate: string;
    remark: string | null;
}

interface EquipmentRecord {
    id: string;
    groupName: string;
    equipmentName: string;
    downtimeMinutes: number;
    totalProduction: number;
    changeDate: string;
    productionImpact: 'Yes' | 'No' | 'Remark';
    remark: string | null;
}

export default function SummaryPage() {
    const [wireData, setWireData] = React.useState<WireRecord[]>([]);
    const [equipmentData, setEquipmentData] = React.useState<EquipmentRecord[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            // ... dispatch sync for global telemetry
            document.dispatchEvent(new Event('sync_telemetry'));
            const [wRes, eRes] = await Promise.all([
                fetch('/api/wire-records'),
                fetch('/api/equipment-records')
            ]);

            if (wRes.ok && eRes.ok) {
                const [wires, equips] = await Promise.all([
                    wRes.json(),
                    eRes.json()
                ]);
                setWireData(wires);
                setEquipmentData(equips);
            }
        } catch (error) {
            console.error("Failed to fetch summary data", error);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchAllData();
    }, []);

    const totalWireChanges = wireData.length;
    const totalEquipmentChanges = equipmentData.length;
    const totalDowntimeMinutes = equipmentData.reduce((sum, record) => sum + (record.downtimeMinutes || 0), 0);
    const currentProd = Math.max(
        0,
        ...wireData.map(w => w.productionAtInstallation),
        ...wireData.map(w => w.productionAtRemoval || 0),
        ...equipmentData.map(e => e.totalProduction)
    );

    const completedWires = wireData.filter(w => w.wireLifeMT);
    const avgWireLife = completedWires.length > 0
        ? Math.round(completedWires.reduce((sum, w) => sum + w.wireLifeMT!, 0) / completedWires.length)
        : 0;

    const metrics = [
        {
            title: "Total Prod.",
            value: currentProd > 1000 ? (currentProd / 1000).toFixed(1) + 'k' : currentProd,
            unit: "MT",
            icon: <Activity size={24} className="text-zinc-300 dark:text-zinc-600 group-hover:text-emerald-500 transition-colors" />,
            colorClass: "text-emerald-500"
        },
        {
            title: "Wire Changes",
            value: totalWireChanges,
            unit: "LOGS",
            icon: <Layers size={24} className="text-zinc-300 dark:text-zinc-600 group-hover:text-fuchsia-500 transition-colors" />,
            colorClass: "text-fuchsia-600"
        },
        {
            title: "Avg Wire Life",
            value: avgWireLife > 1000 ? (avgWireLife / 1000).toFixed(1) + 'k' : avgWireLife,
            unit: "MT",
            icon: <TrendingUp size={24} className="text-zinc-300 dark:text-zinc-600 group-hover:text-blue-500 transition-colors" />,
            colorClass: "text-blue-500"
        },
        {
            title: "Eq. Maint.",
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

    const activeWireAlerts = wireData
        .filter(w => !w.wireLifeMT && w.expectedLifeMT)
        .map(w => {
            const lifeUsed = currentProd - w.productionAtInstallation;
            const percentUsed = Math.round((lifeUsed / w.expectedLifeMT!) * 100);
            return { ...w, percentUsed };
        })
        .filter(w => w.percentUsed >= 90);

    const downtimeAlerts = equipmentData.filter(e => e.downtimeMinutes > 100);

    const downtimeEvents = [...equipmentData]
        .filter(r => r.downtimeMinutes > 0)
        .sort((a, b) => new Date(a.changeDate).getTime() - new Date(b.changeDate).getTime())
        .slice(-10);
    const maxDowntime = Math.max(...downtimeEvents.map(e => e.downtimeMinutes), 120);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800/50">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-600">Incohub Executive Dashboard</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white leading-none uppercase">
                        Monthly Summary
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchAllData}
                        disabled={isLoading}
                        className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-500 flex items-center justify-center flex-1 md:flex-none"
                    >
                        <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                    </button>
                    <div className="technical-panel px-4 py-2 flex items-center gap-3 bg-zinc-50/50 dark:bg-zinc-900/40">
                        <CalendarDays size={14} className="text-zinc-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-300">
                            {isLoading ? 'SYNCING_REGISTRY' : 'FEBRUARY 2024'}
                        </span>
                    </div>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
                {metrics.map((metric, i) => (
                    <div key={i} className="technical-panel p-5 bg-white/50 dark:bg-zinc-950/20 backdrop-blur-xl group hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-default flex flex-col justify-between overflow-hidden relative">
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-[2px] z-10 animate-pulse flex items-center justify-center">
                                <Activity size={12} className="text-zinc-400 animate-bounce" />
                            </div>
                        )}
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded-[2px] border border-zinc-100 dark:border-zinc-800/50 group-hover:scale-110 transition-transform">
                                {metric.icon}
                            </div>
                            <span className="text-[7px] font-black tracking-[0.3em] text-zinc-300 dark:text-zinc-800 uppercase">
                                KPI_0{i + 1}
                            </span>
                        </div>
                        <div>
                            <div className={`text-4xl lg:text-5xl font-black mono mb-1 tracking-tighter ${metric.colorClass}`}>
                                {metric.value}
                            </div>
                            <div className="flex items-end justify-between">
                                <div className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400">
                                    {metric.title}
                                </div>
                                <div className="text-[8px] font-black text-zinc-300 dark:text-zinc-700">{metric.unit}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Alert System */}
            {(activeWireAlerts.length > 0 || downtimeAlerts.length > 0) && (
                <div className="mt-8 space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 flex items-center gap-2">
                        <ShieldAlert size={14} /> System Alerts
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeWireAlerts.map((w, i) => (
                            <div key={`w-${i}`} className="p-4 border border-amber-500/30 bg-amber-500/5 flex items-start gap-4 animate-in fade-in">
                                <AlertTriangle className="text-amber-500 mt-0.5 shrink-0" size={16} />
                                <div>
                                    <div className="text-[11px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-1">
                                        Warning: Wire Life Critical
                                    </div>
                                    <div className="text-[10px] text-zinc-600 dark:text-zinc-400">
                                        <span className="font-bold text-zinc-900 dark:text-zinc-200">{w.wireType}</span> on <span className="font-bold text-zinc-900 dark:text-zinc-200">{w.machineName}</span> has used {w.percentUsed}% of its expected life.
                                    </div>
                                </div>
                            </div>
                        ))}
                        {downtimeAlerts.map((e, i) => (
                            <div key={`e-${i}`} className="p-4 border border-red-500/30 bg-red-500/5 flex items-start gap-4 animate-in fade-in">
                                <AlertTriangle className="text-red-500 mt-0.5 shrink-0" size={16} />
                                <div>
                                    <div className="text-[11px] font-black text-red-600 dark:text-red-500 uppercase tracking-widest mb-1">
                                        Critical: High Downtime
                                    </div>
                                    <div className="text-[10px] text-zinc-600 dark:text-zinc-400">
                                        <span className="font-bold text-zinc-900 dark:text-zinc-200">{e.equipmentName}</span> on <span className="font-bold text-zinc-900 dark:text-zinc-200">{e.groupName}</span> recorded a severe downtime of {e.downtimeMinutes} mins.
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Detailed Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                {/* Recent Activity Feed */}
                <div className="technical-panel p-6 bg-white/50 dark:bg-zinc-950/20 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">Recent System Activity</h3>
                        <Activity size={14} className="text-zinc-300 dark:text-zinc-700" />
                    </div>
                    <div className="space-y-4">
                        {[...wireData, ...equipmentData]
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
                        {Array.from(new Set([...wireData.map(r => r.machineName), ...equipmentData.map(r => r.groupName)])).map((section, i) => {
                            const wireCount = wireData.filter(r => r.machineName === section).length;
                            const eqCount = equipmentData.filter(r => r.groupName === section).length;
                            const total = wireCount + eqCount;
                            const totalLogs = wireData.length + equipmentData.length;
                            const percentage = totalLogs > 0 ? Math.round((total / totalLogs) * 100) : 0;

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

                {/* Downtime Trend Graph */}
                <div className="technical-panel p-6 bg-white/50 dark:bg-zinc-950/20 backdrop-blur-xl flex flex-col h-[300px]">
                    <div className="flex items-center justify-between mb-6 shrink-0">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">Downtime Trend</h3>
                        <BarChart2 size={14} className="text-zinc-300 dark:text-zinc-700" />
                    </div>
                    <div className="flex-1 flex items-end justify-between gap-1 sm:gap-2 pt-4 border-b border-zinc-200 dark:border-zinc-800 relative pb-10">
                        {downtimeEvents.length === 0 ? (
                            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-zinc-400">No downtime recorded</div>
                        ) : downtimeEvents.map((e, i) => (
                            <div key={i} className="group relative flex flex-col items-center justify-end w-full h-[90%]">
                                <div
                                    className={cn("w-full bg-amber-500/80 hover:bg-amber-400 transition-all rounded-t-[1px]", e.downtimeMinutes > 100 ? "bg-red-500/80 hover:bg-red-400" : "")}
                                    style={{ height: `${(e.downtimeMinutes / maxDowntime) * 100}%` }}
                                />
                                <div className="absolute -top-6 bg-zinc-900 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                    {e.downtimeMinutes}m
                                </div>
                                <div className="absolute -bottom-8 text-[8px] font-bold text-zinc-500 uppercase -rotate-45 whitespace-nowrap origin-left">
                                    {e.changeDate.slice(5).replace('-', '/')}
                                </div>
                            </div>
                        ))}
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
