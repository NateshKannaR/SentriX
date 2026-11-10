import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';
import { incidentService } from '../services/incidentService';
import { Incident } from '../types';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { soundEffects } from '../utils/soundEffects';
import { getLiveLocation, LiveLocationResult, calculateDistanceKm } from '../utils/geolocation';
import { SAFE_MUSTER_ZONES } from '../data/safeZones';
import {
  EMERGENCY_WHATSAPP_DISPLAY,
  dispatchDirectEmergencyWhatsApp,
} from '../utils/whatsappSos';
import {
  User,
  ShieldAlert,
  Clock,
  MapPin,
  Send,
  PlusCircle,
  Radio,
  HeartPulse,
  Phone,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Sparkles,
  RefreshCw,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

export const CitizenPortalPage: React.FC = () => {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  const [incidents, setIncidents] = useState<Incident[]>(() => incidentService.getIncidents());
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('');
  const [updateNote, setUpdateNote] = useState('');
  const [updatedCasualties, setUpdatedCasualties] = useState<number | ''>('');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [userLocation, setUserLocation] = useState<LiveLocationResult | null>(null);

  // Subscribe to real-time changes
  useEffect(() => {
    const unsub = incidentService.subscribe(() => {
      setIncidents(incidentService.getIncidents());
    });
    getLiveLocation().then(loc => setUserLocation(loc));
    return () => unsub();
  }, []);

  // Filter incidents for this citizen or show active incidents in their zone
  const userPhone = session.user?.phone || '+91 7806869597';
  const myIncidents = incidents.filter(
    i => i.contactInformation?.phone === userPhone || i.contactInformation?.name?.toLowerCase().includes('natesh')
  );
  const displayIncidents = myIncidents.length > 0 ? myIncidents : incidents.slice(0, 4);

  // Select first incident by default
  useEffect(() => {
    if (!selectedIncidentId && displayIncidents.length > 0) {
      setSelectedIncidentId(displayIncidents[0].id);
    }
  }, [displayIncidents, selectedIncidentId]);

  const selectedIncident = incidents.find(i => i.id === selectedIncidentId);

  const handleSendUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident || !updateNote.trim()) {
      soundEffects.playAlert();
      return;
    }

    setIsTransmitting(true);
    soundEffects.playClick();

    setTimeout(() => {
      incidentService.addCitizenUpdate(selectedIncident.id, {
        note: updateNote.trim(),
        reporterName: session.user?.name || 'Verified Citizen',
        peopleAffected: updatedCasualties !== '' ? Number(updatedCasualties) : undefined,
      });

      soundEffects.playSuccess();
      setIsTransmitting(false);
      setSuccessMsg(`Update transmitted instantly to Command Center for incident ${selectedIncident.incidentCode}!`);
      setUpdateNote('');
      setUpdatedCasualties('');
      setTimeout(() => setSuccessMsg(''), 6000);
    }, 400);
  };

  const handleEmergencySos = () => {
    soundEffects.playCriticalSiren();
    dispatchDirectEmergencyWhatsApp({
      latitude: userLocation?.latitude || 12.9716,
      longitude: userLocation?.longitude || 77.5946,
      address: userLocation?.address,
      accuracy: userLocation?.accuracy,
      incidentType: 'CITIZEN PORTAL ONE-TAP SOS',
      customNote: `Citizen ${session.user?.name || 'Verified User'} (${userPhone}) in emergency distress!`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050C16] text-white font-sans selection:bg-cyan-500/30">
      <Header />

      <main className="flex-1 py-8 sm:py-10 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Citizen Welcome Header */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#091526] via-[#0A1B30] to-[#071322] border border-cyan-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 text-black flex items-center justify-center font-black text-xl shadow-lg shadow-cyan-500/30 shrink-0">
              <User className="w-8 h-8 text-black" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-mono font-bold border border-cyan-500/40">
                  CITIZEN PROTECTION MATRIX
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> VERIFIED CITIZEN
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
                Welcome, {session.user?.name || 'Natesh Kanna'}
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                Emergency Phone: <span className="text-cyan-400 font-bold">{userPhone}</span> • Blood Group:{' '}
                <span className="text-rose-400 font-bold">{session.user?.bloodGroup || 'O+'}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={handleEmergencySos}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 glow-emerald active:scale-95 transition-all"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>1-Tap WhatsApp SOS ({EMERGENCY_WHATSAPP_DISPLAY})</span>
            </button>

            <Link
              to="/report"
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 glow-red active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>File Emergency Report</span>
            </Link>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title="Sign Out"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-3 shadow-lg animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-bold">{successMsg}</span>
          </div>
        )}

        {/* Grid: Left = Incidents List, Right = Live Telemetry & Instant Update Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (5 cols): Reported Emergencies */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                Active Incident Transmissions
              </h2>
              <span className="text-xs font-mono text-cyan-400 font-bold">
                {displayIncidents.length} Monitored
              </span>
            </div>

            <div className="space-y-3">
              {displayIncidents.map(inc => {
                const isSelected = inc.id === selectedIncidentId;
                return (
                  <div
                    key={inc.id}
                    onClick={() => {
                      soundEffects.playClick();
                      setSelectedIncidentId(inc.id);
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#0A1A2E] border-cyan-500 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500/40'
                        : 'bg-[#071322] hover:bg-[#09182A] border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-black text-cyan-400">
                        {inc.incidentCode}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <SeverityBadge severity={inc.severity} size="sm" />
                        <StatusBadge status={inc.status} size="sm" />
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-white mt-2 line-clamp-1">
                      {inc.title}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-mono">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="truncate">{inc.location}</span>
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Casualties: <strong className="text-white">{inc.peopleAffected}</strong></span>
                      <span className="text-cyan-400 font-semibold flex items-center gap-1">
                        Select to Update <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column (7 cols): Instant Live Update Console */}
          <div className="lg:col-span-7 space-y-4">
            {selectedIncident ? (
              <div className="p-5 sm:p-6 rounded-3xl bg-[#081220] border border-cyan-500/30 shadow-2xl space-y-5">
                {/* Active Incident Brief Header */}
                <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
                      Target Operational Incident
                    </span>
                    <h3 className="text-lg font-black text-white mt-0.5">
                      {selectedIncident.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Code: <strong className="text-cyan-400">{selectedIncident.incidentCode}</strong> • Location: {selectedIncident.location}
                    </p>
                  </div>
                  <Link
                    to={`/track?code=${selectedIncident.incidentCode}`}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400 text-xs font-mono flex items-center gap-1 border border-white/10 transition-colors"
                  >
                    <span>Track Live</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Instant Citizen Live Update Form */}
                <form onSubmit={handleSendUpdate} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Transmit Live Update to Incident Commanders
                    </label>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                      INSTANT CROSS-TAB SYNC
                    </span>
                  </div>

                  <div>
                    <textarea
                      rows={3}
                      value={updateNote}
                      onChange={e => setUpdateNote(e.target.value)}
                      required
                      placeholder="e.g. Fire has spread to 3rd floor. Two more people are trapped near the rear balcony. Heavy smoke visible."
                      className="w-full p-3.5 rounded-2xl bg-[#050C16] border border-white/10 text-white placeholder-slate-500 text-xs font-mono focus:border-cyan-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1">
                        Updated Casualties / People in Distress
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={updatedCasualties}
                        onChange={e => setUpdatedCasualties(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder={`Current: ${selectedIncident.peopleAffected}`}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#050C16] border border-white/10 text-white placeholder-slate-500 text-xs font-mono focus:border-cyan-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="submit"
                        disabled={isTransmitting || !updateNote.trim()}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-teal-500 hover:from-cyan-500 hover:to-teal-400 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all active:scale-95"
                      >
                        <Send className="w-4 h-4 shrink-0" />
                        <span>{isTransmitting ? 'Transmitting Telemetry...' : 'Transmit Update to Admin'}</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    💡 This update is broadcast in real time across the SentriX network. The Admin Command Center will chime and display your report within sub-seconds.
                  </p>
                </form>

                {/* Timeline Activities Feed */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    Incident Activity & Dispatch Timeline
                  </h4>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {incidentService.getActivities(selectedIncident.id).map(act => (
                      <div
                        key={act.id}
                        className="p-3 rounded-xl bg-[#050C16] border border-white/5 text-xs font-mono space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="text-cyan-400 font-bold">{act.actor}</span>
                          <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-slate-200">{act.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-[#081220] border border-white/10 text-center space-y-3">
                <ShieldAlert className="w-10 h-10 text-slate-500 mx-auto" />
                <h3 className="text-sm font-bold text-white">No Incident Selected</h3>
                <p className="text-xs text-slate-400">
                  Select an incident from the left to view timeline status and transmit live updates.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
