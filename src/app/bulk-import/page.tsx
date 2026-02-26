'use client';

import React, { useState, useEffect } from 'react';
import { Database, FileSpreadsheet, AlertTriangle, CheckCircle2, Calculator, Upload, ChevronDown, ListFilter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

type ImportType = 'PRODUCTION_DISPATCH' | 'PRODUCTION_ONLY' | 'DISPATCH_ONLY' | 'STOCK_ONLY' | 'WIRE_RECORDS' | 'EQUIPMENT_RECORDS';

interface TemplateDef {
    id: ImportType;
    name: string;
    description: string;
    columns: string[];
    placeholder: string;
}

const TEMPLATES: Record<ImportType, TemplateDef> = {
    PRODUCTION_DISPATCH: {
        id: 'PRODUCTION_DISPATCH',
        name: 'Production & Dispatch (Combined)',
        description: 'First column: Date (DD/MM/YYYY), Second: Daily Production, Third: Daily Dispatch.',
        columns: ['date', 'production', 'dispatch'],
        placeholder: "DATE\tDaily Production\tDaily Dispatch\n01/11/2025\t148393\t170042\n02/11/2025\t149030\t118366"
    },
    PRODUCTION_ONLY: {
        id: 'PRODUCTION_ONLY',
        name: 'Daily Production (Only)',
        description: 'First column: Date (DD/MM/YYYY), Second: Production Amount (MT).',
        columns: ['date', 'production'],
        placeholder: "DATE\tProduction\n01/11/2025\t148393\n02/11/2025\t149030"
    },
    DISPATCH_ONLY: {
        id: 'DISPATCH_ONLY',
        name: 'Daily Dispatch (Only)',
        description: 'First column: Date (DD/MM/YYYY), Second: Dispatch Amount (MT).',
        columns: ['date', 'dispatch'],
        placeholder: "DATE\tDispatch\n01/11/2025\t170042\n02/11/2025\t118366"
    },
    STOCK_ONLY: {
        id: 'STOCK_ONLY',
        name: 'Daily Stock In Hand (Only)',
        description: 'First column: Date (DD/MM/YYYY), Second: Stock Amount (MT).',
        columns: ['date', 'stock'],
        placeholder: "DATE\tStock Amount\n01/11/2025\t3450\n02/11/2025\t3200"
    },
    WIRE_RECORDS: {
        id: 'WIRE_RECORDS',
        name: 'Wire Records',
        description: 'Date (DD/MM/YYYY), Machine Name, Wire Type, Party Name, Install Prod, Removal Prod, Expected Life, Remark',
        columns: ['changeDate', 'machineName', 'wireType', 'partyName', 'installProd', 'removalProd', 'expectedLife', 'remark'],
        placeholder: "01/11/2025\tPM1\tBottom Wire\tJohnson\t150000\t\t50000\tNew Installation\n05/11/2025\tPM2\tPress Wire\tVoith\t120000\t145000\t40000\tDamaged early"
    },
    EQUIPMENT_RECORDS: {
        id: 'EQUIPMENT_RECORDS',
        name: 'Equipment Records',
        description: 'Date (DD/MM/YYYY), Group Name, Equipment Name, Downtime (mins), Total Prod, Impact (Yes/No/Remark), Remark',
        columns: ['changeDate', 'groupName', 'equipmentName', 'downtimeMinutes', 'totalProduction', 'productionImpact', 'remark'],
        placeholder: "01/11/2025\tPress Section\tFelt Roller\t45\t150000\tYes\tBearing failure\n02/11/2025\tDryer Section\tSteam Joint\t120\t152000\tYes\tSeal leak"
    }
};

interface ParsedRecord {
    [key: string]: string | undefined;
    status?: 'valid' | 'invalid';
    _rawOriginalDate?: string;
}

export default function BulkImportPage() {
    const router = useRouter();
    const [importType, setImportType] = useState<ImportType>('PRODUCTION_DISPATCH');
    const [pastedData, setPastedData] = useState('');

    // Core data structures for dynamic mapping
    const [rawRows, setRawRows] = useState<string[][]>([]); // The raw 2D array of pasted cells
    const [columnMapping, setColumnMapping] = useState<string[]>([]); // map[colIndex] = "dbFieldName" | "ignore"

    const [parsedRecords, setParsedRecords] = useState<ParsedRecord[]>([]); // resulting records
    const [isSaving, setIsSaving] = useState(false);
    const [saveResult, setSaveResult] = useState<{ success?: boolean, msg?: string, count1?: number, count2?: number } | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const activeTemplate = TEMPLATES[importType];

    // Convert DD/MM/YYYY or DD-MM-YYYY to YYYY-MM-DD
    const normalizeDate = (dateStr: string) => {
        if (!dateStr) return '';
        const parts = dateStr.trim().split(/[\/\-]/);
        if (parts.length === 3) {
            let [day, month, year] = parts;
            day = day.padStart(2, '0');
            month = month.padStart(2, '0');
            if (year.length === 2) year = `20${year}`;
            return `${year}-${month}-${day}`;
        }
        return dateStr;
    };

    const validateRecord = (type: ImportType, record: ParsedRecord): boolean => {
        if (type === 'PRODUCTION_DISPATCH' || type === 'PRODUCTION_ONLY' || type === 'DISPATCH_ONLY' || type === 'STOCK_ONLY') {
            const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(record.date || '');
            const p = record.production;
            const d = record.dispatch;
            const s = record.stock;
            const isValidProd = p === '' || p === undefined || !isNaN(parseFloat(p));
            const isValidDisp = d === '' || d === undefined || !isNaN(parseFloat(d));
            const isValidStock = s === '' || s === undefined || !isNaN(parseFloat(s));

            if (type === 'PRODUCTION_ONLY') return isValidDate && !!p && !isNaN(parseFloat(p));
            if (type === 'DISPATCH_ONLY') return isValidDate && !!d && !isNaN(parseFloat(d));
            if (type === 'STOCK_ONLY') return isValidDate && !!s && !isNaN(parseFloat(s));

            return isValidDate && (isValidProd || isValidDisp || isValidStock) && !!(p || d || s);
        }

        if (type === 'WIRE_RECORDS') {
            const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(record.changeDate || '');
            const hasRequired = !!record.machineName && !!record.wireType && !!record.partyName && !!record.installProd;
            const isValidInstall = !isNaN(parseFloat(record.installProd || ''));
            return isValidDate && hasRequired && isValidInstall;
        }

        if (type === 'EQUIPMENT_RECORDS') {
            const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(record.changeDate || '');
            const hasRequired = !!record.groupName && !!record.equipmentName && !!record.downtimeMinutes && !!record.totalProduction && !!record.productionImpact;
            const isValidDetails = !isNaN(parseFloat(record.downtimeMinutes || '')) && !isNaN(parseFloat(record.totalProduction || ''));
            return isValidDate && hasRequired && isValidDetails;
        }

        return false;
    };

    // Parse the 2D raw array using the current mapping into fully structured records
    const computeParsedRecords = (rows: string[][], mapping: string[]) => {
        const parsed: ParsedRecord[] = [];

        for (let i = 0; i < rows.length; i++) {
            const rowData = rows[i];
            const record: ParsedRecord = {};
            let hasAnyData = false;

            // Apply mapping
            for (let colIdx = 0; colIdx < rowData.length; colIdx++) {
                const mapField = mapping[colIdx];
                if (!mapField || mapField === 'ignore') continue;

                let val = (rowData[colIdx] || '').trim().replace(/,/g, '');

                // Date columns need normalization
                if (mapField === 'date' || mapField === 'changeDate') {
                    record._rawOriginalDate = val;
                    val = normalizeDate(val);
                }

                if (val !== '') hasAnyData = true;
                record[mapField] = val;
            }

            // Only add rows that actually have data after mapping
            if (hasAnyData) {
                record.status = validateRecord(importType, record) ? 'valid' : 'invalid';
                parsed.push(record);
            }
        }
        setParsedRecords(parsed);
    };

    // Recalculate anytime raw data or mapping changes
    useEffect(() => {
        if (rawRows.length > 0) {
            computeParsedRecords(rawRows, columnMapping);
        }
    }, [columnMapping, rawRows, importType]);

    const handlePaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setPastedData(value);
        setSaveResult(null);

        if (!value.trim()) {
            setRawRows([]);
            setColumnMapping([]);
            setParsedRecords([]);
            return;
        }

        const lines = value.trim().split('\n');

        let startIndex = 0;
        const firstRowLower = lines[0].toLowerCase();
        if (firstRowLower.includes('date') || firstRowLower.includes('production') || firstRowLower.includes('machine') || firstRowLower.includes('equipment')) {
            startIndex = 1; // Basic header skip
        }

        let maxCols = 0;
        const matrix: string[][] = [];

        for (let i = startIndex; i < lines.length; i++) {
            const cols = lines[i].split('\t');
            if (cols.length >= 1 && cols[0].trim() !== '') {
                if (cols.length > maxCols) maxCols = cols.length;
                matrix.push(cols);
            }
        }

        // Setup initial default mapping by just assigning columns sequentially
        // e.g., if target has 3 columns, map first 3 pasted columns to them
        const initialMapping: string[] = [];
        for (let i = 0; i < maxCols; i++) {
            if (i < activeTemplate.columns.length) {
                initialMapping.push(activeTemplate.columns[i]);
            } else {
                initialMapping.push('ignore');
            }
        }

        setColumnMapping(initialMapping);
        setRawRows(matrix);
    };

    const handleClear = () => {
        setPastedData('');
        setParsedRecords([]);
        setRawRows([]);
        setColumnMapping([]);
        setSaveResult(null);
    };

    const handleTemplateChange = (type: ImportType) => {
        setImportType(type);
        setIsDropdownOpen(false);
        handleClear();
    };

    const handleSelectColumnMapping = (colIndex: number, newField: string) => {
        setColumnMapping(prev => {
            const newMapping = [...prev];

            // Un-map the field if it was already selected somewhere else
            if (newField !== 'ignore') {
                const existingIndex = newMapping.findIndex(m => m === newField);
                if (existingIndex !== -1) {
                    newMapping[existingIndex] = 'ignore';
                }
            }

            newMapping[colIndex] = newField;
            return newMapping;
        });
    };

    const handleSave = async () => {
        const validRecords = parsedRecords.filter(r => r.status === 'valid');
        if (validRecords.length === 0) return;

        setIsSaving(true);
        setSaveResult(null);

        try {
            const res = await fetch('/api/bulk-import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    importType,
                    records: validRecords
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setSaveResult({
                    success: true,
                    msg: data.message || 'Data imported successfully!',
                    count1: data.prodCount || data.importCount || data.stockCount,
                    count2: data.dispCount || data.stockCount
                });

                document.dispatchEvent(new Event('sync_telemetry'));
                setTimeout(() => handleClear(), 3000);
            } else {
                setSaveResult({ success: false, msg: data.error || 'Failed to import data.' });
            }
        } catch (error) {
            setSaveResult({ success: false, msg: 'An unexpected error occurred.' });
        } finally {
            setIsSaving(false);
        }
    };

    const validCount = parsedRecords.filter((r) => r.status === 'valid').length;
    const invalidCount = parsedRecords.length - validCount;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)] animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">Universal Importer</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground leading-none uppercase">
                        Bulk Data Entry
                    </h1>
                </div>

                <div className="relative z-50">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="technical-panel px-4 py-3 flex items-center justify-between gap-4 min-w-[280px] hover:border-primary transition-colors cursor-pointer group"
                    >
                        <div className="flex items-center gap-3">
                            <Database size={16} className="text-primary" />
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">Target Module</span>
                                <span className="text-[11px] font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">
                                    {activeTemplate.name}
                                </span>
                            </div>
                        </div>
                        <ChevronDown size={14} className={cn("text-zinc-500 transition-transform", isDropdownOpen && "rotate-180")} />
                    </button>

                    {isDropdownOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                            <div className="absolute right-0 top-[calc(100%+8px)] w-full technical-panel z-50 flex flex-col py-1 animate-in fade-in zoom-in-95 duration-200">
                                {(Object.keys(TEMPLATES) as ImportType[]).map((key) => (
                                    <button
                                        key={key}
                                        onClick={() => handleTemplateChange(key)}
                                        className={cn(
                                            "px-4 py-3 flex items-center gap-3 text-left transition-colors border-l-2",
                                            importType === key ? "bg-primary/5 border-primary text-primary" : "border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-foreground"
                                        )}
                                    >
                                        <Database size={14} className={importType === key ? "text-primary" : "text-zinc-500"} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{TEMPLATES[key].name}</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_2fr] gap-6">
                <div className="space-y-4">
                    <div className="technical-panel p-6 border-zinc-200/50 dark:border-zinc-800/50">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet size={16} className="text-primary" />
                                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground">Format & Paste</h2>
                            </div>
                        </div>
                        <p className="text-[11px] text-zinc-500 mb-4 tracking-wide font-medium leading-relaxed">
                            {activeTemplate.description}
                        </p>

                        <textarea
                            className="w-full h-80 bg-zinc-50 dark:bg-zinc-900/50 border border-border p-4 text-sm font-mono text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-primary transition-colors resize-none placeholder:text-zinc-400/50"
                            placeholder={activeTemplate.placeholder}
                            value={pastedData}
                            onChange={handlePaste}
                            spellCheck={false}
                        />

                        {pastedData && (
                            <div className="flex items-center justify-between mt-4">
                                <span className="text-[9px] text-zinc-500 font-mono">Found {rawRows.length} rows</span>
                                <button
                                    onClick={handleClear}
                                    className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-red-500 transition-colors"
                                >
                                    Clear Input
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="technical-panel p-6 min-h-full flex flex-col border-zinc-200/50 dark:border-zinc-800/50">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Calculator size={16} className="text-emerald-500" />
                                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground">Dynamic Structure Map</h2>
                            </div>
                            {parsedRecords.length > 0 && (
                                <div className="flex gap-4">
                                    <span className="text-[10px] font-bold uppercase text-emerald-500 tracking-wider">
                                        Valid: {validCount}
                                    </span>
                                    {invalidCount > 0 && (
                                        <span className="text-[10px] font-bold uppercase text-red-500 tracking-wider">
                                            Invalid: {invalidCount}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 bg-zinc-50 dark:bg-zinc-900/30 border border-border overflow-auto max-h-[500px]">
                            {parsedRecords.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-400 p-12 space-y-4">
                                    <FileSpreadsheet size={32} className="opacity-20" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center">
                                        Waiting for {activeTemplate.name} payload...<br />
                                        <span className="text-zinc-500">Paste payload, map columns, then commit</span>
                                    </p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-border z-10 shadow-sm">
                                        <tr>
                                            {/* Dynamic mapping headers based on columnMapping length */}
                                            {columnMapping.map((mapVal, copyColIndex) => (
                                                <th key={copyColIndex} className="px-3 py-3 border-r border-border/30 last:border-0 min-w-[120px]">
                                                    <div className="flex items-center gap-2 mb-1 text-[8px] font-black text-zinc-400 tracking-widest uppercase">
                                                        <ListFilter size={10} /> Column {copyColIndex + 1}
                                                    </div>
                                                    <select
                                                        className={cn(
                                                            "w-full bg-zinc-100 dark:bg-zinc-800 text-[10px] uppercase font-black tracking-wider border border-border px-2 py-1.5 focus:border-primary focus:outline-none transition-colors",
                                                            mapVal === 'ignore' ? 'opacity-50 text-zinc-500' : 'text-primary'
                                                        )}
                                                        value={mapVal}
                                                        onChange={(e) => handleSelectColumnMapping(copyColIndex, e.target.value)}
                                                    >
                                                        <option value="ignore" className="text-zinc-500">─ IGNORE / SKIP ─</option>
                                                        {activeTemplate.columns.map(field => (
                                                            <option key={field} value={field} className="text-foreground">
                                                                {field.replace(/([A-Z])/g, ' $1').trim()}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </th>
                                            ))}
                                            <th className="px-4 py-3 border-l border-border bg-zinc-50 dark:bg-[#0c0c0d] sticky right-0 z-20 shadow-[-4px_0_10px_rgba(0,0,0,0.1)] dark:shadow-[-4px_0_20px_rgba(0,0,0,0.2)]">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Analysis</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {/* To accurately preview we map the 2D raw array vs rendering the 'parsed' object */}
                                        {rawRows.slice(0, 50).map((row, rowIndex) => { // Render preview limit to 50
                                            const record = parsedRecords[rowIndex];
                                            if (!record) return null; // Safe guard
                                            const isInvalid = record.status === 'invalid';

                                            return (
                                                <tr key={rowIndex} className={cn(
                                                    "text-[11px] font-mono group transition-colors",
                                                    isInvalid ? "bg-red-500/5" : "hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                                                )}>
                                                    {/* Cells based on raw data */}
                                                    {row.map((cellValue, colIndex) => {
                                                        const targetField = columnMapping[colIndex];
                                                        const isIgnored = targetField === 'ignore';

                                                        // Get the parsed value if we are a date (we might have transformed it)
                                                        let displayStr = cellValue;
                                                        if (!isIgnored && record[targetField] && (targetField === 'date' || targetField === 'changeDate')) {
                                                            displayStr = record[targetField] || '';
                                                        }

                                                        return (
                                                            <td key={colIndex} className={cn(
                                                                "px-3 py-2 border-r border-border/30 max-w-[150px] truncate",
                                                                isIgnored ? "text-zinc-400 opacity-50 bg-zinc-50/50 dark:bg-zinc-900/50" : (isInvalid ? "text-red-900 dark:text-red-200 font-bold" : "text-zinc-700 dark:text-zinc-300"),
                                                                (!isIgnored && record[targetField] === '') ? "bg-amber-500/10 italic text-amber-600/50" : ""
                                                            )} title={displayStr || "empty"}>
                                                                {displayStr || '-'}

                                                                {/* Error raw rendering for date */}
                                                                {isInvalid && record._rawOriginalDate && (targetField === 'date' || targetField === 'changeDate') && displayStr !== record._rawOriginalDate && (
                                                                    <span className="block text-[9px] text-red-500 mt-0.5 truncate bg-red-500/10 px-1 w-fit rounded-sm">Raw: {record._rawOriginalDate}</span>
                                                                )}
                                                            </td>
                                                        );
                                                    })}

                                                    {/* Status indicator cell */}
                                                    <td className={cn(
                                                        "px-4 py-2 border-l border-border sticky right-0 bg-zinc-50 dark:bg-zinc-950/80 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-900 transition-colors shadow-[-4px_0_10px_rgba(0,0,0,0.05)] text-center",
                                                        isInvalid ? "bg-red-500/10" : ""
                                                    )}>
                                                        {record.status === 'valid' ? (
                                                            <CheckCircle2 size={16} className="text-emerald-500 inline drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                                                        ) : (
                                                            <span title="Invalid format or missing mapped fields">
                                                                <AlertTriangle size={16} className="text-red-500 inline animate-pulse" />
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        {rawRows.length > 50 && (
                            <div className="text-center py-2 text-[9px] font-black uppercase tracking-widest text-zinc-500 bg-zinc-100 dark:bg-zinc-900 border-x border-b border-border">
                                Showing top 50 rows preview... (+{rawRows.length - 50} more)
                            </div>
                        )}

                        {saveResult && (
                            <div className={cn(
                                "mt-4 p-3 border text-[11px] font-bold tracking-wider uppercase flex items-center justify-between shadow-lg",
                                saveResult.success ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400"
                            )}>
                                <span className={saveResult.success ? "text-emerald-500" : ""}>{saveResult.msg}</span>
                                {saveResult.success && saveResult.count1 && (
                                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-1 bg-emerald-500/20">
                                        Imports: {saveResult.count1} {saveResult.count2 ? `| ${saveResult.count2}` : ''}
                                    </span>
                                )}
                            </div>
                        )}

                        <div className="mt-6 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 p-4 border border-border">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">Pre-flight Check</span>
                                <span className={cn("text-[11px] font-bold uppercase tracking-wider", validCount > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500")}>
                                    {validCount > 0 ? `${validCount} records ready for database injection` : 'Awaiting valid structures'}
                                </span>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={validCount === 0 || isSaving}
                                className={cn(
                                    "btn-premium disabled:opacity-50 disabled:cursor-not-allowed group whitespace-nowrap",
                                    isSaving ? "animate-pulse" : (validCount > 0 ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "")
                                )}
                            >
                                {isSaving ? 'Executing Protocol...' : 'Commit Sequence'}
                                <Upload size={14} className="ml-2 group-hover:-translate-y-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
