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
    Info,
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

export default function EquipmentRecordDetail() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [record, setRecord] = React.useState<EquipmentRecord | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [copied, setCopied] = React.useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [masterDataSections, setMasterDataSections] = React.useState<string[]>([]);
    const [masterDataEquipment, setMasterDataEquipment] = React.useState<string[]>([]);

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

    const fetchRecord = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/equipment-records/${id}`);
            if (res.ok) {
                const data = await res.json();
                setRecord(data);
            } else {
                setRecord(null);
            }
        } catch (error) {
            console.error("Failed to fetch equipment record detail", error);
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
                <div className="w-8 h-8 rounded-full border-t-2 border-purple-600 animate-spin" />
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
        const shareText = `Equipment Record EQ_STR_0${record.id.substring(0, 4)}\nGroup: ${record.groupName}\nPart: ${record.equipmentName}\nImpact: ${record.productionImpact === 'Yes' ? 'Critical' : record.productionImpact === 'No' ? 'None' : 'Remark'}\nDowntime: ${record.downtimeMinutes || 0} min\nProduction: ${record.totalProduction.toLocaleString()} MT`;
        navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleExport = () => {
        const headers = ['ID', 'Machine Group', 'Equipment Part Name', 'Impact', 'Downtime (min)', 'Production (MT)', 'Date', 'Remark'];

        const rowData = [
            `EQ_STR_0${record.id.substring(0, 4)}`,
            `"${record.groupName}"`,
            `"${record.equipmentName}"`,
            record.productionImpact,
            record.downtimeMinutes || 0,
            record.totalProduction,
            record.changeDate,
            `"${record.remark || ''}"`
        ];

        const csvContent = headers.join(',') + '\n' + rowData.join(',');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `equipment_record_EQ_STR_0${record.id.substring(0, 4)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleGeneratePDF = () => {
        const doc = new jsPDF();

        // Header Decoration
        doc.setDrawColor(168, 85, 247); // Purple-600
        doc.setLineWidth(2);
        doc.line(15, 10, 195, 10);

        // Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(24, 24, 27); // Zinc-900
        doc.text("INCOHUB_AUDIT_LOG", 15, 25);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(113, 113, 122); // Zinc-500
        doc.text(`AUDIT_ID: EQ_STR_0${record.id.substring(0, 4)}`, 15, 32);
        doc.text(`TIMESTAMP: ${new Date().toLocaleString().toUpperCase()}`, 15, 37);

        // Horizontal Line
        doc.setDrawColor(244, 244, 245); // Zinc-100
        doc.setLineWidth(0.5);
        doc.line(15, 45, 195, 45);

        // Strategic Audit Table
        autoTable(doc, {
            startY: 55,
            head: [['PARAMETER', 'AUDIT_SPEC_VALUE']],
            body: [
                ['MACHINE_GROUP', record.groupName.toUpperCase()],
                ['EQUIPMENT_PART', record.equipmentName.toUpperCase()],
                ['PRODUCTION_IMPACT', record.productionImpact.toUpperCase()],
                ['DOWNTIME_LOGGED', `${record.downtimeMinutes || 0} MINUTES`],
                ['PRODUCTION_AT_CHANGE', `${record.totalProduction.toLocaleString()} MT`],
                ['AUDIT_DATE', record.changeDate.replace(/-/g, '.')],
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

        // Maintenance Notes
        const finalY = (doc as any).lastAutoTable.finalY + 15;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(113, 113, 122);
        doc.text("MAINTENANCE_NOTES:", 15, finalY);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(82, 82, 91);
        const splitRemark = doc.splitTextToSize(record.remark || 'No detailed maintenance notes were provided for this log entry.', 170);
        doc.text(splitRemark, 15, finalY + 7);

        // Security Banner
        doc.setFillColor(24, 24, 27);
        doc.rect(15, 260, 180, 20, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text("INCOHUB AUDIT SIGNATURE", 20, 272);
        doc.text("STATUS: VERIFIED", 150, 272);

        doc.save(`equipment_audit_EQ_STR_0${record.id.substring(0, 4)}.pdf`);
    };

    const handleEdit = async (data: any) => {
        try {
            const res = await fetch(`/api/equipment-records/${id}`, {
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
        if (!confirm("Are you sure you want to delete this audit log? This action cannot be undone.")) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/equipment-records/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                router.push('/equipment-records');
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
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-all">Back to Audit</span>
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
                    <button onClick={handleExport} className="btn-premium flex items-center gap-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900">
                        <Download size={16} />
                        <span>EXPORT_AUDIT_LOG</span>
                    </button>
                </div>
            </div>

            {/* Title & Badge */}
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-600 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Strategic Audit: EQ_STR_0{record.id.substring(0, 4)}</span>
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

                    <div
                        onClick={handleGeneratePDF}
                        className="technical-panel p-8 flex flex-col items-center justify-center text-center space-y-4 border-dashed border-zinc-200 dark:border-zinc-800 bg-transparent cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all group/pdf"
                    >
                        <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center text-zinc-400 group-hover/pdf:text-purple-600 transition-colors">
                            <Download size={20} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">PDF Snapshot</div>
                            <div className="text-[8px] font-medium text-zinc-400 uppercase tracking-widest mt-1">Generate Audit Log</div>
                        </div>
                    </div>
                </div>
            </div>

            <RecordModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Equipment Log"
                fields={[
                    {
                        label: 'Machine Group / Section',
                        name: 'groupName',
                        type: 'select',
                        options: masterDataSections,
                        defaultValue: record.groupName
                    },
                    {
                        label: 'Equipment / Part Name',
                        name: 'equipmentName',
                        type: 'select',
                        options: masterDataEquipment,
                        defaultValue: record.equipmentName
                    },
                    {
                        label: 'Production Impact',
                        name: 'productionImpact',
                        type: 'select',
                        options: ['Yes', 'No', 'Remark'],
                        defaultValue: record.productionImpact
                    },
                    {
                        label: 'Downtime (Minutes)',
                        name: 'downtimeMinutes',
                        type: 'number',
                        defaultValue: record.downtimeMinutes
                    },
                    {
                        label: 'Production (at change)',
                        name: 'totalProduction',
                        type: 'number',
                        defaultValue: record.totalProduction
                    },
                    {
                        label: 'Change Date',
                        name: 'changeDate',
                        type: 'date',
                        defaultValue: record.changeDate
                    },
                    {
                        label: 'Remark / Reason',
                        name: 'remark',
                        type: 'textarea',
                        defaultValue: record.remark
                    },
                ]}
                onSubmit={handleEdit}
            />
        </div>
    );
}
