import React from 'react';
import { Incident } from '../../types';
import { SeverityBadge } from '../common/SeverityBadge';
import { CategoryBadge } from '../common/CategoryBadge';
import { soundEffects } from '../../utils/soundEffects';
import { X, ShieldAlert, AlertTriangle, ArrowRight, Copy, Flame, Clock } from 'lucide-react';

interface EmergencyAlertDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  onInspectDuplicate: (incident: Incident) => void;
}

export const EmergencyAlertDrawer: React.FC<EmergencyAlertDrawerProps> = ({
  isOpen,
  onClose,
  incidents,
  onSelectIncident,
  onInspectDuplicate,
}) => {
  if (!isOpen) return null;

  const criticalIncidents = incidents.filter(i => i.severity === 'Critical' && i.status !== 'Resolved');
  const duplicateWarnings = incidents.filter(i => Boolean(i.duplicateWarning) && i.status !== 'Resolved');
  const pendingHigh = incidents.filter(i => i.severity === 'High' && i.status === 'Reported');

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-md animate-fadeIn selection:bg-sentinel-cyan/30 selection:text-sentinel-cyan">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-3 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-md glass-panel bg-sentinel-navy shadow-2xl border-l border-sentinel-darkBorder flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-sentinel-darkSurface to-slate-900 text-white flex items-center justify-between border-b border-sentinel-darkBorder">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sentinel-red flex items-center justify-center text-white shadow-lg shadow-sentinel-red/30 animate-pulse">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base tracking-tight text-white flex items-center gap-2">
                  <span>Emergency Alert Center</span>
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                </h3>
                <p className="text-xs text-slate-400 font-mono">CRITICAL OPS QUEUE • {criticalIncidents.length + duplicateWarnings.length} ALERTS</p>
              </div>
            </div>
            <button
              onClick={() => {
                soundEffects.playClick();
                onClose();
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close alerts panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Alert Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Section 1: Critical Incidents */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5 font-mono">
                  <Flame className="w-4 h-4 text-red-500 animate-pulse" />
                  Active Critical Incidents ({criticalIncidents.length})
                </span>
              </div>

              {criticalIncidents.length === 0 ? (
                <div className="p-4 rounded-xl bg-sentinel-darkSurface/60 border border-sentinel-darkBorder text-xs text-slate-400 text-center">
                  No active critical emergencies at this moment.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {criticalIncidents.map(inc => (
                    <div
                      key={inc.id}
                      onClick={() => {
                        soundEffects.playBeep();
                        onSelectIncident(inc);
                        onClose();
                      }}
                      className="p-3.5 rounded-2xl bg-red-950/20 border border-red-500/40 hover:border-red-400 hover:shadow-lg hover:shadow-red-500/10 cursor-pointer transition-all group relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-mono text-xs font-bold text-red-400 px-2 py-0.5 rounded bg-red-500/15 border border-red-500/30">
                          {inc.incidentCode}
                        </span>
                        <SeverityBadge severity={inc.severity} size="sm" />
                      </div>
                      <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-red-300 transition-colors">
                        {inc.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                        📍 {inc.location} • 👥 {inc.peopleAffected} at risk
                      </p>
                      <div className="mt-3 pt-2 border-t border-red-900/40 flex items-center justify-between text-[11px] text-red-400 font-medium">
                        <span className="font-mono">STATUS: {inc.status}</span>
                        <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform font-bold text-white">
                          Open Dossier <ArrowRight className="w-3.5 h-3.5 text-sentinel-cyan" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 2: Suspected Duplicate Warnings */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-mono">
                  <Copy className="w-4 h-4 text-amber-400" />
                  Suspected Duplicate Reports ({duplicateWarnings.length})
                </span>
              </div>

              {duplicateWarnings.length === 0 ? (
                <div className="p-4 rounded-xl bg-sentinel-darkSurface/60 border border-sentinel-darkBorder text-xs text-slate-400 text-center">
                  No pending duplicate alarms.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {duplicateWarnings.map(inc => (
                    <div
                      key={inc.id}
                      className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/40 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30">
                          {inc.incidentCode}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold font-mono">
                          {inc.duplicateWarning?.similarityScore}% Match
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white line-clamp-1">
                        {inc.title}
                      </p>
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        Matches {inc.duplicateWarning?.suspectCode}: {inc.duplicateWarning?.reasons[0]}
                      </p>
                      <button
                        onClick={() => {
                          soundEffects.playBeep();
                          onInspectDuplicate(inc);
                          onClose();
                        }}
                        className="w-full mt-1 py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        Inspect & Resolve Duplicate <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 3: High Priority Untriaged */}
            {pendingHigh.length > 0 && (
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5 mb-3 font-mono">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  Untriaged High-Priority ({pendingHigh.length})
                </span>
                <div className="space-y-2">
                  {pendingHigh.map(inc => (
                    <div
                      key={inc.id}
                      onClick={() => {
                        soundEffects.playBeep();
                        onSelectIncident(inc);
                        onClose();
                      }}
                      className="p-3 rounded-xl glass-panel border border-sentinel-darkBorder hover:border-sentinel-cyan cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                        <p className="text-xs font-bold text-white truncate group-hover:text-sentinel-cyan transition-colors">
                          {inc.title}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{inc.location}</p>
                      </div>
                      <SeverityBadge severity={inc.severity} size="sm" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
