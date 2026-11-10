import React, { useState, useMemo } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { Incident, EmergencyCategory, SeverityLevel, IncidentStatus } from '../../types';
import { incidentService } from '../../services/incidentService';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CategoryBadge } from '../../components/common/CategoryBadge';
import { PriorityGauge } from '../../components/common/PriorityGauge';
import { soundFx } from '../../utils/soundEffects';
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
} from 'lucide-react';

interface AdminContextType {
  incidents: Incident[];
  onOpenIncident: (incident: Incident) => void;
  onOpenDuplicate: (incident: Incident) => void;
  onSimulate: () => void;
  onReset: () => void;
}

export const IncidentsPage: React.FC = () => {
  const { incidents, onOpenIncident, onOpenDuplicate } = useOutletContext<AdminContextType>();
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
    link.setAttribute('download', `sentinel360_incidents_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleInlineStatusChange = (id: string, newStatus: IncidentStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playClick();
    incidentService.updateIncidentStatus(id, newStatus, 'Commander Aditi Rao');
  };

  const confirmDelete = () => {
    if (incidentToDelete) {
      soundFx.playAlert();
      incidentService.deleteIncident(incidentToDelete.id);
      setIncidentToDelete(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Live Incident Management Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Prioritize, inspect, update status, and coordinate real-time disaster reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-[#0B1E38] border border-white/10 hover:border-[#16C7E8] text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all hover:glow-cyan"
          >
            <Download className="w-4 h-4 text-sentinel-cyan" />
            <span>Export Intel CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="bg-[#0B1E38]/90 p-5 rounded-3xl border border-white/10 shadow-2xl space-y-4">
        {/* Quick Filter Pill Buttons */}
        <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-white/10">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mr-1">
            Quick Views:
          </span>
          <button
            onClick={() => {
              soundFx.playClick();
              setSeverityFilter('Critical');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
              severityFilter === 'Critical'
                ? 'bg-red-500/20 text-red-400 border border-red-500/40 glow-red'
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            🔥 Critical Tier Only
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setStatusFilter('In Progress');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
              statusFilter === 'In Progress'
                ? 'bg-cyan-500/20 text-sentinel-cyan border border-cyan-500/40 glow-cyan'
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            ⚡ Under Active Dispatch
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setStatusFilter('Reported');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
              statusFilter === 'Reported'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            🕒 Newly Reported
          </button>
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
              placeholder="Search code, title, street, keyword..."
              className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-white/15 bg-[#071426] text-white focus:outline-none focus:border-sentinel-cyan placeholder-slate-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full text-xs rounded-xl border border-white/15 bg-[#071426] text-white px-3 py-2.5 focus:outline-none focus:border-sentinel-cyan font-semibold"
            >
              <option value="ALL">All Categories</option>
              <option value="Fire Emergency">Fire Emergency</option>
              <option value="Road Accident">Road Accident</option>
              <option value="Medical Emergency">Medical Emergency</option>
              <option value="Flood">Flood</option>
              <option value="Building Collapse">Building Collapse</option>
              <option value="Other Emergencies">Other Emergencies</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="w-full text-xs rounded-xl border border-white/15 bg-[#071426] text-white px-3 py-2.5 focus:outline-none focus:border-sentinel-cyan font-semibold"
            >
              <option value="ALL">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full text-xs rounded-xl border border-white/15 bg-[#071426] text-white px-3 py-2.5 focus:outline-none focus:border-sentinel-cyan font-semibold"
            >
              <option value="ALL">All Statuses</option>
              <option value="Reported">Reported</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Sort and Counter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span>Showing <strong className="text-white">{filteredIncidents.length}</strong> of {incidents.length} incidents</span>
            {(categoryFilter !== 'ALL' || severityFilter !== 'ALL' || statusFilter !== 'ALL' || searchQuery) && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  setCategoryFilter('ALL');
                  setSeverityFilter('ALL');
                  setStatusFilter('ALL');
                  setSearchQuery('');
                }}
                className="text-sentinel-cyan hover:underline font-bold"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono text-[11px]">SORT BY:</span>
            <div className="flex items-center gap-1 bg-[#071426] p-1 rounded-xl border border-white/10">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setSortBy('priority');
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                  sortBy === 'priority'
                    ? 'bg-sentinel-cyan text-sentinel-navy shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Priority
              </button>
              <button
                onClick={() => {
                  soundFx.playClick();
                  setSortBy('time');
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                  sortBy === 'time'
                    ? 'bg-sentinel-cyan text-sentinel-navy shadow-sm'
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
                    ? 'bg-sentinel-cyan text-sentinel-navy shadow-sm'
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
              className="p-2 rounded-xl bg-[#071426] border border-white/10 text-slate-300 hover:text-white"
              title="Toggle Ascending/Descending"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Incident Management Table */}
      <div className="bg-[#0B1E38]/90 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        {filteredIncidents.length === 0 ? (
          <div className="p-14 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-white/5 text-slate-400 flex items-center justify-center mx-auto border border-white/10">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-white">No Incidents Found</h3>
            <p className="text-xs text-slate-400">Try adjusting your filters or keyword query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#071426] border-b border-white/10 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
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
                      className={`hover:bg-white/5 cursor-pointer transition-colors ${
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
                          <span className="font-mono text-[10px] text-sentinel-cyan">
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
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
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
                          className="text-[11px] font-semibold bg-[#071426] border border-white/20 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-sentinel-cyan"
                        >
                          <option value="Reported">Reported</option>
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              soundFx.playClick();
                              onOpenIncident(inc);
                            }}
                            className="p-2 rounded-xl text-slate-400 hover:text-sentinel-cyan hover:bg-white/10 transition-colors"
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
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {incidentToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#0B1E38] p-6 rounded-3xl max-w-sm w-full border border-red-500/50 text-center space-y-4 shadow-2xl glow-red">
            <div className="w-12 h-12 rounded-2xl bg-red-500/15 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Delete Incident Report?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to delete {incidentToDelete.incidentCode}? This will immediately adjust dashboard metrics and remove it from the system.
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
