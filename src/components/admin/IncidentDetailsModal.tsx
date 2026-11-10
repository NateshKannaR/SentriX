import React, { useState, useEffect } from 'react';
import { Incident, IncidentActivity, IncidentStatus, SeverityLevel } from '../../types';
import { SeverityBadge } from '../common/SeverityBadge';
import { CategoryBadge } from '../common/CategoryBadge';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityGauge } from '../common/PriorityGauge';
import { incidentService } from '../../services/incidentService';
import { teamService, NearestTeamMatch } from '../../services/teamService';
import { soundFx } from '../../utils/soundEffects';
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
  Crosshair,
  Radio,
  Navigation,
  Zap,
  CheckCircle2,
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

  const [nearestTeams, setNearestTeams] = useState<NearestTeamMatch[]>([]);

  useEffect(() => {
    setCurrentStatus(incident.status);
    setCurrentSeverity(incident.severity);
    setAssignedUnit(incident.assignedUnit || '');
    setActivities(incidentService.getActivities(incident.id));
    if (incident) {
      setNearestTeams(teamService.findNearestTeamsForIncident(incident));
    }
  }, [incident]);

  const handleAssignTeam = (match: NearestTeamMatch) => {
    soundFx.playSuccess();
    setAssignedUnit(match.team.name);
    setCurrentStatus('Assigned');
    incidentService.assignResponseTeam(
      incident.id,
      match.team,
      match.distanceKm,
      match.etaMinutes,
      'Commander Aditi Rao'
    );
    setActivities(incidentService.getActivities(incident.id));
    setNearestTeams(teamService.findNearestTeamsForIncident(incident));
    onIncidentUpdated();
  };

  const handleStatusChange = (newStatus: IncidentStatus) => {
    soundFx.playClick();
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
    soundFx.playAlert();
    incidentService.updateIncidentSeverity(
      incident.id,
      currentSeverity,
      'Commander Aditi Rao',
      overrideReason || 'Operational ground reassessment'
    );
    setShowOverrideInput(false);
    setActivities(incidentService.getActivities(incident.id));
    onIncidentUpdated();
  };

  const handleAssignUnit = (unitName: string) => {
    soundFx.playClick();
    setAssignedUnit(unitName);
    incidentService.assignUnit(incident.id, unitName, 'Commander Aditi Rao');
    setActivities(incidentService.getActivities(incident.id));
    onIncidentUpdated();
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    soundFx.playClick();
    incidentService.addActivity(incident.id, {
      action: 'NOTE_ADDED',
      actor: 'Commander Aditi Rao',
      description: noteText.trim(),
    });
    setNoteText('');
    setActivities(incidentService.getActivities(incident.id));
  };

  const handleDelete = () => {
    soundFx.playAlert();
    incidentService.deleteIncident(incident.id);
    setShowDeleteConfirm(false);
    onClose();
    onIncidentUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-5">
      <div className="bg-[#0B1E38] rounded-2xl sm:rounded-3xl max-w-5xl w-full border border-[#16C7E8]/30 shadow-2xl overflow-hidden max-h-[95vh] sm:max-h-[92vh] flex flex-col animate-scaleUp glow-cyan">
        {/* Top Header */}
        <div className="p-3.5 sm:p-6 bg-[#071426] text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#0B1E38] border border-[#16C7E8]/40 flex items-center justify-center shadow-lg shrink-0">
              <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-sentinel-cyan" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-[#16C7E8]/15 text-sentinel-cyan border border-[#16C7E8]/30 font-black">
                  {incident.incidentCode}
                </span>
                {incident.isDemo && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold hidden xs:inline-block">
                    DEMO
                  </span>
                )}
                <StatusBadge status={currentStatus} size="sm" />
              </div>
              <h2 className="text-sm sm:text-xl font-black text-white mt-0.5 sm:mt-1 line-clamp-1 truncate">
                {incident.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={() => {
                soundFx.playAlert();
                setShowDeleteConfirm(true);
              }}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors"
              title="Delete Incident"
              aria-label="Delete incident"
            >
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-7 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 bg-[#071426]/70">
          {/* Main Dossier Column (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Duplicate Banner if flagged */}
            {incident.duplicateWarning && (
              <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-between shadow-lg glow-amber">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold font-mono uppercase text-amber-300">
                      Cross-Report Duplicate Flag ({incident.duplicateWarning.similarityScore}% Match)
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Correlated with prior incident {incident.duplicateWarning.suspectCode}: {incident.duplicateWarning.reasons[0]}
                    </p>
                  </div>
                </div>
                {onOpenDuplicate && (
                  <button
                    onClick={() => {
                      soundFx.playAlert();
                      onOpenDuplicate(incident);
                      onClose();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shrink-0 shadow transition-transform active:scale-95"
                  >
                    Compare
                  </button>
                )}
              </div>
            )}

            {/* Quick Metadata Pill Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#0B1E38]/80 border border-white/10">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-bold">
                  Category
                </span>
                <div className="mt-1.5">
                  <CategoryBadge category={incident.category} size="sm" />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0B1E38]/80 border border-white/10">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-bold">
                  Severity
                </span>
                <div className="mt-1.5">
                  <SeverityBadge severity={currentSeverity} size="sm" />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0B1E38]/80 border border-white/10">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-bold">
                  People Impact
                </span>
                <div className="mt-1.5 font-black text-sm text-white flex items-center gap-1.5 font-mono">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>{incident.peopleAffected} Casualties</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0B1E38]/80 border border-white/10">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-bold">
                  Reported Time
                </span>
                <div className="mt-1.5 font-mono text-xs text-slate-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(incident.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            {/* Situation Synopsis */}
            <div className="p-5 rounded-2xl bg-[#0B1E38]/80 border border-white/10 space-y-2">
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-sentinel-cyan">
                Field Situation Report
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line font-normal">
                {incident.description}
              </p>
            </div>

            {/* Location & Coordinates */}
            <div className="p-5 rounded-2xl bg-[#0B1E38]/80 border border-white/10 space-y-2">
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-sentinel-cyan">
                Geographic Dispatch Coordinates
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm text-white font-medium">
                  <MapPin className="w-4 h-4 text-sentinel-cyan shrink-0" />
                  <span>{incident.location}</span>
                  {incident.landmark && (
                    <span className="text-xs text-slate-400">({incident.landmark})</span>
                  )}
                </div>
                {incident.latitude && incident.longitude && (
                  <span className="font-mono text-xs px-3 py-1 rounded-xl bg-[#071426] border border-white/10 text-sentinel-cyan">
                    LAT: {incident.latitude.toFixed(4)}, LNG: {incident.longitude.toFixed(4)}
                  </span>
                )}
              </div>
            </div>

            {/* Smart Severity Intelligence Engine Breakdown */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0B1E38] via-[#071426] to-[#040C17] text-white border border-[#16C7E8]/40 shadow-2xl space-y-4 glow-cyan">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-sentinel-cyan animate-spin-slow" />
                  <h3 className="text-sm font-bold tracking-tight text-white">
                    Smart Severity Decision Engine
                  </h3>
                </div>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-sentinel-cyan/20 text-sentinel-cyan border border-sentinel-cyan/40">
                  EXPLAINABLE AI
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Assigned Priority Level
                  </span>
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={incident.recommendedSeverity} size="md" pulsing={false} />
                    {incident.severityOverridden && (
                      <span className="text-xs text-amber-400 italic">
                        (Overridden to {currentSeverity})
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Calculated Priority Index
                  </span>
                  <PriorityGauge score={incident.priorityScore} size="md" />
                </div>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-white/10">
                <span className="text-xs font-mono font-bold text-sentinel-cyan">Triggered Rules & Factors:</span>
                <ul className="space-y-1">
                  {incident.severityReasoning.map((reason, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-sentinel-cyan font-bold">›</span>
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
                  className="text-xs font-bold text-sentinel-cyan hover:underline flex items-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  {showOverrideInput ? 'Cancel Override' : 'Override Severity Classification'}
                </button>
              </div>

              {showOverrideInput && (
                <div className="p-4 rounded-2xl bg-[#071426] border border-[#16C7E8]/40 space-y-3 animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <label className="text-xs text-slate-300 font-bold font-mono">New Severity:</label>
                    <select
                      value={currentSeverity}
                      onChange={e => setCurrentSeverity(e.target.value as SeverityLevel)}
                      className="text-xs bg-[#0B1E38] text-white border border-white/20 rounded-xl px-3 py-1.5 font-bold"
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
                    className="w-full text-xs bg-[#0B1E38] text-white border border-white/20 rounded-xl px-3 py-2"
                  />
                  <button
                    onClick={handleSeverityOverride}
                    className="px-4 py-2 rounded-xl bg-sentinel-cyan text-sentinel-navy text-xs font-black shadow transition-transform active:scale-95"
                  >
                    Confirm & Audit Log Override
                  </button>
                </div>
              )}
            </div>

            {/* Reporter Contact Info */}
            <div className="p-5 rounded-2xl bg-[#0B1E38]/80 border border-white/10 space-y-2">
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                Citizen Reporting Source
              </h3>
              {incident.contactInformation ? (
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-sentinel-cyan" />
                    <strong>Name:</strong> {incident.contactInformation.name || 'Anonymous Citizen'}
                  </span>
                  {incident.contactInformation.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-sentinel-cyan" />
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
            {/* Incident Lifecycle Controller */}
            <div className="p-5 rounded-2xl bg-[#0B1E38]/80 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                  Incident Lifecycle Status
                </h3>
                <span className="text-[9px] font-mono text-cyan-400 font-bold">
                  STEP-BY-STEP WORKFLOW
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {(['Reported', 'Assigned', 'In Progress', 'Resolved'] as IncidentStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className={`py-2 px-2 rounded-xl text-xs font-mono font-black transition-all border text-center ${
                      currentStatus === st
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/30'
                        : 'bg-[#071426] text-slate-300 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Location-Based Response Team Dispatcher */}
            <div className="p-5 rounded-2xl bg-[#0B1E38]/80 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-300 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-cyan-400" />
                  Location-Based Team Dispatch
                </h3>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                  HAVERSINE GPS
                </span>
              </div>

              {/* Active Assigned Team Telemetry */}
              {incident.assignedTeamName && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/70 to-[#0A1322] border border-cyan-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      Assigned Responding Unit
                    </span>
                    <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                      EN ROUTE
                    </span>
                  </div>
                  <div className="text-sm font-black text-white">{incident.assignedTeamName}</div>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-300">
                    <span className="flex items-center gap-1">
                      <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                      Distance: <strong className="text-white">{incident.assignedDistanceKm ?? '1.5'} km</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      ETA: <strong className="text-amber-300">{incident.assignedEtaMinutes ?? '4'} mins</strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Nearest Available Teams List */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                  Nearest Available Units (Auto-Calculated Distance):
                </span>
                {nearestTeams.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No GPS coordinates or all response teams currently deployed.</p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {nearestTeams.slice(0, 3).map((match) => (
                      <div
                        key={match.team.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-colors ${
                          match.isBestFit
                            ? 'bg-emerald-950/40 border-emerald-500/40'
                            : 'bg-[#071426] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-1.5">
                            {match.isBestFit && (
                              <span className="text-[9px] font-mono font-black px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                                BEST FIT
                              </span>
                            )}
                            <span className="text-xs font-bold text-white truncate">{match.team.name}</span>
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{match.team.category}</span>
                            <span>•</span>
                            <span className="text-cyan-400 font-bold">{match.distanceKm} km</span>
                            <span>•</span>
                            <span className="text-amber-400 font-bold">~{match.etaMinutes}m ETA</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAssignTeam(match)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold shrink-0 transition-transform active:scale-95 flex items-center gap-1 ${
                            match.isBestFit
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                              : 'bg-white/10 hover:bg-white/20 text-white'
                          }`}
                        >
                          <Zap className="w-3 h-3" />
                          <span>Dispatch</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Unit fallback */}
              <div className="pt-1">
                <input
                  type="text"
                  value={assignedUnit}
                  onChange={e => setAssignedUnit(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && assignedUnit.trim()) {
                      handleAssignUnit(assignedUnit.trim());
                    }
                  }}
                  placeholder="Or enter custom callsign / badge ID..."
                  className="w-full text-xs rounded-xl border border-white/15 bg-[#071426] px-3 py-2 text-white"
                />
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="p-5 rounded-2xl bg-[#0B1E38]/80 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-sentinel-cyan" />
                  Chronological Audit Trail
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  {activities.length} logs
                </span>
              </div>

              {/* Add Note */}
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Add commander note..."
                  className="flex-1 text-xs rounded-xl border border-white/15 bg-[#071426] px-3 py-2 text-white"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl bg-sentinel-cyan text-sentinel-navy font-black text-xs hover:bg-cyan-300 transition-colors"
                  aria-label="Send note"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Timeline list */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {activities.map(act => (
                  <div key={act.id} className="relative pl-4 border-l-2 border-sentinel-cyan/40 pb-2 text-xs">
                    <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-sentinel-cyan shadow-[0_0_6px_#16C7E8]" />
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                      <span className="font-bold text-slate-300">{act.actor}</span>
                      <span className="font-mono">{new Date(act.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-300 text-xs">{act.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-[#0B1E38] p-6 rounded-3xl max-w-sm w-full border border-red-500/50 text-center space-y-4 shadow-2xl glow-red">
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 text-red-400 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Delete Incident Report?</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Are you sure you want to delete {incident.incidentCode}? This will permanently remove it from the system.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-white/5 text-slate-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2.5 rounded-xl text-xs font-black bg-red-600 hover:bg-red-700 text-white shadow-lg"
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
