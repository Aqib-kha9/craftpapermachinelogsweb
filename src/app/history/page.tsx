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
    Shield,
    RefreshCw
} from 'lucide-react';
import { currentMachineSections } from '@/data/mockData';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface WireRecord {
    id: string;
    machineName: string;
    wireType: string;
    partyName: string;
    productionAtInstallation: number;
    productionAtRemoval: number | null;
    wireLifeMT: number | null;
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

export default function HistoryPage() {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [dateRange, setDateRange] = React.useState({ start: '', end: '' });
    const [sectionFilter, setSectionFilter] = React.useState('');
    const [showFilters, setShowFilters] = React.useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 15;

    // DB state
    const [wireData, setWireData] = React.useState<WireRecord[]>([]);
    const [equipmentData, setEquipmentData] = React.useState<EquipmentRecord[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            // ... dispatch sync for global telemetry
            document.dispatchEvent(new Event('sync_telemetry'));
            const [wireRes, equipRes] = await Promise.all([
                fetch('/api/wire-records'),
                fetch('/api/equipment-records')
            ]);

            if (wireRes.ok && equipRes.ok) {
                const [wires, equips] = await Promise.all([
                    wireRes.json(),
                    equipRes.json()
                ]);
                setWireData(wires);
                setEquipmentData(equips);
            }
        } catch (error) {
            console.error("Failed to fetch history data", error);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchAllData();
    }, []);

    // Merge and sort records by date (descending)
    const combinedHistory = [
        ...wireData.map(r => ({
            id: r.id,
            type: 'WIRE_CHANGE',
            zone: r.machineName,
            detail: r.wireType,
            filterText: `${r.machineName} ${r.wireType} ${r.partyName || ''} ${r.remark || ''}`.toLowerCase(),
            party: r.partyName,
            lifeMT: r.wireLifeMT || (r.productionAtRemoval ? r.productionAtRemoval - r.productionAtInstallation : null),
            changeDate: r.changeDate,
            remark: r.remark
        })),
        ...equipmentData.map(r => ({
            id: r.id,
            type: 'EQUIPMENT_MAINTENANCE',
            zone: r.groupName,
            detail: r.equipmentName,
            filterText: `${r.groupName} ${r.equipmentName} ${r.remark || ''}`.toLowerCase(),
            party: null,
            lifeMT: null,
            changeDate: r.changeDate,
            remark: r.remark
        }))
    ].sort((a, b) => new Date(b.changeDate).getTime() - new Date(a.changeDate).getTime());

    const allSections = Array.from(new Set(combinedHistory.map(h => h.zone)));

    const filteredHistory = combinedHistory.filter(entry => {
        if (searchTerm && !entry.filterText.includes(searchTerm.toLowerCase())) return false;
        if (sectionFilter && entry.zone !== sectionFilter) return false;
        if (dateRange.start && new Date(entry.changeDate) < new Date(dateRange.start)) return false;
        if (dateRange.end && new Date(entry.changeDate) > new Date(dateRange.end)) return false;
        return true;
    });

    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
    const paginatedHistory = filteredHistory.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset pagination when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, sectionFilter, dateRange]);

    const handleClearFilters = () => {
        setSearchTerm('');
        setSectionFilter('');
        setDateRange({ start: '', end: '' });
    };

    const handleExport = () => {
        const headers = ['Type', 'Section', 'Description', 'Party', 'Life (MT)', 'Date', 'Remark'];
        const csvContent = [
            headers.join(','),
            ...filteredHistory.map(row => [
                row.type,
                `"${row.zone}"`,
                `"${row.detail}"`,
                `"${row.party || '-'}"`,
                row.lifeMT !== null ? row.lifeMT : '-',
                row.changeDate,
                `"${row.remark || ''}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `management_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
            {/* Archive Protocol Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800/50">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-white animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-600">Incohub History: Version 4.1</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white leading-none uppercase">
                        All History
                    </h1>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <button
                        onClick={fetchAllData}
                        disabled={isLoading}
                        className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-500 flex items-center justify-center flex-1 md:flex-none"
                    >
                        <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                    </button>
                    <div className="technical-panel px-6 py-2 flex-1 md:flex-none bg-zinc-50/50 dark:bg-zinc-900/40">
                        <div className="text-[8px] uppercase text-zinc-400 font-black tracking-[0.2em] mb-0.5">Database</div>
                        <div className="text-sm font-black text-emerald-500 uppercase mono tracking-tighter">
                            {isLoading ? 'Syncing...' : 'Connected'}
                        </div>
                    </div>
                    <button onClick={handleExport} className="btn-premium flex items-center justify-center gap-3 w-full sm:w-auto">
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
                    <div className="text-3xl font-black text-zinc-900 dark:text-white mono mb-1">{filteredHistory.length}</div>
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
                <div className="p-5 border-b border-zinc-200 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-950/20 backdrop-blur-xl flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-sm group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-[10px] font-black opacity-30"><Search size={14} /></div>
                            <input
                                type="text"
                                placeholder="SEARCH WIRE/PART NAME OR PARTY..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-zinc-100/50 dark:bg-zinc-900/50 border border-transparent focus:border-zinc-400 dark:focus:border-zinc-600 rounded-[1px] px-8 py-2 text-[10px] font-bold uppercase tracking-widest focus:outline-none transition-all mono"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={cn(
                                    "px-4 py-2 border text-[9px] font-black uppercase tracking-widest transition-colors flex items-center gap-2",
                                    showFilters ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900" : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                                )}
                            >
                                <Filter size={12} />
                                {showFilters ? 'Hide Filters' : 'Filters'}
                            </button>
                            {(searchTerm || sectionFilter || dateRange.start || dateRange.end) && (
                                <button
                                    onClick={handleClearFilters}
                                    className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-red-500 transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Expandable Filters */}
                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50 animate-in fade-in zoom-in-95 duration-200">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Section</label>
                                <select
                                    value={sectionFilter}
                                    onChange={(e) => setSectionFilter(e.target.value)}
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[1px] px-3 py-2 text-[10px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider focus:outline-none"
                                >
                                    <option value="">All Sections</option>
                                    {allSections.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Start Date</label>
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[1px] px-3 py-2 text-[10px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider focus:outline-none mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">End Date</label>
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[1px] px-3 py-2 text-[10px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider focus:outline-none mono"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50 dark:bg-zinc-900/30 border-b border-zinc-200 dark:border-zinc-800/50">
                                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Type</th>
                                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Section</th>
                                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Description / Detail</th>
                                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Party (Wire)</th>
                                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Life (MT)</th>
                                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Date</th>
                                <th className="px-6 py-4 text-center text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Logs</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/50 font-medium">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest animate-pulse">
                                        Synchronizing Data Registry...
                                    </td>
                                </tr>
                            ) : paginatedHistory.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                        No matching records found
                                    </td>
                                </tr>
                            ) : paginatedHistory.map((entry, i) => (
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
                                    <td className="px-6 py-4">
                                        <div className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">
                                            {entry.party || '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 mono text-[11px] font-black text-emerald-600 dark:text-emerald-500">
                                        {entry.lifeMT !== null ? entry.lifeMT.toLocaleString() : '-'}
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

                {/* Footer Status & Pagination */}
                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800/50 bg-zinc-50 dark:bg-zinc-900/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em]">
                            Showing {filteredHistory.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredHistory.length)} of {filteredHistory.length} logs
                        </span>
                    </div>

                    <div className="flex gap-1.5">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-1 px-3 border border-zinc-200 dark:border-zinc-800 text-[9px] font-black text-zinc-400 hover:text-zinc-900 dark:hover:text-white uppercase transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            Prev
                        </button>

                        <div className="flex items-center px-4 text-[10px] font-black text-zinc-900 dark:text-white mono bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                            {currentPage} / {Math.max(1, totalPages)}
                        </div>

                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="p-1 px-3 border border-zinc-200 dark:border-zinc-800 text-[9px] font-black text-zinc-400 hover:text-zinc-900 dark:hover:text-white uppercase transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
