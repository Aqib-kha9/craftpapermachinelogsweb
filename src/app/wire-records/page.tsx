'use client';

import React, { useState, useEffect } from 'react';
import {
    Layers,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Download,
    Calendar,
    ClipboardList,
    RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { RecordModal } from '@/components/layout/RecordModal';
import Link from 'next/link';

interface MasterDataItem {
    category: string;
    value: string;
    isActive: boolean;
}

interface WireRecord {
    id: string;
    machineName: string;
    wireType: string;
    partyName: string;
    productionAtInstallation: number;
    productionAtRemoval: number | null;
    wireLifeMT: number | null;
    expectedLifeMT: number | null;
    wireCost: number | null;
    changeDate: string;
    remark: string | null;
}

export default function WireRecordsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [sectionFilter, setSectionFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // DB state
    const [records, setRecords] = useState<WireRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [masterDataSections, setMasterDataSections] = useState<string[]>([]);
    const [masterDataWireTypes, setMasterDataWireTypes] = useState<string[]>([]);
    const [masterDataParties, setMasterDataParties] = useState<string[]>([]);

    const fetchMasterData = async () => {
        try {
            const res = await fetch('/api/master-data');
            if (res.ok) {
                const data: MasterDataItem[] = await res.json();
                setMasterDataSections(data.filter(item => item.category === 'MACHINE_SECTION' && item.isActive).map(item => item.value));
                setMasterDataWireTypes(data.filter(item => item.category === 'WIRE_TYPE' && item.isActive).map(item => item.value));
                setMasterDataParties(data.filter(item => item.category === 'PARTY_NAME' && item.isActive).map(item => item.value));
            }
        } catch (error) {
            console.error('Failed to fetch master data', error);
        }
    };

    const fetchRecords = async () => {
        setIsLoading(true);
        try {
            document.dispatchEvent(new Event('sync_telemetry'));
            const res = await fetch('/api/wire-records');
            if (res.ok) {
                const data = await res.json();
                setRecords(data);
            }
        } catch (error) {
            console.error('Failed to fetch wire records', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
        fetchMasterData();
    }, []);

    const filteredRecords = records.filter(record => {
        const textToSearch = `${record.machineName} ${record.wireType} ${record.partyName || ''} ${record.remark || ''}`.toLowerCase();
        if (searchTerm && !textToSearch.includes(searchTerm.toLowerCase())) return false;
        if (sectionFilter && record.machineName !== sectionFilter) return false;
        if (dateRange.start && new Date(record.changeDate) < new Date(dateRange.start)) return false;
        if (dateRange.end && new Date(record.changeDate) > new Date(dateRange.end)) return false;
        return true;
    });

    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
    const paginatedRecords = filteredRecords.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset page to 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, sectionFilter, dateRange]);

    const handleExport = () => {
        const headers = ['ID', 'Machine Section', 'Wire Type', 'Party', 'Install (MT)', 'Removal (MT)', 'Life (MT)', 'Date', 'Remark'];
        const csvContent = [
            headers.join(','),
            ...filteredRecords.map(row => {
                const lifeMT = row.wireLifeMT || (row.productionAtRemoval ? row.productionAtRemoval - row.productionAtInstallation : '-');
                return [
                    `RE_0${row.id.substring(0, 4)}`,
                    `"${row.machineName}"`,
                    `"${row.wireType}"`,
                    `"${row.partyName || '-'}"`,
                    row.productionAtInstallation,
                    row.productionAtRemoval || '-',
                    lifeMT,
                    row.changeDate,
                    `"${row.remark || ''}"`
                ].join(',');
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `wire_records_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleAddRecord = async (data: any) => {
        try {
            const res = await fetch('/api/wire-records', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    machineName: data.machineName,
                    wireType: data.wireType,
                    partyName: data.partyName,
                    productionAtInstallation: data.productionAtInstallation,
                    productionAtRemoval: data.productionAtRemoval,
                    wireCost: data.wireCost,
                    changeDate: data.changeDate,
                    remark: data.remark || ""
                })
            });
            if (res.ok) {
                fetchRecords();
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error('Failed to create record', error);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
            {/* Module Protocol Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)] animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">Incohub Module 1: Production</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground leading-none">
                        WIRE SYSTEMS
                    </h1>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button onClick={fetchRecords} disabled={isLoading} className="p-2 border border-border hover:bg-background/80 transition-colors text-zinc-500 flex items-center justify-center">
                        <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-premium flex items-center justify-center gap-3 w-full sm:w-auto"
                    >
                        <Plus size={16} />
                        <span>ADD NEW ENTRY</span>
                    </button>
                    <button onClick={handleExport} className="p-2 border border-border hover:bg-background/80 transition-colors text-zinc-500 flex items-center justify-center">
                        <Download size={18} />
                    </button>
                </div>
            </div>

            {/* Calibration Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {[
                    { label: 'Total Records', value: records.length, unit: 'LOGS' },
                    { label: 'Avg Wire Life', value: records.length > 0 ? Math.round(records.reduce((acc, curr) => acc + (curr.wireLifeMT || 0), 0) / records.filter(r => r.wireLifeMT).length || 1) : 0, unit: 'MT' },
                    { label: 'Active Wires', value: records.filter(r => !r.productionAtRemoval).length, unit: 'UNITS', highlight: true },
                    { label: 'System Source', value: isLoading ? 'SYNCING' : 'NEON', unit: 'DB' },
                ].map((stat, i) => (
                    <div key={i} className="technical-panel p-5">
                        <div className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] mb-2">{stat.label}</div>
                        <div className={cn("text-2xl font-black mono flex items-baseline gap-1", stat.highlight ? "text-primary" : "text-foreground")}>
                            {stat.value}
                            <span className="text-[10px] font-black opacity-40">{stat.unit}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* High-Precision Ledger Table */}
            <div className="technical-panel overflow-hidden">
                <div className="p-5 border-b border-zinc-200 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-950/20 backdrop-blur-xl flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-sm group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-[10px] font-black opacity-30"><Search size={14} /></div>
                            <input
                                type="text"
                                placeholder="SEARCH WIRE NAME OR PARTY..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-background border border-border focus:border-primary/30 rounded-[1px] px-8 py-2 text-[10px] font-bold uppercase tracking-widest focus:outline-none transition-all mono text-foreground"
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
                            <div className="h-6 w-px bg-zinc-200 dark:border-zinc-800 hidden sm:block" />
                            <span className="hidden sm:inline-flex text-[9px] font-black text-emerald-500 uppercase tracking-widest px-2 py-1 bg-emerald-500/5 border border-emerald-500/10">
                                {isLoading ? 'SYNCING...' : 'Connected'}
                            </span>
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
                                    className="w-full bg-background border border-border rounded-[1px] px-3 py-2 text-[10px] font-bold text-foreground uppercase tracking-wider focus:outline-none focus:border-primary"
                                >
                                    <option value="">All Sections</option>
                                    {masterDataSections.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Start Date</label>
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                    className="w-full bg-background border border-border rounded-[1px] px-3 py-2 text-[10px] font-bold text-foreground uppercase tracking-wider focus:outline-none focus:border-primary mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">End Date</label>
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                    className="w-full bg-background border border-border rounded-[1px] px-3 py-2 text-[10px] font-bold text-foreground uppercase tracking-wider focus:outline-none focus:border-primary mono"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50 dark:bg-zinc-900/30 border-b border-zinc-200 dark:border-zinc-800/50">
                                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">ID</th>
                                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Machine Section</th>
                                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Wire Type</th>
                                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Party</th>
                                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Install (MT)</th>
                                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Removal (MT)</th>
                                <th className="px-6 py-4 text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em]">Life (MT)</th>
                                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Date</th>
                                <th className="px-6 py-4 text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em]">Cost</th>
                                <th className="px-6 py-4 text-center text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/50 font-medium">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={10} className="px-6 py-8 text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest animate-pulse">
                                        Loading Records...
                                    </td>
                                </tr>
                            ) : paginatedRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-6 py-8 text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                        No matching records found
                                    </td>
                                </tr>
                            ) : paginatedRecords.map((record) => (
                                <tr key={record.id} className="hover:bg-fuchsia-500/5 dark:hover:bg-fuchsia-500/5 transition-colors group">
                                    <td className="px-6 py-4 mono text-[11px] text-zinc-400 dark:text-zinc-600 whitespace-nowrap">
                                        <Link href={`/wire-records/${record.id}`} className="hover:text-fuchsia-600 transition-colors">
                                            RE_{record.id.substring(0, 4)}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/wire-records/${record.id}`} className="text-[12px] font-black text-zinc-900 dark:text-zinc-200 uppercase tracking-tight hover:text-fuchsia-600 transition-colors cursor-pointer block">
                                            {record.machineName}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-black text-primary py-0.5 border-b border-primary/20">
                                            {record.wireType.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-bold text-foreground uppercase tracking-widest leading-tight">
                                            {record.partyName}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 mono text-[11px] font-black text-foreground">
                                        {record.productionAtInstallation.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 mono text-[11px] font-black text-foreground">
                                        {record.productionAtRemoval ? record.productionAtRemoval.toLocaleString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 mono text-[11px] font-black text-emerald-600 dark:text-emerald-500">
                                        {record.wireLifeMT
                                            ? record.wireLifeMT.toLocaleString()
                                            : (record.productionAtRemoval ? (record.productionAtRemoval - record.productionAtInstallation).toLocaleString() : '-')}
                                    </td>
                                    <td className="px-6 py-4 mono text-[10px] text-zinc-500 uppercase">
                                        {record.changeDate.replace(/-/g, '.')}
                                    </td>
                                    <td className="px-6 py-4 mono text-[11px] font-black text-emerald-600 dark:text-emerald-500">
                                        {record.wireCost ? record.wireCost.toLocaleString() : '--'}
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

                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800/50 bg-zinc-50 dark:bg-zinc-900/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em]">
                        Showing {filteredRecords.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredRecords.length)} of {filteredRecords.length} records
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-1 px-3 border border-zinc-200 dark:border-zinc-800 text-[9px] font-black text-zinc-500 hover:text-zinc-900 dark:hover:text-white uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            Prev
                        </button>
                        <span className="flex items-center px-2 text-[10px] font-black text-zinc-400">
                            PAGE {currentPage}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="p-1 px-3 border border-zinc-200 dark:border-zinc-800 text-[9px] font-black text-zinc-500 hover:text-zinc-900 dark:hover:text-white uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            Next
                        </button>
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
                        options: masterDataSections,
                        placeholder: 'Select Section'
                    },
                    {
                        label: 'Wire Type / Name',
                        name: 'wireType',
                        type: 'select',
                        options: masterDataWireTypes,
                        placeholder: 'Select Wire Type'
                    },
                    {
                        label: 'Party / Vendor Name',
                        name: 'partyName',
                        type: 'select',
                        options: masterDataParties,
                        placeholder: 'Select Vendor'
                    },
                    {
                        label: 'Production at Installation (MT)',
                        name: 'productionAtInstallation',
                        type: 'number',
                        placeholder: 'Enter production at install'
                    },
                    {
                        label: 'Production at Removal (MT)',
                        name: 'productionAtRemoval',
                        type: 'number',
                        placeholder: 'Leave blank if currently active'
                    },
                    {
                        label: 'Wire Cost (Optional)',
                        name: 'wireCost',
                        type: 'number',
                        placeholder: 'Enter wire cost'
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
                onSubmit={handleAddRecord}
            />
        </div>
    );
}
