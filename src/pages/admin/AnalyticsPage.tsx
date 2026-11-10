import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Incident, DashboardMetrics } from '../../types';
import { incidentService } from '../../services/incidentService';
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
    const csvContent = incidentService.exportIncidentsCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sentinel360_analytics_report_${Date.now()}.csv`);
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
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Intelligence Analytics & Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quantitative analysis of incident patterns, casualty impact, and system triage performance.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-xl bg-sentinel-navy hover:bg-sentinel-darkBlue text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-center"
        >
          <Download className="w-4 h-4 text-sentinel-cyan" />
          <span>Export Analytics CSV</span>
        </button>
      </div>

      {/* KPI Quad */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-sentinel-darkCard border border-slate-200 dark:border-sentinel-darkBorder shadow-xs">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
            Average Priority Score
          </span>
          <span className="font-mono text-3xl font-black text-sentinel-cyan mt-1 block">
            {metrics.avgPriorityScore}
            <span className="text-sm text-slate-400 font-normal"> / 100</span>
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Weighted operational triage</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-sentinel-darkCard border border-slate-200 dark:border-sentinel-darkBorder shadow-xs">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
            Total Casualties Logged
          </span>
          <span className="font-mono text-3xl font-black text-red-500 mt-1 block">
            {metrics.totalCasualties}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Across all 6 categories</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-sentinel-darkCard border border-slate-200 dark:border-sentinel-darkBorder shadow-xs">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
            Resolution Rate
          </span>
          <span className="font-mono text-3xl font-black text-emerald-500 mt-1 block">
            {metrics.total > 0 ? Math.round((metrics.resolved / metrics.total) * 100) : 0}%
          </span>
          <p className="text-[11px] text-slate-500 mt-1">
            {metrics.resolved} of {metrics.total} cleared
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-sentinel-darkCard border border-slate-200 dark:border-sentinel-darkBorder shadow-xs">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
            Critical Incident Ratio
          </span>
          <span className="font-mono text-3xl font-black text-amber-500 mt-1 block">
            {metrics.total > 0 ? Math.round((metrics.critical / metrics.total) * 100) : 0}%
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Requiring rapid intervention</p>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Casualty Impact by Category */}
        <div className="bg-white dark:bg-sentinel-darkCard p-6 rounded-2xl border border-slate-200 dark:border-sentinel-darkBorder shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Casualties & People Affected by Category
              </h3>
              <p className="text-xs text-slate-400">Total volume of individuals reported at risk</p>
            </div>
            <Users className="w-5 h-5 text-sentinel-red" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={casualtiesByCategory}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
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
                  }}
                />
                <Bar dataKey="casualties" fill="#F04452" radius={[6, 6, 0, 0]} name="People Affected" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Proportions */}
        <div className="bg-white dark:bg-sentinel-darkCard p-6 rounded-2xl border border-slate-200 dark:border-sentinel-darkBorder shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Severity Ratio Distribution
              </h3>
              <p className="text-xs text-slate-400">Relative proportions of classified emergency tiers</p>
            </div>
            <ShieldAlert className="w-5 h-5 text-sentinel-cyan" />
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
                  outerRadius={90}
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
