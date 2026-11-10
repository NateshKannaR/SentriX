import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShieldAlert,
  Radio,
  PhoneCall,
  LayoutDashboard,
  Search,
  Menu,
  X,
  Volume2,
  VolumeX,
  Clock,
  Activity,
  Terminal,
} from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';

export const Header: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(soundFx.isEnabled());
  const [currentTime, setCurrentTime] = useState(new Date().toUTCString().slice(17, 25));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toUTCString().slice(17, 25));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAudioToggle = () => {
    const newState = soundFx.toggle();
    setAudioEnabled(newState);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#071426]/90 backdrop-blur-xl border-b border-[#16C7E8]/20 text-white shadow-2xl">
      {/* Top Telemetry Micro-Bar */}
      <div className="hidden lg:flex items-center justify-between px-6 py-1 bg-[#040C17] border-b border-white/5 text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            TELEMETRY: ACTIVE (LATENCY 12ms)
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1 text-[#16C7E8]">
            <Clock className="w-3 h-3" /> UTC {currentTime}Z
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">DEFCON LEVEL 2: HIGH READINESS</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-slate-400">ENCRYPTION: AES-256 GCM</span>
          <span className="text-slate-600">|</span>
          <span className="text-[#16C7E8] font-bold">CODE CLASH 2026 EDITION</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand with Tactical Halo */}
          <Link
            to="/"
            onClick={() => soundFx.playClick()}
            className="flex items-center gap-3.5 group cursor-pointer"
          >
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-sentinel-red via-rose-700 to-[#071426] p-0.5 shadow-lg shadow-sentinel-red/25 group-hover:scale-105 transition-all">
              <div className="w-full h-full bg-[#071426] rounded-[14px] flex items-center justify-center relative overflow-hidden">
                <ShieldAlert className="w-6 h-6 text-sentinel-red group-hover:text-white transition-colors" />
                <div className="absolute inset-0 bg-gradient-to-t from-sentinel-red/20 to-transparent pointer-events-none" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-sentinel-cyan rounded-full animate-ping" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-sentinel-cyan rounded-full shadow-[0_0_8px_#16C7E8]" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-2xl tracking-wider text-white">Sentri</span>
                <span className="bg-gradient-to-r from-sentinel-cyan via-teal-300 to-blue-400 bg-clip-text text-transparent font-black text-2xl tracking-tight">
                  X
                </span>
                <span className="hidden sm:inline-block text-[9px] uppercase font-mono px-2 py-0.5 rounded-full bg-sentinel-cyan/15 text-sentinel-cyan border border-sentinel-cyan/30 tracking-widest font-bold">
                  MIL-SPEC
                </span>
              </div>
                <p className="text-[11px] text-slate-400 font-mono tracking-tight flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="hidden sm:inline">Intelligent Emergency Operations Platform</span>
                  <span className="inline sm:hidden text-[10px] text-slate-400">Emergency Operations</span>
                </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#0B1E38]/60 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
            <Link
              to="/"
              onClick={() => soundFx.playClick()}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive('/')
                  ? 'text-sentinel-cyan bg-[#16C7E8]/15 shadow-sm border border-[#16C7E8]/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Overview
            </Link>

            <Link
              to="/report"
              onClick={() => soundFx.playClick()}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                isActive('/report')
                  ? 'text-sentinel-red bg-sentinel-red/15 border border-sentinel-red/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-sentinel-red animate-pulse" />
              Report SOS
            </Link>

            <Link
              to="/track"
              onClick={() => soundFx.playClick()}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isActive('/track')
                  ? 'text-sentinel-cyan bg-[#16C7E8]/15 border border-[#16C7E8]/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Track Code
            </Link>
          </nav>

          {/* Quick Actions Bar */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Audio Toggle */}
            <button
              onClick={handleAudioToggle}
              className={`p-2.5 rounded-xl border transition-all ${
                audioEnabled
                  ? 'bg-[#16C7E8]/10 text-sentinel-cyan border-[#16C7E8]/30 shadow-[0_0_12px_rgba(22,199,232,0.2)]'
                  : 'bg-white/5 text-slate-500 border-white/10 hover:text-slate-300'
              }`}
              title={audioEnabled ? 'Mute Tactical Audio' : 'Enable Tactical Audio HUD'}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* SOS Emergency Reporting CTA */}
            <Link
              to="/report"
              onClick={() => soundFx.playAlert()}
              className="px-4 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-sentinel-red to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg shadow-sentinel-red/35 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] border border-red-400/40 glow-red"
            >
              <PhoneCall className="w-4 h-4 animate-bounce" />
              <span>SOS DISPATCH</span>
            </Link>

            {/* Admin Command Center */}
            <Link
              to="/admin/dashboard"
              onClick={() => soundFx.playClick()}
              className="px-4 py-2.5 rounded-xl text-xs font-extrabold bg-[#0B1E38] hover:bg-[#10284B] text-slate-200 hover:text-white border border-[#16C7E8]/40 hover:border-[#16C7E8] transition-all flex items-center gap-2 shadow-lg shadow-black/40 hover:glow-cyan"
            >
              <LayoutDashboard className="w-4 h-4 text-sentinel-cyan" />
              <span>COMMAND CENTER</span>
            </Link>
          </div>

          {/* Mobile controls */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={handleAudioToggle}
              className={`p-2.5 rounded-xl border transition-all min-w-[40px] min-h-[40px] flex items-center justify-center ${
                audioEnabled
                  ? 'bg-sentinel-cyan/15 text-sentinel-cyan border-sentinel-cyan/40'
                  : 'bg-white/5 text-slate-500 border-white/10'
              }`}
              aria-label="Toggle tactical audio"
            >
              {audioEnabled ? <Volume2 className="w-4 h-4 text-sentinel-cyan" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-300 hover:text-white bg-white/5 border border-white/10 min-w-[42px] min-h-[42px] flex items-center justify-center"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-sentinel-cyan" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#16C7E8]/20 bg-[#071426]/98 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-3 animate-fadeIn shadow-2xl">
          {/* Mobile Telemetry Strip */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#040C17] border border-white/10 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE
            </span>
            <span className="text-[#16C7E8] flex items-center gap-1 font-bold">
              <Clock className="w-3 h-3" /> UTC {currentTime}Z
            </span>
            <span className="text-amber-400">DEFCON 2</span>
          </div>

          <div className="space-y-1">
            <Link
              to="/"
              onClick={() => {
                soundFx.playClick();
                setMobileMenuOpen(false);
              }}
              className={`block px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                isActive('/')
                  ? 'bg-[#16C7E8]/15 text-sentinel-cyan border border-[#16C7E8]/30'
                  : 'text-slate-200 hover:bg-white/5'
              }`}
            >
              Overview
            </Link>
            <Link
              to="/report"
              onClick={() => {
                soundFx.playAlert();
                setMobileMenuOpen(false);
              }}
              className={`block px-4 py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-between ${
                isActive('/report')
                  ? 'bg-sentinel-red/15 text-sentinel-red border border-sentinel-red/30'
                  : 'text-slate-200 hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-2 text-sentinel-red">
                <Radio className="w-4 h-4 animate-pulse" />
                Report SOS Emergency
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-sentinel-red/20 text-red-300 font-black">
                URGENT
              </span>
            </Link>
            <Link
              to="/track"
              onClick={() => {
                soundFx.playClick();
                setMobileMenuOpen(false);
              }}
              className={`block px-4 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${
                isActive('/track')
                  ? 'bg-[#16C7E8]/15 text-sentinel-cyan border border-[#16C7E8]/30'
                  : 'text-slate-200 hover:bg-white/5'
              }`}
            >
              <Search className="w-4 h-4 text-sentinel-cyan" />
              Track Incident Code
            </Link>
          </div>

          <div className="pt-3 border-t border-white/10 space-y-2">
            <Link
              to="/report"
              onClick={() => {
                soundFx.playAlert();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3.5 rounded-2xl text-center font-extrabold bg-gradient-to-r from-sentinel-red to-rose-600 text-white flex items-center justify-center gap-2 shadow-lg shadow-sentinel-red/30 glow-red border border-red-400/40 text-sm"
            >
              <PhoneCall className="w-4 h-4" />
              SOS Immediate Report
            </Link>
            <Link
              to="/admin/dashboard"
              onClick={() => {
                soundFx.playClick();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3.5 rounded-2xl text-center font-extrabold bg-[#0B1E38] hover:bg-[#10284B] text-white border border-[#16C7E8]/40 flex items-center justify-center gap-2 text-sm shadow-lg"
            >
              <LayoutDashboard className="w-4 h-4 text-sentinel-cyan" />
              Admin Command Center
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
