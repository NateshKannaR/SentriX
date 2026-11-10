import React, { useState, useMemo } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { Incident, EmergencyCategory, SeverityLevel, IncidentStatus } from '../../types';
import { incidentService } from '../../services/incidentService';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CategoryBadge } from '../../components/common/CategoryBadge';
import { PriorityGauge } from '../../components/common/PriorityGauge';
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
  const [searchParams, setSearchParams] = useSearchParams();

  // URL Query param filters
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
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            inc.incidentCode.toLowerCase().includes(q) ||
            inc.title.toLowerCase().includes(q) ||
            inc.description.toLowerCase().includes(q) ||
            inc.location.toLowerCase().includes(q);
          if (!matches) return false;
        }

        // Category filter
        if (categoryFilter !== 'ALL' && inc.category !== categoryFilter) return false;

        // Severity filter
        if (severityFilter !== 'ALL' && inc.severity !== severityFilter) return false;

        // Status filter
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
    incidentService.updateIncidentStatus(id, newStatus, 'Commander Aditi Rao');
  };

  const confirmDelete = () => {
    if (incidentToDelete) {
      incidentService.deleteIncident(incidentToDelete.id);
      setIncidentToDelete(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Live Incident Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Prioritize, inspect, update status, and track real-time emergency reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-sentinel-darkCard border border-slate-200 dark:border-sentinel-darkBorder hover:border-sentinel-cyan text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-sentinel-cyan" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="bg-white dark:bg-sentinel-darkCard p-4 rounded-2xl border border-slate-200 dark:border-sentinel-darkBorder shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search bar */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by code, title, street, keyword..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sentinel-cyan"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-2 focus:outline-none focus:border-sentinel-cyan"
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
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-2 focus:outline-none focus:border-sentinel-cyan"
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
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-2 focus:outline-none focus:border-sentinel-cyan"
            >
              <option value="ALL">All Statuses</option>
              <option value="Reported">Reported</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Secondary Sort Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span>Showing <strong>{filteredIncidents.length}</strong> of {incidents.length} incidents</span>
            {(categoryFilter !== 'ALL' || severityFilter !== 'ALL' || statusFilter !== 'ALL' || searchQuery) && (
              <button
                onClick={() => {
                  setCategoryFilter('ALL');
                  setSeverityFilter('ALL');
                  setStatusFilter('ALL');
                  setSearchQuery('');
                }}
                className="text-sentinel-cyan hover:underline font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Sort by:</span>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setSortBy('priority')}
                className={`px-2 py-1 rounded text-[11px] font-bold ${
                  sortBy === 'priority'
                    ? 'bg-sentinel-navy text-sentinel-cyan dark:bg-sentinel-cyan dark:text-sentinel-navy shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Priority Score
              </button>
              <button
                onClick={() => setSortBy('time')}
                className={`px-2 py-1 rounded text-[11px] font-bold ${
                  sortBy === 'time'
                    ? 'bg-sentinel-navy text-sentinel-cyan dark:bg-sentinel-cyan dark:text-sentinel-navy shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Reported Time
              </button>
              <button
                onClick={() => setSortBy('casualties')}
                className={`px-2 py-1 rounded text-[11px] font-bold ${
                  sortBy === 'casualties'
                    ? 'bg-sentinel-navy text-sentinel-cyan dark:bg-sentinel-cyan dark:text-sentinel-navy shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Casualties
              </button>
            </div>
            <button
              onClick={() => setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'))}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-white"
              title="Toggle Ascending/Descending"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Incident Management Table */}
      <div className="bg-white dark:bg-sentinel-darkCard rounded-2xl border border-slate-200 dark:border-sentinel-darkBorder shadow-xs overflow-hidden">
        {filteredIncidents.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">No Incidents Found</h3>
            <p className="text-xs text-slate-500">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-sentinel-darkBorder text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4">Incident ID</th>
                  <th className="py-3.5 px-4 min-w-[220px]">Title & Description</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Location</th>
                  <th className="py-3.5 px-4">Severity</th>
                  <th className="py-3.5 px-4 text-center">People</th>
                  <th className="py-3.5 px-4">Reported</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredIncidents.map(inc => {
                  const isCritical = inc.severity === 'Critical' && inc.status !== 'Resolved';
                  return (
                    <tr
                      key={inc.id}
                      onClick={() => onOpenIncident(inc)}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                        isCritical
                          ? 'bg-red-500/5 dark:bg-red-950/20 border-l-4 border-l-red-500'
                          : inc.duplicateWarning
                          ? 'border-l-4 border-l-amber-500'
                          : ''
                      }`}
                    >
                      {/* Code */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {inc.incidentCode}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            Score: {inc.priorityScore}/100
                          </span>
                        </div>
                      </td>

                      {/* Title & Description preview */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                              {inc.title}
                            </span>
                            {inc.duplicateWarning && (
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  onOpenDuplicate(inc);
                                }}
                                className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold flex items-center gap-1 shrink-0"
                              >
                                <Copy className="w-3 h-3" /> Duplicate Alert
                              </button>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            {inc.description}
                          </p>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <CategoryBadge category={inc.category} size="sm" />
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-1 text-slate-700 dark:text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2 text-[11px]">{inc.location}</span>
                        </div>
                      </td>

                      {/* Severity */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <SeverityBadge severity={inc.severity} size="sm" />
                      </td>

                      {/* People affected */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {inc.peopleAffected}
                        </span>
                      </td>

                      {/* Reported Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          {new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          value={inc.status}
                          onClick={e => e.stopPropagation()}
                          onChange={e =>
                            handleInlineStatusChange(inc.id, e.target.value as IncidentStatus, e as any)
                          }
                          className="text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-none"
                        >
                          <option value="Reported">Reported</option>
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              onOpenIncident(inc);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sentinel-cyan hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Inspect Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setIncidentToDelete(inc);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-sentinel-darkSurface p-6 rounded-2xl max-w-sm w-full border border-red-500/40 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Delete Incident Report?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete {incidentToDelete.incidentCode}? This will immediately adjust dashboard metrics.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setIncidentToDelete(null)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow"
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
