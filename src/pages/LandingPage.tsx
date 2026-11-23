import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { incidentService } from '../services/incidentService';
import { analyzeIncidentIntelligence } from '../services/intelligenceEngine';
import { DashboardMetrics, EmergencyCategory } from '../types';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { PriorityGauge } from '../components/common/PriorityGauge';
import { soundFx } from '../utils/soundEffects';
import {
  ShieldAlert,
  Search,
  Radio,
  LayoutDashboard,
  Flame,
  Car,
  HeartPulse,
  Waves,
  Building2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle2,
  Activity,
  Copy,
  Zap,
  Users,
  Terminal,
  Cpu,
  Layers,
  ChevronRight,
  Mic,
  MicOff,
  Navigation,
  Languages,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { speechRecognition, nlpClassifyEmergency } from '../utils/speechAI';

export const LandingPage: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const [trackingCode, setTrackingCode] = useState('');
  const [metrics, setMetrics] = useState<DashboardMetrics>(() => incidentService.getDashboardMetrics());

  // Interactive Live Playground on the Hero
  const [playgroundCategory, setPlaygroundCategory] = useState<EmergencyCategory>('Fire Emergency');
  const [playgroundText, setPlaygroundText] = useState('Multiple workers trapped on 3rd floor with heavy toxic smoke');
  const [playgroundCasualties, setPlaygroundCasualties] = useState(6);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceSpeechError, setVoiceSpeechError] = useState<string | null>(null);

  const handleTogglePlaygroundVoice = () => {
    if (isVoiceListening) {
      speechRecognition.stop();
      setIsVoiceListening(false);
      return;
    }

    if (!speechRecognition.isSupported()) {
      setVoiceSpeechError('Voice dictation not supported in this browser. Try Chrome/Edge.');
      return;
    }

    setVoiceSpeechError(null);
    setIsVoiceListening(true);
    soundFx.playRadioBeep();

    speechRecognition.start(
      (transcript: string, isFinal: boolean) => {
        setPlaygroundText(transcript);
        const classified = nlpClassifyEmergency(transcript);
        if (classified.detectedCategory) {
          setPlaygroundCategory(classified.detectedCategory);
        }
        if (classified.extractedCasualties !== undefined) {
          setPlaygroundCasualties(classified.extractedCasualties);
        }
        if (isFinal) {
          setIsVoiceListening(false);
          soundFx.playSuccess();
        }
      },
      (error: string) => {
        setVoiceSpeechError(error);
        setIsVoiceListening(false);
      },
      currentLanguage.speechLocale
    );
  };

  useEffect(() => {
    const unsub = incidentService.subscribe(() => {
      setMetrics(incidentService.getDashboardMetrics());
    });
    return () => unsub();
  }, []);

  const livePlaygroundScore = useMemo(() => {
    return analyzeIncidentIntelligence({
      category: playgroundCategory,
      peopleAffected: playgroundCasualties,
      title: 'Interactive Intelligence Triage Test',
      description: playgroundText,
    });
  }, [playgroundCategory, playgroundText, playgroundCasualties]);

  const categories = [
    {
      name: 'Fire Emergency' as const,
      icon: Flame,
      color: 'from-orange-500 to-red-600',
      badgeColor: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
      tag: 'Thermal & Smoke Hazard',
      desc: 'High-rise structural fires, chemical godown conflagrations, active thermal spread.',
    },
    {
      name: 'Road Accident' as const,
      icon: Car,
      color: 'from-amber-500 to-orange-600',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      tag: 'Trauma & Highway Pileup',
      desc: 'Expressway multi-vehicle pileups, fuel tankers overturned, arterial lane blockages.',
    },
    {
      name: 'Medical Emergency' as const,
      icon: HeartPulse,
      color: 'from-rose-500 to-pink-600',
      badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      tag: 'Life-Critical Care',
      desc: 'Acute cardiac arrest, respiratory failure, mass trauma resuscitation.',
    },
    {
      name: 'Flood' as const,
      icon: Waves,
      color: 'from-sky-500 to-blue-600',
      badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
      tag: 'Hydrological Disaster',
      desc: 'Flash floods, lake bund breaches, submerged housing colonies, swiftwater rescue.',
    },
    {
      name: 'Building Collapse' as const,
      icon: Building2,
      color: 'from-purple-500 to-indigo-600',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      tag: 'Structural Failure',
      desc: 'Slab failures, rubble entrapment, NDRF seismic search and canine operations.',
    },
    {
      name: 'Other Emergencies' as const,
      icon: AlertTriangle,
      color: 'from-teal-500 to-emerald-600',
      badgeColor: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
      tag: 'Hazmat & Gas Leaks',
      desc: 'Pressurized gas pipeline ruptures, toxic chemical solvent leaks, electrical grid arcs.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#071426] text-slate-100 font-sans selection:bg-[#16C7E8]/30">
      <Header />

      <main>
        <section className="relative overflow-hidden border-b border-white/10 bg-[#081322]">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(22,199,232,0.15),transparent_58%)]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.2fr_1fr] lg:gap-16 lg:px-8">
            <div>
              <p className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.19em] text-cyan-300">
                <ShieldAlert className="h-4 w-4" aria-hidden="true" /> Emergency response portal
              </p>
              <h1 className="max-w-xl text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Report an emergency. <span className="text-cyan-300">Follow the response.</span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-300 sm:text-lg">
                Send an incident report with its location, then use your incident code to check its status.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Link to="/report" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-red-600 px-5 font-semibold text-white hover:bg-red-500">
                  <Radio className="h-5 w-5" aria-hidden="true" /> Report an emergency
                </Link>
                <Link to="/citizen" className="inline-flex min-h-12 items-center gap-2 text-sm font-semibold text-slate-200 hover:text-cyan-300">
                  Citizen tools <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <form
              className="rounded-3xl border border-cyan-400/20 bg-[#102038] p-5 shadow-2xl shadow-black/25 sm:p-8"
              onSubmit={event => {
                event.preventDefault();
                const code = trackingCode.trim().toUpperCase();
                if (code) navigate({ pathname: '/track', search: new URLSearchParams({ code }).toString() });
              }}
            >
              <Search className="mb-5 h-6 w-6 text-cyan-300" aria-hidden="true" />
              <h2 className="text-2xl font-bold text-white">Track an incident</h2>
              <p className="mt-2 text-sm text-slate-300" id="home-track-help">Use the code shown after you submitted your report.</p>
              <label htmlFor="home-track-code" className="mt-6 block text-sm font-medium">Incident code</label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                  id="home-track-code"
                  aria-describedby="home-track-help"
                  value={trackingCode}
                  onChange={event => setTrackingCode(event.target.value)}
                  required
                  autoCapitalize="characters"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="STX-2026-1001"
                  className="min-w-0 flex-1 rounded-xl border border-white/15 bg-[#081322] px-3 py-3 font-mono text-sm uppercase text-white placeholder:text-slate-500"
                />
                <button type="submit" disabled={!trackingCode.trim()} className="rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-200 disabled:opacity-50">
                  Track
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#0a182a]">
          <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 md:grid-cols-[1fr_auto] md:items-center lg:px-8">
            <dl className="grid grid-cols-3 gap-3">
              <div><dt className="text-xs text-slate-400">Incidents</dt><dd className="mt-1 text-xl font-bold tabular-nums">{metrics.total}</dd></div>
              <div><dt className="text-xs text-slate-400">Critical incidents</dt><dd className="mt-1 text-xl font-bold tabular-nums text-red-300">{metrics.critical}</dd></div>
              <div><dt className="text-xs text-slate-400">Average priority</dt><dd className="mt-1 text-xl font-bold tabular-nums text-cyan-300">{metrics.avgPriorityScore}</dd></div>
            </dl>
            <Link to="/admin/dashboard" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold hover:bg-white/5">
              <LayoutDashboard className="h-4 w-4 text-cyan-300" aria-hidden="true" /> Command center
              <ArrowRight className="ml-auto h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="border-b border-white/10 py-12 sm:py-16">
          <div className="mx-auto grid max-w-7xl items-start gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:px-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white">Try the triage simulator</h2>
              <p className="mt-3 max-w-md leading-relaxed text-slate-300">Change the scenario to see how the severity and priority score respond. The simulator runs without submitting an incident.</p>
            </div>
              {/* Right: Interactive Live AI Triage Playground */}
              <div className="min-w-0">
                <div className="relative rounded-2xl sm:rounded-3xl bg-[#0B1E38]/90 border border-[#16C7E8]/30 p-4 sm:p-6 shadow-2xl backdrop-blur-2xl space-y-4 sm:space-y-5 overflow-hidden">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 sm:pb-4">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-sentinel-cyan/20 border border-sentinel-cyan/40 text-sentinel-cyan flex items-center justify-center shrink-0">
                        <Cpu className="w-4 h-4 animate-spin-slow" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                          Severity Engine Simulator
                        </h3>
                        <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono">Live rule-based decision support</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-sentinel-cyan/15 text-sentinel-cyan border border-sentinel-cyan/30 shrink-0">
                      INTERACTIVE
                    </span>
                  </div>

                  {/* Playground Controls */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <label htmlFor="triage-category" className="block text-[10px] uppercase font-mono font-bold text-slate-400 mb-1">
                        1. Test Emergency Category
                      </label>
                      <select
                        id="triage-category"
                        value={playgroundCategory}
                        onChange={e => setPlaygroundCategory(e.target.value as EmergencyCategory)}
                        className="w-full bg-[#071426] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-sentinel-cyan font-semibold"
                      >
                        <option value="Fire Emergency">Fire Emergency (High Base Risk)</option>
                        <option value="Building Collapse">Building Collapse (Entrapment Risk)</option>
                        <option value="Road Accident">Road Accident (Expressway Hazard)</option>
                        <option value="Medical Emergency">Medical Emergency (Acute Window)</option>
                        <option value="Flood">Flood (Rising Water Hazard)</option>
                        <option value="Other Emergencies">Other Emergencies</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="triage-casualties" className="text-[10px] uppercase font-mono font-bold text-slate-400">
                          2. Casualties Reported: <span className="text-white font-bold">{playgroundCasualties}</span>
                        </label>
                        <span className="text-[10px] text-slate-500 font-mono">Slide to test</span>
                      </div>
                      <input
                        id="triage-casualties"
                        type="range"
                        min="0"
                        max="20"
                        value={playgroundCasualties}
                        onChange={e => setPlaygroundCasualties(parseInt(e.target.value))}
                        className="w-full accent-sentinel-cyan cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="triage-description" className="text-[10px] uppercase font-mono font-bold text-slate-400">
                          3. Incident Keywords & Context
                        </label>
                        <button
                          type="button"
                          onClick={handleTogglePlaygroundVoice}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all shadow-sm ${
                            isVoiceListening
                              ? 'bg-red-500 text-white animate-pulse shadow-red-500/50'
                              : 'bg-sentinel-cyan/15 hover:bg-sentinel-cyan/25 text-sentinel-cyan border border-sentinel-cyan/30'
                          }`}
                          title="Dictate an emergency scenario using speech recognition"
                        >
                          {isVoiceListening ? (
                            <>
                              <MicOff className="w-3 h-3 animate-spin" />
                              <span>Stop Voice Triage</span>
                            </>
                          ) : (
                            <>
                              <Mic className="w-3 h-3 text-sentinel-cyan" />
                              <span>🎙️ Voice Dictate</span>
                            </>
                          )}
                        </button>
                      </div>
                      <input
                        id="triage-description"
                        type="text"
                        value={playgroundText}
                        onChange={e => setPlaygroundText(e.target.value)}
                        placeholder="e.g. Trapped under building debris with severe trauma..."
                        className="w-full bg-[#071426] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-sentinel-cyan placeholder-slate-500"
                      />
                      {isVoiceListening && (
                        <p className="mt-1 text-[10px] text-sentinel-cyan font-mono animate-pulse flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                          Listening in {currentLanguage.name}... Speak scenario (e.g. &quot;Huge fire with 8 people trapped&quot;)
                        </p>
                      )}
                      {voiceSpeechError && (
                        <p className="mt-1 text-[10px] text-red-400 font-mono">{voiceSpeechError}</p>
                      )}
                    </div>
                  </div>

                  {/* Live Output Box */}
                  <div className="p-4 rounded-2xl bg-[#071426] border border-[#16C7E8]/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        Evaluated Triage Outcome
                      </span>
                      <SeverityBadge severity={livePlaygroundScore.recommendedSeverity} size="sm" />
                    </div>

                    <PriorityGauge score={livePlaygroundScore.priorityScore} size="sm" />

                    <div className="text-[11px] text-slate-300 font-mono space-y-1 pt-1 border-t border-white/10">
                      <span className="text-sentinel-cyan font-bold block">Engine Match Reasons:</span>
                      {livePlaygroundScore.severityReasoning.slice(0, 2).map((r, i) => (
                        <p key={i} className="text-slate-400 text-[10px] truncate">• {r}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </section>

        {/* Mandatory Emergency Categories Bento Grid */}
        <section className="py-20 bg-[#071426] border-b border-white/10 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-sentinel-cyan bg-[#16C7E8]/10 px-3.5 py-1 rounded-full border border-[#16C7E8]/30">
                Mandatory Challenge Verticals
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                One Unified Platform. All 6 Incident Categories.
              </h2>
              <p className="text-sm text-slate-400 max-w-xl mx-auto">
                Every disaster category features tailored assessment parameters, priority rules, and dedicated tactical dispatch paths.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat, idx) => {
                const Icon = cat.icon;
                const countForCat = metrics.byCategory.find(c => c.category === cat.name)?.count || 0;
                return (
                  <div
                    key={idx}
                    className="rounded-3xl bg-[#0B1E38]/80 border border-white/10 p-7 hover:border-sentinel-cyan/60 hover:bg-[#10284B] transition-all group flex flex-col justify-between shadow-xl relative overflow-hidden"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}
                        >
                          <Icon className="w-7 h-7" />
                        </div>
                        <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-bold border ${cat.badgeColor}`}>
                          {cat.tag}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-sentinel-cyan transition-colors">
                          {cat.name}
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed mt-2">{cat.desc}</p>
                      </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        Active Cases: <strong className="text-white">{countForCat}</strong>
                      </span>
                      <Link
                        to={`/report?category=${encodeURIComponent(cat.name)}`}
                        onClick={() => soundFx.playClick()}
                        className="text-xs font-bold text-sentinel-cyan hover:text-white flex items-center gap-1 group-hover:translate-x-1 transition-all"
                      >
                        Report This <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Operational Workflow Architecture */}
        <section className="py-20 bg-[#040C17] border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-sentinel-cyan bg-white/5 px-3.5 py-1 rounded-full border border-white/10">
                Operational Loop
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Rapid Response Engineering
              </h2>
              <p className="text-sm text-slate-400">
                Three synchronized phases from citizen panic button to stabilized emergency scene.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-3xl bg-[#0B1E38]/70 border border-white/10 space-y-4 relative">
                <div className="w-12 h-12 rounded-2xl bg-sentinel-navy border border-[#16C7E8]/30 text-sentinel-cyan font-mono font-black text-lg flex items-center justify-center">
                  01
                </div>
                <h3 className="text-lg font-bold text-white">Citizen Field Intake</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Friction-free intake with live map pin-dropping, structured casualty counts, and optional photo upload without cumbersome logins.
                </p>
                <div className="pt-2 text-[11px] font-mono text-sentinel-red flex items-center gap-1 font-bold">
                  <Radio className="w-3.5 h-3.5 animate-pulse" /> Fast Response Entry
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-[#0B1E38]/90 border-2 border-[#16C7E8]/50 space-y-4 shadow-2xl relative glow-cyan">
                <div className="w-12 h-12 rounded-2xl bg-sentinel-cyan text-sentinel-navy font-mono font-black text-lg flex items-center justify-center">
                  02
                </div>
                <h3 className="text-lg font-bold text-white">Smart Severity & Duplicate Shield</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Rule-based intelligence evaluates life-critical threat indicators, calculates a transparent 0-100 Priority Score, and correlates spatial duplicates to prevent double dispatch.
                </p>
                <div className="pt-2 text-[11px] font-mono text-sentinel-cyan flex items-center gap-1 font-bold">
                  <Sparkles className="w-3.5 h-3.5" /> Explainable Decision Support
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-[#0B1E38]/70 border border-white/10 space-y-4 relative">
                <div className="w-12 h-12 rounded-2xl bg-sentinel-navy border border-[#16C7E8]/30 text-sentinel-cyan font-mono font-black text-lg flex items-center justify-center">
                  03
                </div>
                <h3 className="text-lg font-bold text-white">Command Center & Field Units</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Incident commanders manage the priority queue on interactive Leaflet maps, deploy specialized rescue battalions, and maintain an immutable chronological audit trail.
                </p>
                <div className="pt-2 text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Closed-Loop Resolution
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Emergency Superpowers Section */}
        <section className="py-20 bg-[#071426] border-b border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-sentinel-cyan/5 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-sentinel-cyan bg-sentinel-cyan/10 px-3.5 py-1 rounded-full border border-sentinel-cyan/30">
                Emergency Superpowers
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Advanced Mission-Critical Capabilities
              </h2>
              <p className="text-sm text-slate-400">
                Beyond basic reporting: SentriX equips citizens, dispatchers, and rescue teams with cutting-edge resilient technologies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 1. Live GPS Telemetry */}
              <div className="p-6 rounded-3xl bg-[#0B1E38]/80 border border-sentinel-cyan/30 hover:border-sentinel-cyan transition-all group space-y-3 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-sentinel-cyan/15 border border-sentinel-cyan/40 text-sentinel-cyan flex items-center justify-center">
                  <Navigation className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Live GPS Telemetry
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                    ACTIVE
                  </span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  1-tap satellite GPS coordinate lock with automatic OpenStreetMap reverse geocoding and real-time distance calculations to nearest emergency units.
                </p>
                <div className="pt-2 text-[11px] font-mono text-sentinel-cyan">
                  • Precision ±5m Geo-Locating • Distance Matrix
                </div>
              </div>

              {/* 2. Voice AI Assistant */}
              <div className="p-6 rounded-3xl bg-[#0B1E38]/80 border border-white/10 hover:border-sentinel-cyan/60 transition-all group space-y-3 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/40 text-purple-400 flex items-center justify-center">
                  <Mic className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  AURA Tactical Voice AI
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/40 font-bold">
                    SPEECH API
                  </span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Hands-free emergency reporting via cross-browser Web Speech API. Natural language processing parses categories and casualty numbers from spoken panic descriptions.
                </p>
                <div className="pt-2 text-[11px] font-mono text-purple-400">
                  • Spoken Dictation • Interactive Commander Dialog
                </div>
              </div>

              {/* 3. Multi-Language i18n */}
              <div className="p-6 rounded-3xl bg-[#0B1E38]/80 border border-white/10 hover:border-sentinel-cyan/60 transition-all group space-y-3 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                  <Languages className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Multilingual i18n
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/40 font-bold">
                    5 LOCALES
                  </span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Instant UI and voice recognition switching across English, Hindi (हिन्दी), Tamil (தமிழ்), Telugu (తెలుగు), and Spanish (Español).
                </p>
                <div className="pt-2 text-[11px] font-mono text-blue-400">
                  • Native Locales • Reactive Language Switcher
                </div>
              </div>

              {/* 4. Direct WhatsApp Emergency SOS (+91 7806869597) */}
              <div className="p-6 rounded-3xl bg-[#0B1E38]/80 border border-white/10 hover:border-emerald-500/60 transition-all group space-y-3 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                  <Radio className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  WhatsApp Emergency SOS
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                    DIRECT: +91 7806869597
                  </span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Direct 1-tap WhatsApp emergency distress dispatch to verified response helpline <span className="text-emerald-400 font-mono font-bold">+91 7806869597</span> with live satellite GPS pin, reverse-geocoded landmark, and battery telemetry.
                </p>
                <div className="pt-2 text-[11px] font-mono text-emerald-400">
                  • Direct WhatsApp: 7806869597 • Live GPS Telemetry
                </div>
              </div>

              {/* 5. Optical & Acoustic Strobe */}
              <div className="p-6 rounded-3xl bg-[#0B1E38]/80 border border-white/10 hover:border-amber-500/60 transition-all group space-y-3 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                  <Zap className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Rescue Distress Strobe
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold">
                    MORSE AUDIO
                  </span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  5.5Hz alternating high-intensity screen strobe paired with an 1800Hz Web Audio Morse code S-O-S pattern (··· --- ···) to signal rescue drones and dogs.
                </p>
                <div className="pt-2 text-[11px] font-mono text-amber-400">
                  • Optical Screen Beacon • Web Audio Morse Code
                </div>
              </div>

              {/* 6. Safe Muster Zones */}
              <div className="p-6 rounded-3xl bg-[#0B1E38]/80 border border-white/10 hover:border-emerald-500/60 transition-all group space-y-3 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Safe Zones & Hospitals
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                    EVACUATION
                  </span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Geo-registered shelters, Level-1 trauma centers, and disaster muster points with real-time bed capacity and live distance routing on Leaflet maps.
                </p>
                <div className="pt-2 text-[11px] font-mono text-emerald-400">
                  • Bed Capacity Telemetry • Live Distance Routing
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};
