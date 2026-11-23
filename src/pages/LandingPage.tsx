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
  ShieldAlert, Search, Radio, LayoutDashboard, Flame, Car, HeartPulse, Waves,
  Building2, AlertTriangle, ArrowRight, Cpu, Mic, MicOff, MapPin, Activity,
  ChevronDown,
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
    { name: 'Fire Emergency', icon: Flame, description: 'Smoke, fire, or an explosion', color: 'text-orange-300' },
    { name: 'Road Accident', icon: Car, description: 'Collisions and road hazards', color: 'text-amber-300' },
    { name: 'Medical Emergency', icon: HeartPulse, description: 'Urgent illness or injury', color: 'text-rose-300' },
    { name: 'Flood', icon: Waves, description: 'Rising water or flooding', color: 'text-sky-300' },
    { name: 'Building Collapse', icon: Building2, description: 'Structural damage or collapse', color: 'text-violet-300' },
    { name: 'Other Emergencies', icon: AlertTriangle, description: 'Hazards that need urgent attention', color: 'text-teal-300' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0b121c] text-slate-100 font-sans selection:bg-[#16C7E8]/30">
      <Header />

      <main>
        <section className="relative overflow-hidden border-b border-white/10 bg-[#0d1825]">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,149,0.22),transparent_62%)]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.2fr_1fr] lg:gap-16 lg:px-8">
            <div>
              <p className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.19em] text-cyan-300">
                <ShieldAlert className="h-4 w-4" aria-hidden="true" /> Emergency response portal
              </p>
              <h1 className="max-w-xl text-4xl font-semibold leading-[1.03] tracking-[-0.045em] text-white sm:text-5xl xl:text-[3.5rem]">
                Report an emergency.<span className="block text-cyan-300">Follow the response.</span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-300 sm:text-lg">
                Send an incident report with its location, then use your incident code to check its status.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Link to="/report" className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-rose-600 px-5 font-semibold text-white hover:bg-rose-500">
                  <Radio className="h-5 w-5" aria-hidden="true" /> Report an emergency
                </Link>
                <Link to="/citizen" className="inline-flex min-h-12 items-center gap-2 text-sm font-semibold text-slate-200 hover:text-cyan-300">
                  Citizen tools <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <form
              className="rounded-2xl border border-white/15 bg-[#121f2e] p-5 shadow-xl shadow-black/20 sm:p-8"
              onSubmit={event => {
                event.preventDefault();
                const code = trackingCode.trim().toUpperCase();
                if (code) navigate({ pathname: '/track', search: new URLSearchParams({ code }).toString() });
              }}
            >
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                <Search className="h-5 w-5" aria-hidden="true" />
              </div>
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
              <ol aria-label="Incident lifecycle" className="mt-6 grid grid-cols-3 gap-2 border-t border-white/10 pt-5 text-xs text-slate-300">
                <li className="flex flex-col gap-2"><Radio className="h-4 w-4 text-cyan-300" aria-hidden="true" /> Report received</li>
                <li className="flex flex-col gap-2"><MapPin className="h-4 w-4 text-cyan-300" aria-hidden="true" /> Team assigned</li>
                <li className="flex flex-col gap-2"><Activity className="h-4 w-4 text-cyan-300" aria-hidden="true" /> Status updated</li>
              </ol>
            </form>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Report by incident type</h2>
            <p className="mt-2 text-sm text-slate-400">Choose the closest match to start with the right category.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map(({ name, icon: Icon, description, color }) => (
              <Link
                key={name}
                to={`/report?category=${encodeURIComponent(name)}`}
                className="group flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-[#101c29] p-4 transition hover:border-cyan-300/45 hover:bg-[#142434]"
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 ${color}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-white">{name}</span>
                  <span className="mt-1 block text-xs text-slate-400">{description}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-cyan-300" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#0f1a27]">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_1fr_auto] lg:items-center lg:px-8">
            <div>
              <h2 className="text-xl font-semibold text-white">Command center</h2>
              <p className="mt-1 text-sm text-slate-400">Review incidents, manage teams, and open the operations map.</p>
            </div>
            <dl className="grid grid-cols-3 gap-3">
              <div><dt className="text-xs text-slate-400">Incidents</dt><dd className="mt-1 text-xl font-semibold tabular-nums">{metrics.total}</dd></div>
              <div><dt className="text-xs text-slate-400">Critical</dt><dd className="mt-1 text-xl font-semibold tabular-nums text-rose-300">{metrics.critical}</dd></div>
              <div><dt className="text-xs text-slate-400">Resolved</dt><dd className="mt-1 text-xl font-semibold tabular-nums text-cyan-300">{metrics.resolved}</dd></div>
            </dl>
            <Link to="/admin/dashboard" className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/15 px-4 py-3 text-sm font-semibold hover:bg-white/5">
              <LayoutDashboard className="h-4 w-4 text-cyan-300" aria-hidden="true" /> Open workspace
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <details className="group rounded-xl border border-white/10 bg-[#101c29]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl p-5 marker:content-none sm:p-6">
              <span>
                <span className="block text-lg font-semibold text-white">Triage simulator</span>
                <span className="mt-1 block text-sm text-slate-400">Try a sample report and see how severity is calculated.</span>
              </span>
              <ChevronDown className="h-5 w-5 shrink-0 text-cyan-300 transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="p-4 pt-0 sm:p-6 sm:pt-0">
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
          </details>
        </section>
      </main>
      <Footer />
    </div>
  );
};
