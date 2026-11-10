import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Lock, Mail, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('commander.rao@sentinel360.gov');
  const [password, setPassword] = useState('sentinel2026');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }
    login(email, password);
    navigate('/admin/dashboard');
  };

  const handleDemoBypass = () => {
    login('commander.rao@sentinel360.gov', 'sentinel2026');
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sentinel-navy text-white p-4 relative overflow-hidden font-sans">
      {/* Background aesthetics */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#16C7E8_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-sentinel-cyan/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sentinel-red/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-md w-full bg-sentinel-darkSurface/90 border border-sentinel-darkBorder rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6 animate-scaleUp">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sentinel-red to-rose-700 flex items-center justify-center mx-auto shadow-lg shadow-sentinel-red/30">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            SENTINEL <span className="text-sentinel-cyan">360</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">
            Command Center Terminal Login
          </p>
        </div>

        {/* Demo Mode Notice for Judges */}
        <div className="p-3.5 rounded-2xl bg-sentinel-darkBlue/80 border border-sentinel-cyan/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-sentinel-cyan uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Zap className="w-3.5 h-3.5 text-sentinel-cyan" /> Hackathon Judge Quick Access
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-xs text-slate-300">
            Pre-loaded with authorized Command credentials. Click below to enter the live command center instantly.
          </p>
          <button
            type="button"
            onClick={handleDemoBypass}
            className="w-full py-2.5 px-3 rounded-xl bg-sentinel-cyan hover:bg-cyan-300 text-sentinel-navy font-bold text-xs flex items-center justify-center gap-2 shadow transition-transform active:scale-95"
          >
            <span>One-Click Judge Commander Access</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && <div className="text-xs text-red-400 bg-red-500/10 p-2.5 rounded-xl border border-red-500/30">{error}</div>}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Authorized Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="commander.rao@sentinel360.gov"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-sentinel-navy border border-sentinel-darkBorder focus:border-sentinel-cyan focus:outline-none text-xs text-white placeholder-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Passkey / Access Token
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-sentinel-navy border border-sentinel-darkBorder focus:border-sentinel-cyan focus:outline-none text-xs text-white placeholder-slate-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-sentinel-darkBlue hover:bg-slate-800 text-white font-bold text-xs border border-sentinel-darkBorder hover:border-sentinel-cyan/40 transition-colors flex items-center justify-center gap-2"
          >
            <span>Sign In to Terminal</span>
            <ArrowRight className="w-3.5 h-3.5 text-sentinel-cyan" />
          </button>
        </form>

        <div className="pt-2 text-center">
          <Link to="/" className="text-xs text-slate-400 hover:text-white transition-colors">
            ← Return to Citizen Public Portal
          </Link>
        </div>
      </div>
    </div>
  );
};
