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
  Truck,
  Bookmark,
  ChevronLeft,
  ChevronRight,
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

const FILTER_KEYS = ['category', 'severity', 'status', 'scope'] as const;
const PAGE_SIZE = 12;
const SAVED_VIEWS_KEY = 'sentrix_incident_views';
type SavedView = { name: string; filters: string };

function readSavedViews(): SavedView[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(SAVED_VIEWS_KEY) ?? '[]');
    if (Array.isArray(saved)) {
      return saved.filter((view): view is SavedView =>
        view !== null && typeof view === 'object' &&
        typeof view.name === 'string' && typeof view.filters === 'string',
      );
    }
  } catch {
    return [];
  }
  return [];
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
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category') || 'ALL';
  const severityFilter = searchParams.get('severity') || 'ALL';
  const activeOnly = searchParams.get('scope') === 'active';
  const statusFilter = searchParams.get('status') || 'ALL';
  const [searchQuery, setSearchQuery] = useState('');
  const [savedViews, setSavedViews] = useState(readSavedViews);
  const [viewName, setViewName] = useState('');
  const [selectedViewName, setSelectedViewName] = useState('');
  const [viewMessage, setViewMessage] = useState('');
  const hasFilters = FILTER_KEYS.some(name => searchParams.has(name) && searchParams.get(name) !== 'ALL');

  const persistViews = (next: SavedView[], message: string) => {
    try {
      localStorage.setItem(SAVED_VIEWS_KEY, JSON.stringify(next));
      setSavedViews(next);
      setViewMessage(message);
      return true;
    } catch {
      setViewMessage('Your browser could not save the change. Check its storage settings and try again.');
      return false;
    }
  };

  const saveView = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = viewName.trim();
    if (!name || !hasFilters) return;
    if (savedViews.some(view => view.name.toLowerCase() === name.toLowerCase())) {
      setViewMessage('A view with that name already exists.');
      return;
    }

    const filters = new URLSearchParams();
    for (const key of FILTER_KEYS) {
      const value = searchParams.get(key);
      if (value && value !== 'ALL') filters.set(key, value);
    }

    if (persistViews([...savedViews, { name, filters: filters.toString() }], `Saved “${name}”.`)) {
      setSelectedViewName(name);
      setViewName('');
    }
  };

  const applyView = () => {
    const view = savedViews.find(item => item.name === selectedViewName);
    if (!view) return;
    const filters = new URLSearchParams(view.filters);
    const next = new URLSearchParams(searchParams);
    for (const key of FILTER_KEYS) {
      const value = filters.get(key);
      if (value) next.set(key, value);
      else next.delete(key);
    }
    next.delete('page');
    setSearchQuery('');
    setSearchParams(next);
    setViewMessage(`Applied “${view.name}”.`);
  };

  const removeView = () => {
    if (!selectedViewName) return;
    if (persistViews(savedViews.filter(view => view.name !== selectedViewName), `Removed “${selectedViewName}”.`)) {
      setSelectedViewName('');
    }
  };

  const resetPage = () => {
    if (!searchParams.has('page')) return;
    const next = new URLSearchParams(searchParams);
    next.delete('page');
    setSearchParams(next, { replace: true });
  };

  const setFilter = (name: (typeof FILTER_KEYS)[number], value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'ALL') next.delete(name);
    else next.set(name, value);
    next.delete('page');
    setSearchParams(next);
  };

  const [sortBy, setSortBy] = useState<'priority' | 'time' | 'casualties'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [incidentToDelete, setIncidentToDelete] = useState<Incident | null>(null);

  // Filter and Sort Incidents
  const filteredIncidents = useMemo(() => {
    return incidents
      .filter(inc => {
        if (activeOnly && inc.status === 'Resolved') return false;
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
  }, [incidents, activeOnly, searchQuery, categoryFilter, severityFilter, statusFilter, sortBy, sortOrder]);

  const requestedPage = Number(searchParams.get('page') ?? '1');
  const totalPages = Math.max(1, Math.ceil(filteredIncidents.length / PAGE_SIZE));
  const currentPage = Number.isSafeInteger(requestedPage) ? Math.min(totalPages, Math.max(1, requestedPage)) : 1;
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const visibleIncidents = filteredIncidents.slice(pageStart, pageStart + PAGE_SIZE);

  const goToPage = (page: number) => {
    const next = new URLSearchParams(searchParams);
    if (page === 1) next.delete('page');
    else next.set('page', String(page));
    setSearchParams(next);
  };

  const handleExportCSV = () => {
    soundFx.playClick();
    const csvContent = incidentService.exportIncidentsCSV(filteredIncidents);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sentrix_intel_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
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
    <div className="ops-page">
      {/* Page Header */}
      <div className="ops-page-heading">
        <div>
          <h1 className="ops-heading-title">
            {t('admin.nav.incidents', 'Live Incidents')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Search reports, prioritize the queue, and review response progress.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={!filteredIncidents.length}
            className="ops-action disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export results</span>
          </button>
        </div>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="ops-panel p-5 space-y-4">
        {/* Quick Filter Pill Buttons */}
        <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08] overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mr-1 shrink-0">
            Quick Views:
          </span>
          <button type="button" className="ops-filter shrink-0" aria-pressed={activeOnly} onClick={() => setFilter('scope', activeOnly ? 'ALL' : 'active')}>
            Active only
          </button>
          <button
            aria-pressed={severityFilter === 'Critical'}
            onClick={() => {
              soundFx.playClick();
              setFilter('severity', severityFilter === 'Critical' ? 'ALL' : 'Critical');
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
            aria-pressed={statusFilter === 'Assigned'}
            onClick={() => {
              soundFx.playClick();
              setFilter('status', statusFilter === 'Assigned' ? 'ALL' : 'Assigned');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 whitespace-nowrap ${
              statusFilter === 'Assigned'
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            🚛 {t('status.assigned', 'Assigned')}
          </button>
          <button
            aria-pressed={statusFilter === 'In Progress'}
            onClick={() => {
              soundFx.playClick();
              setFilter('status', statusFilter === 'In Progress' ? 'ALL' : 'In Progress');
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
            aria-pressed={statusFilter === 'Reported'}
            onClick={() => {
              soundFx.playClick();
              setFilter('status', statusFilter === 'Reported' ? 'ALL' : 'Reported');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 whitespace-nowrap ${
              statusFilter === 'Reported'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            🕒 {t('status.reported', 'Reported')}
          </button>
          {(hasFilters || searchQuery) && (
            <button
              onClick={() => {
                soundFx.playClick();
                const next = new URLSearchParams(searchParams);
                FILTER_KEYS.forEach(name => next.delete(name));
                next.delete('page');
                setSearchParams(next);
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
              aria-label="Search incidents"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                resetPage();
              }}
              placeholder={t('admin.header.search', 'Search code, title, street...')}
              className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-white/10 bg-[#060B14] text-white focus:outline-none focus:border-cyan-400 placeholder-slate-400"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              aria-label="Incident category"
              value={categoryFilter}
              onChange={e => setFilter('category', e.target.value)}
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
              aria-label="Incident severity"
              value={severityFilter}
              onChange={e => setFilter('severity', e.target.value)}
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
              aria-label="Incident status"
              value={statusFilter}
              onChange={e => setFilter('status', e.target.value)}
              className="w-full text-xs rounded-xl border border-white/10 bg-[#060B14] text-white px-3 py-2 focus:outline-none focus:border-cyan-400 font-semibold"
            >
              <option value="ALL">All Statuses</option>
              <option value="Reported">{t('status.reported', 'Reported')}</option>
              <option value="Assigned">{t('status.assigned', 'Assigned')}</option>
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

          <div className="flex flex-wrap items-center gap-2">
            <span className="hidden text-slate-400 sm:inline">Sort by</span>
            <div className="flex items-center gap-1 bg-[#060B14] p-1 rounded-xl border border-white/10">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setSortBy('priority');
                  resetPage();
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                  sortBy === 'priority'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Priority
              </button>
              <button
                onClick={() => {
                  soundFx.playClick();
                  setSortBy('time');
                  resetPage();
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
                  resetPage();
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
                resetPage();
              }}
              className="p-2 rounded-xl bg-[#060B14] border border-white/10 text-slate-300 hover:text-white"
              title="Toggle Ascending/Descending"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <details className="rounded-2xl border border-white/10 bg-[#0e1826]">
        <summary className="cursor-pointer rounded-2xl px-4 py-3 text-sm font-semibold text-white">
          <Bookmark className="mr-2 inline h-4 w-4 text-cyan-300" aria-hidden="true" />
          Saved views{savedViews.length > 0 && ` (${savedViews.length})`}
        </summary>
        <div className="space-y-3 px-4 pb-4 text-sm">
          <p className="text-slate-400">Save the current report filters on this browser.</p>
          <form onSubmit={saveView} className="flex flex-wrap gap-2">
            <input
              aria-label="View name"
              placeholder="Name this view"
              value={viewName}
              onChange={event => setViewName(event.target.value)}
              maxLength={40}
              className="min-w-0 rounded-lg border border-white/15 bg-[#08121f] px-3 py-2 text-white"
            />
            <button type="submit" disabled={!hasFilters || !viewName.trim()} className="rounded-lg bg-cyan-300 px-3 py-2 font-semibold text-slate-950 disabled:opacity-40">
              Save current filters
            </button>
          </form>
          {savedViews.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <select aria-label="Saved incident view" value={selectedViewName} onChange={event => setSelectedViewName(event.target.value)} className="max-w-full rounded-lg border border-white/15 bg-[#08121f] px-3 py-2 text-white">
                <option value="">Select a view</option>
                {savedViews.map(view => <option key={view.name} value={view.name}>{view.name}</option>)}
              </select>
              <button type="button" disabled={!selectedViewName} onClick={applyView} className="rounded-lg border border-white/15 px-3 py-2 text-white hover:bg-white/5 disabled:opacity-40">Apply</button>
              <button type="button" disabled={!selectedViewName} onClick={removeView} className="rounded-lg px-3 py-2 text-rose-300 hover:bg-rose-300/10 disabled:opacity-40">Remove</button>
            </div>
          )}
          <p role="status" className="text-cyan-200">{viewMessage}</p>
        </div>
      </details>

      {/* Incident Management Table */}
      <div className="ops-panel overflow-hidden">
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
              {visibleIncidents.map(inc => {
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
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {inc.priorityRank && (
                          <span className="font-mono text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            #{inc.priorityRank}
                          </span>
                        )}
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

                    {/* Assigned Team Telemetry */}
                    {inc.assignedTeamName && (
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-xl border border-indigo-500/20">
                        <Truck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="truncate">
                          Assigned: <strong>{inc.assignedTeamName}</strong> ({inc.assignedTeamCategory})
                        </span>
                        {inc.assignedEtaMinutes !== undefined && (
                          <span className="text-amber-400 ml-auto shrink-0">ETA ~{inc.assignedEtaMinutes}m</span>
                        )}
                      </div>
                    )}

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
                        <option value="Assigned">Assigned</option>
                        <option value="Assigned">{t('status.assigned', 'Assigned')}</option>
              <option value="Pending">{t('status.pending', 'Pending')}</option>
                        <option value="In Progress">{t('status.inProgress', 'In Progress')}</option>
                        <option value="Resolved">{t('status.resolved', 'Resolved')}</option>
                      </select>

                      <div className="flex min-w-0 flex-wrap items-center gap-2">
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
                  {visibleIncidents.map(inc => {
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
                            <div className="flex items-center gap-1.5">
                              {inc.priorityRank && (
                                <span className="font-mono text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                  #{inc.priorityRank}
                                </span>
                              )}
                              <span className="font-mono font-bold text-white text-xs">
                                {inc.incidentCode}
                              </span>
                            </div>
                            <span className="font-mono text-[10px] text-cyan-400">
                              Priority: {inc.priorityScore}/100
                            </span>
                            {inc.assignedTeamName && (
                              <span className="font-mono text-[10px] text-indigo-400 flex items-center gap-1 mt-0.5">
                                <Truck className="w-3 h-3 text-indigo-400" />
                                <span className="truncate max-w-[120px]">{inc.assignedTeamName}</span>
                              </span>
                            )}
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
                            <option value="Assigned">Assigned</option>
                            <option value="Assigned">{t('status.assigned', 'Assigned')}</option>
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

      {totalPages > 1 && (
        <nav aria-label="Incident pagination" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0e1826] px-4 py-3">
          <p className="text-sm tabular-nums text-slate-300">
            {pageStart + 1}–{pageStart + visibleIncidents.length} of {filteredIncidents.length} results
          </p>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Previous page" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="rounded-lg border border-white/15 p-2 hover:bg-white/5 disabled:opacity-40"><ChevronLeft className="h-4 w-4" aria-hidden="true" /></button>
            <span className="px-1 text-xs tabular-nums text-slate-300">Page {currentPage} of {totalPages}</span>
            <button type="button" aria-label="Next page" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="rounded-lg border border-white/15 p-2 hover:bg-white/5 disabled:opacity-40"><ChevronRight className="h-4 w-4" aria-hidden="true" /></button>
          </div>
        </nav>
      )}

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
