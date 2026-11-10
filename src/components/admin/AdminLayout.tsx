import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { EmergencyAlertDrawer } from './EmergencyAlertDrawer';
import { IncidentDetailsModal } from './IncidentDetailsModal';
import { DuplicateComparisonModal } from './DuplicateComparisonModal';
import { VoiceAssistantModal } from '../common/VoiceAssistantModal';
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
  CheckCircle2,
  Volume2,
  VolumeX,
  Clock,
  Radio,
  Flame,
  Activity,
  Mic,
  Globe,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { session, logout, theme, toggleTheme } = useAuth();
  const { language, setLanguage, currentLanguageOption, languages } = useLanguage();
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
    setSimulationToast(`🚨 Simulated Emergency Injected: ${simulated.incidentCode} (${simulated.category})`);
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

  const handleDismissDuplicate = (targetId: string) => {
    incidentService.dismissDuplicateWarning(targetId);
    setIncidents(incidentService.getIncidents());
    soundEffects.playClick();
  };

  const criticalCount = incidents.filter(i => i.severity === 'Critical' && i.status !== 'Resolved').length;
  const duplicateCount = incidents.filter(i => Boolean(i.duplicateWarning) && i.status !== 'Resolved').length;
  const totalAlerts = criticalCount + duplicateCount;

  return (
    <div className="flex h-screen overflow-hidden bg-[#071426] text-slate-100 font-sans selection:bg-[#16C7E8]/30">
      {/* Desktop Tactical Sidebar */}
      <div className="hidden lg:block h-full">
        <AdminSidebar
          incidents={incidents}
          onSimulate={handleSimulate}
          onReset={handleReset}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-[85vw]">
            <AdminSidebar
              incidents={incidents}
              onNavigate={() => setMobileSidebarOpen(false)}
              onClose={() => setMobileSidebarOpen(false)}
              onSimulate={() => {
                handleSimulate();
                setMobileSidebarOpen(false);
              }}
              onReset={() => {
                handleReset();
                setMobileSidebarOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#071426]">
        {/* Civil Defense Emergency Marquee Banner */}
        <CivilDefenseBanner />

        {/* Top Tactical Command HUD Bar */}
        <header className="h-16 sm:h-18 bg-[#0B1E38]/95 border-b border-[#16C7E8]/20 flex items-center justify-between px-3 sm:px-6 shrink-0 z-20 backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 min-w-[38px] min-h-[38px] flex items-center justify-center"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search with Glow */}
            <div className="relative w-32 xs:w-44 sm:w-64 md:w-80">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search code, title..."
                  className="w-full text-xs rounded-xl bg-[#071426] border border-white/15 focus:border-sentinel-cyan focus:ring-1 focus:ring-sentinel-cyan pl-8 sm:pl-9 pr-2 sm:pr-3 py-1.5 sm:py-2 text-white placeholder-slate-500 focus:outline-none transition-all"
                />
              </div>

              {/* Search Autocomplete Dropdown */}
              {isSearchOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0B1E38] border border-[#16C7E8]/30 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto backdrop-blur-2xl">
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
                          <span className="font-mono text-xs font-bold text-sentinel-cyan mr-2">
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
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#071426] border border-white/10 text-xs font-mono text-slate-300">
              <Clock className="w-3.5 h-3.5 text-sentinel-cyan" />
              <span>UTC {currentUtc}Z</span>
            </div>
          </div>

          {/* Right Header Tactical Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Tactical Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-200 flex items-center gap-1.5 transition-colors"
                title="Switch Language"
              >
                <Globe className="w-3.5 h-3.5 text-sentinel-cyan" />
                <span className="font-bold">{currentLanguageOption.flag}</span>
                <span className="hidden md:inline">{currentLanguageOption.code.toUpperCase()}</span>
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-[#0B1E38] border border-sentinel-darkBorder shadow-2xl py-1.5 z-50 animate-scaleUp">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as SupportedLanguage);
                        setIsLangDropdownOpen(false);
                        soundEffects.playClick();
                      }}
                      className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between hover:bg-white/10 transition-colors ${
                        language === lang.code ? 'text-sentinel-cyan font-bold bg-white/5' : 'text-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </span>
                      {language === lang.code && <span className="w-1.5 h-1.5 rounded-full bg-sentinel-cyan" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Voice Assistant Trigger */}
            <button
              onClick={() => setIsVoiceAssistantOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-sentinel-cyan/15 hover:bg-sentinel-cyan/25 text-sentinel-cyan border border-sentinel-cyan/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all active:scale-95 glow-cyan"
              title="Launch AURA Voice Assistant"
            >
              <Mic className="w-3.5 h-3.5 text-sentinel-cyan animate-pulse" />
              <span className="hidden sm:inline">Voice AI</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={handleAudioToggle}
              className={`p-2 rounded-xl border transition-all ${
                audioEnabled
                  ? 'bg-sentinel-cyan/15 text-sentinel-cyan border-sentinel-cyan/40 shadow-[0_0_8px_rgba(22,199,232,0.3)]'
                  : 'bg-white/5 text-slate-500 border-white/10 hover:text-slate-300'
              }`}
              title={audioEnabled ? 'Mute Audio HUD' : 'Enable Tactical Audio'}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Quick Simulate Trigger */}
            <button
              onClick={handleSimulate}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sentinel-red hover:bg-red-600 text-white border border-red-400/30 text-xs font-extrabold transition-all shadow-md shadow-sentinel-red/30 glow-red active:scale-95"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Simulate Incident</span>
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
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] rounded-full bg-sentinel-red text-white text-[10px] font-mono font-black flex items-center justify-center px-1 shadow-md shadow-sentinel-red/50 animate-pulse">
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
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sentinel-cyan/30 to-blue-600/30 border border-sentinel-cyan/50 text-sentinel-cyan flex items-center justify-center font-mono font-black text-xs shadow-[0_0_10px_rgba(22,199,232,0.2)]">
                CMD
              </div>
              <div className="hidden xl:block text-left">
                <span className="block text-xs font-bold text-white leading-tight">Chief Aditi Rao</span>
                <span className="block text-[10px] font-mono text-sentinel-cyan leading-tight">DISPATCH-01</span>
              </div>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  logout();
                  navigate('/login');
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400"
                title="Sign Out"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Live Simulation Alert Bar */}
        {simulationToast && (
          <div className="bg-sentinel-red/90 backdrop-blur-md text-white px-4 py-2.5 text-xs flex items-center justify-between border-b border-red-400 shadow-xl animate-slideDown">
            <span className="font-mono font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-white animate-pulse" />
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

        {/* Router Outlet Viewport */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#071426]">
          <Outlet
            context={{
              incidents,
              onOpenIncident: handleOpenIncident,
              onOpenDuplicate: handleOpenDuplicate,
              onSimulate: handleSimulate,
              onReset: handleReset,
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
    </div>
  );
};
