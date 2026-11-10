import React, { useState, useEffect } from 'react';
import { Incident, IncidentActivity, IncidentStatus, SeverityLevel } from '../../types';
import { SeverityBadge } from '../common/SeverityBadge';
import { CategoryBadge } from '../common/CategoryBadge';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityGauge } from '../common/PriorityGauge';
import { incidentService } from '../../services/incidentService';
import {
  X,
  MapPin,
  Clock,
  Users,
  Phone,
  User,
  ShieldAlert,
  Sliders,
  Send,
  Trash2,
  CheckCircle,
  Truck,
  Sparkles,
  AlertCircle,
  MessageSquare,
  Activity,
} from 'lucide-react';

interface IncidentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: Incident | null;
  onIncidentUpdated: () => void;
  onOpenDuplicate?: (incident: Incident) => void;
}

export const IncidentDetailsModal: React.FC<IncidentDetailsModalProps> = ({
  isOpen,
  onClose,
  incident,
  onIncidentUpdated,
  onOpenDuplicate,
}) => {
  if (!isOpen || !incident) return null;

  const [currentStatus, setCurrentStatus] = useState<IncidentStatus>(incident.status);
  const [currentSeverity, setCurrentSeverity] = useState<SeverityLevel>(incident.severity);
  const [assignedUnit, setAssignedUnit] = useState<string>(incident.assignedUnit || '');
  const [noteText, setNoteText] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [showOverrideInput, setShowOverrideInput] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activities, setActivities] = useState<IncidentActivity[]>([]);

  useEffect(() => {
    setCurrentStatus(incident.status);
    setCurrentSeverity(incident.severity);
    setAssignedUnit(incident.assignedUnit || '');
    setActivities(incidentService.getActivities(incident.id));
  }, [incident]);

  const handleStatusChange = (newStatus: IncidentStatus) => {
    setCurrentStatus(newStatus);
    incidentService.updateIncidentStatus(
      incident.id,
      newStatus,
      'Commander Aditi Rao',
      statusNotes || undefined
    );
    setStatusNotes('');
    setActivities(incidentService.getActivities(incident.id));
    onIncidentUpdated();
  };

  const handleSeverityOverride = () => {
    incidentService.updateIncidentSeverity(
      incident.id,
      currentSeverity,
      'Commander Aditi Rao',
      overrideReason || 'Operational reassessment on ground'
    );
    setShowOverrideInput(false);
    setActivities(incidentService.getActivities(incident.id));
    onIncidentUpdated();
  };

  const handleAssignUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedUnit.trim()) return;
    incidentService.assignUnit(incident.id, assignedUnit.trim(), 'Commander Aditi Rao');
    setActivities(incidentService.getActivities(incident.id));
    onIncidentUpdated();
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    incidentService.addActivity(incident.id, {
      action: 'NOTE_ADDED',
      actor: 'Commander Aditi Rao',
      description: noteText.trim(),
    });
    setNoteText('');
    setActivities(incidentService.getActivities(incident.id));
  };

  const handleDelete = () => {
    incidentService.deleteIncident(incident.id);
    setShowDeleteConfirm(false);
    onClose();
    onIncidentUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white dark:bg-sentinel-darkSurface rounded-2xl max-w-5xl w-full border border-slate-200 dark:border-sentinel-darkBorder shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-scaleUp">
        {/* Top Header */}
        <div className="p-4 sm:p-6 bg-sentinel-navy text-white flex items-center justify-between border-b border-sentinel-darkBorder shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sentinel-darkSurface border border-sentinel-darkBorder flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-sentinel-cyan" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-sentinel-cyan/15 text-sentinel-cyan border border-sentinel-cyan/30 font-bold">
                  {incident.incidentCode}
                </span>
                {incident.isDemo && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                    DEMO SIMULATION
                  </span>
                )}
                <StatusBadge status={currentStatus} size="sm" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-1 line-clamp-1">
                {incident.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/10 transition-colors"
              title="Delete Incident"
              aria-label="Delete incident"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Dossier Column (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Duplicate Banner if flagged */}
            {incident.duplicateWarning && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-600 dark:text-amber-400">
                      Possible Duplicate Warning ({incident.duplicateWarning.similarityScore}% Match)
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Matches prior incident {incident.duplicateWarning.suspectCode}: {incident.duplicateWarning.reasons[0]}
                    </p>
                  </div>
                </div>
                {onOpenDuplicate && (
                  <button
                    onClick={() => {
                      onOpenDuplicate(incident);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shrink-0 shadow"
                  >
                    Compare
                  </button>
                )}
              </div>
            )}

            {/* Quick Metadata Pill Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-sentinel-darkCard border border-slate-200 dark:border-sentinel-darkBorder">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Category
                </span>
                <div className="mt-1">
                  <CategoryBadge category={incident.category} size="sm" />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-sentinel-darkCard border border-slate-200 dark:border-sentinel-darkBorder">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Severity
                </span>
                <div className="mt-1">
                  <SeverityBadge severity={currentSeverity} size="sm" />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-sentinel-darkCard border border-slate-200 dark:border-sentinel-darkBorder">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Casualties / Impact
                </span>
                <div className="mt-1 font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>{incident.peopleAffected} People</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-sentinel-darkCard border border-slate-200 dark:border-sentinel-darkBorder">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Time Reported
                </span>
                <div className="mt-1 font-mono text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(incident.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-sentinel-darkCard border border-slate-200 dark:border-sentinel-darkBorder space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Incident Synopsis & Field Report
              </h3>
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {incident.description}
              </p>
            </div>

            {/* Location & Coordinates */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-sentinel-darkCard border border-slate-200 dark:border-sentinel-darkBorder space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Geographic Dispatch Coordinates
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200 font-medium">
                  <MapPin className="w-4 h-4 text-sentinel-cyan shrink-0" />
                  <span>{incident.location}</span>
                  {incident.landmark && (
                    <span className="text-xs text-slate-400">({incident.landmark})</span>
                  )}
                </div>
                {incident.latitude && incident.longitude && (
                  <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    LAT: {incident.latitude.toFixed(4)}, LNG: {incident.longitude.toFixed(4)}
                  </span>
                )}
              </div>
            </div>

            {/* Smart Severity Intelligence Engine Breakdown */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-sentinel-darkBlue to-sentinel-navy text-white border border-sentinel-cyan/30 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-sentinel-cyan animate-spin-slow" />
                  <h3 className="text-sm font-bold tracking-tight text-white">
                    Smart Severity Intelligence Engine
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sentinel-cyan/20 text-sentinel-cyan border border-sentinel-cyan/40">
                  DECISION SUPPORT
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="text-xs text-slate-400 block mb-1">Recommended Severity</span>
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={incident.recommendedSeverity} size="md" pulsing={false} />
                    {incident.severityOverridden && (
                      <span className="text-xs text-amber-400 italic">
                        (Commander Overridden to {currentSeverity})
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block mb-1">Calculated Priority Score</span>
                  <PriorityGauge score={incident.priorityScore} size="md" />
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <span className="text-xs font-semibold text-slate-300">Explainable Decision Factors:</span>
                <ul className="space-y-1">
                  {incident.severityReasoning.map((reason, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                      <span className="text-sentinel-cyan">›</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Commander Override Trigger */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowOverrideInput(!showOverrideInput)}
                  className="text-xs font-medium text-sentinel-cyan hover:underline flex items-center gap-1"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  {showOverrideInput ? 'Cancel Override' : 'Override Severity Classification'}
                </button>
              </div>

              {showOverrideInput && (
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-3 animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <label className="text-xs text-slate-300 font-medium">New Severity Level:</label>
                    <select
                      value={currentSeverity}
                      onChange={e => setCurrentSeverity(e.target.value as SeverityLevel)}
                      className="text-xs bg-sentinel-navy text-white border border-sentinel-cyan/40 rounded-lg px-2.5 py-1.5"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    value={overrideReason}
                    onChange={e => setOverrideReason(e.target.value)}
                    placeholder="Enter justification for commander override..."
                    className="w-full text-xs bg-sentinel-navy text-white border border-white/20 rounded-lg px-3 py-2 placeholder-slate-500"
                  />
                  <button
                    onClick={handleSeverityOverride}
                    className="px-3 py-1.5 rounded-lg bg-sentinel-cyan text-sentinel-navy text-xs font-bold hover:bg-cyan-300 transition-colors"
                  >
                    Confirm & Log Override
                  </button>
                </div>
              )}
            </div>

            {/* Reporter Contact Info */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-sentinel-darkCard border border-slate-200 dark:border-sentinel-darkBorder space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Citizen Reporting Information
              </h3>
              {incident.contactInformation ? (
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <strong>Name:</strong> {incident.contactInformation.name || 'Anonymous Citizen'}
                  </span>
                  {incident.contactInformation.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <strong>Phone:</strong> {incident.contactInformation.phone}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No personal contact information provided.</p>
              )}
            </div>
          </div>

          {/* Right Column: Dispatch Actions & Activity Timeline */}
          <div className="space-y-6">
            {/* Quick Status Updater */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-sentinel-darkCard border border-slate-200 dark:border-sentinel-darkBorder space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Operational Status Controller
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {(['Reported', 'Pending', 'In Progress', 'Resolved'] as IncidentStatus[]).map(st => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all border ${
                      currentStatus === st
                        ? 'bg-sentinel-navy text-white dark:bg-sentinel-cyan dark:text-sentinel-navy border-transparent shadow'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sentinel-cyan'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Assign Response Unit */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-sentinel-darkCard border border-slate-200 dark:border-sentinel-darkBorder space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-sentinel-cyan" />
                Assigned Response Unit
              </h3>
              <form onSubmit={handleAssignUnit} className="space-y-2">
                <input
                  type="text"
                  value={assignedUnit}
                  onChange={e => setAssignedUnit(e.target.value)}
                  placeholder="e.g. Fire Tender 4, ALS Ambulance 108"
                  className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-800 dark:text-slate-200"
                />
                <button
                  type="submit"
                  className="w-full py-1.5 px-3 rounded-lg bg-sentinel-darkBlue hover:bg-sentinel-navy text-white text-xs font-semibold transition-colors"
                >
                  Update Unit Assignment
                </button>
              </form>
            </div>

            {/* Incident Activity Timeline */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-sentinel-darkCard border border-slate-200 dark:border-sentinel-darkBorder space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-sentinel-cyan" />
                  Incident Activity Timeline
                </h3>
                <span className="text-[10px] text-slate-400 font-mono font-medium">
                  {activities.length} logs
                </span>
              </div>

              {/* Add Note */}
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Add commander field note..."
                  className="flex-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-slate-800 dark:text-slate-200"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-sentinel-cyan text-sentinel-navy font-bold text-xs hover:bg-cyan-300 transition-colors"
                  aria-label="Send field note"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Timeline list */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {activities.map(act => (
                  <div key={act.id} className="relative pl-5 border-l-2 border-sentinel-cyan/40 pb-2 text-xs">
                    <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-sentinel-cyan" />
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{act.actor}</span>
                      <span>{new Date(act.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-xs">{act.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal Overlay */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-sentinel-darkSurface p-6 rounded-2xl max-w-sm w-full border border-red-500/40 text-center space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Delete Incident Report?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to delete {incident.incidentCode}? This action will permanently remove it from the database and recalculate statistics.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
