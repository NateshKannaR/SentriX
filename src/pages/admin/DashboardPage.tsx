import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Activity, ArrowRight, ArrowUpRight, CircleCheck, ClipboardList, MapPin, ShieldAlert, Truck } from 'lucide-react';
import { Incident, IncidentStatus } from '../../types';
import { teamService } from '../../services/teamService';
import { getPriorityExplanation } from '../../services/intelligenceEngine';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { StatusBadge } from '../../components/common/StatusBadge';

interface DashboardContext {
  incidents: Incident[];
  onOpenIncident: (incident: Incident) => void;
  onOpenDuplicate: (incident: Incident) => void;
}

type QueueView = 'Critical' | 'Unassigned' | 'All active';
const STATUSES: IncidentStatus[] = ['Reported', 'Pending', 'Assigned', 'In Progress', 'Resolved'];

const isUnassigned = (incident: Incident) =>
  (incident.status === 'Reported' || incident.status === 'Pending') &&
  !incident.assignedTeamId && !incident.assignedTeamName && !incident.assignedUnit;

export const DashboardPage: React.FC = () => {
  const { incidents, onOpenIncident, onOpenDuplicate } = useOutletContext<DashboardContext>();
  const [teams, setTeams] = useState(() => teamService.getTeams());
  const [queueView, setQueueView] = useState<QueueView>('Critical');

  useEffect(() => teamService.subscribe(() => setTeams(teamService.getTeams())), []);

  const active = incidents.filter(incident => incident.status !== 'Resolved')
    .sort((a, b) => b.priorityScore - a.priorityScore || Date.parse(a.createdAt) - Date.parse(b.createdAt));
  const queues: Record<QueueView, Incident[]> = {
    Critical: active.filter(incident => incident.severity === 'Critical'),
    Unassigned: active.filter(isUnassigned),
    'All active': active,
  };
  const queue = queues[queueView];
  const topIncident = active[0];
  const explanation = topIncident && getPriorityExplanation(topIncident, incidents);
  const available = teams.filter(team => team.status === 'Available').length;
  const deployed = teams.filter(team => team.status === 'Busy' || team.status === 'En Route').length;
  const offline = teams.length - available - deployed;
  const flagged = active.filter(incident => incident.duplicateWarning);
  const categories = [...new Set(teams.map(team => team.category))].sort().map(category => {
    const group = teams.filter(team => team.category === category);
    return { category, total: group.length, available: group.filter(team => team.status === 'Available').length };
  });
  const cards = [
    { label: 'Active incidents', value: active.length, note: `${incidents.length} total ${incidents.length === 1 ? 'report' : 'reports'}`, icon: ClipboardList, tone: 'text-sky-300', to: '/admin/incidents?scope=active' },
    { label: 'Critical incidents', value: queues.Critical.length, note: 'Open critical reports', icon: ShieldAlert, tone: 'text-rose-300', to: '/admin/incidents?severity=Critical&scope=active' },
    { label: 'Teams available', value: available, note: `${deployed} deployed · ${offline} offline`, icon: Truck, tone: 'text-emerald-300', to: '/admin/teams' },
    { label: 'Resolved', value: incidents.length - active.length, note: 'Closed incident reports', icon: CircleCheck, tone: 'text-violet-300', to: '/admin/incidents?status=Resolved' },
  ];

  return (
    <div className="ops-page">
      <div className="ops-page-heading">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1>Operations overview</h1>
            {incidents.length > 0 && incidents.every(incident => incident.isDemo) && (
              <span className="rounded-md bg-amber-300/10 px-2 py-1 text-xs font-medium text-amber-200">Demo data</span>
            )}
          </div>
          <p>Review priority incidents, team availability, and reports awaiting review.</p>
        </div>
        <Link to="/admin/map" className="ops-action"><MapPin size={17} /> Open incident map <ArrowUpRight size={15} /></Link>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {cards.map(({ label, value, note, icon: Icon, tone, to }) => (
          <Link key={label} to={to} className="ops-panel ops-metric group min-w-0 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 ${tone}`}><Icon size={18} /></span>
              <ArrowUpRight size={16} className="text-slate-500 group-hover:text-cyan-200" />
            </div>
            <div className="mt-4 text-sm font-medium text-slate-300">{label}</div>
            <div className="mt-1 text-3xl font-semibold tracking-tight tabular-nums text-white">{value}</div>
            <div className="mt-2 text-xs text-slate-400">{note}</div>
          </Link>
        ))}
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <section className="ops-panel overflow-hidden" aria-labelledby="queue-heading">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 p-4 sm:p-5">
            <div>
              <h2 id="queue-heading" className="text-lg font-semibold text-white">Priority queue</h2>
              <p className="mt-1 text-sm text-slate-400">Highest priority first</p>
            </div>
            <Link className="ops-link" to="/admin/incidents?scope=active">Incident list <ArrowRight size={15} /></Link>
          </div>
          <div className="flex flex-wrap gap-2 border-b border-white/10 px-4 py-3 sm:px-5" aria-label="Queue filters">
            {(Object.keys(queues) as QueueView[]).map(view => (
              <button key={view} type="button" className="ops-filter" aria-pressed={queueView === view} onClick={() => setQueueView(view)}>
                {view} <span className="ml-1 text-xs tabular-nums opacity-75">{queues[view].length}</span>
              </button>
            ))}
          </div>
          <div aria-live="polite">
            {queue.length === 0 ? (
              <p className="p-6 text-sm text-slate-400">No incidents in this queue.</p>
            ) : (
              <ul className="divide-y divide-white/10">
                {queue.slice(0, 6).map(incident => (
                  <li key={incident.id}>
                    <button type="button" onClick={() => onOpenIncident(incident)} className="ops-queue-row w-full text-left">
                      <span className="min-w-0">
                        <span className="block text-xs font-medium text-cyan-200">{incident.incidentCode}</span>
                        <span className="mt-1 block break-words text-sm font-semibold text-white">{incident.title}</span>
                        <span className="mt-1 block break-words text-xs text-slate-400">{incident.location}</span>
                      </span>
                      <span className="flex flex-wrap items-center gap-2"><SeverityBadge severity={incident.severity} size="sm" /><StatusBadge status={incident.status} size="sm" /></span>
                      <span className="justify-self-end text-sm font-semibold tabular-nums text-slate-200" aria-label={`Priority ${incident.priorityScore}`}>{incident.priorityScore}<span aria-hidden="true" className="text-xs text-slate-500"> / 100</span></span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <div className="grid min-w-0 content-start gap-4">
          <section className="ops-panel p-4 sm:p-5" aria-labelledby="fleet-heading">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="fleet-heading" className="text-lg font-semibold text-white">Team readiness</h2>
              <Link className="ops-link" to="/admin/teams">Teams <ArrowRight size={15} /></Link>
            </div>
            <p className="mt-1 text-sm text-slate-400">{available} of {teams.length} teams available</p>
            {categories.length ? (
              <ul className="mt-4 space-y-3">
                {categories.map(group => (
                  <li key={group.category}>
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-300">
                      <span>{group.category}</span><span className={group.available ? 'tabular-nums' : 'text-amber-300'}>{group.available}/{group.total}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
                      <div className="h-full rounded-full bg-teal-400" style={{ width: `${group.available / group.total * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-4 text-sm text-slate-400">No teams have been added.</p>}
          </section>
          <section className="ops-panel p-4 sm:p-5" aria-labelledby="review-heading">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="review-heading" className="text-lg font-semibold text-white">Duplicate review</h2>
              <Link className="ops-link" to="/admin/duplicates">Review queue <ArrowRight size={15} /></Link>
            </div>
            <p className="mt-1 text-sm text-slate-400">{flagged.length ? `${flagged.length} active ${flagged.length === 1 ? 'report' : 'reports'} flagged for comparison.` : 'No active reports flagged.'}</p>
            {flagged.slice(0, 2).map(incident => (
              <button key={incident.id} type="button" onClick={() => onOpenDuplicate(incident)} className="mt-3 flex w-full items-center justify-between gap-2 rounded-lg bg-white/5 p-2.5 text-left text-xs text-amber-200 hover:bg-white/10">
                <span className="min-w-0 break-words">{incident.incidentCode} · {incident.title}</span><ArrowRight size={14} className="shrink-0" />
              </button>
            ))}
          </section>
        </div>
      </div>

      {topIncident && explanation && (
        <details className="ops-panel">
          <summary className="cursor-pointer p-4 font-semibold text-white sm:p-5"><Activity size={17} className="mr-2 inline text-cyan-300" /> Priority breakdown · {topIncident.incidentCode}</summary>
          <div className="px-4 pb-4 sm:px-5 sm:pb-5">
            <p className="mb-4 text-sm text-slate-300">{explanation.summary}</p>
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {explanation.factors.map(factor => (
                <div key={factor.name} className="rounded-lg border border-white/10 p-3">
                  <dt className="text-xs text-slate-400">{factor.name} · {factor.weight}</dt>
                  <dd className="mt-1 text-sm font-semibold text-white">{factor.score}/{factor.maxScore}</dd>
                  <dd className="mt-1 text-xs text-slate-300">{factor.value}</dd>
                </div>
              ))}
            </dl>
            <button type="button" className="ops-link mt-4" onClick={() => onOpenIncident(topIncident)}>Open incident <ArrowRight size={15} /></button>
          </div>
        </details>
      )}
      <section className="ops-panel p-4 sm:p-5" aria-labelledby="status-heading">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="status-heading" className="text-lg font-semibold text-white">Reports by status</h2>
          <Link to="/admin/analytics" className="ops-link">Open analytics <ArrowUpRight size={15} /></Link>
        </div>
        <ul className="grid grid-cols-2 gap-2 md:grid-cols-5">
          {STATUSES.map(status => (
            <li key={status}>
              <Link to={`/admin/incidents?status=${encodeURIComponent(status)}`} className="block rounded-lg border border-white/10 px-3 py-2 hover:bg-white/5">
                <span className="block text-xs text-slate-400">{status}</span>
                <span className="mt-1 block text-lg font-semibold tabular-nums text-white">{incidents.filter(incident => incident.status === status).length}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
