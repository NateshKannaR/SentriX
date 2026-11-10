import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import L from 'leaflet';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { incidentService } from '../services/incidentService';
import { analyzeIncidentIntelligence } from '../services/intelligenceEngine';
import { EmergencyCategory, Incident } from '../types';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { PriorityGauge } from '../components/common/PriorityGauge';
import { soundFx } from '../utils/soundEffects';
import {
  Flame,
  Car,
  HeartPulse,
  Waves,
  Building2,
  AlertTriangle,
  MapPin,
  Users,
  Camera,
  CheckCircle2,
  Copy,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Info,
  Clock,
  Phone,
  User,
  Radio,
  Download,
  Share2,
} from 'lucide-react';

const CATEGORIES: { label: EmergencyCategory; icon: typeof Flame; desc: string; color: string }[] = [
  { label: 'Fire Emergency', icon: Flame, desc: 'Commercial, residential, industrial blaze', color: 'from-orange-500 to-red-600' },
  { label: 'Road Accident', icon: Car, desc: 'Vehicular collision, highway pileup, rollover', color: 'from-amber-500 to-orange-600' },
  { label: 'Medical Emergency', icon: HeartPulse, desc: 'Cardiac, severe trauma, respiratory failure', color: 'from-rose-500 to-pink-600' },
  { label: 'Flood', icon: Waves, desc: 'Flash flood, submerged buildings, swiftwater', color: 'from-sky-500 to-blue-600' },
  { label: 'Building Collapse', icon: Building2, desc: 'Structural failure, entrapment, rubble', color: 'from-purple-500 to-indigo-600' },
  { label: 'Other Emergencies', icon: AlertTriangle, desc: 'Hazmat leak, gas rupture, power grid', color: 'from-teal-500 to-emerald-600' },
];

const LOCATION_PRESETS = [
  { name: 'MG Road Metro Station Corridor', landmark: 'Near Pillar 140', lat: 12.9756, lng: 77.6066 },
  { name: 'Outer Ring Road Bellandur Flyover', landmark: 'Near Tech Park Gate 1', lat: 12.9250, lng: 77.6820 },
  { name: 'Whitefield Industrial Zone', landmark: 'Export Promotion Park Gate 3', lat: 12.9830, lng: 77.7280 },
  { name: 'Koramangala 80-Feet Road', landmark: 'Opposite Sony Signal', lat: 12.9350, lng: 77.6240 },
  { name: 'Peenya Industrial Area Stage-2', landmark: 'Plot 48 Substation', lat: 13.0280, lng: 77.5190 },
];

