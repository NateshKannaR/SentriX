import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Incident, DashboardMetrics, ResponseTeam, ResponseTeamCategory } from '../../types';
import { incidentService } from '../../services/incidentService';
import { teamService } from '../../services/teamService';
import { getPriorityExplanation } from '../../services/intelligenceEngine';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CategoryBadge } from '../../components/common/CategoryBadge';
import { PriorityGauge } from '../../components/common/PriorityGauge';
import { soundFx } from '../../utils/soundEffects';
import { useLanguage } from '../../context/LanguageContext';
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
  Cpu,
  Layers,
  Truck,
  Plane,
  FileText,
  Hospital,
  Sparkles,
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
  onSimulateFire?: () => void;
  onReset: () => void;
  onOpenDrone?: (inc?: Incident) => void;
  onOpenPlaybook?: (inc?: Incident) => void;
  onOpenHospitals?: () => void;
}

export const DashboardPage: React.FC = () => {
  const { t } = useLanguage();
  const {
    incidents,
    onOpenIncident,
    onOpenDuplicate,
    onSimulate,
    onSimulateFire,
    onOpenDrone,
    onOpenPlaybook,
    onOpenHospitals,
  } = useOutletContext<AdminContextType>();
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

  const categoryReadiness = useMemo(() => {
    const categories: ResponseTeamCategory[] = [
      'Fire & Rescue',
      'Medical & Trauma',
      'Disaster & Urban SAR',
      'Police & Evacuation',
      'Hazmat & Chemical',
      'Flood & Marine Rescue',
    ];
    return categories.map(cat => {
      const total = teams.filter(t => t.category === cat).length;
      const available = teams.filter(t => t.category === cat && t.status === 'Available').length;
      const busy = teams.filter(t => t.category === cat && (t.status === 'Busy' || t.status === 'En Route')).length;
      const offline = teams.filter(t => t.category === cat && (t.status === 'Offline' || t.status === 'Off Duty')).length;
      return { category: cat, total, available, busy, offline, isZero: available === 0 };
    });
  }, [teams]);

  const zeroAvailableCategories = categoryReadiness.filter(c => c.isZero && c.total > 0);
  const busyTeamsCount = teams.filter(t => t.status === 'Busy' || t.status === 'En Route').length;
  const unassignedCount = incidents.filter(i => (i.status === 'Reported' || i.status === 'Pending') && !i.assignedTeamName).length;

  const sortedUnresolved = [...incidents.filter(i => i.status !== 'Resolved')].sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
  const rankOneIncident = sortedUnresolved[0] || null;
  const rankOneExplanation = rankOneIncident ? getPriorityExplanation(rankOneIncident, incidents) : null;

  const criticalQueue = incidents
    .filter(i => i.severity === 'Critical' && i.status !== 'Resolved')
    .slice(0, 5);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner Alert if Criticals Exist */}
      {criticalQueue.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-950/80 via-red-900/30 to-[#0A101D] border border-red-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xl animate-scaleUp">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center animate-pulse shrink-0 shadow-lg shadow-red-600/40">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                  {t('dash.redAlert', 'RED ALERT')}
                </span>
                <h3 className="text-sm font-black text-white">
                  {criticalQueue.length} {t('dash.redAlertDesc', 'Active Critical Emergency Incident(s) Require Priority Intervention')}
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {t('dash.redAlertSub', 'Mass casualty or severe hazard escalation detected. Tactical response units mobilized.')}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playAlert();
              onOpenIncident(criticalQueue[0]);
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black shrink-0 shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 hover:scale-102 active:scale-98"
          >
            <span>{t('dash.reviewBtn', 'Review Incident')} #{criticalQueue[0].incidentCode}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modern Clean Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t('dash.title', 'Command Center Overview')}
            </h1>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {t('dash.liveTelemetry', 'LIVE TELEMETRY')}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t('dash.subtitle', 'Real-time incident intelligence, automated severity scoring, and active responder unit tracking.')}
          </p>
        </div>

        {/* Action Controls Suite */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {onOpenDrone && (
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenDrone();
              }}
              className="px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
              title="Launch Drone UAV"
            >
              <Plane className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t('admin.header.drone', 'Recon UAV')}</span>
            </button>
          )}

          {onOpenPlaybook && (
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenPlaybook();
              }}
              className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
              title="Generate Incident SOP"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('admin.header.playbook', 'SOP Playbook')}</span>
            </button>
          )}

          {onOpenHospitals && (
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenHospitals();
              }}
              className="px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
              title="Hospital Trauma Beds"
            >
              <Hospital className="w-3.5 h-3.5 text-purple-400" />
              <span>{t('admin.header.hospitals', 'Beds Matrix')}</span>
            </button>
          )}

          {onSimulateFire && (
            <button
              onClick={() => {
                soundFx.playAlert();
                onSimulateFire();
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 via-rose-600 to-red-600 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/30 transition-all active:scale-95"
              title="1-Click Round 2 Evaluation Scenario (Peenya Fire + Nearest Team Matching)"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Simulate Critical Fire</span>
            </button>
          )}

          <button
            onClick={() => {
              soundFx.playAlert();
              onSimulate();
            }}
            className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-red-600/30 transition-all active:scale-95"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{t('dash.simulateCrisis', 'Simulate Crisis')}</span>
          </button>

          <Link
            to="/admin/incidents"
            onClick={() => soundFx.playClick()}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <span>{t('dash.all', 'All')} ({metrics.total})</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          </Link>
        </div>
      </div>

      {/* DASHBOARD STATISTICS CARDS - ROUND 2 CORE METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* 1. Total Incidents */}
        <div className="p-4 rounded-2xl bg-[#0A101D] border border-white/[0.08] shadow-lg space-y-2 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Total Incidents
            </span>
            <div className="w-6 h-6 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Radio className="w-3 h-3" />
            </div>
          </div>
          <div className="font-mono text-2xl font-black text-white">{metrics.total}</div>
          <div className="text-[10px] font-mono text-slate-400 truncate">All active & past</div>
        </div>

        {/* 2. Critical Incidents */}
        <div className="p-4 rounded-2xl bg-[#0A101D] border border-red-500/50 shadow-lg space-y-2 relative overflow-hidden group hover:border-red-500 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-red-400 font-bold flex items-center gap-1">
              Critical
            </span>
            <div className="w-6 h-6 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/40 animate-pulse">
              <ShieldAlert className="w-3 h-3" />
            </div>
          </div>
          <div className="font-mono text-2xl font-black text-red-400">{metrics.critical}</div>
          <div className="text-[10px] font-mono text-red-400/80 truncate">Immediate dispatch</div>
        </div>

        {/* 3. Available Response Teams */}
        <Link
          to="/admin/teams"
          onClick={() => soundFx.playClick()}
          className="p-4 rounded-2xl bg-[#0A101D] border border-emerald-500/40 shadow-lg space-y-2 relative overflow-hidden group hover:border-emerald-400 transition-all block"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
              Available Teams
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Truck className="w-3 h-3" />
            </div>
          </div>
          <div className="font-mono text-2xl font-black text-emerald-400">{metrics.availableTeams}</div>
          <div className="text-[10px] font-mono text-emerald-400/80 truncate">
            {metrics.fleetReadinessPercent}% Fleet Ready →
          </div>
        </Link>

        {/* 4. Busy Response Teams */}
        <Link
          to="/admin/teams"
          onClick={() => soundFx.playClick()}
          className="p-4 rounded-2xl bg-[#0A101D] border border-amber-500/40 shadow-lg space-y-2 relative overflow-hidden group hover:border-amber-400 transition-all block"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
              Busy Teams
            </span>
            <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Activity className="w-3 h-3 animate-pulse" />
            </div>
          </div>
          <div className="font-mono text-2xl font-black text-amber-400">{metrics.busyTeams}</div>
          <div className="text-[10px] font-mono text-amber-400/80 truncate">Deployed in field</div>
        </Link>

        {/* 5. Assigned Incidents */}
        <div className="p-4 rounded-2xl bg-[#0A101D] border border-indigo-500/40 shadow-lg space-y-2 relative overflow-hidden group hover:border-indigo-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold">
              Assigned
            </span>
            <div className="w-6 h-6 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Clock className="w-3 h-3" />
            </div>
          </div>
          <div className="font-mono text-2xl font-black text-indigo-400">{metrics.assigned}</div>
          <div className="text-[10px] font-mono text-indigo-300/80 truncate">Unit dispatched</div>
        </div>

        {/* 6. Resolved Incidents */}
        <div className="p-4 rounded-2xl bg-[#0A101D] border border-white/[0.08] shadow-lg space-y-2 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
              Resolved
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" />
            </div>
          </div>
          <div className="font-mono text-2xl font-black text-emerald-400">{metrics.resolved}</div>
          <div className="text-[10px] font-mono text-emerald-400/80 truncate">Scene stabilized</div>
        </div>
      </div>

      {/* PHASE 8 FEATURE C: EMERGENCY RESPONSE READINESS PANEL */}
      <div className="bg-[#0A101D] p-5 sm:p-6 rounded-3xl border border-white/[0.08] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                Emergency Response Readiness Panel
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  FLEET TELEMETRY
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Live availability by emergency category, mission deployment load, and unassigned queue monitor
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono">
            <span className="text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              Busy Teams: <strong>{busyTeamsCount}</strong>
            </span>
            <span className="text-red-400 font-bold bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20">
              Unassigned Emergencies: <strong>{unassignedCount}</strong>
            </span>
          </div>
        </div>

        {/* Zero Available Alert Warning */}
        {zeroAvailableCategories.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-3 animate-pulse">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-mono font-bold uppercase tracking-wider block text-amber-300">
                CRITICAL READINESS DEFICIT: ZERO UNITS AVAILABLE
              </span>
              <span>
                Zero available response units in sector for:{' '}
                <strong>{zeroAvailableCategories.map(c => c.category).join(', ')}</strong>. Tactical redeployment or mutual aid escalation recommended.
              </span>
            </div>
          </div>
        )}

        {/* Readiness Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categoryReadiness.map((cat) => (
            <div
              key={cat.category}
              className={`p-3 rounded-2xl border transition-all ${
                cat.available === 0
                  ? 'bg-rose-950/20 border-rose-500/40 shadow-inner'
                  : 'bg-white/[0.02] border-white/10 hover:border-cyan-500/30'
              }`}
            >
              <div className="text-[10px] font-mono text-slate-400 font-bold truncate mb-1">
                {cat.category}
              </div>
              <div className="flex items-baseline justify-between">
                <span className={`text-xl font-mono font-black ${cat.available > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {cat.available}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  / {cat.total} total
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5 text-[9px] font-mono text-slate-400">
                <span className="text-amber-400 font-semibold">{cat.busy} Busy</span>
                <span>•</span>
                <span className="text-slate-500">{cat.offline} Off</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DATA VISUALIZATIONS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Incidents by Category (Bar Chart) - 7 Cols */}
        <div className="lg:col-span-7 bg-[#0A101D] p-5 sm:p-6 rounded-3xl border border-white/[0.08] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">
                {t('dash.chartCategory', 'Incidents by Emergency Category')}
              </h3>
              <p className="text-xs text-slate-400">
                {t('dash.chartCategorySub', 'Distribution across 6 categories with critical incident overlay')}
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/30">
              6 Verticals
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.byCategory}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.06} />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 10, fill: '#94A3B8' }}
                  tickFormatter={val => val.replace(' Emergency', '')}
                  angle={-15}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#070D18',
                    borderColor: '#06B6D4',
                    borderRadius: '14px',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.8)',
                  }}
                />
                <Bar dataKey="count" fill="#06B6D4" radius={[6, 6, 0, 0]} name="Total Reports" />
                <Bar dataKey="criticalCount" fill="#EF4444" radius={[6, 6, 0, 0]} name="Critical" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Breakdown (Donut Pie Chart) - 5 Cols */}
        <div className="lg:col-span-5 bg-[#0A101D] p-5 sm:p-6 rounded-3xl border border-white/[0.08] shadow-xl space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">
                {t('dash.chartSeverity', 'Severity Ratio Classification')}
              </h3>
              <p className="text-xs text-slate-400">
                {t('dash.chartSeveritySub', 'Explainable AI risk hierarchy')}
              </p>
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
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                >
                  {metrics.bySeverity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#070D18',
                    borderColor: '#06B6D4',
                    borderRadius: '14px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Severity Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/[0.08]">
            {metrics.bySeverity.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium text-slate-300">{item.severity}</span>
                </div>
                <span className="font-mono font-bold text-white">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Priority Queue */}
      <div className="bg-[#0A101D] rounded-3xl border border-white/[0.08] p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center border border-red-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {t('dash.criticalQueueTitle', 'Critical Priority Incident Queue')}
              </h3>
              <p className="text-xs text-slate-400">
                {t('dash.criticalQueueSub', 'Demands immediate tactical dispatch and life-support intervention')}
              </p>
            </div>
          </div>

          <Link
            to="/admin/incidents"
            onClick={() => soundFx.playClick()}
            className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1 font-mono"
          >
            <span>View All Ranked Incidents</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Explainable Decision Support: Why is this incident ranked #1? */}
        {rankOneIncident && rankOneExplanation && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-950/60 via-[#0D182A] to-[#0A101D] border border-red-500/30 space-y-3 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-red-500/20 text-red-300 font-black border border-red-500/40 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-red-400" />
                  WHY IS THIS INCIDENT RANKED #1?
                </span>
                <span className="font-mono text-xs text-slate-300 font-bold">{rankOneIncident.incidentCode}</span>
              </div>
              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenIncident(rankOneIncident);
                }}
                className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>Inspect & Dispatch Best-Fit Unit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-8 space-y-1">
                <h4 className="text-sm font-black text-white">{rankOneIncident.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{rankOneExplanation.headline}</p>
                <p className="text-[11px] font-mono text-cyan-300 mt-1">{rankOneExplanation.decisionRecommendation}</p>
              </div>
              <div className="md:col-span-4 bg-black/40 p-3 rounded-xl border border-white/10 space-y-1 text-[11px] font-mono">
                <div className="text-slate-400 font-bold uppercase text-[10px] tracking-wider mb-1">Dynamic Scoring Breakdown:</div>
                {rankOneExplanation.factors.map(f => (
                  <div key={f.name} className="flex justify-between text-slate-300">
                    <span>{f.name} ({f.weight}):</span> <strong className="text-white">{f.score} / {f.maxScore} pts</strong>
                  </div>
                ))}
                <div className="flex justify-between pt-1 border-t border-white/10 font-bold text-cyan-400">
                  <span>Total Dynamic Score:</span> <span>{rankOneIncident.priorityScore} / 100</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {incidents.filter(i => i.status !== 'Resolved').length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-slate-400">
            ✅ All emergencies have been resolved or stabilized.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {incidents.filter(i => i.status !== 'Resolved').slice(0, 6).map((inc, index) => (
              <div
                key={inc.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.03] px-3 rounded-2xl transition-colors"
              >
                <div
                  onClick={() => {
                    soundFx.playClick();
                    onOpenIncident(inc);
                  }}
                  className="space-y-1.5 cursor-pointer flex-1"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-black border border-cyan-500/40">
                      RANK #{inc.priorityRank || index + 1}
                    </span>
                    <span className="font-mono text-xs font-bold text-white">
                      {inc.incidentCode}
                    </span>
                    <CategoryBadge category={inc.category} size="sm" />
                    <SeverityBadge severity={inc.severity} size="sm" />
                    <StatusBadge status={inc.status} size="sm" />
                    {inc.assignedTeamName && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        {inc.assignedTeamName} ({inc.assignedDistanceKm ?? '—'} km)
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white line-clamp-1">
                    {inc.title}
                  </h4>
                  <p className="text-xs text-slate-400">
                    📍 {inc.location} • 👥 {inc.peopleAffected} casualties • Score: <strong className="text-cyan-400 font-mono">{inc.priorityScore}/100</strong>
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 self-stretch sm:self-center shrink-0 pt-2 sm:pt-0 border-t border-white/5 sm:border-0">
                  <PriorityGauge score={inc.priorityScore} size="sm" showLabel={false} />

                  {/* Quick Recon UAV Trigger for this incident */}
                  {onOpenDrone && (
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        onOpenDrone(inc);
                      }}
                      className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-colors"
                      title="Launch Drone to Incident Coordinates"
                    >
                      <Plane className="w-4 h-4" />
                    </button>
                  )}

                  {/* Quick Tactical SOP Trigger for this incident */}
                  {onOpenPlaybook && (
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        onOpenPlaybook(inc);
                      }}
                      className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                      title="View AI Tactical SOP Playbook"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onOpenIncident(inc);
                    }}
                    className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
