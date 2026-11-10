import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Incident } from '../../types';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { CategoryBadge } from '../../components/common/CategoryBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { soundEffects } from '../../utils/soundEffects';
import {
  Copy,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  Cpu,
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
  const { incidents, onOpenDuplicate, onOpenIncident } = useOutletContext<AdminContextType>();

  const duplicateIncidents = incidents.filter(i => Boolean(i.duplicateWarning));
  const activeDuplicateAlerts = duplicateIncidents.filter(i => i.status !== 'Resolved');
  const resolvedDuplicates = incidents.filter(i => Boolean(i.duplicateOf));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto selection:bg-sentinel-cyan/30 selection:text-sentinel-cyan">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Duplicate Guard & Cross-Report Analyzer
            </h1>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              AI SPECTRAL ENGINE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Multidimensional correlation correlating citizen reports by geospatial proximity, NLP semantic tokens, and time decay to prevent double dispatch.
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-2xl glass-panel border border-amber-500/30 flex items-start gap-3 bg-gradient-to-r from-amber-950/20 to-transparent">
        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
        </div>
        <div className="text-xs text-slate-300 space-y-1">
          <p className="font-bold text-white flex items-center gap-2">
            <span>Decision Support Policy: Human Commander in the Loop</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400">
              FAIL-SAFE ACTIVE
            </span>
          </p>
          <p className="text-slate-400 leading-relaxed">
            SentriX inspects reports across 4 dimensions: Category exact match, Haversine spatial radius (&lt;1.5km), Jaccard text token overlap, and temporal clustering (&lt;8h). Reports are never dropped silently. Authorized command operators inspect side-by-side evidence before confirming or rejecting duplicates.
          </p>
        </div>
      </div>

      {/* Active Alerts Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2 font-mono">
            <span>PENDING DUPLICATE REVIEWS</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-mono font-bold border border-amber-500/30">
              {activeDuplicateAlerts.length} QUEUED
            </span>
          </h2>
        </div>

        {activeDuplicateAlerts.length === 0 ? (
          <div className="p-12 text-center rounded-3xl glass-panel border border-sentinel-darkBorder space-y-3">
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
                  className="glass-panel p-5 rounded-2xl border-2 border-amber-500/40 shadow-xl space-y-4 flex flex-col justify-between hover:border-amber-400 transition-colors group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                          {inc.incidentCode}
                        </span>
                        <CategoryBadge category={inc.category} size="sm" />
                      </div>
                      <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-xs">
                        {warning.similarityScore}% Match Confidence
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                      {inc.title}
                    </h4>

                    <p className="text-xs text-slate-400 line-clamp-2">
                      {inc.description}
                    </p>

                    <div className="p-3 rounded-xl bg-sentinel-darkSurface/80 border border-amber-500/20 text-xs space-y-1.5">
                      <div className="font-bold text-amber-300 flex items-center justify-between">
                        <span>Suspected Duplicate of Primary:</span>
                        <span className="font-mono text-sentinel-cyan">{warning.suspectCode}</span>
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

                  <div className="pt-3 border-t border-sentinel-darkBorder/60 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      Reported: {new Date(inc.createdAt).toLocaleTimeString()}
                    </span>
                    <button
                      onClick={() => {
                        soundEffects.playBeep();
                        onOpenDuplicate(inc);
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-600/20 transition-all active:scale-95"
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
          <h2 className="text-base font-bold text-white flex items-center gap-2 font-mono">
            <span>LINKED & MERGED HISTORICAL DUPLICATES</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-mono font-bold border border-slate-700">
              {resolvedDuplicates.length} CLOSED
            </span>
          </h2>

          <div className="glass-panel rounded-2xl border border-sentinel-darkBorder divide-y divide-sentinel-darkBorder/60 overflow-hidden">
            {resolvedDuplicates.map(inc => (
              <div
                key={inc.id}
                onClick={() => {
                  soundEffects.playClick();
                  onOpenIncident(inc);
                }}
                className="p-4 flex items-center justify-between hover:bg-slate-800/40 cursor-pointer transition-colors group"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-300">
                      {inc.incidentCode}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium flex items-center gap-1">
                      <GitMerge className="w-3 h-3 text-emerald-400" />
                      Merged into Primary Incident
                    </span>
                  </div>
                  <h5 className="text-xs font-semibold text-white group-hover:text-sentinel-cyan transition-colors">{inc.title}</h5>
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
