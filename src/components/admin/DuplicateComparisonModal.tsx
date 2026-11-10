import React from 'react';
import { Incident } from '../../types';
import { SeverityBadge } from '../common/SeverityBadge';
import { CategoryBadge } from '../common/CategoryBadge';
import { StatusBadge } from '../common/StatusBadge';
import { soundEffects } from '../../utils/soundEffects';
import { X, Copy, CheckCircle, AlertTriangle, ArrowRight, MapPin, Clock, Users, ShieldAlert } from 'lucide-react';

interface DuplicateComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetIncident: Incident | null;
  originalIncident: Incident | null;
  onConfirmDuplicate: (targetId: string, originalId: string) => void;
  onDismissWarning: (targetId: string) => void;
}

export const DuplicateComparisonModal: React.FC<DuplicateComparisonModalProps> = ({
  isOpen,
  onClose,
  targetIncident,
  originalIncident,
  onConfirmDuplicate,
  onDismissWarning,
}) => {
  if (!isOpen || !targetIncident) return null;

  const warning = targetIncident.duplicateWarning;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 selection:bg-sentinel-cyan/30 selection:text-sentinel-cyan">
      <div className="glass-panel bg-sentinel-darkSurface rounded-3xl max-w-4xl w-full border border-sentinel-darkBorder shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white flex items-center justify-between border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Copy className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">Duplicate Incident Resolution Center</h3>
                {warning && (
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-mono font-bold shadow-xs">
                    {warning.similarityScore}% Match Detected
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-100">
                Decision Support: Compare suspect report against previously registered emergency before dispatching duplicate units.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Analysis Reason Bar */}
        {warning && (
          <div className="px-6 py-3 bg-amber-950/40 border-b border-amber-900/50 flex flex-wrap items-center gap-2 text-xs text-amber-300">
            <span className="font-bold flex items-center gap-1 font-mono">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Engine Match Signals:
            </span>
            {warning.reasons.map((reason, idx) => (
              <span key={idx} className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                • {reason}
              </span>
            ))}
          </div>
        )}

        {/* Side-by-Side Comparison */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-sentinel-navy/60">
          {/* Left: Original Previously Reported Incident */}
          <div className="bg-sentinel-darkCard p-5 rounded-2xl border border-sentinel-darkBorder shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sentinel-darkBorder/60">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Prior / Primary Incident
              </span>
              <span className="font-mono text-xs font-bold text-sentinel-cyan px-2 py-0.5 rounded bg-sentinel-cyan/10 border border-sentinel-cyan/20">
                {originalIncident ? originalIncident.incidentCode : warning?.suspectCode}
              </span>
            </div>

            {originalIncident ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CategoryBadge category={originalIncident.category} size="sm" />
                  <SeverityBadge severity={originalIncident.severity} size="sm" />
                  <StatusBadge status={originalIncident.status} size="sm" />
                </div>

                <h4 className="font-bold text-base text-white">
                  {originalIncident.title}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed bg-sentinel-darkSurface/80 p-3.5 rounded-xl border border-sentinel-darkBorder">
                  {originalIncident.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{originalIncident.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{originalIncident.peopleAffected} Affected</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Logged: {new Date(originalIncident.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-xs text-slate-400">Original incident details not loaded.</div>
            )}
          </div>

          {/* Right: Suspect Duplicate Report */}
          <div className="bg-sentinel-darkCard p-5 rounded-2xl border-2 border-amber-500/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sentinel-darkBorder/60">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1 font-mono">
                <AlertTriangle className="w-3.5 h-3.5" /> Suspect Duplicate Report
              </span>
              <span className="font-mono text-xs font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30">
                {targetIncident.incidentCode}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CategoryBadge category={targetIncident.category} size="sm" />
                <SeverityBadge severity={targetIncident.severity} size="sm" />
                <StatusBadge status={targetIncident.status} size="sm" />
              </div>

              <h4 className="font-bold text-base text-white">
                {targetIncident.title}
              </h4>

              <p className="text-xs text-slate-300 leading-relaxed bg-amber-950/20 p-3.5 rounded-xl border border-amber-500/20">
                {targetIncident.description}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{targetIncident.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{targetIncident.peopleAffected} Affected</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2 font-mono text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Logged: {new Date(targetIncident.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Decision Footer */}
        <div className="p-5 bg-sentinel-darkSurface border-t border-sentinel-darkBorder flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            ⚠️ Marking as duplicate links this report to primary record and resolves it to avoid resource redundancy.
          </p>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => {
                soundEffects.playClick();
                onDismissWarning(targetIncident.id);
                onClose();
              }}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              Dismiss (Keep Separate)
            </button>

            <button
              onClick={() => {
                soundEffects.playBeep();
                const origId = originalIncident?.id || warning?.suspectId || '';
                onConfirmDuplicate(targetIncident.id, origId);
                onClose();
              }}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <CheckCircle className="w-4 h-4" />
              Confirm as Duplicate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
