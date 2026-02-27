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
  Database,
  Calendar
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
  const [stockData, setStockData] = React.useState<any[]>([]);
  const [systemConfigs, setSystemConfigs] = React.useState<{ key: string, value: string }[]>([]);

  const [prodDate, setProdDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [prodAmount, setProdAmount] = React.useState('');
  const [dispDate, setDispDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [dispAmount, setDispAmount] = React.useState('');
  const [stockDate, setStockDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [stockAmount, setStockAmount] = React.useState('');
  const [isSubmittingProd, setIsSubmittingProd] = React.useState(false);
  const [isSubmittingDisp, setIsSubmittingDisp] = React.useState(false);
  const [isSubmittingStock, setIsSubmittingStock] = React.useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);

  const [isLoading, setIsLoading] = React.useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const [wireRes, equipRes, prodRes, dispRes, stockRes] = await Promise.all([
        fetch('/api/wire-records'),
        fetch('/api/equipment-records'),
        fetch('/api/production'),
        fetch('/api/dispatch'),
        fetch('/api/stock')
      ]);

      if (wireRes.ok && equipRes.ok && prodRes.ok && dispRes.ok && stockRes.ok) {
        const [wires, equips, prods, disps, stocks] = await Promise.all([
          wireRes.json(),
          equipRes.json(),
          prodRes.json(),
          dispRes.json(),
          stockRes.json()
        ]);
        setWireData(wires);
        setEquipmentData(equips);
        setProductionData(prods);
        setDispatchData(disps);
        setStockData(stocks);
        const configsRes = await fetch('/api/system/config');
        if (configsRes.ok) {
          setSystemConfigs(await configsRes.json());
        }
      }
    } catch (error) {
      // In production, we'd use a proper error reporting service here
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
      // Handle production logging appropriately
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
      // Production error handling logic goes here
    } finally {
      setIsSubmittingDisp(false);
    }
  };

  const submitStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockDate || !stockAmount) return;
    setIsSubmittingStock(true);
    try {
      const res = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: stockDate, amount: stockAmount })
      });
      if (res.ok) {
        setStockAmount('');
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to submit stock:', error);
    } finally {
      setIsSubmittingStock(false);
    }
  };

  const updateMachineStatus = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch('/api/system/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'machineStatus', value: newStatus })
      });
      if (res.ok) {
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to update machine status:', error);
    } finally {
      setIsUpdatingStatus(false);
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
  const currentStock = stockData.length > 0 ? stockData[0].amount : 0;

  const machineStatus = systemConfigs.find(c => c.key === 'machineStatus')?.value || 'OFFLINE';
  const todayDowntime = (equipmentData as any[]).filter(e => e.changeDate === today).reduce((sum, e) => sum + (e.downtimeMinutes || 0), 0);
  const activeWire = (wireData as any[]).sort((a, b) => new Date(b.changeDate).getTime() - new Date(a.changeDate).getTime()).find(w => !w.productionAtRemoval);
  const lastWireChange = (wireData as any[]).length > 0 ? (wireData as any[]).sort((a, b) => new Date(b.changeDate).getTime() - new Date(a.changeDate).getTime())[0].changeDate : '--';
  const lowStockThreshold = 50; // MT

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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">

          <div className="technical-panel p-6 flex flex-col justify-between group hover:border-primary transition-colors">
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
              <Zap size={14} className={cn(machineStatus === 'RUNNING' ? "text-emerald-500" : machineStatus === 'STOP' ? "text-red-500" : "text-amber-500")} />
              Machine Status
            </div>
            <div className={cn("text-2xl font-black tracking-tight uppercase mb-4", machineStatus === 'RUNNING' ? "text-emerald-500" : machineStatus === 'STOP' ? "text-red-500" : "text-amber-500")}>
              {machineStatus}
            </div>
            <div className="flex gap-1">
              {['RUNNING', 'STOP', 'MT'].map((s) => (
                <button
                  key={s}
                  onClick={() => updateMachineStatus(s)}
                  disabled={isUpdatingStatus}
                  className={cn(
                    "px-2 py-1 text-[8px] font-black border transition-all",
                    machineStatus === s
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-black border-transparent shadow-[0_0_10px_rgba(0,0,0,0.1)]"
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-600"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="technical-panel p-6 flex flex-col justify-between group hover:border-primary transition-colors">
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
              <Clock size={14} className="text-amber-500" />
              Today Downtime
            </div>
            <div className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight tabular-nums">
              {todayDowntime} <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">MINS</span>
            </div>
          </div>

          <div className="technical-panel p-6 flex flex-col justify-between group hover:border-primary transition-colors">
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
              <Layers size={14} className="text-fuchsia-500" />
              Active Wire
            </div>
            <div className="text-[12px] font-black text-zinc-900 dark:text-white uppercase truncate">
              {activeWire ? `${activeWire.wireType} (${activeWire.machineName})` : 'NO_ACTIVE_WIRE'}
            </div>
            <div className="text-[9px] text-zinc-500 mt-1 uppercase">Last Change: {lastWireChange.replace(/-/g, '.')}</div>
          </div>

          <div className="technical-panel p-6 flex flex-col justify-between group hover:border-primary transition-colors">
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
              <Activity size={14} className="text-emerald-500" />
              Today Prod
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight tabular-nums">
              {todayProduction.toFixed(1)} <span className="text-[10px] text-zinc-500 uppercase font-bold">MT</span>
            </div>
          </div>

          <div className="technical-panel p-6 flex flex-col justify-between group hover:border-primary transition-colors">
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
              <Truck size={14} className="text-blue-500" />
              Today Dispatch
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight tabular-nums">
              {todayDispatch.toFixed(1)} <span className="text-[10px] text-zinc-500 uppercase font-bold">MT</span>
            </div>
          </div>

          <div className={cn(
            "technical-panel p-6 flex flex-col justify-between group transition-colors relative overflow-hidden",
            currentStock < lowStockThreshold ? "border-red-500 bg-red-500/5 animate-pulse" : "hover:border-primary"
          )}>
            <div className="text-[10px] font-black uppercase tracking-widest mb-3 flex justify-between items-start relative z-10 text-zinc-400">
              <div className="flex items-center gap-2">
                <Database size={14} className={currentStock < lowStockThreshold ? "text-red-500" : "text-primary"} />
                Stock In Hand
              </div>
              {currentStock < lowStockThreshold && (
                <span className="text-[8px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-black animate-bounce">LOW</span>
              )}
            </div>
            <div className="flex flex-col gap-2 relative z-10">
              <div className={cn("text-3xl font-black tracking-tighter tabular-nums", currentStock < lowStockThreshold ? "text-red-500" : "text-zinc-900 dark:text-white")}>
                {currentStock.toLocaleString()} <span className="text-[10px] opacity-70 uppercase font-bold">MT</span>
              </div>

              {/* Visual Stock Level Indicator */}
              <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={cn("h-full transition-all duration-1000 ease-out", currentStock < lowStockThreshold ? "bg-red-500" : "bg-primary")}
                  style={{ width: `${Math.min((currentStock / 500) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[7px] font-black uppercase tracking-widest text-zinc-400">
                <span>0 MT</span>
                <span>Target: 500 MT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Entry Action Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <form onSubmit={submitProduction} className="technical-panel p-4 flex flex-col gap-4 group transition-colors">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em]">Log Production</span>
              <Activity size={14} className="text-emerald-500" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-zinc-500 uppercase">Date</label>
                <input type="date" value={prodDate} onChange={e => setProdDate(e.target.value)} required
                  className="w-full bg-background border border-border px-2 py-1.5 text-xs font-medium focus:outline-none focus:border-primary transition-colors text-foreground" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-zinc-500 uppercase">Amount (MT)</label>
                <input type="number" step="0.01" value={prodAmount} onChange={e => setProdAmount(e.target.value)} placeholder="0.00" required
                  className="w-full bg-background border border-border px-2 py-1.5 text-xs font-medium focus:outline-none focus:border-primary transition-colors font-mono text-foreground" />
              </div>
            </div>

            <button type="submit" disabled={isSubmittingProd} className="btn-premium w-full py-2 text-[10px]">
              {isSubmittingProd ? 'Saving...' : 'Add Production Record'}
            </button>
          </form>

          <form onSubmit={submitDispatch} className="technical-panel p-4 flex flex-col gap-4 group transition-colors">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em]">Log Dispatch</span>
              <Truck size={14} className="text-blue-500" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-zinc-500 uppercase">Date</label>
                <input type="date" value={dispDate} onChange={e => setDispDate(e.target.value)} required
                  className="w-full bg-background border border-border px-2 py-1.5 text-xs font-medium focus:outline-none focus:border-primary transition-colors text-foreground" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-zinc-500 uppercase">Amount (MT)</label>
                <input type="number" step="0.01" value={dispAmount} onChange={e => setDispAmount(e.target.value)} placeholder="0.00" required
                  className="w-full bg-background border border-border px-2 py-1.5 text-xs font-medium focus:outline-none focus:border-primary transition-colors font-mono text-foreground" />
              </div>
            </div>

            <button type="submit" disabled={isSubmittingDisp} className="btn-premium w-full py-2 text-[10px]">
              {isSubmittingDisp ? 'Saving...' : 'Add Dispatch Record'}
            </button>
          </form>

          {/* New Stock Entry Bar */}
          <form onSubmit={submitStock} className="technical-panel p-4 flex flex-col gap-4 group transition-colors border-primary/30 md:col-span-2 xl:col-span-1">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Log Closing Stock</span>
              <Database size={14} className="text-primary" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-zinc-500 uppercase">Closing Date</label>
                <input type="date" value={stockDate} onChange={e => setStockDate(e.target.value)} required
                  className="w-full bg-background border border-border px-2 py-1.5 text-xs font-medium focus:outline-none focus:border-primary transition-colors text-foreground" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-zinc-500 uppercase">Stock (MT)</label>
                <input type="number" step="0.01" value={stockAmount} onChange={e => setStockAmount(e.target.value)} placeholder="0.00" required
                  className="w-full bg-background border border-border px-2 py-1.5 text-xs font-medium focus:outline-none focus:border-primary transition-colors font-mono text-foreground" />
              </div>
            </div>

            <button type="submit" disabled={isSubmittingStock} className="btn-premium w-full py-2 text-[10px] !bg-primary !text-primary-foreground shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
              {isSubmittingStock ? 'Saving...' : 'Update Closing Stock'}
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
