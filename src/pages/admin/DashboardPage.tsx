import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Incident, DashboardMetrics } from '../../types';
import { incidentService } from '../../services/incidentService';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CategoryBadge } from '../../components/common/CategoryBadge';
import { PriorityGauge } from '../../components/common/PriorityGauge';
import {
  ShieldAlert,
  Clock,
  Activity,
  CheckCircle2,
  Users,
  Zap,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Flame,
  Radio,
  FileSpreadsheet,
} from 'lucide-react';
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
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';

interface AdminContextType {
  incidents: Incident[];
  onOpenIncident: (incident: Incident) => void;
  onOpenDuplicate: (incident: Incident) => void;
  onSimulate: () => void;
  onReset: () => void;
}

export const DashboardPage: React.FC = () => {
  const { incidents, onOpenIncident, onOpenDuplicate, onSimulate } = useOutletContext<AdminContextType>();
  const [metrics, setMetrics] = useState<DashboardMetrics>(() => incidentService.getDashboardMetrics());

  useEffect(() => {
    setMetrics(incidentService.getDashboardMetrics());
  }, [incidents]);

  const criticalQueue = incidents
    .filter(i => i.severity === 'Critical' && i.status !== 'Resolved')
    .slice(0, 5);

  const duplicateAlerts = incidents.filter(i => Boolean(i.duplicateWarning) && i.status !== 'Resolved');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner Alert if Criticals Exist */}
      {criticalQueue.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-500/10 dark:bg-red-950/30 border border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sentinel-red text-white flex items-center justify-center animate-pulse shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-600 dark:text-red-400">
                CRITICAL EMERGENCY ALERT: {criticalQueue.length} Active Incident(s) Require Priority Dispatch
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Mass casualty or life-threatening structural/fire conditions detected. Immediate deployment needed.
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenIncident(criticalQueue[0])}
            className="px-4 py-2 rounded-xl bg-sentinel-red hover:bg-red-600 text-white text-xs font-bold shrink-0 shadow-md shadow-sentinel-red/25 transition-all flex items-center justify-center gap-1.5"
          >
            <span>Review Top Priority #{criticalQueue[0].incidentCode}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Command Overview
            </h1>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Centralized intelligence telemetry, explainable severity classification, and active unit response.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSimulate}
            className="px-4 py-2 rounded-xl bg-sentinel-red text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-sentinel-red/25 hover:bg-red-600 transition-all active:scale-95"
          >
            <Zap className="w-4 h-4" />
            <span>Simulate Emergency</span>
          </button>

          <Link
            to="/admin/incidents"
            className="px-4 py-2 rounded-xl bg-white dark:bg-sentinel-darkCard border border-slate-200 dark:border-sentinel-darkBorder hover:border-sentinel-cyan text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <span>View All Incidents</span>
            <ArrowRight className="w-3.5 h-3.5 text-sentinel-cyan" />
          </Link>
        </div>
      </div>

      {/* DASHBOARD STATISTICS CARDS (5 Essential Metrics + Casualties) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Incidents */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-sentinel-darkCard border border-slate-200 dark:border-sentinel-darkBorder shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
              Total Reported
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {metrics.total}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span className="text-emerald-500 font-bold">100%</span> persistent records
          </div>
        </div>

        {/* Critical Incidents */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-sentinel-darkCard border-2 border-red-500/40 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Critical
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center animate-pulse">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400">
            {metrics.critical}
          </div>
          <div className="text-[11px] text-red-500/80 font-medium">
            Requires immediate action
          </div>
        </div>

        {/* Pending Incidents */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-sentinel-darkCard border border-slate-200 dark:border-sentinel-darkBorder shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
              Pending
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
            {metrics.pending}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Awaiting triage/dispatch
          </div>
        </div>

        {/* In Progress */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-sentinel-darkCard border border-slate-200 dark:border-sentinel-darkBorder shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-bold">
              In Progress
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-400">
            {metrics.inProgress}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Field units engaged
          </div>
        </div>

        {/* Resolved */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-sentinel-darkCard border border-slate-200 dark:border-sentinel-darkBorder shadow-xs space-y-2 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">
              Resolved
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {metrics.resolved}
          </div>
          <div className="text-[11px] text-emerald-600/80 font-medium">
            Scene cleared & closed
          </div>
        </div>
      </div>

      {/* DATA VISUALIZATIONS SECTION (Using Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Incidents by Category (Bar Chart) - 7 Cols */}
        <div className="lg:col-span-7 bg-white dark:bg-sentinel-darkCard p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-sentinel-darkBorder shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Incidents by Emergency Category
              </h3>
              <p className="text-xs text-slate-400">
                Distribution across 6 challenge categories with critical incident overlay
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-sentinel-cyan bg-cyan-50 dark:bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-200 dark:border-cyan-800">
              6 Categories
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.byCategory}
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
                <Bar dataKey="count" fill="#16C7E8" radius={[6, 6, 0, 0]} name="Total Reports" />
                <Bar dataKey="criticalCount" fill="#F04452" radius={[6, 6, 0, 0]} name="Critical" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution (Donut Pie Chart) - 5 Cols */}
        <div className="lg:col-span-5 bg-white dark:bg-sentinel-darkCard p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-sentinel-darkBorder shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Incident Severity Breakdown
              </h3>
              <p className="text-xs text-slate-400">Smart AI classified risk hierarchy</p>
            </div>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.bySeverity}
                  dataKey="count"
                  nameKey="severity"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
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

          {/* Custom Severity Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            {metrics.bySeverity.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium text-slate-700 dark:text-slate-300">{item.severity}</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 24-Hour Trend & Volume Timeline - 7 Cols */}
        <div className="lg:col-span-7 bg-white dark:bg-sentinel-darkCard p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-sentinel-darkBorder shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                24-Hour Incident Inflow & Response Volume
              </h3>
              <p className="text-xs text-slate-400">Hourly aggregation of incoming emergency dispatches</p>
            </div>
            <TrendingUp className="w-5 h-5 text-sentinel-cyan" />
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={metrics.timeline}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16C7E8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#16C7E8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="timeLabel" tick={{ fontSize: 10, fill: '#94A3B8' }} />
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
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#16C7E8"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                  name="Volume"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incident Status Pipeline - 5 Cols */}
        <div className="lg:col-span-5 bg-white dark:bg-sentinel-darkCard p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-sentinel-darkBorder shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Incident Operational Pipeline
              </h3>
              <p className="text-xs text-slate-400">Status progression from reporting to scene resolution</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {metrics.byStatus.map((st, idx) => {
              const pct = metrics.total > 0 ? Math.round((st.count / metrics.total) * 100) : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{st.status}</span>
                    <span className="font-mono text-slate-900 dark:text-white">
                      {st.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: st.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Average Priority Score:</span>
            <span className="font-mono font-bold text-sentinel-cyan text-sm">
              {metrics.avgPriorityScore} / 100
            </span>
          </div>
        </div>
      </div>

      {/* Critical Priority Queue */}
      <div className="bg-white dark:bg-sentinel-darkCard rounded-2xl border border-slate-200 dark:border-sentinel-darkBorder p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Critical Priority Queue (Immediate Dispatch)
              </h3>
              <p className="text-xs text-slate-400">
                Sorted by computed Priority Score & casualty severity
              </p>
            </div>
          </div>

          <Link
            to="/admin/incidents?severity=Critical"
            className="text-xs font-bold text-sentinel-red hover:underline flex items-center gap-1"
          >
            <span>View All Critical</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {criticalQueue.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            ✅ All critical emergencies have been resolved or stabilized.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {criticalQueue.map(inc => (
              <div
                key={inc.id}
                onClick={() => onOpenIncident(inc)}
                className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-xl cursor-pointer transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sentinel-cyan">
                      {inc.incidentCode}
                    </span>
                    <CategoryBadge category={inc.category} size="sm" />
                    <SeverityBadge severity={inc.severity} size="sm" />
                    <StatusBadge status={inc.status} size="sm" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                    {inc.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    📍 {inc.location} • 👥 {inc.peopleAffected} casualties reported
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <PriorityGauge score={inc.priorityScore} size="sm" showLabel={false} />
                  <span className="text-xs font-semibold text-sentinel-cyan hover:underline flex items-center gap-1">
                    Open Dossier <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
