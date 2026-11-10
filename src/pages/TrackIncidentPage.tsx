import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { incidentService } from '../services/incidentService';
import { Incident, IncidentActivity } from '../types';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { CategoryBadge } from '../components/common/CategoryBadge';
import {
  Search,
  ShieldAlert,
  Clock,
  MapPin,
  Truck,
  Activity,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const TrackIncidentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || '';

  const [code, setCode] = useState(initialCode);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [activities, setActivities] = useState<IncidentActivity[]>([]);
  const [searched, setSearched] = useState(false);

  const performSearch = (targetCode: string) => {
    if (!targetCode.trim()) return;
    const found = incidentService.getIncidentByCode(targetCode);
    setIncident(found || null);
    if (found) {
      setActivities(incidentService.getActivities(found.id));
    } else {
      setActivities([]);
    }
    setSearched(true);
  };

  useEffect(() => {
    if (initialCode) {
      performSearch(initialCode);
    }
  }, [initialCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(code);
  };

  return (
    <div className="min-h-screen flex flex-col bg-sentinel-bgLight text-slate-800 font-sans">
      <Header />

      <main className="flex-1 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Top Banner */}
          <div className="text-center space-y-2 mb-8">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-sentinel-cyan bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
              Citizen Tracking Portal
            </span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Track Emergency Status
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Check real-time dispatch progress, unit assignments, and operational updates for your reported incident.
            </p>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSubmit} className="mb-10">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="Enter Incident Code (e.g. STX-2026-1001)"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-sentinel-cyan focus:ring-2 focus:ring-sentinel-cyan/20 text-slate-900 font-mono text-sm uppercase placeholder:normal-case placeholder:font-sans focus:outline-none shadow-sm"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3.5 rounded-2xl bg-sentinel-navy hover:bg-sentinel-darkBlue text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 shrink-0"
              >
                <span>Track</span>
                <ArrowRight className="w-4 h-4 text-sentinel-cyan" />
              </button>
            </div>
            {/* Quick Demo Code helper */}
            <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
              <span>Try sample code:</span>
              <button
                type="button"
                onClick={() => {
                  setCode('STX-2026-1001');
                  performSearch('STX-2026-1001');
                }}
                className="font-mono text-sentinel-cyan hover:underline"
              >
                STX-2026-1001
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  setCode('STX-2026-1002');
                  performSearch('STX-2026-1002');
                }}
                className="font-mono text-sentinel-cyan hover:underline"
              >
                STX-2026-1002
              </button>
            </div>
          </form>

          {/* Search Results Display */}
          {searched && !incident && (
            <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-800">Incident Code Not Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                We couldn&apos;t find an emergency report matching &quot;{code}&quot;. Please check the code or contact emergency dispatch.
              </p>
            </div>
          )}

          {incident && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden space-y-6 p-6 sm:p-8 animate-fadeIn">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-sentinel-navy text-sentinel-cyan">
                      {incident.incidentCode}
                    </span>
                    <StatusBadge status={incident.status} size="sm" />
                    <SeverityBadge severity={incident.severity} size="sm" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-2">{incident.title}</h2>
                </div>

                <CategoryBadge category={incident.category} size="md" />
              </div>

              {/* Status Progress Bar */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Incident Response Lifecycle
                </span>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  {[
                    { label: 'Reported', active: true },
                    { label: 'Pending', active: ['Pending', 'In Progress', 'Resolved'].includes(incident.status) },
                    { label: 'In Progress', active: ['In Progress', 'Resolved'].includes(incident.status) },
                    { label: 'Resolved', active: incident.status === 'Resolved' },
                  ].map((step, idx) => (
                    <div key={idx} className="space-y-1">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          step.active ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}
                      />
                      <span className={`text-[11px] font-semibold ${step.active ? 'text-slate-800' : 'text-slate-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Field Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Incident Location</span>
                    <span className="text-slate-800 font-medium">{incident.location}</span>
                    {incident.landmark && <span className="text-slate-500 block">({incident.landmark})</span>}
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50">
                  <Truck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Emergency Unit</span>
                    <span className="text-slate-800 font-medium">
                      {incident.assignedUnit || 'Dispatch in queue / Unit en route'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 rounded-xl bg-slate-50 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900 block mb-1">Field Description:</span>
                {incident.description}
              </div>

              {/* Activity Timeline */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-sentinel-cyan" />
                  Live Operational History ({activities.length})
                </h3>
                <div className="space-y-2.5">
                  {activities.map(act => (
                    <div
                      key={act.id}
                      className="p-3 rounded-xl border border-slate-100 bg-white flex items-start justify-between text-xs gap-3 shadow-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-800 block">{act.actor}</span>
                        <p className="text-slate-600 mt-0.5">{act.description}</p>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400 shrink-0">
                        {new Date(act.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
