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
    Share2,
    Edit,
    Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { RecordModal } from '@/components/layout/RecordModal';

interface MasterDataItem {
    category: string;
    value: string;
    isActive: boolean;
}
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

export default function WireRecordDetail() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [record, setRecord] = React.useState<WireRecord | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [copied, setCopied] = React.useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [masterDataSections, setMasterDataSections] = React.useState<string[]>([]);
    const [masterDataWireTypes, setMasterDataWireTypes] = React.useState<string[]>([]);
    const [masterDataParties, setMasterDataParties] = React.useState<string[]>([]);

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

    const fetchRecord = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/wire-records/${id}`);
            if (res.ok) {
                const data = await res.json();
                setRecord(data);
            } else {
                setRecord(null);
            }
        } catch (error) {
            console.error("Failed to fetch wire record detail", error);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchRecord();
        fetchMasterData();
    }, [id]);

    if (isLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <div className="w-8 h-8 rounded-full border-t-2 border-fuchsia-600 animate-spin" />
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Loading Record...</div>
            </div>
        );
    }

    if (!record) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <div className="text-zinc-400 font-black uppercase tracking-[0.3em]">Record Not Found</div>
                <button onClick={() => router.back()} className="btn-premium">Go Back</button>
            </div>
        );
    }

    const handleShare = () => {
        const shareText = `Wire Record RE_0${record.id.substring(0, 4)}\nMachine: ${record.machineName}\nWire: ${record.wireType}\nParty: ${record.partyName || 'N/A'}\nLife: ${record.wireLifeMT || (record.productionAtRemoval ? record.productionAtRemoval - record.productionAtInstallation : 'Active')} MT`;
        navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleExport = () => {
        const headers = ['ID', 'Machine Section', 'Wire Type', 'Party', 'Install (MT)', 'Removal (MT)', 'Life (MT)', 'Date', 'Remark'];
        const lifeMT = record.wireLifeMT || (record.productionAtRemoval ? record.productionAtRemoval - record.productionAtInstallation : '-');

        const rowData = [
            `RE_0${record.id.substring(0, 4)}`,
            `"${record.machineName}"`,
            `"${record.wireType}"`,
            `"${record.partyName || '-'}"`,
            record.productionAtInstallation,
            record.productionAtRemoval || '-',
            lifeMT,
            record.changeDate,
            `"${record.remark || ''}"`
        ];

        const csvContent = headers.join(',') + '\n' + rowData.join(',');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `wire_record_RE_0${record.id.substring(0, 4)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleGeneratePDF = () => {
        const doc = new jsPDF();

        // Header Decoration
        doc.setDrawColor(192, 38, 211); // Fuchsia-600
        doc.setLineWidth(2);
        doc.line(15, 10, 195, 10);

        // Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(24, 24, 27); // Zinc-900
        doc.text("INCOHUB_WIRE_SNAPSHOT", 15, 25);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(113, 113, 122); // Zinc-500
        doc.text(`REGISTRY_ID: RE_0${record.id.substring(0, 4)}`, 15, 32);
        doc.text(`TIMESTAMP: ${new Date().toLocaleString().toUpperCase()}`, 15, 37);

        // Horizontal Line
        doc.setDrawColor(244, 244, 245); // Zinc-100
        doc.setLineWidth(0.5);
        doc.line(15, 45, 195, 45);

        // Technical Data Table
        autoTable(doc, {
            startY: 55,
            head: [['PARAMETER', 'SPECIFICATION_VALUE']],
            body: [
                ['MACHINE_SECTION', record.machineName.toUpperCase()],
                ['WIRE_TYPE', record.wireType.toUpperCase()],
                ['SUPPLIER_PARTY', (record.partyName || 'N/A').toUpperCase()],
                ['INSTALLATION_MT', `${record.productionAtInstallation.toLocaleString()} MT`],
                ['REMOVAL_MT', record.productionAtRemoval ? `${record.productionAtRemoval.toLocaleString()} MT` : 'ACTIVE_LOG'],
                ['CALCULATED_LIFE', record.wireLifeMT ? `${record.wireLifeMT.toLocaleString()} MT` : (record.productionAtRemoval ? `${(record.productionAtRemoval - record.productionAtInstallation).toLocaleString()} MT` : 'IN_PROGRESS')],
                ['EXPECTED_LIFE', record.expectedLifeMT ? `${record.expectedLifeMT.toLocaleString()} MT` : 'NOT_DEFINED'],
                ['LOG_DATE', record.changeDate.replace(/-/g, '.')],
            ],
            theme: 'plain',
            headStyles: {
                fillColor: [24, 24, 27],
                textColor: [255, 255, 255],
                fontSize: 9,
                fontStyle: 'bold',
                cellPadding: 4
            },
            bodyStyles: {
                fontSize: 9,
                textColor: [63, 63, 70],
                cellPadding: 4
            },
            columnStyles: {
                0: { fontStyle: 'bold', textColor: [113, 113, 122], cellWidth: 60 }
            },
            alternateRowStyles: {
                fillColor: [250, 250, 250]
            }
        });

        // Observation Remark
        const finalY = (doc as any).lastAutoTable.finalY + 15;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(113, 113, 122);
        doc.text("OBSERVATION_REMARK:", 15, finalY);

        doc.setFont("helvetica", "italic");
        doc.setTextColor(82, 82, 91);
        const splitRemark = doc.splitTextToSize(record.remark || 'No additional remarks recorded for this registry entry.', 170);
        doc.text(splitRemark, 15, finalY + 7);

        // Footer Signature
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(192, 38, 211);
        doc.text("VERIFIED BY INCOHUB_SYSTEM", 15, 285);
        doc.setTextColor(161, 161, 170);
        doc.text("PAGE 01/01", 180, 285);

        doc.save(`wire_record_RE_0${record.id.substring(0, 4)}.pdf`);
    };

    const handleEdit = async (data: any) => {
        try {
            const res = await fetch(`/api/wire-records/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                fetchRecord();
                setIsEditModalOpen(false);
            }
        } catch (error) {
            console.error("Failed to update record", error);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this record? This action cannot be undone.")) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/wire-records/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                router.push('/wire-records');
            }
        } catch (error) {
            console.error("Failed to delete record", error);
            setIsDeleting(false);
        }
    };

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
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-500"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-zinc-500 hover:text-red-600 disabled:opacity-50"
                    >
                        <Trash2 size={16} className={isDeleting ? "animate-pulse" : ""} />
                    </button>
                    <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-800 mx-2 hidden sm:block" />
                    <button
                        onClick={handleShare}
                        className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-500 relative"
                    >
                        <Share2 size={16} />
                        {copied && <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[9px] px-2 py-1 uppercase tracking-widest whitespace-nowrap z-50 shadow-lg">Copied</span>}
                    </button>
                    <button onClick={handleExport} className="btn-premium flex items-center gap-3">
                        <Download size={16} />
                        <span>EXPORT_RECORD</span>
                    </button>
                </div>
            </div>

            {/* Title & Badge */}
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-fuchsia-600 shadow-[0_0_10px_rgba(192,38,211,0.5)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Registry Entry: RE_0{record.id.substring(0, 4)}</span>
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
                                        <Activity size={10} /> Install / Removal
                                    </div>
                                    <div className="text-xl font-black text-fuchsia-600 mono uppercase tracking-tight">
                                        {record.productionAtInstallation.toLocaleString()} <span className="text-zinc-400 mx-1">/</span> {record.productionAtRemoval ? record.productionAtRemoval.toLocaleString() : 'ACTIVE'} <span className="text-[10px] ml-1">MT</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8 relative z-10">
                                <div>
                                    <div className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                        <Layers size={10} /> Wire_Specification / Party
                                    </div>
                                    <div className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                                        {record.wireType} <span className="text-zinc-400 text-sm mx-1">|</span> {record.partyName || 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                        <Calendar size={10} /> Log_Timestamp
                                    </div>
                                    <div className="text-2xl font-black text-zinc-900 dark:text-white mono uppercase tracking-tight">
                                        {record.changeDate.replace('-', '.')}
                                    </div>
                                </div>
                                {record.wireCost !== null && (
                                    <div>
                                        <div className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                            <Database size={10} /> Wire_Cost
                                        </div>
                                        <div className="text-xl font-black text-emerald-500 mono uppercase tracking-tight">
                                            {record.wireCost.toLocaleString()} <span className="text-[10px] ml-1">COST</span>
                                        </div>
                                    </div>
                                )}
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

                    <div
                        onClick={handleGeneratePDF}
                        className="technical-panel p-8 flex flex-col items-center justify-center text-center space-y-4 border-dashed border-zinc-200 dark:border-zinc-800 bg-transparent cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all group/pdf"
                    >
                        <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center text-zinc-400 group-hover/pdf:text-fuchsia-600 transition-colors">
                            <Download size={20} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">PDF Snapshot</div>
                            <div className="text-[8px] font-medium text-zinc-400 uppercase tracking-widest mt-1">Generate Technical Log</div>
                        </div>
                    </div>
                </div>
            </div>

            <RecordModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Wire Record"
                fields={[
                    {
                        label: 'Machine Section',
                        name: 'machineName',
                        type: 'select',
                        options: masterDataSections,
                        defaultValue: record.machineName
                    },
                    {
                        label: 'Wire Type / Name',
                        name: 'wireType',
                        type: 'select',
                        options: masterDataWireTypes,
                        defaultValue: record.wireType
                    },
                    {
                        label: 'Party / Vendor Name',
                        name: 'partyName',
                        type: 'select',
                        options: masterDataParties,
                        defaultValue: record.partyName
                    },
                    {
                        label: 'Production at Installation (MT)',
                        name: 'productionAtInstallation',
                        type: 'number',
                        placeholder: 'Current machine production',
                        defaultValue: record.productionAtInstallation
                    },
                    {
                        label: 'Production at Removal (MT)',
                        name: 'productionAtRemoval',
                        type: 'number',
                        placeholder: 'Leave blank if active',
                        defaultValue: record.productionAtRemoval
                    },
                    {
                        label: 'Change Date',
                        name: 'changeDate',
                        type: 'date',
                        defaultValue: record.changeDate
                    },
                    {
                        label: 'Remark',
                        name: 'remark',
                        type: 'textarea',
                        placeholder: 'Any special observations',
                        defaultValue: record.remark
                    },
                    {
                        label: 'Wire Cost (Optional)',
                        name: 'wireCost',
                        type: 'number',
                        placeholder: 'Enter wire cost',
                        defaultValue: record.wireCost
                    },
                ]}
                onSubmit={handleEdit}
            />
        </div>
    );
}
