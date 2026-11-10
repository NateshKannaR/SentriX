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
} from 'lucide-react';
import { Incident } from '../../types';

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
    <aside className="w-64 bg-sentinel-navy text-slate-300 flex flex-col h-full border-r border-sentinel-darkBorder select-none shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-sentinel-darkBorder flex items-center justify-between">
        <Link to="/admin/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sentinel-red flex items-center justify-center text-white shadow-md shadow-sentinel-red/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-wider text-white">SENTINEL</span>
              <span className="font-black text-base text-sentinel-cyan">360</span>
            </div>
            <span className="text-[10px] font-mono tracking-wider text-slate-400 block uppercase">
              Command Center
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Operations
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-sentinel-cyan text-sentinel-navy shadow-md shadow-sentinel-cyan/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-sentinel-navy' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.criticalBadge && !isActive && (
                      <span className="px-1.5 py-0.5 rounded-full bg-sentinel-red text-white text-[10px] font-mono font-bold animate-pulse">
                        {item.criticalBadge}
                      </span>
                    )}
                    {item.badge && !item.criticalBadge && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isActive
                            ? 'bg-sentinel-navy/20 text-sentinel-navy'
                            : item.isWarning
                            ? 'bg-amber-500/20 text-amber-400'
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
      <div className="p-3 mx-3 mb-3 rounded-xl bg-sentinel-darkBlue/70 border border-sentinel-darkBorder space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sentinel-cyan flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" /> Demo Simulator
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">
          Inject real-time realistic emergency scenario for evaluation.
        </p>
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onSimulate}
            disabled={isSimulating}
            className="flex-1 py-1.5 px-2 rounded-lg bg-sentinel-cyan hover:bg-cyan-300 text-sentinel-navy font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all active:scale-95 disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate</span>
          </button>
          <button
            onClick={onReset}
            title="Reset to clean initial seed data"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-sentinel-darkBorder transition-colors"
            aria-label="Reset demo data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Profile / Public Portal Link */}
      <div className="p-3 border-t border-sentinel-darkBorder/60 bg-sentinel-navy space-y-2">
        <Link
          to="/"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <span>Citizen Public Portal</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <div className="px-3 py-1 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-sentinel-cyan/20 border border-sentinel-cyan/40 text-sentinel-cyan flex items-center justify-center font-bold text-xs">
            AR
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-white truncate">Chief Aditi Rao</div>
            <div className="text-[10px] text-slate-400 truncate">Incident Commander #01</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
