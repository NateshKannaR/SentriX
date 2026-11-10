import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Incident } from '../../types';
import { isSupabaseConfigured } from '../../services/supabaseClient';
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
} from 'lucide-react';

interface AdminContextType {
  incidents: Incident[];
  onOpenIncident: (incident: Incident) => void;
  onOpenDuplicate: (incident: Incident) => void;
  onSimulate: () => void;
  onReset: () => void;
}

export const SettingsPage: React.FC = () => {
  const { incidents, onSimulate, onReset } = useOutletContext<AdminContextType>();
  const [copiedSql, setCopiedSql] = useState(false);

  const demoCount = incidents.filter(i => i.isDemo).length;
  const userCount = incidents.filter(i => !i.isDemo).length;

  const handleBatchSimulate = () => {
    onSimulate();
    setTimeout(() => onSimulate(), 300);
    setTimeout(() => onSimulate(), 600);
  };

  const sampleSql = `-- Supabase Schema Snippet
CREATE TABLE public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_code VARCHAR(32) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  category emergency_category NOT NULL,
  severity severity_level NOT NULL,
  priority_score INTEGER NOT NULL CHECK (priority_score >= 0 AND priority_score <= 100),
  status incident_status NOT NULL DEFAULT 'Reported'
);`;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          System Diagnostics & Demonstration Simulator
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage local persistent storage, trigger realistic emergency scenario simulations, and verify backend configuration.
        </p>
      </div>

      {/* Feature 7: Demo Simulation Center */}
      <div className="bg-white dark:bg-sentinel-darkCard p-6 rounded-2xl border border-slate-200 dark:border-sentinel-darkBorder shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Demo Simulation Engine
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold">
                  HACKATHON FEATURE
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Generate realistic multi-category emergency scenarios with live casualty counts, coordinates, and AI scoring.
              </p>
            </div>
          </div>
        </div>

        {/* Data Distribution Pill */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Records</span>
            <span className="font-mono text-xl font-black text-slate-900 dark:text-white mt-0.5 block">
              {incidents.length}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-purple-500 block">Simulated Records</span>
            <span className="font-mono text-xl font-black text-purple-600 dark:text-purple-400 mt-0.5 block">
              {demoCount}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-emerald-500 block">Citizen User Submissions</span>
            <span className="font-mono text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              {userCount}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={onSimulate}
            className="px-4 py-2.5 rounded-xl bg-sentinel-cyan hover:bg-cyan-300 text-sentinel-navy font-bold text-xs flex items-center gap-2 shadow transition-transform active:scale-95"
          >
            <Zap className="w-4 h-4" />
            <span>Simulate Single Emergency</span>
          </button>

          <button
            onClick={handleBatchSimulate}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow transition-transform active:scale-95"
          >
            <Zap className="w-4 h-4" />
            <span>Simulate Burst (3 Scenarios)</span>
          </button>

          <button
            onClick={onReset}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>Reset Demo Data to Initial Seed</span>
          </button>
        </div>
      </div>

      {/* Backend & Supabase Diagnostic Panel */}
      <div className="bg-white dark:bg-sentinel-darkCard p-6 rounded-2xl border border-slate-200 dark:border-sentinel-darkBorder shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Persistence Layer Architecture
              </h3>
              <p className="text-xs text-slate-500">
                Modular repository layer decoupling UI from database implementation
              </p>
            </div>
          </div>

          <span
            className={`font-mono text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 ${
              isSupabaseConfigured
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {isSupabaseConfigured ? 'Supabase Connected' : 'Local Persistent Storage (Active)'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <Server className="w-4 h-4 text-sentinel-cyan" />
            <span>Zero-Config Demonstration Fallback:</span>
          </div>
          <p>
            Sentinel 360 includes a resilient client-side persistent repository with real-time reactive subscribers. All user submissions, simulated emergencies, status changes, and commander activity logs are safely persisted to browser storage with no external dependencies required to evaluate.
          </p>
          <p className="text-[11px] text-slate-400">
            To connect to a live Supabase project, provide <code className="font-mono text-sentinel-cyan">VITE_SUPABASE_URL</code> and <code className="font-mono text-sentinel-cyan">VITE_SUPABASE_ANON_KEY</code> in an <code className="font-mono text-sentinel-cyan">.env</code> file. Full migration SQL is provided at <code className="font-mono text-sentinel-cyan">supabase/schema.sql</code>.
          </p>
        </div>

        {/* SQL Schema Preview */}
        <div className="p-4 rounded-xl bg-sentinel-navy text-slate-300 font-mono text-xs border border-sentinel-darkBorder space-y-2">
          <div className="flex items-center justify-between text-slate-400 border-b border-white/10 pb-2">
            <span className="flex items-center gap-1.5 text-sentinel-cyan text-[11px]">
              <Terminal className="w-3.5 h-3.5" /> supabase/schema.sql
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(sampleSql);
                setCopiedSql(true);
                setTimeout(() => setCopiedSql(false), 2000);
              }}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              {copiedSql ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="overflow-x-auto text-[11px] leading-relaxed text-slate-300">
            {sampleSql}
          </pre>
        </div>
      </div>
    </div>
  );
};
