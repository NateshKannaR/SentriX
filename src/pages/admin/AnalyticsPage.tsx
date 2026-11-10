import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Incident, DashboardMetrics } from '../../types';
import { incidentService } from '../../services/incidentService';
import { soundEffects } from '../../utils/soundEffects';
import { useLanguage } from '../../context/LanguageContext';
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
  const { t } = useLanguage();
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t('admin.nav.analytics', 'Intelligence Analytics')}
            </h1>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              {t('dash.liveTelemetry', 'LIVE TELEMETRY')}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Empirical incident distribution, multi-casualty impact correlation, and AI response priority benchmarking.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition-all active:scale-95"
        >
          <Download className="w-4 h-4 text-white" />
          <span>Export Analytics CSV</span>
        </button>
      </div>

      {/* KPI Quad */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0A101D] border border-white/[0.08] shadow-lg relative overflow-hidden group">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 font-bold block font-mono">
            {t('dash.priorityScore', 'Avg Priority Score')}
          </span>
          <span className="font-mono text-2xl sm:text-3xl font-black text-cyan-400 mt-1 block">
            {metrics.avgPriorityScore}
            <span className="text-xs sm:text-sm text-slate-400 font-normal"> / 100</span>
          </span>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 flex items-center gap-1 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" /> Weighted triage index
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0A101D] border border-white/[0.08] shadow-lg relative overflow-hidden group">
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

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0A101D] border border-white/[0.08] shadow-lg relative overflow-hidden group">
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

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0A101D] border border-white/[0.08] shadow-lg relative overflow-hidden group">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 font-bold block font-mono">
            Critical Ratio
          </span>
          <span className="font-mono text-2xl sm:text-3xl font-black text-amber-400 mt-1 block">
            {metrics.total > 0 ? Math.round((metrics.critical / metrics.total) * 100) : 0}%
          </span>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 flex items-center gap-1 truncate">
            <ShieldAlert className="w-3 h-3 text-amber-400 shrink-0" /> {metrics.critical} critical emergencies
          </p>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Casualty Impact by Category */}
        <div className="bg-[#0A101D] p-5 sm:p-6 rounded-3xl border border-white/[0.08] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">
                Casualty Severity Footprint by Category
              </h3>
              <p className="text-xs text-slate-400">Aggregated victims requiring acute medical stabilization</p>
            </div>
            <Users className="w-5 h-5 text-cyan-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={casualtiesByCategory} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.06} />
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#94A3B8' }} angle={-15} textAnchor="end" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#070D18',
                    borderColor: '#06B6D4',
                    borderRadius: '14px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="casualties" fill="#F04452" radius={[6, 6, 0, 0]} name="Casualties" />
                <Bar dataKey="reports" fill="#06B6D4" radius={[6, 6, 0, 0]} name="Reports" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Score Distribution */}
        <div className="bg-[#0A101D] p-5 sm:p-6 rounded-3xl border border-white/[0.08] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">
                Priority Score Velocity Spectrum
              </h3>
              <p className="text-xs text-slate-400">Incident threat level progression (0 - 100 Index)</p>
            </div>
            <TrendingUp className="w-5 h-5 text-cyan-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.06} />
                <XAxis dataKey="timeLabel" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#070D18',
                    borderColor: '#06B6D4',
                    borderRadius: '14px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="avgPriority"
                  stroke="#06B6D4"
                  strokeWidth={3}
                  dot={{ fill: '#06B6D4', r: 4 }}
                  name="Avg Priority Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
