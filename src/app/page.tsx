'use client';

import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Settings,
  Layers,
  ArrowRight,
  ClipboardList,
  History as HistoryIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface WireRecord {
  id: string;
  changeDate: string;
}

interface EquipmentRecord {
  id: string;
  changeDate: string;
}

export default function Dashboard() {
  const [wireData, setWireData] = React.useState<WireRecord[]>([]);
  const [equipmentData, setEquipmentData] = React.useState<EquipmentRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
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
      console.error("Failed to fetch dashboard stats", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStats();
  }, []);

  const totalLogsCount = wireData.length + equipmentData.length;

  const allDates = [
    ...wireData.map(r => r.changeDate),
    ...equipmentData.map(r => r.changeDate)
  ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const lastUpdate = allDates.length > 0
    ? allDates[0].replace(/-/g, '.')
    : '--.--.----';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800/50">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-1 rounded-full bg-fuchsia-600 shadow-[0_0_8px_rgba(192,38,211,0.8)]" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-600">Incohub Maintenance System</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900 dark:text-white leading-none">
            DASHBOARD
          </h1>
        </div>
        <div className="flex gap-4">
          <div className="technical-panel px-6 py-3 min-w-[140px]">
            <div className="text-[9px] uppercase text-zinc-400 font-black tracking-[0.2em] mb-1">Status</div>
            <div className="text-xl font-black text-emerald-500 mono uppercase tracking-tighter">Online</div>
          </div>
        </div>
      </div>

      {/* Grid Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

        {/* Module Area 01 - Primary Ledger */}
        <div className="md:col-span-8">
          <Link href="/wire-records" className="block group">
            <div className="technical-panel p-6 md:p-10 bg-zinc-50/50 dark:bg-zinc-900/20 group-hover:border-fuchsia-500/50 transition-colors relative overflow-hidden">
              {/* Aesthetic Background Grid Element */}
              <div className="absolute right-0 top-0 w-32 h-32 opacity-[0.03] text-fuchsia-500 transform translate-x-10 -translate-y-10">
                <Layers size={128} />
              </div>

              <div className="flex justify-between items-start mb-16 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-900">
                    <Layers size={20} />
                  </div>
                  <div>
                    <div className="text-[12px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">Module 1</div>
                    <div className="text-[9px] font-medium text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mt-1">Wire Change Records</div>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center group-hover:bg-fuchsia-600 group-hover:border-fuchsia-600 group-hover:text-white transition-all duration-300">
                  <ArrowRight size={16} />
                </div>
              </div>

              <div className="space-y-6 relative z-10">
                <div>
                  <h2 className="text-3xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter leading-none uppercase mb-4">Bottom & Press Wire</h2>
                  <p className="text-xs md:text-sm font-medium text-zinc-500 dark:text-zinc-500 max-w-md leading-relaxed">
                    Maintain production and change history for Bottom Wire, Press Bottom Wire, and other wire components.
                  </p>
                </div>

                <div className="flex items-center gap-6 pt-6 border-t border-zinc-200/50 dark:border-zinc-800/20">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Entry Ready</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Support Modules */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <Link href="/equipment-records" className="group flex-1">
            <div className="technical-panel h-full p-8 group-hover:border-zinc-900 dark:group-hover:border-white transition-colors flex flex-col justify-between">
              <div className="flex justify-between items-center mb-8">
                <Settings size={18} className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                <span className="text-[9px] font-black text-zinc-300 dark:text-zinc-800 tracking-[0.3em]">MODULE 2</span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-white leading-tight uppercase mb-2">Equipment Records</h3>
                <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest leading-relaxed">Parts history & maintenance</p>
              </div>
            </div>
          </Link>

          <Link href="/history" className="group flex-1">
            <div className="technical-panel h-full p-8 group-hover:border-zinc-900 dark:group-hover:border-white transition-colors flex flex-col justify-between">
              <div className="flex justify-between items-center mb-8">
                <HistoryIcon size={18} className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                <span className="text-[9px] font-black text-zinc-300 dark:text-zinc-800 tracking-[0.3em]">MODULE 3</span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-white leading-tight uppercase mb-2">Master History</h3>
                <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest leading-relaxed">Consolidated activity log</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Summary Row */}
      <div className="py-4 px-6 border border-zinc-200 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/20 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-x-0 bottom-0 h-[2px] bg-fuchsia-500/20 animate-pulse">
            <div className="h-full bg-fuchsia-600 w-1/3 animate-[loading_1.5s_infinite_ease-in-out]" />
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total Logs:</span>
            <span className="text-[10px] font-black text-zinc-900 dark:text-white mono bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-[1px] border border-zinc-200 dark:border-zinc-700">
              {isLoading ? '...' : totalLogsCount.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest sm:block hidden">Last Update:</span>
            <span className="text-[10px] font-black text-zinc-900 dark:text-white mono sm:block hidden">
              {isLoading ? 'SYNCING...' : lastUpdate}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isLoading ? "bg-amber-500" : "bg-emerald-500")} />
          <span className={cn("text-[9px] font-black uppercase tracking-widest text-center", isLoading ? "text-amber-600 dark:text-amber-500" : "text-emerald-600 dark:text-emerald-500")}>
            {isLoading ? 'Synchronizing Registry' : 'System Operational'}
          </span>
        </div>
      </div>
    </div>
  );
}
