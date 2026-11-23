import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Incident } from '../../types';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { CategoryBadge } from '../../components/common/CategoryBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { soundEffects } from '../../utils/soundEffects';
import { useLanguage } from '../../context/LanguageContext';
import {
  Copy,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  Layers,
  Sparkles,
  GitMerge,
} from 'lucide-react';

interface AdminContextType {
  incidents: Incident[];
  onOpenIncident: (incident: Incident) => void;
  onOpenDuplicate: (incident: Incident) => void;
  onSimulate: () => void;
  onReset: () => void;
}

export const DuplicatesPage: React.FC = () => {
  const { t } = useLanguage();
  const { incidents, onOpenDuplicate, onOpenIncident } = useOutletContext<AdminContextType>();

  const duplicateIncidents = incidents.filter(i => Boolean(i.duplicateWarning));
  const activeDuplicateAlerts = duplicateIncidents.filter(i => i.status !== 'Resolved');
  const resolvedDuplicates = incidents.filter(i => Boolean(i.duplicateOf));

  return (
    <div className="ops-page">
      {/* Header */}
      <div className="ops-page-heading">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="ops-heading-title">
              {t('admin.nav.duplicates', 'Duplicate Guard')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Compare potentially related reports before confirming a duplicate.
          </p>
        </div>
      </div>

      <details className="ops-panel p-4 text-sm text-slate-300">
        <summary className="cursor-pointer font-semibold text-white">How reports are matched</summary>
        <p className="mt-2 leading-relaxed">Matches consider incident category, distance, overlapping keywords, and report timing. Open a flagged pair to review the evidence before deciding.</p>
      </details>

      {/* Active Alerts Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2 font-mono">
            <span>Pending reviews</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-mono font-bold border border-amber-500/30">
              {activeDuplicateAlerts.length}
            </span>
          </h2>
        </div>

        {activeDuplicateAlerts.length === 0 ? (
          <div className="p-12 text-center ops-panel space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-base text-white">
              Zero Suspected Duplicate Collisions
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              All reported emergencies are uniquely identified and routed to independent dispatch pipelines without operational overlap.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeDuplicateAlerts.map(inc => {
              const warning = inc.duplicateWarning!;
              return (
                <div
                  key={inc.id}
                  className="bg-[#0A101D] p-5 rounded-2xl border border-amber-500/40 shadow-xl space-y-4 flex flex-col justify-between hover:border-amber-400 transition-colors group relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                          {inc.incidentCode}
                        </span>
                        <CategoryBadge category={inc.category} size="sm" />
                      </div>
                      <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {warning.similarityScore}% Match Confidence
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                      {inc.title}
                    </h4>

                    <p className="text-xs text-slate-400 line-clamp-2">
                      {inc.description}
                    </p>

                    <div className="p-3 rounded-xl bg-[#060B14] border border-amber-500/20 text-xs space-y-1.5">
                      <div className="font-bold text-amber-300 flex items-center justify-between">
                        <span>Suspected Duplicate of Primary:</span>
                        <span className="font-mono text-cyan-400">{warning.suspectCode}</span>
                      </div>
                      <ul className="text-[11px] text-slate-300 space-y-1 pt-1">
                        {warning.reasons.map((r, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      Reported: {new Date(inc.createdAt).toLocaleTimeString()}
                    </span>
                    <button
                      onClick={() => {
                        soundEffects.playBeep();
                        onOpenDuplicate(inc);
                      }}
                      className="w-full sm:w-auto justify-center px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-600/20 transition-all active:scale-95"
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

      {/* Resolved Duplicate Archive */}
      {resolvedDuplicates.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 font-mono">
            <GitMerge className="w-4 h-4 text-emerald-400" />
            <span>CONFIRMED DUPLICATES ARCHIVE</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
              {resolvedDuplicates.length} CLOSED
            </span>
          </h2>

          <div className="ops-panel divide-y divide-white/5 overflow-hidden">
            {resolvedDuplicates.map(inc => (
              <div
                key={inc.id}
                onClick={() => onOpenIncident(inc)}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.03] cursor-pointer transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400 line-through">
                      {inc.incidentCode}
                    </span>
                    <CategoryBadge category={inc.category} size="sm" />
                    <StatusBadge status="Resolved" size="sm" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">{inc.title}</h4>
                  <p className="text-xs text-slate-400">
                    Linked as duplicate of primary incident <strong className="text-cyan-400 font-mono">#{inc.duplicateOf}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
