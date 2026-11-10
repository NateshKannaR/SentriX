import React from 'react';
import { Incident } from '../../types';
import { SeverityBadge } from '../common/SeverityBadge';
import { CategoryBadge } from '../common/CategoryBadge';
import { StatusBadge } from '../common/StatusBadge';
import { X, Copy, CheckCircle, AlertTriangle, ArrowRight, MapPin, Clock, Users } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-sentinel-darkSurface rounded-2xl max-w-4xl w-full border border-slate-200 dark:border-sentinel-darkBorder shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Copy className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Duplicate Incident Resolution Center</h3>
                {warning && (
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-mono font-bold">
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
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* AI Analysis Reason Bar */}
        {warning && (
          <div className="px-6 py-3 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900/50 flex flex-wrap items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
            <span className="font-bold flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Engine Match Signals:
            </span>
            {warning.reasons.map((reason, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/60 font-medium">
                • {reason}
              </span>
            ))}
          </div>
        )}

        {/* Side-by-Side Comparison */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 dark:bg-slate-900/30">
          {/* Left: Original Previously Reported Incident */}
          <div className="bg-white dark:bg-sentinel-darkCard p-5 rounded-xl border border-slate-200 dark:border-sentinel-darkBorder shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Prior / Primary Incident
              </span>
              <span className="font-mono text-xs font-bold text-sentinel-cyan">
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

                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  {originalIncident.title}
                </h4>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  {originalIncident.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{originalIncident.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{originalIncident.peopleAffected} Affected</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Reported: {new Date(originalIncident.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-xs text-slate-500">Original incident details not loaded.</div>
            )}
          </div>

          {/* Right: Suspect Duplicate Report */}
          <div className="bg-white dark:bg-sentinel-darkCard p-5 rounded-xl border-2 border-amber-500/40 dark:border-amber-500/30 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Suspect Duplicate Report
              </span>
              <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                {targetIncident.incidentCode}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CategoryBadge category={targetIncident.category} size="sm" />
                <SeverityBadge severity={targetIncident.severity} size="sm" />
                <StatusBadge status={targetIncident.status} size="sm" />
              </div>

              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                {targetIncident.title}
              </h4>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-amber-500/5 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-900/30">
                {targetIncident.description}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{targetIncident.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{targetIncident.peopleAffected} Affected</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Reported: {new Date(targetIncident.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Decision Footer */}
        <div className="p-5 bg-white dark:bg-sentinel-darkSurface border-t border-slate-200 dark:border-sentinel-darkBorder flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            ⚠️ Marking as duplicate will link this report to the primary incident and resolve it to prevent double dispatch.
          </p>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => {
                onDismissWarning(targetIncident.id);
                onClose();
              }}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              Dismiss (Keep Separate)
            </button>

            <button
              onClick={() => {
                const origId = originalIncident?.id || warning?.suspectId || '';
                onConfirmDuplicate(targetIncident.id, origId);
                onClose();
              }}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/30 transition-all flex items-center justify-center gap-2"
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
