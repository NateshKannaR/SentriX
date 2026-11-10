import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { EmergencyAlertDrawer } from './EmergencyAlertDrawer';
import { IncidentDetailsModal } from './IncidentDetailsModal';
import { DuplicateComparisonModal } from './DuplicateComparisonModal';
import { VoiceAssistantModal } from '../common/VoiceAssistantModal';
import { AutonomousDroneModal } from './AutonomousDroneModal';
import { TacticalPlaybookModal } from './TacticalPlaybookModal';
import { HospitalResourceDrawer } from './HospitalResourceDrawer';
import { CivilDefenseBanner } from '../common/CivilDefenseBanner';
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
  Clock,
  Mic,
  Globe,
  Plane,
  FileText,
  Hospital,
  X,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { session, logout, theme, toggleTheme } = useAuth();
  const { language, setLanguage, currentLanguageOption, languages, t } = useLanguage();
  const navigate = useNavigate();

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
  const [currentUtc, setCurrentUtc] = useState(new Date().toUTCString().slice(17, 25));

  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  // Advanced Feature Modals State
  const [isDroneOpen, setIsDroneOpen] = useState(false);
  const [droneTargetIncident, setDroneTargetIncident] = useState<Incident | null>(null);
  const [isPlaybookOpen, setIsPlaybookOpen] = useState(false);
  const [playbookIncident, setPlaybookIncident] = useState<Incident | null>(null);
  const [isHospitalDrawerOpen, setIsHospitalDrawerOpen] = useState(false);

  // Live Clock Ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentUtc(new Date().toUTCString().slice(17, 25));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Subscribe to incidentService changes
  useEffect(() => {
    const unsubscribe = incidentService.subscribe(() => {
      setIncidents(incidentService.getIncidents());
    });
    return () => unsubscribe();
  }, []);

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
    setSimulationToast(`🚨 ${simulated.incidentCode} (${simulated.category})`);
    setTimeout(() => setSimulationToast(null), 5000);
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

  return (
    <div className="flex h-screen bg-[#060B14] text-slate-100 overflow-hidden font-sans">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block shrink-0 h-full">
        <AdminSidebar
          incidents={incidents}
          onSimulate={handleSimulate}
          onReset={handleReset}
          onOpenDrone={() => {
            setDroneTargetIncident(incidents[0] || null);
            setIsDroneOpen(true);
          }}
          onOpenPlaybook={() => {
            setPlaybookIncident(incidents[0] || null);
            setIsPlaybookOpen(true);
          }}
          onOpenHospitals={() => setIsHospitalDrawerOpen(true)}
        />
      </div>

      {/* Mobile Slide-Over Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fadeIn"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl animate-slideRight">
            <AdminSidebar
              incidents={incidents}
              onSimulate={handleSimulate}
              onReset={handleReset}
              onNavigate={() => setMobileSidebarOpen(false)}
              onClose={() => setMobileSidebarOpen(false)}
              onOpenDrone={() => {
                setDroneTargetIncident(incidents[0] || null);
                setIsDroneOpen(true);
              }}
              onOpenPlaybook={() => {
                setPlaybookIncident(incidents[0] || null);
                setIsPlaybookOpen(true);
              }}
              onOpenHospitals={() => setIsHospitalDrawerOpen(true)}
            />
          </div>
        </div>
      )}

      {/* Main Command Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Civil Defense Emergency Marquee Banner */}
        <CivilDefenseBanner />

        {/* Top Tactical Command HUD Bar */}
        <header className="h-16 bg-[#080E1A]/95 border-b border-white/[0.08] flex items-center justify-between px-3 sm:px-6 shrink-0 z-20 backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 min-w-[38px] min-h-[38px] flex items-center justify-center"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search */}
            <div className="relative w-36 xs:w-48 sm:w-64 md:w-80">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t('admin.header.search', 'Search code, title, location...')}
                  className="w-full text-xs rounded-xl bg-[#060B14] border border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 pl-9 pr-3 py-2 text-white placeholder-slate-400 focus:outline-none transition-all"
                />
              </div>

              {/* Search Autocomplete Dropdown */}
              {isSearchOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0A1120] border border-cyan-500/30 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto backdrop-blur-2xl">
                  {searchResults.length === 0 ? (
                    <div className="p-3 text-xs text-slate-400 text-center">
                      No incidents match &quot;{searchQuery}&quot;
                    </div>
                  ) : (
                    searchResults.map(inc => (
                      <div
                        key={inc.id}
                        onClick={() => handleOpenIncident(inc)}
                        className="p-3 hover:bg-white/10 cursor-pointer border-b border-white/5 flex items-center justify-between gap-2"
                      >
                        <div className="truncate">
                          <span className="font-mono text-xs font-bold text-cyan-400 mr-2">
                            {inc.incidentCode}
                          </span>
                          <span className="text-xs font-semibold text-white">
                            {inc.title}
                          </span>
                          <div className="text-[10px] text-slate-400 truncate">{inc.location}</div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-white/10 text-slate-300 shrink-0">
                          {inc.severity}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Live Clock Micro-Display */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#060B14] border border-white/10 text-xs font-mono text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>UTC {currentUtc}Z</span>
            </div>
          </div>

          {/* Right Header Tactical Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Tactical Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-200 flex items-center gap-1.5 transition-colors"
                title={t('admin.header.switchLanguage', 'Switch Language')}
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold">{currentLanguageOption.flag}</span>
                <span className="hidden md:inline">{currentLanguageOption.name}</span>
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#0A1120] border border-white/15 shadow-2xl py-1.5 z-50 animate-scaleUp">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as SupportedLanguage);
                        setIsLangDropdownOpen(false);
                        soundEffects.playClick();
                      }}
                      className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between hover:bg-white/10 transition-colors ${
                        language === lang.code ? 'text-cyan-400 font-bold bg-white/5' : 'text-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </span>
                      {language === lang.code && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Recon Drone UAV Trigger */}
            <button
              onClick={() => {
                soundEffects.playClick();
                setDroneTargetIncident(incidents[0] || null);
                setIsDroneOpen(true);
              }}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold transition-all"
              title="Autonomous Drone Reconnaissance"
            >
              <Plane className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>{t('admin.header.drone', 'Recon UAV')}</span>
            </button>

            {/* Quick Tactical SOP Playbook Trigger */}
            <button
              onClick={() => {
                soundEffects.playClick();
                setPlaybookIncident(incidents[0] || null);
                setIsPlaybookOpen(true);
              }}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold transition-all"
              title="AI Incident Action Playbook"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('admin.header.playbook', 'SOP Playbook')}</span>
            </button>

            {/* Trauma Bed Allocator Trigger */}
            <button
              onClick={() => {
                soundEffects.playClick();
                setIsHospitalDrawerOpen(true);
              }}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono font-bold transition-all"
              title="Hospital Bed Matrix"
            >
              <Hospital className="w-3.5 h-3.5 text-purple-400" />
              <span>{t('admin.header.hospitals', 'Beds Matrix')}</span>
            </button>

            {/* Voice Assistant Trigger */}
            <button
              onClick={() => setIsVoiceAssistantOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all active:scale-95"
              title="Launch AURA Voice Assistant"
            >
              <Mic className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="hidden sm:inline">{t('admin.header.voiceAi', 'Voice AI')}</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={handleAudioToggle}
              className={`p-2 rounded-xl border transition-all ${
                audioEnabled
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-sm'
                  : 'bg-white/5 text-slate-500 border-white/10 hover:text-slate-300'
              }`}
              title={audioEnabled ? 'Mute Audio HUD' : 'Enable Tactical Audio'}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Quick Simulate Trigger */}
            <button
              onClick={handleSimulate}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md shadow-red-600/30 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t('admin.header.simulate', 'Simulate Incident')}</span>
            </button>

            {/* Emergency Alert Bell Drawer */}
            <button
              onClick={() => {
                soundEffects.playClick();
                setIsAlertDrawerOpen(true);
              }}
              className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
              title="Emergency Alerts"
              aria-label="View emergency alerts"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {totalAlerts > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-mono font-black flex items-center justify-center px-1 shadow-md shadow-red-500/50 animate-pulse">
                  {totalAlerts}
                </span>
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => {
                soundEffects.playClick();
                toggleTheme();
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-400" />
              )}
            </button>

            <div className="h-6 w-px bg-white/10 hidden sm:block" />

            {/* Admin Profile */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-mono font-black text-xs">
                CMD
              </div>
              <div className="hidden xl:block text-left">
                <span className="block text-xs font-bold text-white leading-tight">
                  {t('admin.sidebar.commander', 'Chief Aditi Rao')}
                </span>
                <span className="block text-[10px] font-mono text-cyan-400 leading-tight">
                  DISPATCH-01
                </span>
              </div>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  logout();
                  navigate('/login');
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                title={t('admin.header.logout', 'End Session')}
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Live Simulation Alert Bar */}
        {simulationToast && (
          <div className="bg-red-950/90 backdrop-blur-md text-red-200 px-4 py-2 text-xs flex items-center justify-between border-b border-red-500/40 shadow-xl animate-slideDown">
            <span className="font-mono font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
              {simulationToast}
            </span>
            <button
              onClick={() => setSimulationToast(null)}
              className="text-white/80 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Real-time Incoming Live Alert Toast from Citizen Transmissions */}
        {liveBroadcastAlert && (
          <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-md w-full p-4 rounded-3xl bg-gradient-to-r from-red-950 via-[#0A101D] to-[#0A101D] border-2 border-red-500 shadow-2xl animate-slideDown glow-red select-none">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 animate-pulse shadow-lg shadow-red-600/40">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-400 bg-red-500/20 px-2 py-0.5 rounded border border-red-500/30">
                    {liveBroadcastAlert.type}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold animate-pulse">● LIVE TRANSMISSION</span>
                </div>
                <h4 className="text-xs sm:text-sm font-black text-white mt-1">
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
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Router Outlet Viewport */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#060B14]">
          <Outlet
            context={{
              incidents,
              onOpenIncident: handleOpenIncident,
              onOpenDuplicate: handleOpenDuplicate,
              onSimulate: handleSimulate,
              onReset: handleReset,
              onOpenDrone: (inc?: Incident) => {
                setDroneTargetIncident(inc || incidents[0] || null);
                setIsDroneOpen(true);
              },
              onOpenPlaybook: (inc?: Incident) => {
                setPlaybookIncident(inc || incidents[0] || null);
                setIsPlaybookOpen(true);
              },
              onOpenHospitals: () => setIsHospitalDrawerOpen(true),
            }}
          />
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
