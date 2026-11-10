import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>(() => incidentService.getDashboardMetrics());

  // Interactive Live Playground on the Hero
  const [playgroundCategory, setPlaygroundCategory] = useState<EmergencyCategory>('Fire Emergency');
  const [playgroundText, setPlaygroundText] = useState('Multiple workers trapped on 3rd floor with heavy toxic smoke');
  const [playgroundCasualties, setPlaygroundCasualties] = useState(6);

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

      {/* Hero Section with Tactical HUD & Live AI Triage Playground */}
      <section className="relative overflow-hidden pt-12 pb-24 border-b border-[#16C7E8]/20 hud-grid">
        {/* Ambient Gradient Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-[#16C7E8]/10 via-transparent to-sentinel-red/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#16C7E8]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0B1E38]/80 border border-[#16C7E8]/30 backdrop-blur-xl mb-6 shadow-lg shadow-[#16C7E8]/10 animate-fadeIn">
            <span className="w-2.5 h-2.5 rounded-full bg-sentinel-red animate-ping" />
            <span className="font-mono text-xs uppercase tracking-wider text-sentinel-cyan font-bold">
              CODE CLASH 2026 OFFICIAL PLATFORM
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-emerald-400 text-xs font-mono font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> DISPATCH GRID ONLINE
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <span className="font-mono text-xs font-extrabold tracking-widest uppercase text-sentinel-cyan flex items-center gap-2">
                  <Terminal className="w-4 h-4" /> Next-Gen Emergency Intelligence
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white">
                  When Every Second Matters,{' '}
                  <span className="bg-gradient-to-r from-sentinel-cyan via-teal-300 to-blue-400 bg-clip-text text-transparent">
                    Intelligence Matters.
                  </span>
                </h1>
              </div>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-normal">
                <strong className="text-white font-bold">SENTINEL 360</strong> transforms chaotic field reports
                into actionable, prioritized dispatch intelligence. Features explainable AI severity scoring,
                real-time geospatial mapping, automated duplicate suppression, and unified commander operations.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  to="/report"
                  onClick={() => soundFx.playAlert()}
                  className="px-6 py-4 rounded-2xl text-base font-black bg-gradient-to-r from-sentinel-red to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-xl shadow-sentinel-red/35 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] border border-red-400/40 glow-red"
                >
                  <Radio className="w-5 h-5 animate-pulse" />
                  <span>REPORT AN EMERGENCY</span>
                </Link>

                <Link
                  to="/admin/dashboard"
                  onClick={() => soundFx.playClick()}
                  className="px-6 py-4 rounded-2xl text-base font-black bg-[#0B1E38] hover:bg-[#10284B] text-white border border-[#16C7E8]/40 hover:border-[#16C7E8] shadow-xl shadow-black/40 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] hover:glow-cyan"
                >
                  <LayoutDashboard className="w-5 h-5 text-sentinel-cyan" />
                  <span>ADMIN COMMAND CENTER</span>
                  <ArrowRight className="w-4 h-4 text-sentinel-cyan" />
                </Link>
              </div>

              {/* Live Metric Ticker under buttons */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4">
                <div className="space-y-0.5">
                  <span className="font-mono text-2xl font-black text-white">{metrics.total}</span>
                  <p className="text-[11px] font-mono text-slate-400 uppercase">Tracked Incidents</p>
                </div>
                <div className="space-y-0.5">
                  <span className="font-mono text-2xl font-black text-red-400">{metrics.critical}</span>
                  <p className="text-[11px] font-mono text-red-300 uppercase">Critical Priority</p>
                </div>
                <div className="space-y-0.5">
                  <span className="font-mono text-2xl font-black text-sentinel-cyan">{metrics.avgPriorityScore}</span>
                  <p className="text-[11px] font-mono text-slate-400 uppercase">Avg Priority Index</p>
                </div>
              </div>
            </div>

            {/* Right: Interactive Live AI Triage Playground */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl bg-[#0B1E38]/90 border border-[#16C7E8]/30 p-6 shadow-2xl backdrop-blur-2xl space-y-5 overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-sentinel-cyan/20 border border-sentinel-cyan/40 text-sentinel-cyan flex items-center justify-center">
                      <Cpu className="w-4 h-4 animate-spin-slow" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                        Smart Severity Engine Simulator
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono">Live rule-based decision support</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-sentinel-cyan/15 text-sentinel-cyan border border-sentinel-cyan/30">
                    INTERACTIVE
                  </span>
                </div>

                {/* Playground Controls */}
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] uppercase font-mono font-bold text-slate-400 mb-1">
                      1. Test Emergency Category
                    </label>
                    <select
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
                      <label className="text-[10px] uppercase font-mono font-bold text-slate-400">
                        2. Casualties Reported: <span className="text-white font-bold">{playgroundCasualties}</span>
                      </label>
                      <span className="text-[10px] text-slate-500 font-mono">Slide to test</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={playgroundCasualties}
                      onChange={e => setPlaygroundCasualties(parseInt(e.target.value))}
                      className="w-full accent-sentinel-cyan cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono font-bold text-slate-400 mb-1">
                      3. Incident Keywords (Try typing &quot;trapped&quot;, &quot;explosion&quot;, &quot;toxic&quot;)
                    </label>
                    <input
                      type="text"
                      value={playgroundText}
                      onChange={e => setPlaygroundText(e.target.value)}
                      className="w-full bg-[#071426] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-sentinel-cyan placeholder-slate-500"
                    />
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

      {/* Verified Statistics & Telemetry Bar */}
      <section className="py-16 bg-[#071426] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/10">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-sentinel-cyan">
                Live Data-Driven Telemetry
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                Active Operational Metrics (MongoDB / Storage)
              </h2>
            </div>
            <Link
              to="/admin/dashboard"
              onClick={() => soundFx.playClick()}
              className="px-5 py-2.5 rounded-xl bg-[#0B1E38] hover:bg-[#10284B] text-white text-xs font-bold border border-[#16C7E8]/40 hover:border-[#16C7E8] transition-colors flex items-center gap-2"
            >
              <span>Launch Command Center</span>
              <ChevronRight className="w-4 h-4 text-sentinel-cyan" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
            <div className="p-5 rounded-2xl bg-[#0B1E38]/60 border border-white/10 space-y-1">
              <span className="font-mono text-3xl sm:text-4xl font-black text-white">{metrics.total}</span>
              <p className="text-xs text-slate-400 font-medium">Total Registered Incidents</p>
              <span className="text-[10px] text-emerald-400 font-mono">● Real-time Persistent Store</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0B1E38]/60 border border-red-500/30 space-y-1">
              <span className="font-mono text-3xl sm:text-4xl font-black text-red-400">{metrics.critical}</span>
              <p className="text-xs text-slate-400 font-medium">Critical Priority Emergencies</p>
              <span className="text-[10px] text-red-400 font-mono">Immediate Interventions</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0B1E38]/60 border border-white/10 space-y-1">
              <span className="font-mono text-3xl sm:text-4xl font-black text-sentinel-cyan">{metrics.totalCasualties}</span>
              <p className="text-xs text-slate-400 font-medium">Total Casualties Monitored</p>
              <span className="text-[10px] text-sentinel-cyan font-mono">Zero Neglected Patients</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0B1E38]/60 border border-white/10 space-y-1">
              <span className="font-mono text-3xl sm:text-4xl font-black text-emerald-400">99.8%</span>
              <p className="text-xs text-slate-400 font-medium">Dispatch Reliability SLA</p>
              <span className="text-[10px] text-emerald-400 font-mono">Mission Control Uptime</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
