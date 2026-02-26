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
  History as HistoryIcon,
  Activity,
  Zap,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Truck,
  Database
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

interface ProductionRecord {
  id: string;
  date: string;
  amount: number;
}

interface DispatchRecord {
  id: string;
  date: string;
  amount: number;
}

export default function Dashboard() {
  const [wireData, setWireData] = React.useState<WireRecord[]>([]);
  const [equipmentData, setEquipmentData] = React.useState<EquipmentRecord[]>([]);
  const [productionData, setProductionData] = React.useState<ProductionRecord[]>([]);
  const [dispatchData, setDispatchData] = React.useState<DispatchRecord[]>([]);

  const [prodDate, setProdDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [prodAmount, setProdAmount] = React.useState('');
  const [dispDate, setDispDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [dispAmount, setDispAmount] = React.useState('');
  const [isSubmittingProd, setIsSubmittingProd] = React.useState(false);
  const [isSubmittingDisp, setIsSubmittingDisp] = React.useState(false);

  const [isLoading, setIsLoading] = React.useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const [wireRes, equipRes, prodRes, dispRes] = await Promise.all([
        fetch('/api/wire-records'),
        fetch('/api/equipment-records'),
        fetch('/api/production'),
        fetch('/api/dispatch')
      ]);

      if (wireRes.ok && equipRes.ok && prodRes.ok && dispRes.ok) {
        const [wires, equips, prods, disps] = await Promise.all([
          wireRes.json(),
          equipRes.json(),
          prodRes.json(),
          dispRes.json()
        ]);
        setWireData(wires);
        setEquipmentData(equips);
        setProductionData(prods);
        setDispatchData(disps);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitProduction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodDate || !prodAmount) return;
    setIsSubmittingProd(true);
    try {
      const res = await fetch('/api/production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: prodDate, amount: prodAmount })
      });
      if (res.ok) {
        setProdAmount('');
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to submit production:', error);
    } finally {
      setIsSubmittingProd(false);
    }
  };

  const submitDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispDate || !dispAmount) return;
    setIsSubmittingDisp(true);
    try {
      const res = await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dispDate, amount: dispAmount })
      });
      if (res.ok) {
        setDispAmount('');
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to submit dispatch:', error);
    } finally {
      setIsSubmittingDisp(false);
    }
  };

  React.useEffect(() => {
    fetchStats();
  }, []);

  const totalLogsCount = wireData.length + equipmentData.length;

  const allDates = [
    ...wireData.map(r => r.changeDate),
    ...equipmentData.map(r => r.changeDate),
    ...productionData.map(r => r.date),
    ...dispatchData.map(r => r.date)
  ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const lastUpdate = allDates.length > 0
    ? allDates[0].replace(/-/g, '.')
    : '--.--.----';

  const today = new Date().toISOString().split('T')[0];
  const currentMonth = today.substring(0, 7); // YYYY-MM

  const todayProduction = productionData.filter(p => p.date === today).reduce((sum, p) => sum + p.amount, 0);
  const todayDispatch = dispatchData.filter(d => d.date === today).reduce((sum, d) => sum + d.amount, 0);

  const monthProduction = productionData.filter(p => p.date.startsWith(currentMonth)).reduce((sum, p) => sum + p.amount, 0);
  const monthDispatch = dispatchData.filter(d => d.date.startsWith(currentMonth)).reduce((sum, d) => sum + d.amount, 0);

  const totalProduction = productionData.reduce((sum, p) => sum + p.amount, 0);
  const totalDispatch = dispatchData.reduce((sum, d) => sum + d.amount, 0);
  const currentStock = totalProduction - totalDispatch;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)] animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-600">Incohub Maintenance System</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900 dark:text-white leading-none">
            DASHBOARD
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="technical-panel px-6 py-3 min-w-[140px] flex items-center justify-between">
            <div>
              <div className="text-[9px] uppercase text-zinc-400 font-bold tracking-[0.2em] mb-1">System Status</div>
              <div className="text-lg font-black text-emerald-500 mono uppercase tracking-tight flex items-center gap-2">
                Online
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stock & Flow Section */}
      <div className="space-y-4">

        {/* Secondary Header for Section */}
        <div className="flex items-center justify-between pb-2 border-b border-border/30">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Live Telemetry</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/stock-history" className="text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1">
              View Ledger <ArrowRight size={10} />
            </Link>
            <Activity size={12} className="text-zinc-400" />
          </div>
        </div>

        {/* KPI Command Center */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="technical-panel p-6 flex flex-col justify-between group hover:border-primary transition-colors">
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
              <Activity size={14} className="text-emerald-500" />
              Today Production
            </div>
            <div className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight tabular-nums group-hover:text-emerald-500 transition-colors">
              {Number(todayProduction.toFixed(2))} <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">MT</span>
            </div>
          </div>

          <div className="technical-panel p-6 flex flex-col justify-between group hover:border-primary transition-colors">
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
              <Truck size={14} className="text-blue-500" />
              Today Dispatch
            </div>
            <div className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight tabular-nums group-hover:text-blue-500 transition-colors">
              {Number(todayDispatch.toFixed(2))} <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">MT</span>
            </div>
          </div>

          <Link href="/stock-history" className="technical-panel p-6 flex flex-col justify-between group hover:border-primary transition-colors cursor-pointer bg-zinc-50 dark:bg-zinc-900/40 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-[0.03] text-primary group-hover:scale-110 group-hover:-translate-y-2 group-hover:-translate-x-2 transition-transform duration-500 z-0">
              <Database size={100} />
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white mb-3 flex justify-between items-start relative z-10">
              <div className="flex items-center gap-2">
                <Database size={14} className="text-primary" />
                Total Stock In Hand
              </div>
              <ArrowRight size={14} className="text-zinc-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <div className="text-5xl font-black text-zinc-900 dark:text-white tracking-tighter tabular-nums drop-shadow-sm group-hover:text-primary transition-colors relative z-10">
              {Number(currentStock.toFixed(2))} <span className="text-[12px] opacity-70 uppercase tracking-widest font-bold text-zinc-500">MT</span>
            </div>
          </Link>
        </div>

        {/* Quick Entry Action Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <form onSubmit={submitProduction} className="technical-panel p-1 flex flex-col sm:flex-row items-center gap-2 group transition-colors">
            <div className="flex items-center gap-3 px-4 py-3 sm:py-0 min-w-[140px] w-full sm:w-auto border-b sm:border-b-0 sm:border-r border-border">
              <span className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em] whitespace-nowrap">Log Production</span>
            </div>

            <div className="flex-grow flex items-center gap-2 px-2 py-2 sm:py-0 w-full">
              <input type="date" value={prodDate} onChange={e => setProdDate(e.target.value)} required
                className="flex-1 min-w-[120px] bg-background border border-border px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary transition-colors text-foreground" />
              <input type="number" step="0.01" value={prodAmount} onChange={e => setProdAmount(e.target.value)} placeholder="0.00 MT" required
                className="w-24 sm:w-32 flex-shrink-0 bg-background border border-border px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary transition-colors font-mono text-foreground" />
            </div>

            <button type="submit" disabled={isSubmittingProd} className="w-full sm:w-auto btn-premium m-1">
              {isSubmittingProd ? 'Saving...' : 'Add Record'}
            </button>
          </form>

          <form onSubmit={submitDispatch} className="technical-panel p-1 flex flex-col sm:flex-row items-center gap-2 group transition-colors">
            <div className="flex items-center gap-3 px-4 py-3 sm:py-0 min-w-[140px] w-full sm:w-auto border-b sm:border-b-0 sm:border-r border-border">
              <span className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] whitespace-nowrap">Log Dispatch</span>
            </div>

            <div className="flex-grow flex items-center gap-2 px-2 py-2 sm:py-0 w-full">
              <input type="date" value={dispDate} onChange={e => setDispDate(e.target.value)} required
                className="flex-1 min-w-[120px] bg-background border border-border px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary transition-colors text-foreground" />
              <input type="number" step="0.01" value={dispAmount} onChange={e => setDispAmount(e.target.value)} placeholder="0.00 MT" required
                className="w-24 sm:w-32 flex-shrink-0 bg-background border border-border px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary transition-colors font-mono text-foreground" />
            </div>

            <button type="submit" disabled={isSubmittingDisp} className="w-full sm:w-auto btn-premium m-1">
              {isSubmittingDisp ? 'Saving...' : 'Add Record'}
            </button>
          </form>
        </div>
      </div>

      {/* Module Navigation Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

        {/* Primary Module */}
        <div className="md:col-span-8">
          <Link href="/wire-records" className="block group h-full">
            <div className="technical-panel p-6 md:p-10 group-hover:border-primary/50 transition-colors relative overflow-hidden h-full">

              <div className="absolute right-0 top-0 w-32 h-32 opacity-[0.03] text-fuchsia-500 transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-700">
                <Layers size={128} />
              </div>

              <div className="flex justify-between items-start mb-16 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary flex items-center justify-center text-primary-foreground">
                    <Layers size={20} />
                  </div>
                  <div>
                    <div className="text-[12px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">Directory 01</div>
                    <div className="text-[9px] font-medium text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mt-1">Maintenance Ledgers</div>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground transition-all duration-300">
                  <ArrowRight size={16} />
                </div>
              </div>

              <div className="space-y-6 relative z-10">
                <div>
                  <h2 className="text-3xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter leading-none uppercase mb-4">Bottom & <br />Press Wire</h2>
                  <p className="text-xs md:text-sm font-medium text-zinc-500 dark:text-zinc-500 max-w-md leading-relaxed">
                    Comprehensive production and lifecycle tracking for primary machine paper wire components.
                  </p>
                </div>

                <div className="flex items-center gap-6 pt-6 border-t border-border/20">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Database Active</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Support Modules */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <Link href="/equipment-records" className="group flex-1">
            <div className="technical-panel h-full p-8 group-hover:border-primary transition-colors flex flex-col justify-between">

              <div className="flex justify-between items-center mb-10">
                <Settings size={18} className="text-zinc-400 group-hover:text-primary transition-colors" />
                <span className="text-[9px] font-black text-zinc-300 dark:text-zinc-800 tracking-[0.3em]">MOD-2</span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase mb-2">Equipment<br />Records</h3>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Parts & Maintenance</p>
              </div>
            </div>
          </Link>

          <Link href="/history" className="group flex-1">
            <div className="technical-panel h-full p-8 group-hover:border-primary transition-colors flex flex-col justify-between">

              <div className="flex justify-between items-center mb-10">
                <HistoryIcon size={18} className="text-zinc-400 group-hover:text-primary transition-colors" />
                <span className="text-[9px] font-black text-zinc-300 dark:text-zinc-800 tracking-[0.3em]">MOD-3</span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase mb-2">Master<br />History</h3>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Global Activity Log</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Status Footer */}
      <div className="py-4 px-6 border border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden mt-6">
        {isLoading && (
          <div className="absolute inset-x-0 bottom-0 h-[2px] bg-primary/20 animate-pulse">
            <div className="h-full bg-primary w-1/3 animate-[loading_1.5s_infinite_ease-in-out]" />
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total Logs:</span>
            <span className="text-[10px] font-black text-foreground mono bg-background px-2 py-0.5 rounded-[1px] border border-border">
              {isLoading ? '...' : totalLogsCount.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest sm:block hidden">Last Update:</span>
            <span className="text-[10px] font-black text-foreground mono sm:block hidden">
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
