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
  ShieldCheck,
  Cpu,
  User,
  Phone,
  HeartPulse,
  Radio,
  Sparkles,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginCommander, loginCitizen } = useAuth();
  const navigate = useNavigate();

  // Active Login Mode: 'commander' | 'citizen'
  const [activeTab, setActiveTab] = useState<'commander' | 'citizen'>('commander');

  // Commander Credentials
  const [commanderEmail, setCommanderEmail] = useState('commander.rao@sentrix.gov');
  const [commanderPassword, setCommanderPassword] = useState('sentinel2026');
  const [commanderBadge, setCommanderBadge] = useState('DISPATCH-CMD-01');

  // Citizen Credentials
  const [citizenName, setCitizenName] = useState('Natesh Kanna');
  const [citizenPhone, setCitizenPhone] = useState('+91 7806869597');
  const [citizenBloodGroup, setCitizenBloodGroup] = useState('O+');
  const [citizenOtp, setCitizenOtp] = useState('7806');

  const [error, setError] = useState('');

  const handleCommanderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commanderEmail.trim()) {
      setError('Authorized commander email identifier required');
      soundEffects.playAlert();
      return;
    }
    soundEffects.playClick();
    loginCommander(commanderEmail, commanderPassword, commanderBadge);
    navigate('/admin/dashboard');
  };

  const handleCitizenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenPhone.trim()) {
      setError('Valid mobile number required for citizen verification');
      soundEffects.playAlert();
      return;
    }
    soundEffects.playClick();
    loginCitizen(citizenName, citizenPhone, citizenBloodGroup);
    navigate('/citizen');
  };

  const handleCommanderDemoBypass = () => {
    soundEffects.playBeep();
    loginCommander('commander.rao@sentrix.gov', 'sentinel2026', 'DISPATCH-CMD-01');
    navigate('/admin/dashboard');
  };

  const handleCitizenDemoBypass = () => {
    soundEffects.playBeep();
    loginCitizen('Natesh Kanna', '+91 7806869597', 'O+');
    navigate('/citizen');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050B14] text-white p-4 relative overflow-hidden font-sans selection:bg-cyan-500/30">
      {/* Background HUD aesthetics */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#16C7E8_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-red-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative max-w-lg w-full bg-[#080E1A] border border-white/10 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6 animate-scaleUp">
        {/* Top Telemetry Strip */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-white/10 pb-3">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            GATEWAY // DUAL-AUTH-MATRIX
          </span>
          <span className="text-slate-400 uppercase tracking-widest font-bold">
            ENCRYPTION: AES-256
          </span>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="relative inline-block">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 flex items-center justify-center mx-auto shadow-xl shadow-red-600/30 border border-white/20">
              <ShieldAlert className="w-9 h-9 text-white animate-pulse" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#080E1A] border border-cyan-400 flex items-center justify-center text-[10px] text-cyan-400">
              <Cpu className="w-3 h-3" />
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Sentri<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">X</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">
            Intelligent Emergency Response & Disaster Management System
          </p>
        </div>

        {/* Dual Portal Switcher Tabs */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[#050C16] border border-white/10 gap-1.5">
          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('commander');
              setError('');
            }}
            className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'commander'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Command Official</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('citizen');
              setError('');
            }}
            className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'citizen'
                ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            <span>Citizen Portal</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-mono flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. COMMANDER LOGIN PORTAL */}
        {activeTab === 'commander' ? (
          <form onSubmit={handleCommanderSubmit} className="space-y-4 animate-fadeIn">
            {/* Judge 1-Click Fast Pass */}
            <div className="p-3.5 rounded-2xl bg-red-950/30 border border-red-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-red-400 font-bold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Hackathon Judge 1-Click Access
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold">
                  LEVEL 3 CLEARANCE
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Instantly bypass manual input and launch Command Center with Chief Officer credentials:
              </p>
              <button
                type="button"
                onClick={handleCommanderDemoBypass}
                className="w-full py-2 px-3 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/40 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>⚡ Instant Entry: Chief Aditi Rao (DISPATCH-CMD-01)</span>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase mb-1">
                  Official Commander ID / Gov Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={commanderEmail}
                    onChange={e => setCommanderEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#050C16] border border-white/10 text-white placeholder-slate-500 text-xs font-mono focus:border-red-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase mb-1">
                  Security Clearance Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={commanderPassword}
                    onChange={e => setCommanderPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#050C16] border border-white/10 text-white placeholder-slate-500 text-xs font-mono focus:border-red-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase mb-1">
                  Tactical Badge ID / Station Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={commanderBadge}
                    onChange={e => setCommanderBadge(e.target.value)}
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#050C16] border border-white/10 text-white placeholder-slate-500 text-xs font-mono focus:border-red-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all active:scale-95"
            >
              <span>Authenticate & Enter Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* 2. CITIZEN LOGIN PORTAL */
          <form onSubmit={handleCitizenSubmit} className="space-y-4 animate-fadeIn">
            {/* Judge 1-Click Fast Pass for Citizen */}
            <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-cyan-400 font-bold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Hackathon Judge 1-Click Citizen Pass
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                  CITIZEN PROFILE
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Launch citizen dashboard with verified mobile number and emergency profile:
              </p>
              <button
                type="button"
                onClick={handleCitizenDemoBypass}
                className="w-full py-2 px-3 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/40 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>⚡ Instant Entry: Natesh Kanna (+91 7806869597)</span>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase mb-1">
                  Citizen Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={citizenName}
                    onChange={e => setCitizenName(e.target.value)}
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#050C16] border border-white/10 text-white placeholder-slate-500 text-xs font-mono focus:border-cyan-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase mb-1">
                  Mobile / WhatsApp Emergency Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={citizenPhone}
                    onChange={e => setCitizenPhone(e.target.value)}
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#050C16] border border-white/10 text-white placeholder-slate-500 text-xs font-mono focus:border-cyan-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase mb-1">
                    Emergency Blood Group
                  </label>
                  <div className="relative">
                    <HeartPulse className="w-4 h-4 text-rose-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={citizenBloodGroup}
                      onChange={e => setCitizenBloodGroup(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#050C16] border border-white/10 text-white text-xs font-mono focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="O+">O+ (Positive)</option>
                      <option value="O-">O- (Universal)</option>
                      <option value="A+">A+ (Positive)</option>
                      <option value="A-">A- (Negative)</option>
                      <option value="B+">B+ (Positive)</option>
                      <option value="B-">B- (Negative)</option>
                      <option value="AB+">AB+ (Positive)</option>
                      <option value="AB-">AB- (Negative)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase mb-1">
                    OTP Verification
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={citizenOtp}
                      onChange={e => setCitizenOtp(e.target.value)}
                      maxLength={6}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#050C16] border border-white/10 text-white text-xs font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 transition-all active:scale-95"
            >
              <span>Verify & Access Citizen Emergency Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Back to Public Home */}
        <div className="text-center pt-2">
          <Link
            to="/"
            onClick={() => soundEffects.playClick()}
            className="text-xs text-slate-400 hover:text-cyan-400 font-mono transition-colors"
          >
            ← Return to SentriX Public Emergency Defense Portal
          </Link>
        </div>
      </div>
    </div>
  );
};
