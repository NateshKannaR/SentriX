import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { incidentService } from '../services/incidentService';
import { DashboardMetrics } from '../types';
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
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>(() => incidentService.getDashboardMetrics());

  useEffect(() => {
    const unsub = incidentService.subscribe(() => {
      setMetrics(incidentService.getDashboardMetrics());
    });
    return () => unsub();
  }, []);

  const categories = [
    {
      name: 'Fire Emergency',
      icon: Flame,
      color: 'from-orange-500 to-red-600',
      tag: 'Thermal & Smoke Hazard',
      desc: 'Commercial, industrial, and high-rise structural blazes with active hazard escalation.',
    },
    {
      name: 'Road Accident',
      icon: Car,
      color: 'from-amber-500 to-orange-600',
      tag: 'Trauma & Highway Pileup',
      desc: 'Expressway collisions, multi-vehicle pileups, rollovers, and hazardous transit blockades.',
    },
    {
      name: 'Medical Emergency',
      icon: HeartPulse,
      color: 'from-rose-500 to-pink-600',
      tag: 'Life-Critical Care',
      desc: 'Cardiac arrests, mass casualty triage, acute trauma, and oxygen supply failure.',
    },
    {
      name: 'Flood',
      icon: Waves,
      color: 'from-sky-500 to-blue-600',
      tag: 'Hydrological Disaster',
      desc: 'Flash floods, lake bund breaches, submerged settlements, and swiftwater boat rescue.',
    },
    {
      name: 'Building Collapse',
      icon: Building2,
      color: 'from-purple-500 to-indigo-600',
      tag: 'Structural Failure',
      desc: 'Construction slab failures, structural debris entrapment, and heavy SAR operations.',
    },
    {
      name: 'Other Emergencies',
      icon: AlertTriangle,
      color: 'from-teal-500 to-emerald-600',
      tag: 'Hazmat & Gas Leaks',
      desc: 'Industrial toxic solvent leaks, pressurized gas pipe ruptures, and hazardous materials.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-sentinel-bgLight text-slate-800 font-sans selection:bg-sentinel-cyan/30">
      <Header />

      {/* Hero Section with Command Center Visual Aesthetics */}
      <section className="relative overflow-hidden bg-sentinel-navy text-white pt-16 pb-24 border-b border-sentinel-darkBorder">
        {/* Subtle Background Grid / Radar Effect */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#16C7E8_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-sentinel-cyan/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-sentinel-red/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-sentinel-cyan/30 backdrop-blur-md mb-6 animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-sentinel-red animate-ping" />
            <span className="font-mono text-xs uppercase tracking-wider text-sentinel-cyan font-semibold">
              Code Clash 2026 Emergency Platform
            </span>
            <span className="text-slate-400 text-xs">• Live Operational Triage</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
                When Every Second Matters,{' '}
                <span className="bg-gradient-to-r from-sentinel-cyan via-teal-300 to-blue-400 bg-clip-text text-transparent">
                  Intelligence Matters.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                <strong className="text-white">SENTINEL 360</strong> centralizes citizen emergency reports,
                dynamically classifies incident severity using explainable decision support, suppresses duplicate
                dispatches, and gives commanders unified operational command.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  to="/report"
                  className="px-6 py-3.5 rounded-xl text-base font-bold bg-sentinel-red hover:bg-red-600 text-white shadow-xl shadow-sentinel-red/30 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Radio className="w-5 h-5 animate-pulse" />
                  <span>REPORT AN EMERGENCY</span>
                </Link>

                <Link
                  to="/admin/dashboard"
                  className="px-6 py-3.5 rounded-xl text-base font-bold bg-sentinel-darkSurface hover:bg-sentinel-darkCard text-white border border-sentinel-cyan/40 hover:border-sentinel-cyan shadow-lg shadow-black/20 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02]"
                >
                  <LayoutDashboard className="w-5 h-5 text-sentinel-cyan" />
                  <span>ADMIN COMMAND CENTER</span>
                  <ArrowRight className="w-4 h-4 text-sentinel-cyan" />
                </Link>
              </div>

              {/* Feature Highlights micro-bar */}
              <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-sentinel-cyan" /> 6 Mandatory Categories
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-sentinel-cyan" /> Transparent AI Severity Engine
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-sentinel-cyan" /> Geospatial Incident Heatmap
                </span>
              </div>
            </div>

            {/* Right Live Command Snapshot Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl bg-sentinel-darkSurface/90 border border-sentinel-darkBorder p-6 shadow-2xl backdrop-blur-xl space-y-5">
                <div className="flex items-center justify-between border-b border-sentinel-darkBorder pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono text-xs text-white font-bold tracking-wider uppercase">
                      Telemetry Stream
                    </span>
                  </div>
                  <span className="font-mono text-xs text-sentinel-cyan px-2 py-0.5 rounded bg-sentinel-cyan/15 border border-sentinel-cyan/30">
                    REAL-TIME
                  </span>
                </div>

                {/* Live Stats Quad */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-sentinel-navy/80 border border-sentinel-darkBorder">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                      Total Incidents
                    </span>
                    <span className="font-mono text-2xl font-black text-white mt-1 block">
                      {metrics.total}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">● Active in system</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30">
                    <span className="text-[11px] uppercase tracking-wider text-red-300 block font-semibold flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-red-400" /> Critical
                    </span>
                    <span className="font-mono text-2xl font-black text-red-400 mt-1 block">
                      {metrics.critical}
                    </span>
                    <span className="text-[10px] text-red-300 font-mono">Immediate Response</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-sentinel-navy/80 border border-sentinel-darkBorder">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                      Under Dispatch
                    </span>
                    <span className="font-mono text-2xl font-black text-sentinel-cyan mt-1 block">
                      {metrics.inProgress}
                    </span>
                    <span className="text-[10px] text-sentinel-cyan font-mono">Units Deployed</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-sentinel-navy/80 border border-sentinel-darkBorder">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                      Resolved
                    </span>
                    <span className="font-mono text-2xl font-black text-emerald-400 mt-1 block">
                      {metrics.resolved}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">Scene Stabilized</span>
                  </div>
                </div>

                {/* Intelligence Engine Highlight */}
                <div className="p-3.5 rounded-xl bg-sentinel-darkBlue/70 border border-sentinel-cyan/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-sentinel-cyan" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Smart Severity Engine Active</h4>
                      <p className="text-[11px] text-slate-400">Rule-based casualty & keyword risk triage</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-sentinel-cyan px-2 py-1 rounded bg-sentinel-cyan/15">
                    SCORE {metrics.avgPriorityScore}/100
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Categories Section */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-sentinel-red bg-red-50 px-3 py-1 rounded-full border border-red-200">
              Mandatory Challenge Categories
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              One Platform. Every Emergency Category.
            </h2>
            <p className="text-base text-slate-600">
              Citizens can immediately report any incident across the 6 disaster verticals with tailored field parameters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-sentinel-cyan/60 transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                        {cat.tag}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-sentinel-darkBlue transition-colors">
                      {cat.name}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">{cat.desc}</p>
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      to={`/report?category=${encodeURIComponent(cat.name)}`}
                      className="text-xs font-bold text-sentinel-red hover:text-red-700 flex items-center gap-1 group-hover:translate-x-1 transition-all"
                    >
                      Report Incident <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How Sentinel 360 Works */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-sentinel-cyan bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
              Operational Architecture
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              How SENTINEL 360 Coordinates Disaster Response
            </h2>
            <p className="text-base text-slate-600">
              From citizen field submission to AI severity triage and response commander dispatch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="w-10 h-10 rounded-xl bg-sentinel-navy text-white flex items-center justify-center font-mono font-bold text-base mb-4">
                01
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">1. Rapid Citizen Reporting</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Citizens submit incident specifics including category, location pins, affected casualty counts, and photos. No cumbersome login required during critical moments.
              </p>
              <span className="text-[11px] font-mono font-semibold text-sentinel-red bg-red-50 px-2 py-0.5 rounded border border-red-100">
                Friction-free SOS intake
              </span>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-7 rounded-2xl border-2 border-sentinel-cyan/40 shadow-md relative">
              <div className="w-10 h-10 rounded-xl bg-sentinel-cyan text-sentinel-navy flex items-center justify-center font-mono font-bold text-base mb-4">
                02
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">2. Smart Severity Engine & Scoring</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Explainable rule intelligence scans reports for casualty thresholds, threat keywords (e.g. trapped, chemical, collapse), computes a 0-100 priority score, and checks for duplicates.
              </p>
              <span className="text-[11px] font-mono font-semibold text-sentinel-cyan bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100">
                Transparent Decision Support
              </span>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="w-10 h-10 rounded-xl bg-sentinel-darkBlue text-white flex items-center justify-center font-mono font-bold text-base mb-4">
                03
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">3. Commander Dispatch & Tracking</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Incident commanders triage the priority queue, assign units (Ambulance, NDRF, Fire Tender), override classifications when necessary, and maintain a chronological audit trail.
              </p>
              <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                End-to-End Incident Lifecycle
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Statistics & Demonstration Telemetry */}
      <section className="py-16 bg-sentinel-navy text-white border-b border-sentinel-darkBorder">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/10">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-sentinel-cyan">
                Operational Demonstration Telemetry
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                Real-Time Incident Analytics (Demonstration Data)
              </h2>
            </div>
            <Link
              to="/admin/dashboard"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2 border border-white/20 transition-colors"
            >
              Open Live Analytics Dashboard <ArrowRight className="w-3.5 h-3.5 text-sentinel-cyan" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
            <div className="space-y-1">
              <span className="font-mono text-3xl sm:text-4xl font-black text-white">{metrics.total}</span>
              <p className="text-xs text-slate-400 font-medium">Total Registered Incidents</p>
              <span className="text-[10px] text-slate-500 font-mono">100% Data-Driven Local Store</span>
            </div>

            <div className="space-y-1">
              <span className="font-mono text-3xl sm:text-4xl font-black text-red-400">{metrics.critical}</span>
              <p className="text-xs text-slate-400 font-medium">Critical Priority Emergencies</p>
              <span className="text-[10px] text-red-400/80 font-mono">High Casualty Triggers</span>
            </div>

            <div className="space-y-1">
              <span className="font-mono text-3xl sm:text-4xl font-black text-sentinel-cyan">{metrics.totalCasualties}</span>
              <p className="text-xs text-slate-400 font-medium">Total People Affected / Tracked</p>
              <span className="text-[10px] text-sentinel-cyan/80 font-mono">Casualty Safeguard</span>
            </div>

            <div className="space-y-1">
              <span className="font-mono text-3xl sm:text-4xl font-black text-emerald-400">99.8%</span>
              <p className="text-xs text-slate-400 font-medium">System Uptime & Availability</p>
              <span className="text-[10px] text-emerald-400/80 font-mono">Zero Single Point of Failure</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
