import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Incident } from '../../types';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { CategoryBadge } from '../../components/common/CategoryBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Copy,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
} from 'lucide-react';

interface AdminContextType {
  incidents: Incident[];
  onOpenIncident: (incident: Incident) => void;
  onOpenDuplicate: (incident: Incident) => void;
  onSimulate: () => void;
  onReset: () => void;
}

export const DuplicatesPage: React.FC = () => {
  const { incidents, onOpenDuplicate, onOpenIncident } = useOutletContext<AdminContextType>();

  const duplicateIncidents = incidents.filter(i => Boolean(i.duplicateWarning));
  const activeDuplicateAlerts = duplicateIncidents.filter(i => i.status !== 'Resolved');
  const resolvedDuplicates = incidents.filter(i => Boolean(i.duplicateOf));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Duplicate Guard & Cross-Report Analyzer
            </h1>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold">
              AI ENGINE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Correlates incoming citizen reports by geospatial proximity, textual semantics, and reporting time windows to prevent duplicate dispatch.
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
          <p className="font-bold text-slate-900 dark:text-white">
            Decision Support Policy: Human Commander in the Loop
          </p>
          <p>
            Sentinel 360 detects duplicate signals across 4 dimensions: Category match, Haversine geospatial proximity (&lt;1.5km), Jaccard description token overlap, and temporal proximity (&lt;8 hours). In accordance with disaster response protocols, reports are never deleted automatically. Commanders inspect side-by-side evidence before confirming or dismissing.
          </p>
        </div>
      </div>

      {/* Active Alerts Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Pending Duplicate Reviews</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 text-xs font-mono font-bold">
              {activeDuplicateAlerts.length}
            </span>
          </h2>
        </div>

        {activeDuplicateAlerts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-sentinel-darkCard border border-slate-200 dark:border-sentinel-darkBorder space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              No Pending Duplicate Warnings
            </h3>
            <p className="text-xs text-slate-500">
              All reported emergencies are uniquely identified and routed to independent dispatch pipelines.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeDuplicateAlerts.map(inc => {
              const warning = inc.duplicateWarning!;
              return (
                <div
                  key={inc.id}
                  className="bg-white dark:bg-sentinel-darkCard p-5 rounded-2xl border-2 border-amber-500/40 dark:border-amber-500/30 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                          {inc.incidentCode}
                        </span>
                        <CategoryBadge category={inc.category} size="sm" />
                      </div>
                      <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        {warning.similarityScore}% Match Confidence
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {inc.title}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {inc.description}
                    </p>

                    <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 text-xs space-y-1.5">
                      <div className="font-semibold text-amber-900 dark:text-amber-300">
                        Suspected Duplicate of: <span className="font-mono">{warning.suspectCode}</span>
                      </div>
                      <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5">
                        {warning.reasons.map((r, idx) => (
                          <li key={idx}>• {r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">
                      Reported: {new Date(inc.createdAt).toLocaleTimeString()}
                    </span>
                    <button
                      onClick={() => onOpenDuplicate(inc)}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
                    >
                      <span>Side-by-Side Inspector</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resolved Duplicates Section */}
      {resolvedDuplicates.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Linked & Closed Duplicates</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-mono font-bold">
              {resolvedDuplicates.length}
            </span>
          </h2>

          <div className="bg-white dark:bg-sentinel-darkCard rounded-2xl border border-slate-200 dark:border-sentinel-darkBorder divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
            {resolvedDuplicates.map(inc => (
              <div
                key={inc.id}
                onClick={() => onOpenIncident(inc)}
                className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                      {inc.incidentCode}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-medium">
                      Merged into Primary Incident
                    </span>
                  </div>
                  <h5 className="text-xs font-semibold text-slate-900 dark:text-white">{inc.title}</h5>
                </div>
                <StatusBadge status={inc.status} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
