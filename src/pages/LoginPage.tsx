import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { soundEffects } from '../utils/soundEffects';
import {
  ShieldAlert,
  Lock,
  Mail,
  ArrowRight,
  Zap,
  CheckCircle2,
  KeyRound,
  Terminal,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('commander.rao@sentinel360.gov');
  const [password, setPassword] = useState('sentinel2026');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Authorized email identifier required');
      soundEffects.playAlert();
      return;
    }
    soundEffects.playClick();
    login(email, password);
    navigate('/admin/dashboard');
  };

  const handleDemoBypass = () => {
    soundEffects.playBeep();
    login('commander.rao@sentinel360.gov', 'sentinel2026');
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sentinel-navy text-white p-4 relative overflow-hidden font-sans selection:bg-sentinel-cyan/30 selection:text-sentinel-cyan">
      {/* Background HUD aesthetics */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#16C7E8_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-sentinel-cyan/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sentinel-red/15 rounded-full blur-3xl pointer-events-none" />

      {/* Cyber Frame Container */}
      <div className="relative max-w-md w-full glass-panel border border-sentinel-darkBorder rounded-3xl p-8 shadow-2xl backdrop-blur-2xl space-y-6 animate-scaleUp">
        {/* Top telemetry tag */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-sentinel-darkBorder/60 pb-3">
          <span className="flex items-center gap-1.5 text-sentinel-cyan">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            GATEWAY // TERMINAL-01
          </span>
          <span className="text-slate-500 uppercase tracking-widest">ENCRYPTION: AES-256</span>
        </div>

        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="relative inline-block">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sentinel-red via-rose-600 to-amber-600 flex items-center justify-center mx-auto shadow-xl shadow-sentinel-red/30 border border-white/20">
              <ShieldAlert className="w-9 h-9 text-white animate-pulse" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-sentinel-darkSurface border border-sentinel-cyan flex items-center justify-center text-[10px] text-sentinel-cyan">
              <Cpu className="w-3 h-3" />
            </span>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white">
            SENTINEL <span className="text-transparent bg-clip-text bg-gradient-to-r from-sentinel-cyan to-teal-300">360</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">
            Command Center Terminal Clearance
          </p>
        </div>

        {/* Demo Mode Notice for Judges */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-sentinel-darkSurface to-slate-900 border border-sentinel-cyan/40 space-y-2.5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-sentinel-cyan uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Hackathon Judge One-Click Entry
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
              VERIFIED
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Pre-configured with Commander credentials for CODE CLASH 2026 evaluators. Bypass manual credential entry below:
          </p>

          <button
            type="button"
            onClick={handleDemoBypass}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sentinel-cyan via-teal-400 to-cyan-300 hover:opacity-95 text-sentinel-navy font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
          >
            <span>One-Click Judge Commander Access</span>
            <ArrowRight className="w-4 h-4 text-sentinel-navy" />
          </button>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/30 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300">
              Commander Email Identifier
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="commander.rao@sentinel360.gov"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-sentinel-darkSurface border border-sentinel-darkBorder focus:border-sentinel-cyan focus:ring-1 focus:ring-sentinel-cyan/40 focus:outline-none text-xs text-white placeholder-slate-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300">
              Passkey / Access Token
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-sentinel-darkSurface border border-sentinel-darkBorder focus:border-sentinel-cyan focus:ring-1 focus:ring-sentinel-cyan/40 focus:outline-none text-xs text-white placeholder-slate-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-sentinel-darkBorder hover:border-sentinel-cyan/40 transition-colors flex items-center justify-center gap-2"
          >
            <span>Authenticate Session</span>
            <ArrowRight className="w-3.5 h-3.5 text-sentinel-cyan" />
          </button>
        </form>

        <div className="pt-2 text-center border-t border-sentinel-darkBorder/40">
          <Link
            to="/"
            className="text-xs text-slate-400 hover:text-sentinel-cyan transition-colors font-mono inline-flex items-center gap-1"
          >
            ← Return to Public Citizen Portal
          </Link>
        </div>
      </div>
    </div>
  );
};
