import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { EmergencyAlertDrawer } from './EmergencyAlertDrawer';
import { IncidentDetailsModal } from './IncidentDetailsModal';
import { DuplicateComparisonModal } from './DuplicateComparisonModal';
import { VoiceAssistantModal } from '../common/VoiceAssistantModal';
import { AutonomousDroneModal } from './AutonomousDroneModal';
import { TacticalPlaybookModal } from './TacticalPlaybookModal';
import { HospitalResourceDrawer } from './HospitalResourceDrawer';
import './operations.css';
import { incidentService } from '../../services/incidentService';
import { Incident } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { soundEffects } from '../../utils/soundEffects';
import { SupportedLanguage } from '../../utils/translations';
import {
  Bell,
  Search,
  Sun,
  Moon,
  Zap,
  Menu,
  ShieldAlert,
  LogOut,
  Volume2,
  VolumeX,
  Settings2,
  RotateCcw,
  ChevronDown,
  Mic,
  Globe,
  Plane,
  FileText,
  Hospital,
  Flame,
  X,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { logout, theme, toggleTheme } = useAuth();
  const { language, setLanguage, languages } = useLanguage();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const searchRef = useRef<HTMLInputElement>(null);
  const toolsRef = useRef<HTMLDetailsElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const mobileDialogRef = useRef<HTMLDialogElement>(null);
  const [searchParams] = useSearchParams();

  const [incidents, setIncidents] = useState<Incident[]>(() => incidentService.getIncidents());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Incident[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [isAlertDrawerOpen, setIsAlertDrawerOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [duplicateTarget, setDuplicateTarget] = useState<Incident | null>(null);
  const [duplicateOriginal, setDuplicateOriginal] = useState<Incident | null>(null);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [simulationToast, setSimulationToast] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(!soundEffects.isMuted());

  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);

  // Advanced Feature Modals State
  const [isDroneOpen, setIsDroneOpen] = useState(false);
  const [droneTargetIncident, setDroneTargetIncident] = useState<Incident | null>(null);
  const [isPlaybookOpen, setIsPlaybookOpen] = useState(false);
  const [playbookIncident, setPlaybookIncident] = useState<Incident | null>(null);
  const [isHospitalDrawerOpen, setIsHospitalDrawerOpen] = useState(false);

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const dialog = mobileDialogRef.current;
    if (mobileSidebarOpen && dialog && !dialog.open) dialog.showModal();
  }, [mobileSidebarOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === 'Escape' && toolsRef.current?.open) {
        toolsRef.current.open = false;
        toolsRef.current.querySelector('summary')?.focus();
      }
    };
    const closeToolsOutside = (event: PointerEvent) => {
      const tools = toolsRef.current;
      if (tools && event.target instanceof Node && !tools.contains(event.target)) tools.open = false;
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', closeToolsOutside);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', closeToolsOutside);
    };
  }, []);

  // Subscribe to incidentService changes
  useEffect(() => {
    const unsubscribe = incidentService.subscribe(() => {
      setIncidents(incidentService.getIncidents());
    });
    return () => unsubscribe();
  }, []);

  // Deep-link / open incident modal directly via query parameter
  useEffect(() => {
    const code = searchParams.get('openIncident');
    if (code && incidents.length > 0) {
      const target = incidents.find(i => i.incidentCode === code || i.id === code);
      if (target) {
        setSelectedIncident(target);
        setIsDetailsOpen(true);
      }
    }
  }, [searchParams, incidents]);

  const [liveBroadcastAlert, setLiveBroadcastAlert] = useState<{
    code: string;
    title: string;
    type: string;
    note?: string;
    incident: Incident;
  } | null>(null);

  // Real-time live cross-tab subscription
  useEffect(() => {
    const unsubEvents = incidentService.subscribeToLiveEvents(event => {
      soundEffects.playCriticalSiren();
      setLiveBroadcastAlert({
        code: event.incident?.incidentCode || 'EMERGENCY',
        title: event.incident?.title || 'Live Emergency Incident',
        type: event.type === 'CITIZEN_UPDATE' ? 'Citizen Live Update' : 'Incoming Live Incident',
        note: event.note,
        incident: event.incident,
      });
      setTimeout(() => setLiveBroadcastAlert(null), 9000);
    });
    return () => unsubEvents();
  }, []);

  // Handle global search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }
    const q = searchQuery.toLowerCase();
    const matches = incidents.filter(
      i =>
        i.incidentCode.toLowerCase().includes(q) ||
        i.title.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
    );
    setSearchResults(matches);
    setIsSearchOpen(true);
  }, [searchQuery, incidents]);

  const handleSimulate = () => {
    soundEffects.playCriticalSiren();
    const simulated = incidentService.simulateEmergency();
    setSimulationToast(`Demo incident added · ${simulated.incidentCode} (${simulated.category})`);
    setTimeout(() => setSimulationToast(null), 5000);
  };

  const handleSimulateFire = () => {
    soundEffects.playCriticalSiren();
    const result = incidentService.simulateCriticalBuildingFire();
    setSimulationToast(`Demo fire added · ${result.incident.incidentCode} · Suggested team: ${result.recommendedTeamName}`);
    setTimeout(() => setSimulationToast(null), 8000);
    handleOpenIncident(result.incident);
  };

  const handleReset = () => {
    soundEffects.playClick();
    if (window.confirm('Reset all demo incidents and logs to default seed dataset?')) {
      incidentService.resetDemoData();
      setSimulationToast('🔄 Platform restored to default seed state.');
      setTimeout(() => setSimulationToast(null), 3000);
    }
  };

  const handleAudioToggle = () => {
    const muted = soundEffects.toggleMute();
    setAudioEnabled(!muted);
    if (!muted) soundEffects.playBeep();
  };

  const handleOpenIncident = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsDetailsOpen(true);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleOpenDuplicate = (incident: Incident) => {
    setDuplicateTarget(incident);
    if (incident.duplicateWarning) {
      const orig = incidentService.getIncidentById(incident.duplicateWarning.suspectId);
      setDuplicateOriginal(orig || null);
    } else {
      setDuplicateOriginal(null);
    }
    setIsDuplicateModalOpen(true);
  };

  const handleConfirmDuplicate = (targetId: string, originalId: string) => {
    incidentService.confirmDuplicate(targetId, originalId);
    setIncidents(incidentService.getIncidents());
    soundEffects.playClick();
  };

  const handleDismissDuplicate = (id: string) => {
    incidentService.dismissDuplicateWarning(id);
    setIncidents(incidentService.getIncidents());
    soundEffects.playClick();
  };

  const criticalCount = incidents.filter(i => i.severity === 'Critical' && i.status !== 'Resolved').length;
  const duplicateCount = incidents.filter(i => Boolean(i.duplicateWarning) && i.status !== 'Resolved').length;
  const totalAlerts = criticalCount + duplicateCount;

  const runTool = (action: () => void) => {
    if (toolsRef.current) toolsRef.current.open = false;
    action();
  };

  const tools = [
    { label: 'Voice assistant', icon: Mic, action: () => setIsVoiceAssistantOpen(true) },
    { label: 'Drone simulation', icon: Plane, action: () => { setDroneTargetIncident(incidents[0] ?? null); setIsDroneOpen(true); } },
    { label: 'Response playbook', icon: FileText, action: () => { setPlaybookIncident(incidents[0] ?? null); setIsPlaybookOpen(true); } },
    { label: 'Hospital bed availability', icon: Hospital, action: () => setIsHospitalDrawerOpen(true) },
    { label: audioEnabled ? 'Mute audio' : 'Enable audio', icon: audioEnabled ? Volume2 : VolumeX, action: handleAudioToggle },
    { label: theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme', icon: theme === 'dark' ? Sun : Moon, action: toggleTheme },
  ];

  return (
    <div className="ops-shell flex h-[100dvh] overflow-hidden text-slate-100">
      <div className="hidden h-full w-56 shrink-0 lg:block"><AdminSidebar incidents={incidents} /></div>
      {mobileSidebarOpen && (
        <dialog
          ref={mobileDialogRef}
          aria-label="Command center navigation"
          className="ops-mobile-nav fixed inset-y-0 left-0 right-auto m-0 h-[100dvh] max-h-none w-64 max-w-[85vw] p-0"
          onClose={() => setMobileSidebarOpen(false)}
          onClick={event => {
            if (event.target === event.currentTarget) setMobileSidebarOpen(false);
          }}
        >
          <AdminSidebar incidents={incidents} onNavigate={() => setMobileSidebarOpen(false)} onClose={() => setMobileSidebarOpen(false)} />
        </dialog>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="ops-toolbar relative z-20 flex h-16 shrink-0 items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6">
          <button type="button" className="ops-icon ops-nav-toggle shrink-0" onClick={() => setMobileSidebarOpen(true)} aria-label="Open navigation" aria-expanded={mobileSidebarOpen}><Menu size={19} /></button>
          <div className="relative min-w-0 flex-1 md:max-w-md">
            <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchRef}
              type="search"
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              onKeyDown={event => { if (event.key === 'Escape') setSearchQuery(''); }}
              aria-label="Search incidents"
              aria-keyshortcuts="Control+K Meta+K"
              placeholder="Search incidents"
              className="ops-search w-full rounded-lg border border-white/10 py-2 pl-9 pr-2 text-sm placeholder:text-slate-400 sm:pr-16"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 text-[11px] text-slate-400 sm:block">Ctrl/⌘ K</kbd>
            {isSearchOpen && (
              <div className="ops-panel absolute inset-x-0 top-full mt-2 max-h-72 overflow-auto shadow-xl">
                {searchResults.length ? searchResults.map(incident => (
                  <button type="button" key={incident.id} onClick={() => handleOpenIncident(incident)} className="block w-full border-b border-white/10 p-3 text-left hover:bg-white/5">
                    <span className="block text-xs text-cyan-200">{incident.incidentCode} · {incident.severity}</span>
                    <span className="block break-words text-sm font-semibold text-white">{incident.title}</span>
                    <span className="block break-words text-xs text-slate-400">{incident.location}</span>
                  </button>
                )) : <p className="p-3 text-sm text-slate-400">No matching incidents.</p>}
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={() => setIsAlertDrawerOpen(true)} className="ops-icon relative" aria-label={`View emergency alerts (${totalAlerts})`}>
              <Bell size={18} />
              {totalAlerts > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-rose-400 px-1 text-[10px] font-semibold tabular-nums text-slate-950">{totalAlerts}</span>}
            </button>
            <details ref={toolsRef} className="relative">
              <summary className="ops-action cursor-pointer list-none marker:content-none" aria-label="Workspace tools"><Settings2 size={17} /><span className="hidden sm:inline">Tools</span><ChevronDown size={14} className="hidden sm:block" /></summary>
              <div className="ops-panel absolute right-0 top-full mt-2 max-h-[calc(100dvh-5rem)] w-64 max-w-[calc(100vw-1rem)] overflow-auto p-2 shadow-xl">
                {tools.map(({ label, icon: Icon, action }) => (
                  <button type="button" key={label} className="ops-menu-item" onClick={() => runTool(action)}><Icon size={16} />{label}</button>
                ))}
                <label className="ops-menu-item">
                  <Globe size={16} />
                  <span>Language</span>
                  <select aria-label="Workspace language" value={language} onChange={event => setLanguage(event.target.value as SupportedLanguage)} className="ml-auto min-w-0 max-w-24 rounded bg-[#152131] p-1 text-xs">
                    {languages.map(item => <option key={item.code} value={item.code}>{item.name}</option>)}
                  </select>
                </label>
                <div className="my-1 border-t border-white/10" />
                <button type="button" className="ops-menu-item" onClick={() => runTool(handleSimulate)}><Zap size={16} /> Simulate incident</button>
                <button type="button" className="ops-menu-item" onClick={() => runTool(handleSimulateFire)}><Flame size={16} /> Simulate critical fire</button>
                <button type="button" className="ops-menu-item" onClick={() => runTool(handleReset)}><RotateCcw size={16} /> Reset demo data</button>
                <div className="my-1 border-t border-white/10" />
                <button type="button" className="ops-menu-item" onClick={() => runTool(() => { logout(); navigate('/login'); })}><LogOut size={16} /> Sign out</button>
              </div>
            </details>
          </div>
        </header>

        {/* Live Simulation Alert Bar */}
        {simulationToast && (
          <div role="status" className="flex shrink-0 items-center justify-between gap-3 border-b border-amber-500/30 bg-amber-950/40 px-4 py-2 text-sm text-amber-100">
            <span className="flex min-w-0 items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-300" />
              {simulationToast}
            </span>
            <button
              onClick={() => setSimulationToast(null)}
              aria-label="Dismiss simulation notification"
              className="text-white/80 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Real-time Incoming Live Alert Toast from Citizen Transmissions */}
        {liveBroadcastAlert && (
          <div className="ops-panel fixed right-3 top-20 z-50 w-[calc(100%-1.5rem)] max-w-md p-4 shadow-xl sm:right-6">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-400/15 text-rose-300">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-400 bg-red-500/20 px-2 py-0.5 rounded border border-red-500/30">
                    {liveBroadcastAlert.type}
                  </span>
                </div>
                <h4 className="mt-1 break-words text-sm font-semibold text-white">
                  {liveBroadcastAlert.code}: {liveBroadcastAlert.title}
                </h4>
                {liveBroadcastAlert.note && (
                  <p className="text-xs text-amber-300 font-mono mt-1 bg-black/40 p-2 rounded-xl border border-white/5">
                    "{liveBroadcastAlert.note}"
                  </p>
                )}
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    onClick={() => {
                      handleOpenIncident(liveBroadcastAlert.incident);
                      setLiveBroadcastAlert(null);
                    }}
                    className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs font-mono transition-colors shadow-md"
                  >
                    Inspect Incident
                  </button>
                  <button
                    onClick={() => setLiveBroadcastAlert(null)}
                    className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-400 hover:text-white text-xs font-mono transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
              <button
                onClick={() => setLiveBroadcastAlert(null)}
                aria-label="Close incident notification"
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Router Outlet Viewport */}
        <main ref={mainRef} className="ops-main min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <Suspense fallback={<div role="status" className="p-6 text-sm text-slate-300">Loading workspace…</div>}>
            <Outlet
              context={{
                incidents,
                onOpenIncident: handleOpenIncident,
                onOpenDuplicate: handleOpenDuplicate,
                onSimulate: handleSimulate,
                onSimulateFire: handleSimulateFire,
                onReset: handleReset,
                onOpenDrone: (inc?: Incident) => {
                  setDroneTargetIncident(inc || incidents[0] || null);
                  setIsDroneOpen(true);
                },
                onOpenPlaybook: (inc?: Incident) => {
                  setPlaybookIncident(inc || incidents[0] || null);
                  setIsPlaybookOpen(true);
                },
              }}
            />
          </Suspense>
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <EmergencyAlertDrawer
        isOpen={isAlertDrawerOpen}
        onClose={() => setIsAlertDrawerOpen(false)}
        incidents={incidents}
        onSelectIncident={handleOpenIncident}
        onInspectDuplicate={handleOpenDuplicate}
      />

      <IncidentDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        incident={selectedIncident}
        onIncidentUpdated={() => setIncidents(incidentService.getIncidents())}
        onOpenDuplicate={handleOpenDuplicate}
      />

      <DuplicateComparisonModal
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        targetIncident={duplicateTarget}
        originalIncident={duplicateOriginal}
        onConfirmDuplicate={handleConfirmDuplicate}
        onDismissWarning={handleDismissDuplicate}
      />

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceAssistantOpen}
        onClose={() => setIsVoiceAssistantOpen(false)}
        onSimulate={handleSimulate}
        navigate={navigate}
      />

      {/* Autonomous Drone Reconnaissance Modal */}
      <AutonomousDroneModal
        isOpen={isDroneOpen}
        onClose={() => setIsDroneOpen(false)}
        targetIncident={droneTargetIncident}
      />

      {/* Tactical Incident Action Playbook Modal */}
      <TacticalPlaybookModal
        isOpen={isPlaybookOpen}
        onClose={() => setIsPlaybookOpen(false)}
        incident={playbookIncident}
      />

      {/* Regional Trauma Hospital & Bed Allocator Drawer */}
      <HospitalResourceDrawer
        isOpen={isHospitalDrawerOpen}
        onClose={() => setIsHospitalDrawerOpen(false)}
      />
    </div>
  );
};
