import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Incident, DashboardMetrics } from '../../types';
import { incidentService } from '../../services/incidentService';
import { soundEffects } from '../../utils/soundEffects';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import {
  Download,
  BarChart3,
  TrendingUp,
  Users,
  ShieldAlert,
  Clock,
  Layers,
  Award,
  Activity,
  Flame,
  CheckCircle2,
} from 'lucide-react';

interface AdminContextType {
  incidents: Incident[];
  onOpenIncident: (incident: Incident) => void;
  onOpenDuplicate: (incident: Incident) => void;
  onSimulate: () => void;
  onReset: () => void;
}

export const AnalyticsPage: React.FC = () => {
  const { incidents } = useOutletContext<AdminContextType>();
  const [metrics, setMetrics] = useState<DashboardMetrics>(() => incidentService.getDashboardMetrics());

  useEffect(() => {
    setMetrics(incidentService.getDashboardMetrics());
  }, [incidents]);

  const handleExportCSV = () => {
    soundEffects.playBeep();
    const csvContent = incidentService.exportIncidentsCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sentrix_analytics_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Casualty distribution by category
  const casualtiesByCategory = metrics.byCategory.map(cat => {
    const totalCasualties = incidents
      .filter(i => i.category === cat.category)
      .reduce((sum, i) => sum + i.peopleAffected, 0);
    return {
      category: cat.category.replace(' Emergency', ''),
      casualties: totalCasualties,
      reports: cat.count,
    };
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto selection:bg-sentinel-cyan/30 selection:text-sentinel-cyan">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
              Intelligence Analytics & Telemetry
            </h1>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-sentinel-cyan/10 text-sentinel-cyan border border-sentinel-cyan/30 font-bold flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-sentinel-cyan animate-pulse" />
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Empirical incident distribution, multi-casualty impact correlation, and AI response priority benchmarking.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sentinel-cyan hover:bg-cyan-300 text-sentinel-navy text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-sentinel-cyan/20 transition-all active:scale-95"
        >
          <Download className="w-4 h-4 text-sentinel-navy" />
          <span>Export Analytics CSV</span>
        </button>
      </div>

      {/* KPI Quad */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-5 rounded-2xl glass-panel border border-sentinel-darkBorder shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 font-bold block font-mono">
            Avg Priority Score
          </span>
          <span className="font-mono text-2xl sm:text-3xl font-black text-sentinel-cyan mt-1 block">
            {metrics.avgPriorityScore}
            <span className="text-xs sm:text-sm text-slate-400 font-normal"> / 100</span>
          </span>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 flex items-center gap-1 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-sentinel-cyan shrink-0" /> Weighted triage index
          </p>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl glass-panel border border-sentinel-darkBorder shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full blur-xl pointer-events-none" />
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 font-bold block font-mono">
            Total Casualties
          </span>
          <span className="font-mono text-2xl sm:text-3xl font-black text-red-400 mt-1 block">
            {metrics.totalCasualties}
          </span>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 flex items-center gap-1 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" /> Across 6 categories
          </p>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl glass-panel border border-sentinel-darkBorder shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 font-bold block font-mono">
            Resolution Rate
          </span>
          <span className="font-mono text-2xl sm:text-3xl font-black text-emerald-400 mt-1 block">
            {metrics.total > 0 ? Math.round((metrics.resolved / metrics.total) * 100) : 0}%
          </span>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 flex items-center gap-1 truncate">
            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /> {metrics.resolved} of {metrics.total} cleared
          </p>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl glass-panel border border-sentinel-darkBorder shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 font-bold block font-mono">
            Critical Ratio
          </span>
          <span className="font-mono text-2xl sm:text-3xl font-black text-amber-400 mt-1 block">
            {metrics.total > 0 ? Math.round((metrics.critical / metrics.total) * 100) : 0}%
          </span>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 flex items-center gap-1 truncate">
            <Flame className="w-3 h-3 text-amber-400 shrink-0" /> Rapid dispatch
          </p>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Casualty Impact by Category */}
        <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-sentinel-darkBorder shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">
                Casualties & People Affected by Category
              </h3>
              <p className="text-xs text-slate-400">Total volume of individuals registered at risk</p>
            </div>
            <div className="p-2 rounded-xl bg-sentinel-red/10 text-sentinel-red">
              <Users className="w-5 h-5 text-sentinel-red" />
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={casualtiesByCategory}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1F293D" opacity={0.5} />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 10, fill: '#94A3B8' }}
                  angle={-15}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#071426',
                    borderColor: '#16C7E8',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                  }}
                />
                <Bar dataKey="casualties" fill="#F04452" radius={[6, 6, 0, 0]} name="People Affected" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Proportions */}
        <div className="glass-panel p-6 rounded-2xl border border-sentinel-darkBorder shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">
                Severity Ratio Distribution
              </h3>
              <p className="text-xs text-slate-400">Relative proportions of classified emergency tiers</p>
            </div>
            <div className="p-2 rounded-xl bg-sentinel-cyan/10 text-sentinel-cyan">
              <ShieldAlert className="w-5 h-5 text-sentinel-cyan" />
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.bySeverity}
                  dataKey="count"
                  nameKey="severity"
                  cx="50%"
                  cy="50%"
                  outerRadius={88}
                  innerRadius={36}
                  stroke="#08101E"
                  strokeWidth={2}
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`
                  }
                >
                  {metrics.bySeverity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#071426',
                    borderColor: '#16C7E8',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
