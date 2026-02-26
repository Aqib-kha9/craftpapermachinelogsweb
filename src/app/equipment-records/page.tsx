'use client';

import React, { useState, useEffect } from 'react';
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
    Info,
    RefreshCw,
    ArrowRight
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

interface EquipmentRecord {
    id: string;
    groupName: string;
    equipmentName: string;
    downtimeMinutes: number;
    totalProduction: number;
    changeDate: string;
    productionImpact: 'Yes' | 'No' | 'Remark';
    downtimeCategory?: string | null;
    maintenanceCost?: number | null;
    sparePartUsed?: string | null;
    technicianName?: string | null;
    remark: string | null;
}

export default function EquipmentRecordsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [sectionFilter, setSectionFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // DB state
    const [records, setRecords] = useState<EquipmentRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [masterDataSections, setMasterDataSections] = useState<string[]>([]);
    const [masterDataEquipment, setMasterDataEquipment] = useState<string[]>([]);

    const fetchMasterData = async () => {
        try {
            const res = await fetch('/api/master-data');
            if (res.ok) {
                const data: MasterDataItem[] = await res.json();
                setMasterDataSections(data.filter(item => item.category === 'MACHINE_SECTION' && item.isActive).map(item => item.value));
                setMasterDataEquipment(data.filter(item => item.category === 'EQUIPMENT_NAME' && item.isActive).map(item => item.value));
            }
        } catch (error) {
            console.error('Failed to fetch master data', error);
        }
    };

    const fetchRecords = async () => {
        setIsLoading(true);
        try {
            document.dispatchEvent(new Event('sync_telemetry'));
            const res = await fetch('/api/equipment-records');
            if (res.ok) {
                const data = await res.json();
                setRecords(data);
            }
        } catch (error) {
            console.error('Failed to fetch equipment records', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
        fetchMasterData();
    }, []);

    const filteredRecords = records.filter(record => {
        const textToSearch = `${record.groupName} ${record.equipmentName} ${record.remark || ''}`.toLowerCase();
        if (searchTerm && !textToSearch.includes(searchTerm.toLowerCase())) return false;
        if (sectionFilter && record.groupName !== sectionFilter) return false;
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
        const headers = ['ID', 'Machine Group', 'Equipment Part Name', 'Impact', 'Downtime (min)', 'Production (MT)', 'Date', 'Remark'];
        const csvContent = [
            headers.join(','),
            ...filteredRecords.map(row => {
                return [
                    `EQ_STR_0${row.id.substring(0, 4)}`,
                    `"${row.groupName}"`,
                    `"${row.equipmentName}"`,
                    row.productionImpact,
                    row.downtimeMinutes || 0,
                    row.totalProduction,
                    row.changeDate,
                    `"${row.remark || ''}"`
                ].join(',');
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `equipment_records_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleAddRecord = async (data: any) => {
        try {
            const res = await fetch('/api/equipment-records', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groupName: data.groupName,
                    equipmentName: data.equipmentName,
                    productionImpact: data.productionImpact,
                    downtimeMinutes: data.downtimeMinutes ? Number(data.downtimeMinutes) : 0,
                    totalProduction: data.totalProduction,
                    changeDate: data.changeDate,
                    downtimeCategory: data.downtimeCategory,
                    maintenanceCost: data.maintenanceCost,
                    sparePartUsed: data.sparePartUsed,
                    technicianName: data.technicianName,
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
            {/* Strategic Protocol Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)] animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">Incohub Module 2: Equipment Logs</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground leading-none uppercase">
                        Equipment Records
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
                        <span>LOG MAINTENANCE</span>
                    </button>
                    <button onClick={handleExport} className="p-2 border border-border hover:bg-background/80 transition-colors text-zinc-500 flex items-center justify-center">
                        <Download size={18} />
                    </button>
                </div>
            </div>

            {/* High-Precision Registry Table */}
            <div className="technical-panel overflow-hidden">
                <div className="p-5 border-b border-zinc-200 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-950/20 backdrop-blur-xl flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-sm group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-[10px] font-black opacity-30"><Search size={14} /></div>
                            <input
                                type="text"
                                placeholder="SEARCH EQUIPMENT OR RECORDS..."
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
                            <div className="h-6 w-px bg-zinc-200 dark:border-zinc-800 hidden sm:block" />
                            <span className="hidden sm:inline-flex text-[9px] font-black text-primary uppercase tracking-widest px-2 py-1 bg-primary/5 border border-primary/10">
                                {isLoading ? 'SYNCING...' : 'Tracking Active'}
                            </span>
                        </div>
                    </div>

                    {/* Expandable Filters */}
                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50 animate-in fade-in zoom-in-95 duration-200">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Machine Group</label>
                                <select
                                    value={sectionFilter}
                                    onChange={(e) => setSectionFilter(e.target.value)}
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[1px] px-3 py-2 text-[10px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider focus:outline-none"
                                >
                                    <option value="">All Groups</option>
                                    {masterDataSections.map(s => <option key={s} value={s}>{s}</option>)}
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
                                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">ID</th>
                                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Machine Group / Section</th>
                                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Equipment / Part Name</th>
                                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Impact</th>
                                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Details</th>
                                <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Tech</th>
                                <th className="px-6 py-4 text-right text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/50 font-medium">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest animate-pulse">
                                        Loading Records...
                                    </td>
                                </tr>
                            ) : paginatedRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                        No matching records found
                                    </td>
                                </tr>
                            ) : paginatedRecords.map((record) => (
                                <tr key={record.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors group">
                                    <td className="px-6 py-4 mono text-[11px] text-zinc-400 dark:text-zinc-600 whitespace-nowrap">
                                        <Link href={`/equipment-records/${record.id}`} className="hover:text-purple-600 transition-colors">
                                            EQ_STR_0{record.id.substring(0, 4)}
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
                                            {record.productionImpact}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            {record.downtimeCategory && (
                                                <div className="text-[9px] font-bold text-zinc-500 uppercase">CAT: {record.downtimeCategory}</div>
                                            )}
                                            {record.maintenanceCost && (
                                                <div className="text-[9px] font-black text-emerald-500 uppercase">COST: {record.maintenanceCost.toLocaleString()}</div>
                                            )}
                                            {record.sparePartUsed && (
                                                <div className="text-[9px] font-bold text-amber-600 uppercase truncate max-w-[120px]">PART: {record.sparePartUsed}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-[10px] font-black uppercase whitespace-nowrap">
                                        {record.technicianName || '--'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/equipment-records/${record.id}`} className="inline-flex items-center justify-center w-8 h-8 border border-border hover:border-primary hover:text-primary transition-colors">
                                            <ArrowRight size={14} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Technical Foot Row */}
                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800/50 bg-zinc-50 dark:bg-zinc-900/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em]">
                            Showing {filteredRecords.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredRecords.length)} of {filteredRecords.length} records
                        </span>
                    </div>

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

                    {/* <div className="flex gap-2 w-full sm:w-auto">
                        <button onClick={handleExport} className="px-3 py-1 bg-zinc-900 dark:bg-zinc-800 text-white text-[9px] font-black uppercase tracking-widest w-full sm:w-auto">
                            EXPORT DATA
                        </button>
                    </div> */}
                </div>
            </div>

            {/* System Intelligence Banner */}
            <div className="bg-card border border-border p-4 md:p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                        <Settings size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">EQUIP_SYSTEM_REGISTRY</h1>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-1">Component Maintenance & Parts Lifecycle</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setIsModalOpen(true);
                    }}
                    className="btn-premium"
                >
                    <Plus size={16} />
                    <span>Initialize_New_Part_Log</span>
                </button>
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
                        options: masterDataSections,
                        placeholder: 'Select Group'
                    },
                    {
                        label: 'Equipment / Part Name',
                        name: 'equipmentName',
                        type: 'select',
                        options: masterDataEquipment,
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
                        label: 'Downtime (Minutes)',
                        name: 'downtimeMinutes',
                        type: 'number',
                        placeholder: 'Enter downtime in minutes'
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
                    {
                        label: 'Downtime Category',
                        name: 'downtimeCategory',
                        type: 'text',
                        placeholder: 'e.g., Mechanical, Electrical, Operational'
                    },
                    {
                        label: 'Maintenance Cost (Optional)',
                        name: 'maintenanceCost',
                        type: 'number',
                        placeholder: 'Enter cost'
                    },
                    {
                        label: 'Spare Part Used',
                        name: 'sparePartUsed',
                        type: 'text',
                        placeholder: 'Part name/ID'
                    },
                    {
                        label: 'Technician Name',
                        name: 'technicianName',
                        type: 'text',
                        placeholder: 'Name of the technician'
                    },
                ]}
                onSubmit={handleAddRecord}
            />
        </div>
    );
}
