'use client';

import React, { useState, useEffect } from 'react';
import {
    Download,
    Upload,
    Database,
    ShieldCheck,
    AlertTriangle,
    RefreshCcw,
    CheckCircle2,
    FileCode,
    HardDrive,
    Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SystemPage() {
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error', message?: string }>({ type: 'idle' });
    const [dbStats, setDbStats] = useState({ wires: 0, equipment: 0, lastCheck: '' });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            document.dispatchEvent(new Event('sync_telemetry'));
            const [wRes, eRes] = await Promise.all([
                fetch('/api/wire-records'),
                fetch('/api/equipment-records')
            ]);
            const wData = await wRes.json();
            const eData = await eRes.json();
            setDbStats({
                wires: wData.length,
                equipment: eData.length,
                lastCheck: new Date().toLocaleTimeString()
            });
        } catch (err) {
            console.error('Stats fetch failed');
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        setStatus({ type: 'idle' });
        try {
            const res = await fetch('/api/system/backup');
            const data = await res.json();

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `incohub_vault_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setStatus({ type: 'success', message: 'VAULT_EXPORT_SUCCESSFUL' });
        } catch (err) {
            setStatus({ type: 'error', message: 'VAULT_EXPORT_FAILED' });
        } finally {
            setIsExporting(false);
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!confirm('WARNING: Importing a backup will OVERWRITE ALL current data. Do you want to proceed?')) {
            e.target.value = '';
            return;
        }

        setIsImporting(true);
        setStatus({ type: 'idle' });
        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const content = JSON.parse(event.target?.result as string);
                    const res = await fetch('/api/system/restore', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(content),
                    });

                    if (res.ok) {
                        setStatus({ type: 'success', message: 'VAULT_RESTORE_COMPLETE' });
                        fetchStats();
                    } else {
                        throw new Error();
                    }
                } catch (err) {
                    setStatus({ type: 'error', message: 'VAULT_RESTORE_FAILED: DATA_CORRUPTION_OR_INVALID_FORMAT' });
                } finally {
                    setIsImporting(false);
                }
            };
            reader.readAsText(file);
        } catch (err) {
            setIsImporting(false);
            setStatus({ type: 'error', message: 'FILE_READ_ERROR' });
        }
    };

    return (
        <div className=" mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800/50">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-600 shadow-[0_0_10px_rgba(192,38,211,0.8)]" />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-600">Core Infrastructure</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">Incohub Vault</h1>
                    <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mt-2 px-1 border-l-2 border-fuchsia-600/30">System Integrated Backup & Recovery Control</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <div className="text-[8px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">Global Status</div>
                        <div className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter mt-1">Registry_Link_Stable</div>
                    </div>
                    <div className="w-10 h-10 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white shadow-xl">
                        <Database size={20} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* SYstem Health Summary */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="technical-panel p-6 bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-600 mb-6 flex items-center gap-2">
                            <HardDrive size={12} />
                            Database_Metrics
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800/50">
                                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Wire_Logs</span>
                                <span className="text-lg font-black text-zinc-900 dark:text-white">{dbStats.wires}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800/50">
                                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Equip_Logs</span>
                                <span className="text-lg font-black text-zinc-900 dark:text-white">{dbStats.equipment}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Last_Health_Check</span>
                                <span className="text-[10px] font-black text-fuchsia-600 dark:text-fuchsia-400 mono">{dbStats.lastCheck || 'SYNCING...'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 bg-fuchsia-600/5 border border-fuchsia-600/10 rounded-sm">
                        <div className="flex items-start gap-4">
                            <ShieldCheck className="text-fuchsia-600 shrink-0" size={20} />
                            <div className="space-y-1">
                                <h4 className="text-[10px] font-black text-fuchsia-600 uppercase tracking-widest">Vault_Security</h4>
                                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                                    Backups contain full machine histories. Store exported JSON files in a secured physical or cloud storage.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="technical-panel p-6 bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-600 mb-6 flex items-center gap-2">
                            <Globe size={12} className="text-emerald-500" />
                            Cloud_Aegis_Recovery
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                <span className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-wider">Neon_PITR: ACTIVE</span>
                            </div>
                            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                                Continuous point-in-time recovery is enabled via Neon infrastructure. Your data is protected by secondary cloud snapshots.
                            </p>
                            <div className="pt-2">
                                <div className="text-[8px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-2">Protection_Window</div>
                                <div className="flex gap-1">
                                    {Array.from({ length: 7 }).map((_, i) => (
                                        <div key={i} className="h-1 flex-1 bg-emerald-500/20 rounded-full overflow-hidden">
                                            <div className="h-full w-full bg-emerald-500 animate-[pulse_2s_infinite]" style={{ animationDelay: `${i * 0.2}s` }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Center */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Export Card */}
                        <div className="technical-panel p-8 bg-zinc-900 text-white border-zinc-800 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                                <Download size={80} />
                            </div>
                            <div className="relative z-10 space-y-6">
                                <div className="w-12 h-12 rounded bg-fuchsia-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(192,38,211,0.4)]">
                                    <Download size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black tracking-tight uppercase">Vault_Out</h3>
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-2 leading-loose">
                                        Generate a comprehensive system state backup. All machine records and history will be packed into a portable JSON protocol.
                                    </p>
                                </div>
                                <button
                                    onClick={handleExport}
                                    disabled={isExporting}
                                    className="w-full btn-premium py-4 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                                >
                                    {isExporting ? <RefreshCcw className="animate-spin" size={18} /> : <FileCode size={18} />}
                                    <span>INITIATE_BACKUP</span>
                                </button>
                            </div>
                        </div>

                        {/* Import Card */}
                        <div className="technical-panel p-8 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700 text-zinc-900 dark:text-white">
                                <Upload size={80} />
                            </div>
                            <div className="relative z-10 space-y-6">
                                <div className="w-12 h-12 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-900 dark:text-white">
                                    <Upload size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">Vault_In</h3>
                                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-2 leading-loose">
                                        Inject a previous system state into the registry. <span className="text-red-500 font-black">WARNING:</span> This action will replace all current data.
                                    </p>
                                </div>
                                <label className="w-full btn-premium-secondary py-4 flex items-center justify-center gap-3 active:scale-[0.98] transition-all cursor-pointer">
                                    {isImporting ? <RefreshCcw className="animate-spin" size={18} /> : <Upload size={18} />}
                                    <span>RESTORE_REGISTRY</span>
                                    <input
                                        type="file"
                                        accept=".json"
                                        className="hidden"
                                        onChange={handleImport}
                                        disabled={isImporting}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Status Feed */}
                    {status.type !== 'idle' && (
                        <div className={cn(
                            "p-4 rounded-sm border flex items-center gap-4 animate-in slide-in-from-top-4 duration-500",
                            status.type === 'success' ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"
                        )}>
                            {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                            <div className="flex-1">
                                <div className="text-[9px] font-black uppercase tracking-widest leading-none mb-1">Vault_Protocol_Event</div>
                                <div className="text-[11px] font-black uppercase tracking-wider">{status.message}</div>
                            </div>
                        </div>
                    )}

                    <div className="p-6 bg-zinc-50 dark:bg-zinc-[#070708] border border-zinc-200 dark:border-zinc-800 space-y-4">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="text-amber-500" size={16} />
                            <span className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-widest">Protocol_Advisory</span>
                        </div>
                        <ul className="space-y-2">
                            {[
                                'External backups are the only protection against infrastructure failure.',
                                'Always verify the JSON integrity before performing a full registry restore.',
                                'The system maintains an atomic transaction log during vault operations.'
                            ].map((note, i) => (
                                <li key={i} className="flex items-center gap-3 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                                    <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 shrink-0" />
                                    {note}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
