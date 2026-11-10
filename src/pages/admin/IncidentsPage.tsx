import React, { useState, useMemo } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { Incident, EmergencyCategory, SeverityLevel, IncidentStatus } from '../../types';
import { incidentService } from '../../services/incidentService';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CategoryBadge } from '../../components/common/CategoryBadge';
import { PriorityGauge } from '../../components/common/PriorityGauge';
import { soundFx } from '../../utils/soundEffects';
import { useLanguage } from '../../context/LanguageContext';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  ArrowUpDown,
  AlertTriangle,
  Copy,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  SlidersHorizontal,
  Flame,
  ShieldAlert,
  Plane,
  FileText,
} from 'lucide-react';

interface AdminContextType {
  incidents: Incident[];
  onOpenIncident: (incident: Incident) => void;
  onOpenDuplicate: (incident: Incident) => void;
  onSimulate: () => void;
  onReset: () => void;
  onOpenDrone?: (inc?: Incident) => void;
  onOpenPlaybook?: (inc?: Incident) => void;
  onOpenHospitals?: () => void;
}

export const IncidentsPage: React.FC = () => {
  const { t } = useLanguage();
  const {
    incidents,
    onOpenIncident,
    onOpenDuplicate,
    onOpenDrone,
    onOpenPlaybook,
  } = useOutletContext<AdminContextType>();
  const [searchParams] = useSearchParams();

  const initialCategory = searchParams.get('category') || 'ALL';
  const initialSeverity = searchParams.get('severity') || 'ALL';
  const initialStatus = searchParams.get('status') || 'ALL';

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategory);
  const [severityFilter, setSeverityFilter] = useState<string>(initialSeverity);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [sortBy, setSortBy] = useState<'priority' | 'time' | 'casualties'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [incidentToDelete, setIncidentToDelete] = useState<Incident | null>(null);

  // Filter and Sort Incidents
  const filteredIncidents = useMemo(() => {
    return incidents
      .filter(inc => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            inc.incidentCode.toLowerCase().includes(q) ||
            inc.title.toLowerCase().includes(q) ||
            inc.description.toLowerCase().includes(q) ||
            inc.location.toLowerCase().includes(q);
          if (!matches) return false;
        }

        if (categoryFilter !== 'ALL' && inc.category !== categoryFilter) return false;
        if (severityFilter !== 'ALL' && inc.severity !== severityFilter) return false;
        if (statusFilter !== 'ALL' && inc.status !== statusFilter) return false;

        return true;
      })
      .sort((a, b) => {
        let valA = 0;
        let valB = 0;

        if (sortBy === 'priority') {
          valA = a.priorityScore;
          valB = b.priorityScore;
        } else if (sortBy === 'time') {
          valA = new Date(a.createdAt).getTime();
          valB = new Date(b.createdAt).getTime();
        } else if (sortBy === 'casualties') {
          valA = a.peopleAffected;
          valB = b.peopleAffected;
        }

        return sortOrder === 'desc' ? valB - valA : valA - valB;
      });
  }, [incidents, searchQuery, categoryFilter, severityFilter, statusFilter, sortBy, sortOrder]);

  const handleExportCSV = () => {
    soundFx.playClick();
    const csvContent = incidentService.exportIncidentsCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sentrix_intel_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleInlineStatusChange = (
    id: string,
    newStatus: IncidentStatus,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    soundFx.playClick();
    incidentService.updateIncident(id, { status: newStatus });
  };

  const confirmDelete = () => {
    if (!incidentToDelete) return;
    soundFx.playAlert();
    incidentService.deleteIncident(incidentToDelete.id);
    setIncidentToDelete(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('admin.nav.incidents', 'Live Incidents')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Prioritize, inspect, update status, and deploy tactical reconnaissance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-[#0A101D] border border-white/10 hover:border-cyan-400 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export Intel CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="bg-[#0A101D] p-5 rounded-3xl border border-white/[0.08] shadow-xl space-y-4">
        {/* Quick Filter Pill Buttons */}
        <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08] overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mr-1 shrink-0">
            Quick Views:
          </span>
          <button
            onClick={() => {
              soundFx.playClick();
              setSeverityFilter('Critical');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 whitespace-nowrap ${
              severityFilter === 'Critical'
                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            🔥 {t('dash.critical', 'Critical')}
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setStatusFilter('In Progress');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 whitespace-nowrap ${
              statusFilter === 'In Progress'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            ⚡ {t('dash.inProgress', 'In Progress')}
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setStatusFilter('Reported');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 whitespace-nowrap ${
              statusFilter === 'Reported'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            🕒 {t('status.reported', 'Reported')}
          </button>
          {(categoryFilter !== 'ALL' || severityFilter !== 'ALL' || statusFilter !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                soundFx.playClick();
                setCategoryFilter('ALL');
                setSeverityFilter('ALL');
                setStatusFilter('ALL');
                setSearchQuery('');
              }}
              className="px-2.5 py-1.5 rounded-xl text-xs font-mono text-slate-400 hover:text-red-400 bg-white/5 border border-white/10 shrink-0 whitespace-nowrap"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Inputs & Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search bar */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('admin.header.search', 'Search code, title, street...')}
              className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-white/10 bg-[#060B14] text-white focus:outline-none focus:border-cyan-400 placeholder-slate-400"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full text-xs rounded-xl border border-white/10 bg-[#060B14] text-white px-3 py-2 focus:outline-none focus:border-cyan-400 font-semibold"
            >
              <option value="ALL">All Categories</option>
              <option value="Fire Emergency">{t('cat.fire', 'Fire Emergency')}</option>
              <option value="Road Accident">{t('cat.road', 'Road Accident')}</option>
              <option value="Medical Emergency">{t('cat.medical', 'Medical Emergency')}</option>
              <option value="Flood">{t('cat.flood', 'Flood')}</option>
              <option value="Building Collapse">{t('cat.collapse', 'Building Collapse')}</option>
              <option value="Other Emergencies">{t('cat.other', 'Other Emergencies')}</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="w-full text-xs rounded-xl border border-white/10 bg-[#060B14] text-white px-3 py-2 focus:outline-none focus:border-cyan-400 font-semibold"
            >
              <option value="ALL">All Severities</option>
              <option value="Critical">{t('sev.critical', 'Critical')}</option>
              <option value="High">{t('sev.high', 'High')}</option>
              <option value="Medium">{t('sev.medium', 'Medium')}</option>
              <option value="Low">{t('sev.low', 'Low')}</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full text-xs rounded-xl border border-white/10 bg-[#060B14] text-white px-3 py-2 focus:outline-none focus:border-cyan-400 font-semibold"
            >
              <option value="ALL">All Statuses</option>
              <option value="Reported">{t('status.reported', 'Reported')}</option>
              <option value="Pending">{t('status.pending', 'Pending')}</option>
              <option value="In Progress">{t('status.inProgress', 'In Progress')}</option>
              <option value="Resolved">{t('status.resolved', 'Resolved')}</option>
            </select>
          </div>
        </div>

        {/* Sort and Counter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/[0.08] text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span>Showing <strong className="text-white">{filteredIncidents.length}</strong> of {incidents.length} incidents</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono text-[11px]">SORT BY:</span>
            <div className="flex items-center gap-1 bg-[#060B14] p-1 rounded-xl border border-white/10">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setSortBy('priority');
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                  sortBy === 'priority'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('dash.priorityScore', 'Priority')}
              </button>
              <button
                onClick={() => {
                  soundFx.playClick();
                  setSortBy('time');
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                  sortBy === 'time'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Time
              </button>
              <button
                onClick={() => {
                  soundFx.playClick();
                  setSortBy('casualties');
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                  sortBy === 'casualties'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Casualties
              </button>
            </div>
            <button
              onClick={() => {
                soundFx.playClick();
                setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
              }}
              className="p-2 rounded-xl bg-[#060B14] border border-white/10 text-slate-300 hover:text-white"
              title="Toggle Ascending/Descending"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Incident Management Table */}
      <div className="bg-[#0A101D] rounded-3xl border border-white/[0.08] shadow-xl overflow-hidden">
        {filteredIncidents.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-white/5 text-slate-400 flex items-center justify-center mx-auto border border-white/10">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-white">No Incidents Found</h3>
            <p className="text-xs text-slate-400">Try adjusting your filters or keyword query.</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View (block md:hidden) */}
            <div className="md:hidden divide-y divide-white/10">
              {filteredIncidents.map(inc => {
                const isCritical = inc.severity === 'Critical' && inc.status !== 'Resolved';
                return (
                  <div
                    key={inc.id}
                    onClick={() => {
                      soundFx.playClick();
                      onOpenIncident(inc);
                    }}
                    className={`p-4 space-y-3 cursor-pointer transition-colors active:bg-white/5 ${
                      isCritical
                        ? 'bg-red-500/10 border-l-4 border-l-red-500'
                        : inc.duplicateWarning
                        ? 'border-l-4 border-l-amber-500'
                        : ''
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-cyan-400">
                          {inc.incidentCode}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300 font-bold">
                          {inc.priorityScore}/100
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <SeverityBadge severity={inc.severity} size="sm" />
                        <StatusBadge status={inc.status} size="sm" />
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h4 className="text-sm font-bold text-white leading-snug">
                        {inc.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                        {inc.description}
                      </p>
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-1">
                      <div className="flex items-center gap-1 text-[11px] text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{inc.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-mono">
                        <CategoryBadge category={inc.category} size="sm" />
                        <span>👥 {inc.peopleAffected}</span>
                        <span>•</span>
                        <span>{new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    {/* Quick Action Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5" onClick={e => e.stopPropagation()}>
                      <select
                        value={inc.status}
                        onChange={e =>
                          handleInlineStatusChange(inc.id, e.target.value as IncidentStatus, e as any)
                        }
                        className="text-[11px] font-semibold bg-[#060B14] border border-white/20 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-cyan-400"
                      >
                        <option value="Reported">{t('status.reported', 'Reported')}</option>
                        <option value="Pending">{t('status.pending', 'Pending')}</option>
                        <option value="In Progress">{t('status.inProgress', 'In Progress')}</option>
                        <option value="Resolved">{t('status.resolved', 'Resolved')}</option>
                      </select>

                      <div className="flex items-center gap-2">
                        {onOpenDrone && (
                          <button
                            onClick={() => {
                              soundFx.playClick();
                              onOpenDrone(inc);
                            }}
                            className="p-1.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                            title="Launch Recon Drone UAV"
                          >
                            <Plane className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onOpenPlaybook && (
                          <button
                            onClick={() => {
                              soundFx.playClick();
                              onOpenPlaybook(inc);
                            }}
                            className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            title="Generate Tactical Playbook"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {inc.duplicateWarning && (
                          <button
                            type="button"
                            onClick={() => {
                              soundFx.playAlert();
                              onOpenDuplicate(inc);
                            }}
                            className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" /> Duplicate
                          </button>
                        )}
                        <button
                          onClick={() => {
                            soundFx.playClick();
                            onOpenIncident(inc);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 text-xs font-bold flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{t('dash.inspectDossier', 'View')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (hidden md:block) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#060B14] border-b border-white/[0.08] text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-4">Incident ID</th>
                    <th className="py-4 px-4 min-w-[240px]">Situation Headline & Summary</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4 min-w-[170px]">Location</th>
                    <th className="py-4 px-4">Severity</th>
                    <th className="py-4 px-4 text-center">People</th>
                    <th className="py-4 px-4">Reported</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {filteredIncidents.map(inc => {
                    const isCritical = inc.severity === 'Critical' && inc.status !== 'Resolved';
                    return (
                      <tr
                        key={inc.id}
                        onClick={() => {
                          soundFx.playClick();
                          onOpenIncident(inc);
                        }}
                        className={`hover:bg-white/[0.03] cursor-pointer transition-colors ${
                          isCritical
                            ? 'bg-red-500/10 border-l-4 border-l-red-500'
                            : inc.duplicateWarning
                            ? 'border-l-4 border-l-amber-500'
                            : ''
                        }`}
                      >
                        {/* Code */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-mono font-bold text-white text-xs">
                              {inc.incidentCode}
                            </span>
                            <span className="font-mono text-[10px] text-cyan-400">
                              Priority: {inc.priorityScore}/100
                            </span>
                          </div>
                        </td>

                        {/* Title & Description preview */}
                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white line-clamp-1">
                                {inc.title}
                              </span>
                              {inc.duplicateWarning && (
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation();
                                    soundFx.playAlert();
                                    onOpenDuplicate(inc);
                                  }}
                                  className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold flex items-center gap-1 shrink-0"
                                >
                                  <Copy className="w-3 h-3" /> Duplicate
                                </button>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-1">
                              {inc.description}
                            </p>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <CategoryBadge category={inc.category} size="sm" />
                        </td>

                        {/* Location */}
                        <td className="py-4 px-4">
                          <div className="flex items-start gap-1 text-slate-300">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-2 text-[11px]">{inc.location}</span>
                          </div>
                        </td>

                        {/* Severity */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <SeverityBadge severity={inc.severity} size="sm" />
                        </td>

                        {/* Casualties */}
                        <td className="py-4 px-4 whitespace-nowrap text-center">
                          <span className="font-mono font-black text-white text-sm">
                            {inc.peopleAffected}
                          </span>
                        </td>

                        {/* Reported Time */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="font-mono text-[11px] text-slate-400">
                            {new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>

                        {/* Status Dropdown */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <select
                            value={inc.status}
                            onClick={e => e.stopPropagation()}
                            onChange={e =>
                              handleInlineStatusChange(inc.id, e.target.value as IncidentStatus, e as any)
                            }
                            className="text-[11px] font-semibold bg-[#060B14] border border-white/20 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-cyan-400"
                          >
                            <option value="Reported">{t('status.reported', 'Reported')}</option>
                            <option value="Pending">{t('status.pending', 'Pending')}</option>
                            <option value="In Progress">{t('status.inProgress', 'In Progress')}</option>
                            <option value="Resolved">{t('status.resolved', 'Resolved')}</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {onOpenDrone && (
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  soundFx.playClick();
                                  onOpenDrone(inc);
                                }}
                                className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-white/10 transition-colors"
                                title="Deploy Recon Drone"
                              >
                                <Plane className="w-4 h-4" />
                              </button>
                            )}

                            {onOpenPlaybook && (
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  soundFx.playClick();
                                  onOpenPlaybook(inc);
                                }}
                                className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-white/10 transition-colors"
                                title="AI Tactical Playbook"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={e => {
                                e.stopPropagation();
                                soundFx.playClick();
                                onOpenIncident(inc);
                              }}
                              className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-white/10 transition-colors"
                              title="Inspect Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                soundFx.playAlert();
                                setIncidentToDelete(inc);
                              }}
                              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-white/10 transition-colors"
                              title="Delete Incident"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {incidentToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#0A101D] p-6 rounded-3xl max-w-sm w-full border border-red-500/50 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-500/15 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Delete Incident Report?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to delete {incidentToDelete.incidentCode}? This will immediately adjust dashboard metrics.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setIncidentToDelete(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-white/5 text-slate-300 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl text-xs font-black bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/40"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
