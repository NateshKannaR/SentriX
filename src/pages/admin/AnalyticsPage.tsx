import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Incident, DashboardMetrics, ResponseTeam } from '../../types';
import { incidentService } from '../../services/incidentService';
import { teamService } from '../../services/teamService';
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
  Truck,
  Zap,
  Compass,
  AlertTriangle,
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
  const [teams, setTeams] = useState<ResponseTeam[]>(() => teamService.getTeams());

  useEffect(() => {
    setMetrics(incidentService.getDashboardMetrics());
  }, [incidents]);

  useEffect(() => {
    const unsub = teamService.subscribe(() => {
      setTeams(teamService.getTeams());
    });
    return unsub;
  }, []);

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

  // Response Team workload by category
  const teamWorkloadByCategory = [
    'Fire & Rescue',
    'Medical & Trauma',
    'Disaster & Urban SAR',
    'Police & Evacuation',
    'Hazmat & Chemical',
    'Flood & Marine Rescue',
  ].map(cat => {
    const catTeams = teams.filter(t => t.category === cat);
    return {
      category: cat.replace(' & Rescue', '').replace(' & Trauma', '').replace(' & Evacuation', '').replace(' & Chemical', '').replace(' & Urban SAR', '').replace(' & Marine Rescue', ''),
      available: catTeams.filter(t => t.status === 'Available').length,
      busy: catTeams.filter(t => t.status === 'Busy' || t.status === 'En Route').length,
      offline: catTeams.filter(t => t.status === 'Offline' || t.status === 'Off Duty').length,
    };
  });

  const categoryPieData = metrics.byCategory.map((cat, idx) => {
    const colors = ['#EF4444', '#F97316', '#06B6D4', '#3B82F6', '#8B5CF6', '#10B981'];
    return {
      name: cat.category.replace(' Emergency', ''),
      value: cat.count,
      color: colors[idx % colors.length],
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
            Empirical incident distribution, response team readiness, and multi-agency operational benchmarking.
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

      {/* 8 Mandatory Round 2 Challenge Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Total Emergencies */}
        <div className="p-4 rounded-2xl bg-[#0A101D] border border-white/[0.08] shadow-lg">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            1. Total Emergencies
          </span>
          <span className="font-mono text-2xl font-black text-white mt-1 block">
            {metrics.total}
          </span>
          <p className="text-[10px] font-mono text-slate-400 mt-1">Metropolitan scope</p>
        </div>

        {/* 2. Critical Emergencies */}
        <div className="p-4 rounded-2xl bg-[#0A101D] border border-red-500/30 shadow-lg">
          <span className="text-[10px] font-mono uppercase tracking-wider text-red-400 font-bold block">
            2. Critical Emergencies
          </span>
          <span className="font-mono text-2xl font-black text-red-400 mt-1 block">
            {metrics.critical}
          </span>
          <p className="text-[10px] font-mono text-red-400/80 mt-1">Immediate priority</p>
        </div>

        {/* 3. Available Teams */}
        <div className="p-4 rounded-2xl bg-[#0A101D] border border-emerald-500/30 shadow-lg">
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
            3. Available Teams
          </span>
          <span className="font-mono text-2xl font-black text-emerald-400 mt-1 block">
            {metrics.availableTeams}
          </span>
          <p className="text-[10px] font-mono text-emerald-400/80 mt-1">{metrics.fleetReadinessPercent}% Fleet Ready</p>
        </div>

        {/* 4. Busy Teams */}
        <div className="p-4 rounded-2xl bg-[#0A101D] border border-amber-500/30 shadow-lg">
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
            4. Busy Teams
          </span>
          <span className="font-mono text-2xl font-black text-amber-400 mt-1 block">
            {metrics.busyTeams}
          </span>
          <p className="text-[10px] font-mono text-amber-400/80 mt-1">Active on missions</p>
        </div>

        {/* 5. Assigned Incidents */}
        <div className="p-4 rounded-2xl bg-[#0A101D] border border-indigo-500/30 shadow-lg">
          <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold block">
            5. Assigned Incidents
          </span>
          <span className="font-mono text-2xl font-black text-indigo-400 mt-1 block">
            {metrics.assigned}
          </span>
          <p className="text-[10px] font-mono text-indigo-300 mt-1">Units en route / in field</p>
        </div>

        {/* 6. Resolved Incidents */}
        <div className="p-4 rounded-2xl bg-[#0A101D] border border-emerald-500/30 shadow-lg">
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
            6. Resolved Incidents
          </span>
          <span className="font-mono text-2xl font-black text-emerald-400 mt-1 block">
            {metrics.resolved}
          </span>
          <p className="text-[10px] font-mono text-emerald-400 mt-1">
            {metrics.total > 0 ? Math.round((metrics.resolved / metrics.total) * 100) : 0}% cleared
          </p>
        </div>

        {/* 7. Team Utilization Percentage */}
        <div className="p-4 rounded-2xl bg-[#0A101D] border border-cyan-500/30 shadow-lg">
          <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
            7. Team Utilization
          </span>
          <span className="font-mono text-2xl font-black text-cyan-400 mt-1 block">
            {metrics.teamUtilizationPercent ?? 0}%
          </span>
          <p className="text-[10px] font-mono text-cyan-400/80 mt-1">(Busy / Total Fleet) × 100</p>
        </div>

        {/* 8. Unassigned Emergencies */}
        <div className="p-4 rounded-2xl bg-[#0A101D] border border-rose-500/30 shadow-lg">
          <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold block">
            8. Unassigned Incidents
          </span>
          <span className="font-mono text-2xl font-black text-rose-400 mt-1 block">
            {metrics.unassignedIncidents ?? 0}
          </span>
          <p className="text-[10px] font-mono text-rose-400/80 mt-1">Awaiting dispatch</p>
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

        {/* Incident Distribution by Category (Donut Chart) */}
        <div className="bg-[#0A101D] p-5 sm:p-6 rounded-3xl border border-white/[0.08] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">
                Incident Distribution by Category
              </h3>
              <p className="text-xs text-slate-400">Proportional classification across all reported events</p>
            </div>
            <PieChart className="w-5 h-5 text-cyan-400" />
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#070D18',
                    borderColor: '#06B6D4',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category Pill Badges */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
            {categoryPieData.map(cat => (
              <div key={cat.name} className="flex items-center gap-1.5 text-[11px] font-mono text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                <span>{cat.name}:</span>
                <strong className="text-white">{cat.value}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Incident Lifecycle Pipeline Status */}
        <div className="bg-[#0A101D] p-5 sm:p-6 rounded-3xl border border-white/[0.08] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">
                Incident Lifecycle Pipeline
              </h3>
              <p className="text-xs text-slate-400">Reported ➔ Assigned ➔ In Progress ➔ Resolved flow</p>
            </div>
            <Clock className="w-5 h-5 text-cyan-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.byStatus} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.06} />
                <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#94A3B8' }} />
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
                <Bar dataKey="count" radius={[8, 8, 0, 0]} name="Incidents">
                  {metrics.byStatus.map((entry, index) => (
                    <Cell key={`status-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Response Team Fleet Workload by Category (Stacked Bar Chart) */}
        <div className="bg-[#0A101D] p-5 sm:p-6 rounded-3xl border border-white/[0.08] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">
                Team Workload & Fleet Distribution
              </h3>
              <p className="text-xs text-slate-400">Available vs Busy vs Offline units across 6 specialist branches</p>
            </div>
            <Truck className="w-5 h-5 text-cyan-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamWorkloadByCategory} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
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
                <Bar dataKey="available" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} name="Available" />
                <Bar dataKey="busy" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} name="Busy (Deployed)" />
                <Bar dataKey="offline" stackId="a" fill="#64748B" radius={[4, 4, 0, 0]} name="Offline" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs font-mono pt-2 border-t border-white/5">
            <span className="flex items-center gap-1.5 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Available</span>
            <span className="flex items-center gap-1.5 text-amber-400"><span className="w-2 h-2 rounded-full bg-amber-500" /> Busy</span>
            <span className="flex items-center gap-1.5 text-slate-400"><span className="w-2 h-2 rounded-full bg-slate-500" /> Offline</span>
          </div>
        </div>
      </div>
    </div>
  );
};
