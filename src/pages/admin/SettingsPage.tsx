import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Incident } from '../../types';
import { soundEffects } from '../../utils/soundEffects';
import { useLanguage } from '../../context/LanguageContext';
import {
  Zap,
  RotateCcw,
  Database,
  CheckCircle2,
  AlertTriangle,
  Server,
  Shield,
  Copy,
  Terminal,
  Volume2,
  VolumeX,
  Radio,
  Cpu,
  Flame,
  Cloud,
} from 'lucide-react';

interface AdminContextType {
  incidents: Incident[];
  onOpenIncident: (incident: Incident) => void;
  onOpenDuplicate: (incident: Incident) => void;
  onSimulate: () => void;
  onReset: () => void;
}

export const SettingsPage: React.FC = () => {
  const { t } = useLanguage();
  const { incidents, onSimulate, onReset } = useOutletContext<AdminContextType>();
  const [copiedSql, setCopiedSql] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(soundEffects.isMuted());

  const demoCount = incidents.filter(i => i.isDemo).length;
  const userCount = incidents.filter(i => !i.isDemo).length;

  const handleBatchSimulate = () => {
    soundEffects.playAlert();
    onSimulate();
    setTimeout(() => onSimulate(), 300);
    setTimeout(() => onSimulate(), 600);
  };

  const toggleSound = () => {
    const muted = soundEffects.toggleMute();
    setIsAudioMuted(muted);
    if (!muted) {
      soundEffects.playBeep();
    }
  };

  const sampleSql = `-- PostgreSQL / Supabase Schema Snippet
CREATE TABLE public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_code VARCHAR(32) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  category emergency_category NOT NULL,
  severity severity_level NOT NULL,
  priority_score INTEGER NOT NULL CHECK (priority_score >= 0 AND priority_score <= 100),
  status incident_status NOT NULL DEFAULT 'Reported',
  location VARCHAR(255) NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  people_affected INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('admin.nav.settings', 'System & Simulator')}
          </h1>
          <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold flex items-center gap-1 shrink-0">
            <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            DIAGNOSTICS ONLINE
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure backend persistence layers, manage multi-channel emergency simulation tests, and inspect audio synthesizers.
        </p>
      </div>

      {/* Feature: Demo Simulation Center */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#0A101D] border border-white/[0.08] shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/30 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Crisis Simulation Reactor
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 font-bold shrink-0">
                  CODE CLASH 2026
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Synthesize realistic multi-category disaster vectors with geospatial coordinates, randomized casualties, and AI triage.
              </p>
            </div>
          </div>
        </div>

        {/* Data Distribution Pill */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-[#060B14] border border-white/5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Total Persistent Records</span>
            <span className="font-mono text-2xl font-black text-white mt-1 block">
              {incidents.length}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#060B14] border border-white/5">
            <span className="text-[10px] uppercase font-bold text-purple-400 block font-mono">Simulated Test Scenarios</span>
            <span className="font-mono text-2xl font-black text-purple-400 mt-1 block">
              {demoCount}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#060B14] border border-white/5 col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block font-mono">Live Citizen Submissions</span>
            <span className="font-mono text-2xl font-black text-emerald-400 mt-1 block">
              {userCount}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <button
            onClick={() => {
              soundEffects.playBeep();
              onSimulate();
            }}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition-all active:scale-95"
          >
            <Zap className="w-4 h-4 shrink-0" />
            <span>Simulate Single Emergency</span>
          </button>

          <button
            onClick={handleBatchSimulate}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all active:scale-95"
          >
            <Zap className="w-4 h-4 shrink-0" />
            <span>Simulate 3-Incident Burst</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              onReset();
            }}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center justify-center gap-2 transition-colors active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{t('admin.sidebar.resetBtn', 'Reset Demo Data')}</span>
          </button>
        </div>
      </div>

      {/* Audio HUD Synthesizer Diagnostics */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#0A101D] border border-white/[0.08] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shrink-0">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Mission Control Audio HUD Synthesizer
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Synthesized Web Audio API sound telemetry for mission control operators
              </p>
            </div>
          </div>

          <button
            onClick={toggleSound}
            className={`self-start sm:self-auto px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border transition-colors shrink-0 ${
              !isAudioMuted
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-white/5 text-slate-400 border-white/10'
            }`}
          >
            {!isAudioMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{!isAudioMuted ? 'AUDIO HUD ACTIVE' : 'MUTED'}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-mono text-slate-400 mr-1 w-full sm:w-auto">Test Sound Profiles:</span>
          <button
            onClick={() => soundEffects.playBeep()}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-mono border border-white/10 hover:border-cyan-400 transition-colors"
          >
            Telemetry Ping (880Hz)
          </button>
          <button
            onClick={() => soundEffects.playAlert()}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-amber-300 text-xs font-mono border border-white/10 hover:border-amber-400 transition-colors"
          >
            Warning Pulse (440Hz)
          </button>
          <button
            onClick={() => soundEffects.playSiren()}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-red-300 text-xs font-mono border border-white/10 hover:border-red-400 transition-colors"
          >
            Critical Siren (600-900Hz)
          </button>
          <button
            onClick={() => soundEffects.playClick()}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono border border-white/10 hover:border-slate-500 transition-colors"
          >
            Haptic Key Click
          </button>
        </div>
      </div>

      {/* Backend & MongoDB Persistence Panel */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#0A101D] border border-white/[0.08] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Persistence Layer Architecture
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Dual persistence engine: MongoDB Atlas Cloud + Local Reactive Fallback
              </p>
            </div>
          </div>

          <span className="self-start sm:self-auto font-mono text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            MongoDB Atlas Connected
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#060B14] border border-white/5 text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-white">
            <Cloud className="w-4 h-4 text-cyan-400" />
            <span>MongoDB Atlas Production Cluster (<code className="text-cyan-400 font-mono">cluster0.wwp3oig.mongodb.net</code>)</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Integrated with Vercel Serverless Functions under <code className="font-mono text-cyan-400">/api/incidents</code>, <code className="font-mono text-cyan-400">/api/activities</code>, and <code className="font-mono text-cyan-400">/api/simulate</code> using cached connection pooling. Client also includes auto-syncing offline capability so application operates with 100% reliability even in disconnected field conditions.
          </p>
        </div>
      </div>
    </div>
  );
};