export const ReportPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = (searchParams.get('category') as EmergencyCategory) || 'Fire Emergency';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EmergencyCategory>(initialCategory);
  const [location, setLocation] = useState('');
  const [landmark, setLandmark] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(12.9716);
  const [longitude, setLongitude] = useState<number | undefined>(77.5946);
  const [peopleAffected, setPeopleAffected] = useState<number>(0);
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedIncident, setSubmittedIncident] = useState<Incident | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Mini Leaflet Map Picker
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    try {
      const map = L.map(mapContainerRef.current, {
        center: [latitude || 12.9716, longitude || 77.5946],
        zoom: 13,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      const marker = L.marker([latitude || 12.9716, longitude || 77.5946], {
        draggable: true,
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        setLatitude(pos.lat);
        setLongitude(pos.lng);
      });

      map.on('click', e => {
        marker.setLatLng(e.latlng);
        setLatitude(e.latlng.lat);
        setLongitude(e.latlng.lng);
        soundFx.playBeep(500, 0.04);
      });

      markerRef.current = marker;
      mapInstanceRef.current = map;
    } catch {
      // fallback
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker position when preset is clicked
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current && latitude && longitude) {
      markerRef.current.setLatLng([latitude, longitude]);
      mapInstanceRef.current.panTo([latitude, longitude]);
    }
  }, [latitude, longitude]);

  // Real-time Intelligence Preview
  const liveIntelligence = useMemo(() => {
    return analyzeIncidentIntelligence({
      category,
      peopleAffected,
      title: title || 'Emergency Incident',
      description: description || 'Pending field brief',
      location,
    });
  }, [category, peopleAffected, title, description, location]);

  const handleSelectPreset = (preset: typeof LOCATION_PRESETS[0]) => {
    soundFx.playClick();
    setLocation(preset.name);
    setLandmark(preset.landmark);
    setLatitude(preset.lat);
    setLongitude(preset.lng);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        soundFx.playClick();
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) {
      newErrors.title = 'Incident title is required (e.g. "Commercial 3rd floor fire")';
    } else if (title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters long';
    }

    if (!description.trim()) {
      newErrors.description = 'Please describe what you see at the emergency scene';
    } else if (description.trim().length < 15) {
      newErrors.description = 'Description should be descriptive (at least 15 characters)';
    }

    if (!location.trim()) {
      newErrors.location = 'Incident location or address is required for dispatch units';
    }

    if (peopleAffected < 0) {
      newErrors.peopleAffected = 'People affected cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      soundFx.playAlert();
      return;
    }

    setIsSubmitting(true);
    soundFx.playAlert();

    setTimeout(() => {
      const newInc = incidentService.createIncident({
        title: title.trim(),
        description: description.trim(),
        category,
        location: location.trim(),
        landmark: landmark.trim() || undefined,
        latitude,
        longitude,
        peopleAffected,
        contactInformation:
          reporterName.trim() || reporterPhone.trim() || reporterEmail.trim()
            ? {
                name: reporterName.trim() || undefined,
                phone: reporterPhone.trim() || undefined,
                email: reporterEmail.trim() || undefined,
              }
            : undefined,
        imageUrl: imagePreview || undefined,
        isDemo: false,
      });

      setIsSubmitting(false);
      setSubmittedIncident(newInc);
      soundFx.playCriticalSiren();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 600);
  };

  const copyIncidentCode = () => {
    if (submittedIncident) {
      navigator.clipboard.writeText(submittedIncident.incidentCode);
      setCopiedCode(true);
      soundFx.playClick();
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#071426] text-slate-100 font-sans selection:bg-[#16C7E8]/30">
      <Header />

      <main className="flex-1 py-10 sm:py-14 hud-grid">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Post-Submission Success Screen with Emergency Ticket Receipt */}
          {submittedIncident ? (
            <div className="bg-[#0B1E38]/95 rounded-2xl sm:rounded-3xl border border-[#16C7E8]/40 shadow-2xl p-4 sm:p-10 text-center space-y-5 sm:space-y-6 animate-scaleUp glow-cyan">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 animate-bounce" />
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30">
                  OFFICIALLY LOGGED IN EMERGENCY GRID
                </span>
                <h1 className="text-xl sm:text-3xl font-black text-white mt-2">
                  Emergency Report Transmitted
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mt-2">
                  Your incident brief has been accepted by the SentriX Command Center. Field units are actively being notified.
                </p>
              </div>

              {/* Unique Incident Code Box */}
              <div className="max-w-md mx-auto p-4 sm:p-5 rounded-2xl bg-[#071426] text-white border border-[#16C7E8]/50 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-center sm:text-left">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                    Your Incident Tracking Code
                  </span>
                  <span className="font-mono text-xl sm:text-2xl font-black text-sentinel-cyan">
                    {submittedIncident.incidentCode}
                  </span>
                </div>
                <button
                  onClick={copyIncidentCode}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all border border-white/20 active:scale-95"
                >
                  <Copy className="w-4 h-4 text-sentinel-cyan" />
                  {copiedCode ? 'Copied!' : 'Copy Code'}
                </button>
              </div>

              {/* AI Triage Receipt Breakdown */}
              <div className="max-w-md mx-auto p-5 rounded-2xl bg-[#071426] border border-white/10 text-left space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    Smart Severity Assessment
                  </span>
                  <SeverityBadge severity={submittedIncident.severity} size="sm" />
                </div>
                <PriorityGauge score={submittedIncident.priorityScore} size="sm" />
                <div className="text-xs text-slate-300 space-y-1 pt-1 border-t border-white/10 font-mono">
                  <span className="font-bold text-sentinel-cyan block">Decision Engine Factors:</span>
                  <ul className="text-[11px] text-slate-400 space-y-0.5">
                    {submittedIncident.severityReasoning.map((r, i) => (
                      <li key={i}>• {r}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Citizen Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <Link
                  to={`/track?code=${submittedIncident.incidentCode}`}
                  onClick={() => soundFx.playClick()}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sentinel-cyan to-teal-400 text-sentinel-navy text-xs font-black shadow-lg shadow-sentinel-cyan/30 flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95"
                >
                  <span>Track Live Incident Status</span>
                  <ArrowRight className="w-4 h-4 text-sentinel-navy" />
                </Link>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    setSubmittedIncident(null);
                    setTitle('');
                    setDescription('');
                    setLocation('');
                    setPeopleAffected(0);
                    setImagePreview(null);
                  }}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/15"
                >
                  Submit Another Report
                </button>
              </div>
            </div>
          ) : (
            /* Emergency Submission Terminal */
            <div className="space-y-8 animate-fadeIn">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-xs font-mono font-bold uppercase tracking-wider">
                  <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                  EMERGENCY SOS INTAKE CONSOLE
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Report an Emergency Incident
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
                  Submit real-time situation parameters. The Smart Severity Engine analyzes casualties, keywords, and geography in sub-seconds.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Category Grid */}
                <div className="bg-[#0B1E38]/90 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-bold uppercase tracking-widest text-sentinel-cyan">
                      Step 1: Emergency Category <span className="text-red-400">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">6 Verticals</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                    {CATEGORIES.map(cat => {
                      const Icon = cat.icon;
                      const isSelected = category === cat.label;
                      return (
                        <button
                          key={cat.label}
                          type="button"
                          onClick={() => {
                            soundFx.playClick();
                            setCategory(cat.label);
                          }}
                          className={`p-3 sm:p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2.5 sm:gap-3 min-h-[96px] ${
                            isSelected
                              ? 'border-sentinel-red bg-red-500/15 text-white ring-2 ring-sentinel-red/30 shadow-lg shadow-sentinel-red/20 glow-red'
                              : 'border-white/10 hover:border-white/20 bg-[#071426] text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div
                              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${
                                isSelected ? 'bg-sentinel-red text-white' : 'bg-white/5 text-slate-400'
                              }`}
                            >
                              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-sentinel-red animate-pulse" />}
                          </div>
                          <div>
                            <span className="font-bold text-xs block text-white leading-tight">
                              {cat.label}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5 line-clamp-1">
                              {cat.desc}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Situation Report & Live Neural Scanner */}
                <div className="bg-[#0B1E38]/90 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl space-y-4">
                  <label className="block text-xs font-mono font-bold uppercase tracking-widest text-sentinel-cyan">
                    Step 2: Incident Title & Detailed Field Description <span className="text-red-400">*</span>
                  </label>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Incident Headline / Summary
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. 3rd Floor Restaurant Fire with Trapped Diners"
                      className={`w-full rounded-2xl border px-4 py-3 text-sm bg-[#071426] text-white placeholder-slate-500 focus:outline-none transition-all ${
                        errors.title
                          ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                          : 'border-white/15 focus:border-sentinel-cyan focus:ring-1 focus:ring-sentinel-cyan'
                      }`}
                    />
                    {errors.title && <p className="text-xs text-red-400 mt-1 font-mono">{errors.title}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Detailed Field Situation (Mention trapped people, smoke, collapse, hazards)
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Describe what you see: visible flames, structural debris, water depth, conscious/unconscious casualties, hazardous gas smells..."
                      className={`w-full rounded-2xl border px-4 py-3 text-sm bg-[#071426] text-white placeholder-slate-500 focus:outline-none transition-all ${
                        errors.description
                          ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                          : 'border-white/15 focus:border-sentinel-cyan focus:ring-1 focus:ring-sentinel-cyan'
                      }`}
                    />
                    {errors.description && (
                      <p className="text-xs text-red-400 mt-1 font-mono">{errors.description}</p>
                    )}
                  </div>
                </div>

                {/* 3. Location & Interactive Leaflet Pin-Drop Map */}
                <div className="bg-[#0B1E38]/90 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <label className="text-xs font-mono font-bold uppercase tracking-widest text-sentinel-cyan">
                      Step 3: Location & Interactive Map Pin <span className="text-red-400">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">Click on map to place pin</span>
                  </div>

                  {/* Location Presets */}
                  <div className="flex flex-wrap gap-2">
                    {LOCATION_PRESETS.map((pr, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPreset(pr)}
                        className="text-xs px-3 py-1.5 rounded-xl bg-[#071426] hover:bg-white/10 text-slate-300 border border-white/10 font-mono flex items-center gap-1.5 transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5 text-sentinel-cyan" />
                        <span>{pr.name.split(' ')[0]} {pr.name.split(' ')[1]}</span>
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Address or Landmark Description
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder="e.g. Phoenix Mall Block B, MG Road Metro Corridor"
                        className={`w-full rounded-2xl border pl-11 pr-4 py-3 text-sm bg-[#071426] text-white placeholder-slate-500 focus:outline-none transition-all ${
                          errors.location
                            ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                            : 'border-white/15 focus:border-sentinel-cyan focus:ring-1 focus:ring-sentinel-cyan'
                        }`}
                      />
                    </div>
                    {errors.location && (
                      <p className="text-xs text-red-400 mt-1 font-mono">{errors.location}</p>
                    )}
                  </div>

                  {/* Leaflet Pin-Drop Mini Map Canvas */}
                  <div className="rounded-2xl overflow-hidden border border-white/15 h-56 relative shadow-inner">
                    <div ref={mapContainerRef} className="w-full h-full" />
                    <div className="absolute top-2 left-2 z-[1000] bg-[#071426]/90 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-xl border border-white/10 text-[10px] font-mono text-slate-300">
                      📍 Click or drag marker to set coordinates
                    </div>
                  </div>

                  {/* Coordinates pill */}
                  {latitude && longitude && (
                    <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] font-mono text-slate-400 px-1">
                      <span>Coordinates: {latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
                      <span className="text-sentinel-cyan font-bold">Geocoded</span>
                    </div>
                  )}
                </div>

                {/* 4. Casualties & Live AI Triage Preview */}
                <div className="bg-[#0B1E38]/90 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl space-y-4">
                  <label className="block text-xs font-mono font-bold uppercase tracking-widest text-sentinel-cyan">
                    Step 4: People Affected & Casualty Triage <span className="text-red-400">*</span>
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-center">
                    {/* Stepper */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">
                        Estimated People Injured, Trapped, or at Risk
                      </label>
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playClick();
                            setPeopleAffected(Math.max(0, peopleAffected - 1));
                          }}
                          className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#071426] hover:bg-white/10 border border-white/15 text-white font-black text-xl flex items-center justify-center transition-colors active:scale-95 shrink-0"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={peopleAffected}
                          onChange={e => setPeopleAffected(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-20 sm:w-24 text-center font-mono font-black text-xl sm:text-2xl rounded-2xl border border-white/15 bg-[#071426] text-white py-2 focus:outline-none focus:border-sentinel-cyan"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playClick();
                            setPeopleAffected(peopleAffected + 1);
                          }}
                          className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#071426] hover:bg-white/10 border border-white/15 text-white font-black text-xl flex items-center justify-center transition-colors active:scale-95 shrink-0"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2">
                        Includes trapped individuals, conscious/unconscious, and critical patients.
                      </p>
                    </div>

                    {/* Live AI Decision Support Preview */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#071426] border border-[#16C7E8]/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase text-sentinel-cyan font-bold flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 animate-pulse shrink-0" /> Live AI Triage Preview
                        </span>
                        <SeverityBadge severity={liveIntelligence.recommendedSeverity} size="sm" pulsing={false} />
                      </div>
                      <PriorityGauge score={liveIntelligence.priorityScore} size="sm" />
                      <p className="text-[11px] font-mono text-slate-300 line-clamp-2">
                        {liveIntelligence.severityReasoning[0] || 'Evaluating incident metrics...'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 5. Optional Reporter Information & Photo */}
                <div className="bg-[#0B1E38]/90 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <label className="text-xs font-mono font-bold uppercase tracking-widest text-sentinel-cyan">
                      Step 5: Optional Contact Information & Scene Photo
                    </label>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 w-fit">
                      NON-MANDATORY
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Your Name (Optional)
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={reporterName}
                          onChange={e => setReporterName(e.target.value)}
                          placeholder="Rajesh Kumar"
                          className="w-full rounded-2xl border border-white/15 bg-[#071426] pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sentinel-cyan"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Callback Phone (Optional)
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={reporterPhone}
                          onChange={e => setReporterPhone(e.target.value)}
                          placeholder="+91 98450 12345"
                          className="w-full rounded-2xl border border-white/15 bg-[#071426] pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sentinel-cyan"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Scene Photo Evidence (Optional)
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer px-4 py-2.5 rounded-2xl bg-[#071426] hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/15 flex items-center gap-2 transition-colors">
                        <Camera className="w-4 h-4 text-sentinel-cyan" />
                        <span>Upload Scene Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      {imagePreview && (
                        <div className="flex items-center gap-3">
                          <img
                            src={imagePreview}
                            alt="Scene Preview"
                            className="w-12 h-12 object-cover rounded-xl border border-white/20"
                          />
                          <button
                            type="button"
                            onClick={() => setImagePreview(null)}
                            className="text-xs text-red-400 hover:underline font-mono"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-sentinel-red to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-black text-base shadow-2xl shadow-sentinel-red/40 transition-all flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99] border border-red-400/40 glow-red disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2.5">
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Transmitting to Emergency War Room...
                      </span>
                    ) : (
                      <>
                        <ShieldAlert className="w-5 h-5" />
                        <span>SUBMIT EMERGENCY REPORT NOW</span>
                      </>
                    )}
                  </button>
                  <p className="text-center text-[11px] font-mono text-slate-500 mt-2">
                    False emergency reporting is punishable under Disaster Management Act provisions.
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
