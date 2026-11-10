import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { EmergencyAlertDrawer } from './EmergencyAlertDrawer';
import { IncidentDetailsModal } from './IncidentDetailsModal';
import { DuplicateComparisonModal } from './DuplicateComparisonModal';
import { incidentService } from '../../services/incidentService';
import { Incident } from '../../types';
import { useAuth } from '../../context/AuthContext';
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
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { session, logout, theme, toggleTheme } = useAuth();
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
    const simulated = incidentService.simulateEmergency();
    setSimulationToast(`🚨 Simulated Emergency Injected: ${simulated.incidentCode} (${simulated.category})`);
    setTimeout(() => setSimulationToast(null), 4000);
  };

  const handleReset = () => {
    if (window.confirm('Reset all demo incidents and logs to default seed dataset?')) {
      incidentService.resetDemoData();
      setSimulationToast('🔄 Platform restored to default seed state.');
      setTimeout(() => setSimulationToast(null), 3000);
    }
  };

  const handleOpenIncident = (inc: Incident) => {
    setSelectedIncident(inc);
    setIsDetailsOpen(true);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleOpenDuplicate = (target: Incident) => {
    setDuplicateTarget(target);
    const origId = target.duplicateWarning?.suspectId;
    const orig = origId ? incidentService.getIncidentById(origId) : null;
    setDuplicateOriginal(orig || null);
    setIsDuplicateModalOpen(true);
  };

  const handleConfirmDuplicate = (targetId: string, originalId: string) => {
    incidentService.markAsDuplicate(targetId, originalId);
    setSimulationToast('✅ Incident linked and closed as duplicate.');
    setTimeout(() => setSimulationToast(null), 3000);
  };

  const handleDismissDuplicate = (targetId: string) => {
    incidentService.dismissDuplicateWarning(targetId);
    setSimulationToast('ℹ️ Duplicate flag dismissed.');
    setTimeout(() => setSimulationToast(null), 3000);
  };

  const criticalCount = incidents.filter(i => i.severity === 'Critical' && i.status !== 'Resolved').length;
  const duplicateCount = incidents.filter(i => Boolean(i.duplicateWarning) && i.status !== 'Resolved').length;
  const totalAlerts = criticalCount + duplicateCount;

  return (
    <div className="flex h-screen overflow-hidden bg-sentinel-bgLight dark:bg-sentinel-navy text-slate-800 dark:text-slate-100 font-sans">
      {/* Desktop Sidebar */}
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
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-full">
            <AdminSidebar
              incidents={incidents}
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Command Bar */}
        <header className="h-16 bg-white dark:bg-sentinel-darkSurface border-b border-slate-200 dark:border-sentinel-darkBorder flex items-center justify-between px-4 sm:px-6 shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search */}
            <div className="relative w-48 sm:w-80">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search code, title, location..."
                  className="w-full text-xs rounded-xl bg-slate-100 dark:bg-sentinel-darkCard border border-transparent focus:border-sentinel-cyan focus:bg-white dark:focus:bg-sentinel-darkSurface pl-9 pr-3 py-2 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none transition-all"
                />
              </div>

              {/* Search Autocomplete Dropdown */}
              {isSearchOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-sentinel-darkSurface border border-slate-200 dark:border-sentinel-darkBorder rounded-xl shadow-xl z-50 overflow-hidden max-h-72 overflow-y-auto">
                  {searchResults.length === 0 ? (
                    <div className="p-3 text-xs text-slate-400 text-center">
                      No incidents match &quot;{searchQuery}&quot;
                    </div>
                  ) : (
                    searchResults.map(inc => (
                      <div
                        key={inc.id}
                        onClick={() => handleOpenIncident(inc)}
                        className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2"
                      >
                        <div className="truncate">
                          <span className="font-mono text-xs font-bold text-sentinel-cyan mr-2">
                            {inc.incidentCode}
                          </span>
                          <span className="text-xs font-medium text-slate-900 dark:text-white">
                            {inc.title}
                          </span>
                          <div className="text-[10px] text-slate-400 truncate">{inc.location}</div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                          {inc.severity}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Simulate Trigger in Header */}
            <button
              onClick={handleSimulate}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sentinel-red/10 hover:bg-sentinel-red/20 text-sentinel-red dark:text-rose-400 border border-sentinel-red/30 text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Simulate Emergency</span>
            </button>

            {/* Emergency Alert Bell Drawer Trigger */}
            <button
              onClick={() => setIsAlertDrawerOpen(true)}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Emergency Alerts"
              aria-label="View emergency alerts"
            >
              <Bell className="w-5 h-5" />
              {totalAlerts > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] rounded-full bg-sentinel-red text-white text-[10px] font-mono font-bold flex items-center justify-center px-1 shadow animate-pulse">
                  {totalAlerts}
                </span>
              )}
            </button>

            {/* Dark / Light Mode Switch */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

            {/* Admin Profile */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-sentinel-darkBlue dark:bg-sentinel-cyan/20 border border-sentinel-cyan/40 text-sentinel-cyan flex items-center justify-center font-bold text-xs">
                AR
              </div>
              <div className="hidden md:block text-left">
                <span className="block text-xs font-bold leading-tight">Chief Aditi Rao</span>
                <span className="block text-[10px] text-slate-400 leading-tight">Command Center</span>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                title="Sign Out"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Global Simulation Toast Notice */}
        {simulationToast && (
          <div className="bg-sentinel-navy text-white px-4 py-2 text-xs flex items-center justify-between border-b border-sentinel-cyan/40 animate-slideDown shadow-lg">
            <span className="font-mono font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sentinel-cyan" />
              {simulationToast}
            </span>
            <button
              onClick={() => setSimulationToast(null)}
              className="text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Router Outlet Viewport */}
        <main className="flex-1 overflow-y-auto">
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
    </div>
  );
};
