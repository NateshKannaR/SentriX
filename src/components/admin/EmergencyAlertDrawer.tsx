import React from 'react';
import { Incident } from '../../types';
import { SeverityBadge } from '../common/SeverityBadge';
import { CategoryBadge } from '../common/CategoryBadge';
import { X, ShieldAlert, AlertTriangle, ArrowRight, Copy } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-sentinel-darkSurface shadow-2xl border-l border-slate-200 dark:border-sentinel-darkBorder flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-sentinel-navy text-white flex items-center justify-between border-b border-sentinel-darkBorder">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sentinel-red flex items-center justify-center text-white animate-pulse">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base tracking-tight">Emergency Alert Center</h3>
                <p className="text-xs text-slate-400">High-priority operational action items</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
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
                <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  Active Critical Incidents ({criticalIncidents.length})
                </span>
              </div>

              {criticalIncidents.length === 0 ? (
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 text-center">
                  No active critical emergencies at this moment.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {criticalIncidents.map(inc => (
                    <div
                      key={inc.id}
                      onClick={() => {
                        onSelectIncident(inc);
                        onClose();
                      }}
                      className="p-3 rounded-xl bg-red-500/5 dark:bg-red-950/20 border border-red-500/30 hover:border-red-500 hover:shadow-md cursor-pointer transition-all group"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                          {inc.incidentCode}
                        </span>
                        <SeverityBadge severity={inc.severity} size="sm" />
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1 group-hover:text-red-600 transition-colors">
                        {inc.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                        📍 {inc.location} • 👥 {inc.peopleAffected} affected
                      </p>
                      <div className="mt-2.5 pt-2 border-t border-red-200 dark:border-red-900/40 flex items-center justify-between text-[11px] text-red-600 dark:text-red-400 font-medium">
                        <span>Status: {inc.status}</span>
                        <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Review Dossier <ArrowRight className="w-3.5 h-3.5" />
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
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Copy className="w-4 h-4" />
                  Suspected Duplicate Reports ({duplicateWarnings.length})
                </span>
              </div>

              {duplicateWarnings.length === 0 ? (
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 text-center">
                  No pending duplicate alarms.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {duplicateWarnings.map(inc => (
                    <div
                      key={inc.id}
                      className="p-3 rounded-xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/30 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                          {inc.incidentCode}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold">
                          {inc.duplicateWarning?.similarityScore}% Match
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                        {inc.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Matches {inc.duplicateWarning?.suspectCode}: {inc.duplicateWarning?.reasons[0]}
                      </p>
                      <button
                        onClick={() => {
                          onInspectDuplicate(inc);
                          onClose();
                        }}
                        className="w-full mt-1 py-1.5 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
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
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 flex items-center gap-1.5 mb-3">
                  <AlertTriangle className="w-4 h-4" />
                  Untriaged High-Priority ({pendingHigh.length})
                </span>
                <div className="space-y-2">
                  {pendingHigh.map(inc => (
                    <div
                      key={inc.id}
                      onClick={() => {
                        onSelectIncident(inc);
                        onClose();
                      }}
                      className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-sentinel-cyan cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div className="space-y-0.5 max-w-[240px]">
                        <p className="text-xs font-medium text-slate-900 dark:text-slate-200 truncate">
                          {inc.title}
                        </p>
                        <p className="text-[10px] text-slate-500">{inc.location}</p>
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
