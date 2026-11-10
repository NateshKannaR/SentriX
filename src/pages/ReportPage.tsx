import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { incidentService } from '../services/incidentService';
import { analyzeIncidentIntelligence } from '../services/intelligenceEngine';
import { EmergencyCategory, Incident } from '../types';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { PriorityGauge } from '../components/common/PriorityGauge';
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
} from 'lucide-react';

const CATEGORIES: { label: EmergencyCategory; icon: typeof Flame; desc: string }[] = [
  { label: 'Fire Emergency', icon: Flame, desc: 'Commercial, residential, industrial blaze' },
  { label: 'Road Accident', icon: Car, desc: 'Vehicular collision, highway pileup, rollover' },
  { label: 'Medical Emergency', icon: HeartPulse, desc: 'Cardiac, severe trauma, respiratory failure' },
  { label: 'Flood', icon: Waves, desc: 'Flash flood, submerged buildings, swiftwater' },
  { label: 'Building Collapse', icon: Building2, desc: 'Structural failure, entrapment, rubble' },
  { label: 'Other Emergencies', icon: AlertTriangle, desc: 'Hazmat leak, gas rupture, power grid' },
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
  const navigate = useNavigate();

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
      newErrors.description = 'Please provide details of the emergency situation';
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
    if (!validate()) return;

    setIsSubmitting(true);

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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 600);
  };

  const copyIncidentCode = () => {
    if (submittedIncident) {
      navigator.clipboard.writeText(submittedIncident.incidentCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-sentinel-bgLight text-slate-800 font-sans">
      <Header />

      <main className="flex-1 py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Post-Submission Success Screen */}
          {submittedIncident ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-10 text-center space-y-6 animate-scaleUp">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Incident Officially Registered
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                  Emergency Report Dispatched
                </h1>
                <p className="text-sm text-slate-600 max-w-md mx-auto mt-2">
                  Your report has been routed to the Sentinel 360 Emergency Command Center. Field units are being notified.
                </p>
              </div>

              {/* Unique Incident Code Box */}
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-sentinel-navy text-white border border-sentinel-cyan/40 shadow-lg flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                    Your Incident Tracking Code
                  </span>
                  <span className="font-mono text-xl sm:text-2xl font-black text-sentinel-cyan">
                    {submittedIncident.incidentCode}
                  </span>
                </div>
                <button
                  onClick={copyIncidentCode}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/20"
                >
                  <Copy className="w-4 h-4 text-sentinel-cyan" />
                  {copiedCode ? 'Copied!' : 'Copy Code'}
                </button>
              </div>

              {/* Severity & Triage Assessment Confirmation */}
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Smart Severity Assessment
                  </span>
                  <SeverityBadge severity={submittedIncident.severity} size="sm" />
                </div>
                <PriorityGauge score={submittedIncident.priorityScore} size="sm" />
                <div className="text-xs text-slate-600 space-y-1">
                  <span className="font-semibold block text-slate-700">Triage Decision Factors:</span>
                  <ul className="list-disc list-inside text-[11px] text-slate-500 space-y-0.5">
                    {submittedIncident.severityReasoning.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Safety Instructions */}
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left text-xs text-amber-800 space-y-1">
                <span className="font-bold flex items-center gap-1 text-amber-900">
                  <ShieldAlert className="w-4 h-4 text-amber-600" /> Immediate Safety Precautions:
                </span>
                <p>• Keep clear of moving emergency apparatus and keep access lanes open.</p>
                <p>• If safe to do so, guide responders to the exact entrance or casualty point.</p>
                <p>• Do not re-enter hazardous smoke, flood, or structurally compromised zones.</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <Link
                  to={`/track?code=${submittedIncident.incidentCode}`}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sentinel-navy text-white text-xs font-bold hover:bg-sentinel-darkBlue flex items-center justify-center gap-2 shadow"
                >
                  <span>Track Live Incident Status</span>
                  <ArrowRight className="w-4 h-4 text-sentinel-cyan" />
                </Link>

                <button
                  onClick={() => {
                    setSubmittedIncident(null);
                    setTitle('');
                    setDescription('');
                    setLocation('');
                    setPeopleAffected(0);
                    setImagePreview(null);
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Submit Another Report
                </button>
              </div>
            </div>
          ) : (
            /* Emergency Submission Form */
            <div className="space-y-8">
              {/* Top Banner */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-sentinel-red text-xs font-bold uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4" />
                  Citizen Emergency Dispatch Portal
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  Report an Emergency Incident
                </h1>
                <p className="text-sm text-slate-600 max-w-xl mx-auto">
                  Provide essential field information. Your report is instantly evaluated by our Smart Severity Engine and placed into the priority dispatch queue.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. Category Selector */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Step 1: Emergency Category <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {CATEGORIES.map(cat => {
                      const Icon = cat.icon;
                      const isSelected = category === cat.label;
                      return (
                        <button
                          key={cat.label}
                          type="button"
                          onClick={() => setCategory(cat.label)}
                          className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                            isSelected
                              ? 'border-sentinel-red bg-red-500/5 text-sentinel-navy ring-2 ring-sentinel-red/20 shadow-sm'
                              : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                isSelected ? 'bg-sentinel-red text-white' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            {isSelected && <span className="w-2 h-2 rounded-full bg-sentinel-red" />}
                          </div>
                          <div>
                            <span className="font-bold text-xs block text-slate-900 leading-tight">
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

                {/* 2. Incident Specifics */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Step 2: Incident Title & Detailed Field Synopsis <span className="text-red-500">*</span>
                  </label>

                  {/* Title */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Incident Headline / Short Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. 3rd Floor Restaurant Fire with Trapped Diners"
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                        errors.title
                          ? 'border-red-500 focus:ring-red-200'
                          : 'border-slate-200 focus:border-sentinel-cyan focus:ring-sentinel-cyan/20'
                      }`}
                    />
                    {errors.title && (
                      <p className="text-xs text-red-600 mt-1">{errors.title}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Detailed Situation Report (Include trapped people, smoke, collapse, hazards)
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Describe what you see: visible flames, structural damage, water levels, conscious/unconscious casualties, hazardous smells..."
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                        errors.description
                          ? 'border-red-500 focus:ring-red-200'
                          : 'border-slate-200 focus:border-sentinel-cyan focus:ring-sentinel-cyan/20'
                      }`}
                    />
                    {errors.description && (
                      <p className="text-xs text-red-600 mt-1">{errors.description}</p>
                    )}
                  </div>
                </div>

                {/* 3. Location & Coordinates */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Step 3: Location & Spatial Landmarks <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">Quick presets available</span>
                  </div>

                  {/* Location Presets */}
                  <div className="flex flex-wrap gap-2">
                    {LOCATION_PRESETS.map((pr, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPreset(pr)}
                        className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-medium flex items-center gap-1 transition-colors"
                      >
                        <MapPin className="w-3 h-3 text-sentinel-cyan" />
                        <span>{pr.name.split(' ')[0]} {pr.name.split(' ')[1]}</span>
                      </button>
                    ))}
                  </div>

                  {/* Address Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Street Address or Precise Location
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder="e.g. Phoenix Mall Block B, MG Road Metro Corridor"
                        className={`w-full rounded-xl border pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                          errors.location
                            ? 'border-red-500 focus:ring-red-200'
                            : 'border-slate-200 focus:border-sentinel-cyan focus:ring-sentinel-cyan/20'
                        }`}
                      />
                    </div>
                    {errors.location && (
                      <p className="text-xs text-red-600 mt-1">{errors.location}</p>
                    )}
                  </div>

                  {/* Landmark & Coords */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Prominent Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        value={landmark}
                        onChange={e => setLandmark(e.target.value)}
                        placeholder="e.g. Near Metro Pillar 142"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sentinel-cyan"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Latitude (Optional)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={latitude ?? ''}
                        onChange={e => setLatitude(parseFloat(e.target.value) || undefined)}
                        placeholder="12.9716"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-sentinel-cyan"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Longitude (Optional)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={longitude ?? ''}
                        onChange={e => setLongitude(parseFloat(e.target.value) || undefined)}
                        placeholder="77.5946"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-sentinel-cyan"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Casualties & Live Intelligence Triage Preview */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Step 4: People Affected & Casualty Triage <span className="text-red-500">*</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                    {/* Stepper */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        Estimated Number of People Injured or Trapped
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setPeopleAffected(Math.max(0, peopleAffected - 1))}
                          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-lg flex items-center justify-center transition-colors"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={peopleAffected}
                          onChange={e => setPeopleAffected(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-24 text-center font-mono font-bold text-xl rounded-xl border border-slate-200 py-1.5 text-slate-900 focus:outline-none focus:border-sentinel-cyan"
                        />
                        <button
                          type="button"
                          onClick={() => setPeopleAffected(peopleAffected + 1)}
                          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-lg flex items-center justify-center transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Count includes injured, trapped, or persons in immediate life peril.
                      </p>
                    </div>

                    {/* Live Decision Support Preview */}
                    <div className="p-4 rounded-xl bg-sentinel-navy text-white border border-sentinel-cyan/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase text-sentinel-cyan font-bold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> AI Triage Preview
                        </span>
                        <SeverityBadge severity={liveIntelligence.recommendedSeverity} size="sm" pulsing={false} />
                      </div>
                      <PriorityGauge score={liveIntelligence.priorityScore} size="sm" />
                      <p className="text-[11px] text-slate-300 line-clamp-2">
                        {liveIntelligence.severityReasoning[0] || 'Evaluating incident metrics...'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 5. Optional Reporter Information & Photo */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Step 5: Contact Info & Photo Evidence (Optional)
                    </label>
                    <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-mono font-semibold">
                      Non-Mandatory
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Your Name (Optional)
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={reporterName}
                          onChange={e => setReporterName(e.target.value)}
                          placeholder="Rajesh Kumar"
                          className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sentinel-cyan"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Callback Phone (Optional)
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={reporterPhone}
                          onChange={e => setReporterPhone(e.target.value)}
                          placeholder="+91 98450 12345"
                          className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sentinel-cyan"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Photo upload input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Scene Photo Attachment (Optional)
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 flex items-center gap-1.5 transition-colors">
                        <Camera className="w-4 h-4 text-slate-500" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      {imagePreview && (
                        <div className="flex items-center gap-2">
                          <img
                            src={imagePreview}
                            alt="Incident Scene"
                            className="w-10 h-10 object-cover rounded-lg border border-slate-300"
                          />
                          <button
                            type="button"
                            onClick={() => setImagePreview(null)}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-2xl bg-sentinel-red hover:bg-red-600 text-white font-extrabold text-base shadow-xl shadow-sentinel-red/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Transmitting to Command Center...
                      </span>
                    ) : (
                      <>
                        <ShieldAlert className="w-5 h-5" />
                        <span>SUBMIT EMERGENCY REPORT NOW</span>
                      </>
                    )}
                  </button>
                  <p className="text-center text-[11px] text-slate-400 mt-2">
                    False emergency reporting is punishable under disaster management regulations.
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
