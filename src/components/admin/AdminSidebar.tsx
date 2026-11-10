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
  Terminal,
} from 'lucide-react';
import { Incident } from '../../types';
import { soundFx } from '../../utils/soundEffects';

interface AdminSidebarProps {
  incidents: Incident[];
  onSimulate: () => void;
  onReset: () => void;
  isSimulating?: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  incidents,
  onSimulate,
  onReset,
  isSimulating = false,
}) => {
  const criticalCount = incidents.filter(i => i.severity === 'Critical' && i.status !== 'Resolved').length;
  const duplicateCount = incidents.filter(i => Boolean(i.duplicateWarning) && i.status !== 'Resolved').length;

  const navItems = [
    {
      to: '/admin/dashboard',
      label: 'Command Overview',
      icon: LayoutDashboard,
    },
    {
      to: '/admin/incidents',
      label: 'Live Incidents',
      icon: ListFilter,
      badge: incidents.length,
      criticalBadge: criticalCount > 0 ? criticalCount : undefined,
    },
    {
      to: '/admin/map',
      label: 'Incident Map',
      icon: MapPin,
    },
    {
      to: '/admin/duplicates',
      label: 'Duplicate Guard',
      icon: Copy,
      badge: duplicateCount > 0 ? `${duplicateCount} Alert` : undefined,
      isWarning: duplicateCount > 0,
    },
    {
      to: '/admin/analytics',
      label: 'Intelligence Analytics',
      icon: BarChart3,
    },
    {
      to: '/admin/settings',
      label: 'System & Simulator',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-68 bg-[#040C17] text-slate-300 flex flex-col h-full border-r border-[#16C7E8]/20 select-none shrink-0 shadow-2xl">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <Link
          to="/admin/dashboard"
          onClick={() => soundFx.playClick()}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sentinel-red to-rose-700 flex items-center justify-center text-white shadow-md shadow-sentinel-red/30 glow-red">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base tracking-wider text-white">SENTINEL</span>
              <span className="font-black text-base text-sentinel-cyan">360</span>
            </div>
            <span className="text-[9px] font-mono tracking-widest text-slate-400 block uppercase font-bold">
              WAR ROOM CONSOLE
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">
          OPERATIONAL MODULES
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => soundFx.playClick()}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-sentinel-cyan to-teal-400 text-[#071426] shadow-lg shadow-sentinel-cyan/25 glow-cyan'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#071426]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.criticalBadge && !isActive && (
                      <span className="px-2 py-0.5 rounded-full bg-sentinel-red text-white text-[10px] font-mono font-black animate-pulse glow-red">
                        {item.criticalBadge}
                      </span>
                    )}
                    {item.badge && !item.criticalBadge && (
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                          isActive
                            ? 'bg-[#071426]/20 text-[#071426]'
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
      </div>

      {/* Simulator Quick Action Panel */}
      <div className="p-3.5 mx-3 mb-3 rounded-2xl bg-[#0B1E38]/90 border border-[#16C7E8]/30 space-y-2 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sentinel-cyan flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-sentinel-cyan animate-pulse" /> SIMULATOR
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]" />
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">
          Inject real-time multi-casualty crisis scenario.
        </p>
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => {
              soundFx.playAlert();
              onSimulate();
            }}
            disabled={isSimulating}
            className="flex-1 py-2 px-2.5 rounded-xl bg-gradient-to-r from-sentinel-cyan to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-sentinel-navy font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-sentinel-cyan/30 transition-all active:scale-95 disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate</span>
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              onReset();
            }}
            title="Reset to clean initial seed data"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
            aria-label="Reset demo data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Profile / Public Portal Link */}
      <div className="p-3.5 border-t border-white/10 bg-[#040C17] space-y-2">
        <Link
          to="/"
          onClick={() => soundFx.playClick()}
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <span>Citizen Public Portal</span>
          <ExternalLink className="w-3.5 h-3.5 text-sentinel-cyan" />
        </Link>
        <div className="px-3 py-1.5 flex items-center gap-2.5 bg-[#071426] rounded-xl border border-white/5">
          <div className="w-8 h-8 rounded-lg bg-sentinel-cyan/20 border border-sentinel-cyan/40 text-sentinel-cyan flex items-center justify-center font-black text-xs">
            AR
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-white truncate">Chief Aditi Rao</div>
            <div className="text-[10px] font-mono text-slate-500 truncate">Tactical Dispatch Commander</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
