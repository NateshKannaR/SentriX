import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ArrowUpRight, BarChart3, ClipboardList, Copy, LayoutDashboard, MapPin, Settings, Shield, Truck, X } from 'lucide-react';
import { Incident } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface AdminSidebarProps {
  incidents: Incident[];
  onNavigate?: () => void;
  onClose?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ incidents, onNavigate, onClose }) => {
  const { session } = useAuth();
  const { t } = useLanguage();
  const critical = incidents.filter(incident => incident.severity === 'Critical' && incident.status !== 'Resolved').length;
  const duplicates = incidents.filter(incident => incident.duplicateWarning && incident.status !== 'Resolved').length;
  const pages = [
    { path: 'dashboard', title: t('ops.nav.overview', 'Overview'), icon: LayoutDashboard },
    { path: 'incidents', title: t('ops.nav.incidents', 'Incidents'), icon: ClipboardList, count: critical },
    { path: 'teams', title: t('ops.nav.teams', 'Response teams'), icon: Truck },
    { path: 'map', title: t('ops.nav.map', 'Incident map'), icon: MapPin },
    { path: 'duplicates', title: t('ops.nav.duplicates', 'Duplicate review'), icon: Copy, count: duplicates },
    { path: 'analytics', title: t('ops.nav.analytics', 'Analytics'), icon: BarChart3 },
    { path: 'settings', title: t('ops.nav.settings', 'Settings & simulator'), icon: Settings },
  ];
  const name = session.user?.name || 'Commander';

  return (
    <aside className="ops-sidebar flex h-full w-full flex-col">
      <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4">
        <Link to="/admin/dashboard" onClick={onNavigate} className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-cyan-300/10 text-cyan-200"><Shield size={19} /></span>
          <span>
            <span className="block text-base font-semibold tracking-tight text-white">Sentri<span className="text-cyan-200">X</span></span>
            <span className="block text-xs text-slate-400">Command center</span>
          </span>
        </Link>
        {onClose && <button type="button" className="ops-icon" onClick={onClose} aria-label="Close navigation"><X size={18} /></button>}
      </div>
      <nav aria-label="Command center" className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
        {pages.map(({ path, title, icon: Icon, count }) => (
          <NavLink key={path} to={`/admin/${path}`} onClick={onNavigate} className="ops-nav-link">
            <Icon size={17} className="shrink-0" />
            <span className="min-w-0 flex-1">{title}</span>
            {Boolean(count) && <span className="rounded bg-amber-300/10 px-1.5 py-0.5 text-xs tabular-nums text-amber-200">{count}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-2 border-t border-white/10 p-3">
        <Link to="/citizen" onClick={onNavigate} className="ops-nav-link">Citizen portal <ArrowUpRight size={15} className="ml-auto" /></Link>
        <Link to="/login" onClick={onNavigate} className="ops-nav-link">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 text-xs font-semibold text-cyan-200">{name.slice(0, 2).toUpperCase()}</span>
          <span className="min-w-0">
            <span className="block truncate font-semibold text-white">{name}</span>
            <span className="block truncate text-xs text-slate-400">{session.user?.badge || 'Switch user'}</span>
          </span>
        </Link>
      </div>
    </aside>
  );
};
