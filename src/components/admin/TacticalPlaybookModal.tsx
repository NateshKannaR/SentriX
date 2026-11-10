import React from 'react';
import {
  FileText,
  X,
  Printer,
  ShieldAlert,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Flame,
  Hospital,
  Radio,
} from 'lucide-react';
import { Incident } from '../../types';
import { soundFx } from '../../utils/soundEffects';
import { useLanguage } from '../../context/LanguageContext';
import { SeverityBadge } from '../common/SeverityBadge';

interface TacticalPlaybookModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident?: Incident | null;
}

export const TacticalPlaybookModal: React.FC<TacticalPlaybookModalProps> = ({
  isOpen,
  onClose,
  incident,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const currentInc = incident || {
    id: 'demo-crisis',
    incidentCode: 'STX-2026-PLAYBOOK',
    title: 'High-Density Structural Hazard & Multiple Entrapments',
    category: 'Building Collapse',
    severity: 'Critical',
    priorityScore: 94,
    status: 'In Progress',
    location: 'Sector 4 Metro Infrastructure Corridor',
    lat: 12.9716,
    lng: 77.5946,
    peopleAffected: 9,
    description: 'Structural failure on lower support pillars with active gas leak risk and entrapped civilian victims.',
    reportedAt: new Date().toISOString(),
    assignedUnit: 'Battalion 4 Heavy USAR',
    severityReasoning: [
      'Entrapment risk detected',
      'High casualties > 5',
      'Secondary explosion vulnerability',
    ],
  };

  const getSopSteps = (category: string) => {
    switch (category) {
      case 'Fire Emergency':
        return {
          phase1: [
            'Establish 200m hot-zone cordon and isolate central industrial gas mains.',
            'Deploy Aerial Ladder Platforms (ALP-50) for immediate upper-floor balcony extractions.',
            'Connect dual 10-bar hydrants to pressurized district emergency water reservoirs.',
          ],
          phase2: [
            'Deploy thermal infrared drones (FLIR) to map thermal flashover hotspots.',
            'Commit breathing-apparatus search pairs to primary egress stairwells.',
            'Erect Rapid Decontamination & Smoke Inhalation Treatment Canopy at command post.',
          ],
          phase3: [
            'Activate green-light trauma ambulance corridors to nearest Level-1 Burn Center.',
            'Broadcast localized Civil Defense evacuation SMS to citizens within 500m downwind.',
            'Document structural thermal imagery for official forensic fire audit.',
          ],
        };
      case 'Building Collapse':
        return {
          phase1: [
            'Immediately silence heavy machinery to enable acoustic life-detector listening probes.',
            'Isolate regional power grids and natural gas pipelines within 300m radius.',
            'Establish secondary collapse monitoring laser prisms on structural perimeter.',
          ],
          phase2: [
            'Deploy Urban Search and Rescue (USAR) K-9 search teams through cleared void spaces.',
            'Install hydraulic telescopic shoring struts to secure rescue access tunnels.',
            'Deploy fiber-optic search cameras with two-way voice comms into rubble voids.',
          ],
          phase3: [
            'Coordinate Level-1 Trauma surgeon mobilization for on-site confined-space triage.',
            'Establish civilian reunification muster desk at designated community shelter.',
            'Transition from rescue to structural demolition under civil engineer supervision.',
          ],
        };
      default:
        return {
          phase1: [
            'Secure incident boundary with dynamic traffic diversions and perimeter tape.',
            'Perform immediate 360-degree hazard survey (HAZMAT, fuel, downed power lines).',
            'Establish Incident Command Post (ICP) upwind and uphill from emergency core.',
          ],
          phase2: [
            'Initiate START triage (Simple Triage and Rapid Treatment) for all affected casualties.',
            'Dispatch specialized responder units with direct encrypted radio channel lock.',
            'Continuously synchronize spatial casualty updates with central SentriX radar.',
          ],
          phase3: [
            'Initiate rapid casualty transport to regional hospitals via priority corridors.',
            'Conduct secondary sweep to verify zero unaccounted civilian victims.',
            'Log verified incident timeline into immutable MongoDB audit database.',
          ],
        };
    }
  };

  const sop = getSopSteps(currentInc.category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-3xl bg-[#070D18] border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#0A1324] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                {t('playbook.title', 'AI Incident Tactical Action Playbook (SOP)')}
              </span>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{currentInc.incidentCode} — {currentInc.category}</span>
                <SeverityBadge severity={currentInc.severity as any} size="sm" />
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              title="Print Briefing"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto text-xs text-slate-300 font-sans">
          {/* Situation Brief Summary */}
          <div className="p-4 rounded-2xl bg-[#0A1324] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase font-bold text-cyan-400">
                Operational Situation Brief
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                Priority Score: <strong className="text-red-400 font-bold">{currentInc.priorityScore}/100</strong>
              </span>
            </div>
            <p className="text-sm font-bold text-white">{currentInc.title}</p>
            <p className="text-xs text-slate-300 leading-relaxed">{currentInc.description}</p>
            <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400 border-t border-white/10">
              <span>📍 {currentInc.location}</span>
              <span>👥 {currentInc.peopleAffected} Casualties at Risk</span>
              <span>🚒 Assigned: {currentInc.assignedUnit || 'Battalion Pending'}</span>
            </div>
          </div>

          {/* SOP Phase 1 */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 font-mono font-bold text-xs flex items-center justify-center">
                01
              </span>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono">
                {t('playbook.immediatePhase', 'Phase 1: Immediate Containment (0 - 15 Mins)')}
              </h4>
            </div>
            <div className="space-y-2 pl-8">
              {sop.phase1.map((step, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 text-slate-200 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SOP Phase 2 */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center">
                02
              </span>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono">
                {t('playbook.searchPhase', 'Phase 2: Tactical Search & Rescue (15 - 45 Mins)')}
              </h4>
            </div>
            <div className="space-y-2 pl-8">
              {sop.phase2.map((step, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-slate-200 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SOP Phase 3 */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">
                03
              </span>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono">
                {t('playbook.stabilizationPhase', 'Phase 3: Scene Stabilization & Hospital Corridors (45+ Mins)')}
              </h4>
            </div>
            <div className="space-y-2 pl-8">
              {sop.phase3.map((step, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-slate-200 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#0A1324] border-t border-white/10 flex items-center justify-between">
          <span className="font-mono text-[10px] text-slate-400">
            CONFIDENTIAL // SENTRIX COMMAND HEADQUARTERS
          </span>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
