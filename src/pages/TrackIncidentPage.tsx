import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { incidentService } from '../services/incidentService';
import { Incident, IncidentActivity } from '../types';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { soundEffects } from '../utils/soundEffects';
import { getLiveLocation, calculateDistanceKm, LiveLocationResult } from '../utils/geolocation';
import { useLanguage } from '../context/LanguageContext';
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
  Radio,
  Crosshair,
  Compass,
  Sparkles,
  ExternalLink,
  Navigation,
} from 'lucide-react';

export const TrackIncidentPage: React.FC = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || '';

  const [code, setCode] = useState(initialCode);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [activities, setActivities] = useState<IncidentActivity[]>([]);
  const [searched, setSearched] = useState(false);
  const [userLocation, setUserLocation] = useState<LiveLocationResult | null>(null);

  const performSearch = (targetCode: string) => {
    if (!targetCode.trim()) return;
    soundEffects.playBeep();
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
    // Acquire user location for distance calculation
    getLiveLocation().then(loc => setUserLocation(loc));
  }, [initialCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(code);
  };

  // Distance from user to incident
  const distanceKm = userLocation && incident?.latitude && incident?.longitude
    ? calculateDistanceKm(userLocation.latitude, userLocation.longitude, incident.latitude, incident.longitude)
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-sentinel-navy text-white font-sans relative selection:bg-sentinel-cyan/30 selection:text-sentinel-cyan">
      {/* Background HUD elements */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#16C7E8_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="fixed top-1/4 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 -right-32 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

      <Header />

      <main className="flex-1 py-10 sm:py-12 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Top Banner */}
          <div className="text-center space-y-3 mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sentinel-cyan/10 border border-sentinel-cyan/30 text-sentinel-cyan text-xs font-mono font-bold tracking-wider uppercase">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              {t('track.badge', 'CIVILIAN TELEMETRY RADAR')}
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {t('track.title', 'Track Real-Time Emergency Status')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
              {t('track.subtitle', 'Enter your unique 8-character Incident Code to inspect real-time dispatch progress, assigned responder units, and GPS telemetry.')}
            </p>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="glass-panel p-2 rounded-2xl border border-sentinel-darkBorder flex flex-col sm:flex-row gap-2 shadow-2xl focus-within:border-sentinel-cyan/60 transition-colors">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-sentinel-cyan/70 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder={t('track.placeholder', 'Enter Incident Code (e.g. STX-2026-1001)')}
                  className="w-full pl-12 pr-4 py-3 bg-transparent text-white font-mono text-sm uppercase placeholder:normal-case placeholder:font-sans placeholder:text-slate-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                onClick={() => soundEffects.playClick()}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-sentinel-cyan to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-sentinel-navy font-bold text-sm shadow-lg shadow-sentinel-cyan/20 transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
              >
                <span>{t('track.btn', 'Search Radar')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Demo Code helper */}
            <div className="mt-3 text-xs text-slate-400 flex flex-wrap items-center justify-center gap-2">
              <span className="font-mono text-[11px] text-slate-500 uppercase">{t('track.quickDemo', 'Or try a live emergency scenario:')}</span>
              {['STX-2026-1001', 'STX-2026-1002', 'STX-2026-1003'].map(sample => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setCode(sample);
                    performSearch(sample);
                  }}
                  className="px-2.5 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700 border border-slate-700 hover:border-sentinel-cyan font-mono text-[11px] text-sentinel-cyan transition-colors"
                >
                  {sample}
                </button>
              ))}
            </div>
          </form>

          {/* Incident Not Found */}
          {searched && !incident && (
            <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-red-500/30 text-center space-y-4 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/20">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-white">Incident Identifier Not Located</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  No registered emergency matches &quot;<span className="text-red-400 font-mono">{code}</span>&quot;. Ensure proper format or report a new situation.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/report"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sentinel-red/20 hover:bg-sentinel-red/30 text-red-300 border border-sentinel-red/40 text-xs font-bold transition-colors"
                >
                  <ShieldAlert className="w-4 h-4 text-sentinel-red" />
                  <span>Report New Incident Now</span>
                </Link>
              </div>
            </div>
          )}

          {/* Active Incident Dossier */}
          {incident && (
            <div className="glass-panel rounded-3xl border border-sentinel-darkBorder shadow-2xl overflow-hidden space-y-6 p-5 sm:p-8 animate-fadeIn">
              {/* Dossier Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sentinel-darkBorder/60">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-3 py-1 rounded-md bg-sentinel-darkSurface text-sentinel-cyan border border-sentinel-cyan/30">
                      {incident.incidentCode}
                    </span>
                    <StatusBadge status={incident.status} size="sm" />
                    <SeverityBadge severity={incident.severity} size="sm" />
                  </div>
                  <h2 className="text-lg sm:text-2xl font-black text-white mt-3 tracking-tight">
                    {incident.title}
                  </h2>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-2">
                  <CategoryBadge category={incident.category} size="md" />
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    Logged: {new Date(incident.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Status Progress Stepper */}
              <div className="p-4 sm:p-5 rounded-2xl bg-sentinel-darkSurface/60 border border-sentinel-darkBorder/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-sentinel-cyan" />
                    Operational Response Lifecycle
                  </span>
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Live Protocol Active
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center pt-2">
                  {[
                    { label: t('track.stepReported', 'Incident Reported'), active: true, step: '01' },
                    { label: t('track.stepTriaged', 'AI Severity Triaged'), active: true, step: '02' },
                    { label: t('track.stepDispatched', 'Unit Dispatched'), active: ['Pending', 'In Progress', 'Resolved'].includes(incident.status), step: '03' },
                    { label: t('track.stepResolved', 'Incident Resolved'), active: incident.status === 'Resolved', step: '04' },
                  ].map((step, idx) => (
                    <div key={idx} className="space-y-2 p-2 rounded-xl bg-sentinel-darkSurface/40 sm:bg-transparent">
                      <div className="relative">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            step.active
                              ? 'bg-gradient-to-r from-emerald-500 to-sentinel-cyan shadow-sm shadow-cyan-500/30'
                              : 'bg-slate-800'
                          }`}
                        />
                        {step.active && (
                          <div className="absolute -top-1 right-0 w-4 h-4 rounded-full bg-sentinel-cyan border-2 border-sentinel-navy shadow-md animate-ping opacity-60" />
                        )}
                      </div>
                      <div className="text-left sm:text-center">
                        <span className="text-[10px] font-mono text-slate-500 block">STEP {step.step}</span>
                        <span className={`text-xs font-bold block ${step.active ? 'text-white' : 'text-slate-500'}`}>
                          {step.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Telemetry Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-sentinel-darkSurface/50 border border-sentinel-darkBorder/60 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-sentinel-cyan/10 text-sentinel-cyan shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Location Coordinates</span>
                    <span className="text-white font-semibold block mt-0.5">{incident.location}</span>
                    {distanceKm !== null && (
                      <span className="text-emerald-400 font-mono text-[11px] block mt-1">
                        🛰️ {distanceKm} km from your live position
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                      [{(incident.latitude ?? 12.9716).toFixed(4)}, {(incident.longitude ?? 77.5946).toFixed(4)}]
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-sentinel-darkSurface/50 border border-sentinel-darkBorder/60 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                      {t('track.dispatchUnit', 'Dispatched Unit')}
                    </span>
                    <span className="text-white font-semibold block mt-0.5">
                      {incident.assignedUnit || 'Dispatch in queue / Unit en route'}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      GPS Beacon Live
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-sentinel-darkSurface/50 border border-sentinel-darkBorder/60 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">People Affected</span>
                    <span className="text-white font-semibold block mt-0.5 text-sm">
                      {incident.peopleAffected} {incident.peopleAffected === 1 ? 'person' : 'people'}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Triage Priority: <span className="text-sentinel-cyan font-mono font-bold">{incident.priorityScore}/100</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 rounded-2xl bg-sentinel-darkSurface/40 border border-sentinel-darkBorder/60 text-xs text-slate-300 leading-relaxed">
                <span className="font-bold text-white block mb-1 font-mono uppercase tracking-wider text-[11px] text-slate-400">
                  Citizen Situation Narrative:
                </span>
                <p className="text-slate-200">{incident.description}</p>
              </div>

              {/* Activity Timeline */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
                    <Activity className="w-4 h-4 text-sentinel-cyan" />
                    Live Tactical Action Log ({activities.length})
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">Auto-synced with MongoDB</span>
                </div>

                <div className="space-y-2.5">
                  {activities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3.5 rounded-xl border border-sentinel-darkBorder/60 bg-sentinel-darkSurface/50 flex items-start justify-between text-xs gap-3 hover:border-sentinel-cyan/40 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-sentinel-cyan shrink-0" />
                          <span className="font-bold text-white">{act.actor}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {act.action}
                          </span>
                        </div>
                        <p className="text-slate-300 text-xs pl-4">{act.description}</p>
                      </div>
                      <span className="font-mono text-[11px] text-slate-400 shrink-0">
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
