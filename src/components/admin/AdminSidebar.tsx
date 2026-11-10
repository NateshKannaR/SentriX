import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldAlert,
  MapPin,
  BarChart3,
  Copy,
  Settings,
  ExternalLink,
  Zap,
  RotateCcw,
  ListFilter,
  Activity,
  Plane,
  FileText,
  Hospital,
  X,
} from 'lucide-react';
import { Incident } from '../../types';
import { soundFx } from '../../utils/soundEffects';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface AdminSidebarProps {
  incidents: Incident[];
  onSimulate: () => void;
  onReset: () => void;
  isSimulating?: boolean;
  onNavigate?: () => void;
  onClose?: () => void;
  onOpenDrone?: () => void;
  onOpenPlaybook?: () => void;
  onOpenHospitals?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  incidents,
  onSimulate,
  onReset,
  isSimulating = false,
  onNavigate,
  onClose,
  onOpenDrone,
  onOpenPlaybook,
  onOpenHospitals,
}) => {
  const { t } = useLanguage();
  const { session } = useAuth();
  const criticalCount = incidents.filter(i => i.severity === 'Critical' && i.status !== 'Resolved').length;
  const duplicateCount = incidents.filter(i => Boolean(i.duplicateWarning) && i.status !== 'Resolved').length;

  const navItems = [
    {
      to: '/admin/dashboard',
      label: t('admin.nav.overview', 'Command Overview'),
      icon: LayoutDashboard,
    },
    {
      to: '/admin/incidents',
      label: t('admin.nav.incidents', 'Live Incidents'),
      icon: ListFilter,
      badge: incidents.length,
      criticalBadge: criticalCount > 0 ? criticalCount : undefined,
    },
    {
      to: '/admin/map',
      label: t('admin.nav.map', 'Incident Map'),
      icon: MapPin,
    },
    {
      to: '/admin/duplicates',
      label: t('admin.nav.duplicates', 'Duplicate Guard'),
      icon: Copy,
      badge: duplicateCount > 0 ? `${duplicateCount} ${t('admin.sidebar.duplicateAlerts', 'Alert')}` : undefined,
      isWarning: duplicateCount > 0,
    },
    {
      to: '/admin/analytics',
      label: t('admin.nav.analytics', 'Intelligence Analytics'),
      icon: BarChart3,
    },
    {
      to: '/admin/settings',
      label: t('admin.nav.settings', 'System & Simulator'),
      icon: Settings,
    },
  ];

  const handleLinkClick = () => {
    soundFx.playClick();
    onNavigate?.();
  };

  return (
    <aside className="w-72 sm:w-68 bg-[#060B14] text-slate-300 flex flex-col h-full border-r border-white/[0.08] select-none shrink-0 shadow-2xl">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between">
        <Link
          to="/admin/dashboard"
          onClick={handleLinkClick}
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-red-500/25 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-black text-base tracking-wider text-white">Sentri</span>
              <span className="font-black text-base text-cyan-400">X</span>
            </div>
            <span className="text-[9px] font-mono tracking-widest text-slate-400 block uppercase font-bold">
              WAR ROOM CONSOLE
            </span>
          </div>
        </Link>

        {onClose && (
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
          {t('admin.sidebar.modules', 'OPERATIONAL MODULES')}
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleLinkClick}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all min-h-[40px] ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.criticalBadge && !isActive && (
                      <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-mono font-black animate-pulse">
                        {item.criticalBadge}
                      </span>
                    )}
                    {item.badge && !item.criticalBadge && (
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                          isActive
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : item.isWarning
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-white/10 text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </>
              )}
            </NavLink>
          );
        })}

        {/* Tactical Suite Section */}
        <div className="pt-4 px-3 pb-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
          {t('admin.sidebar.advanced', 'TACTICAL SUITE')}
        </div>

        {onOpenDrone && (
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenDrone();
              onNavigate?.();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.04] transition-all min-h-[40px]"
          >
            <div className="flex items-center gap-3">
              <Plane className="w-4 h-4 text-cyan-400" />
              <span>{t('admin.nav.drones', 'Recon Drone UAV')}</span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold">
              LIVE
            </span>
          </button>
        )}

        {onOpenPlaybook && (
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenPlaybook();
              onNavigate?.();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.04] transition-all min-h-[40px]"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>{t('admin.nav.playbook', 'Tactical SOP Playbook')}</span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
              AI
            </span>
          </button>
        )}

        {onOpenHospitals && (
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenHospitals();
              onNavigate?.();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.04] transition-all min-h-[40px]"
          >
            <div className="flex items-center gap-3">
              <Hospital className="w-4 h-4 text-purple-400" />
              <span>{t('admin.nav.hospitals', 'Trauma Bed Matrix')}</span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold">
              BEDS
            </span>
          </button>
        )}
      </div>

      {/* Simulator Quick Action Panel */}
      <div className="p-3 mx-3 mb-3 rounded-2xl bg-[#0B1324]/80 border border-white/[0.08] space-y-2 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            {t('admin.sidebar.simulator', 'SIMULATOR')}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">
          {t('admin.sidebar.simulatorDesc', 'Inject real-time multi-casualty crisis scenario.')}
        </p>
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => {
              soundFx.playAlert();
              onSimulate();
            }}
            disabled={isSimulating}
            className="flex-1 py-2 px-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-red-600/30 transition-all active:scale-95 disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{t('admin.sidebar.simulateBtn', 'Simulate Crisis')}</span>
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              onReset();
            }}
            title={t('admin.sidebar.resetBtn', 'Reset Demo Data')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
            aria-label="Reset demo data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Profile / Dual-Portal Switcher Link */}
      <div className="p-3 border-t border-white/[0.08] bg-[#060B14] space-y-2">
        <Link
          to="/citizen"
          onClick={() => soundFx.playClick()}
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <span>👤 Citizen Public Portal</span>
          <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
        </Link>
        <div className="px-3 py-2 flex items-center justify-between bg-[#0A1120] rounded-xl border border-white/[0.06]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-black text-xs shrink-0">
              {session.user?.name ? session.user.name.slice(0, 2).toUpperCase() : 'AR'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">
                {session.user?.name || 'Chief Aditi Rao'}
              </div>
              <div className="text-[10px] font-mono text-cyan-400 truncate">
                {session.user?.badge || 'DISPATCH-CMD-01'}
              </div>
            </div>
          </div>
          <Link
            to="/login"
            onClick={() => soundFx.playClick()}
            className="text-[10px] text-slate-400 hover:text-white font-mono hover:underline px-1.5 py-0.5 rounded bg-white/5"
            title="Switch User / Logout"
          >
            Switch
          </Link>
        </div>
      </div>
    </aside>
  );
};
