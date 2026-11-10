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
  Mic,
  Zap,
  Globe,
  LifeBuoy,
  Eye,
  User,
} from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';
import { useLanguage } from '../../context/LanguageContext';
import { VoiceAssistantModal } from './VoiceAssistantModal';
import { EmergencySosModal } from './EmergencySosModal';
import { RescueStrobeModal } from './RescueStrobeModal';
import { CivilDefenseBanner } from './CivilDefenseBanner';
import { SupportedLanguage } from '../../utils/translations';

export const Header: React.FC = () => {
  const location = useLocation();
  const { language, setLanguage, currentLanguageOption, languages, t } = useLanguage();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(!soundEffects.isMuted());
  const [currentTime, setCurrentTime] = useState(new Date().toUTCString().slice(17, 25));

  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isStrobeOpen, setIsStrobeOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toUTCString().slice(17, 25));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAudioToggle = () => {
    const muted = soundEffects.toggleMute();
    setAudioEnabled(!muted);
    if (!muted) soundEffects.playBeep();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Civil Defense Emergency Marquee Banner */}
      <CivilDefenseBanner />

      <header className="sticky top-0 z-40 bg-[#071426]/90 backdrop-blur-xl border-b border-[#16C7E8]/20 text-white shadow-2xl">
        {/* Top Telemetry Micro-Bar */}
        <div className="hidden lg:flex items-center justify-between px-6 py-1 bg-[#040C17] border-b border-white/5 text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {t('header.telemetryActive', 'TELEMETRY: ACTIVE (LATENCY 12ms)')}
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 text-[#16C7E8]">
              <Clock className="w-3 h-3" /> UTC {currentTime}Z
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">{t('header.defcon', 'DEFCON LEVEL 2: HIGH READINESS')}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-400">ENCRYPTION: AES-256 GCM</span>
            <span className="text-slate-600">|</span>
            <span className="text-[#16C7E8] font-bold">{t('header.hackathonTag', 'CODE CLASH 2026 EDITION')}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Brand with Tactical Halo */}
            <Link
              to="/"
              onClick={() => soundEffects.playClick()}
              className="flex items-center gap-3.5 group cursor-pointer"
            >
              <div className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-sentinel-red via-rose-700 to-[#071426] p-0.5 shadow-lg shadow-sentinel-red/25 group-hover:scale-105 transition-all shrink-0">
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
                  <span className="hidden sm:inline">{t('header.tagline', 'Every Second Matters. Every Life Counts.')}</span>
                  <span className="inline sm:hidden text-[10px] text-slate-400">Every Second Matters</span>
                </p>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1.5 bg-[#0B1E38]/60 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
              <Link
                to="/"
                onClick={() => soundEffects.playClick()}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive('/')
                    ? 'text-sentinel-cyan bg-[#16C7E8]/15 shadow-sm border border-[#16C7E8]/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {t('nav.overview', 'Public Portal')}
              </Link>

              <Link
                to="/report"
                onClick={() => soundEffects.playClick()}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isActive('/report')
                    ? 'text-sentinel-red bg-sentinel-red/15 border border-sentinel-red/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-sentinel-red animate-pulse" />
                {t('nav.report', 'Report SOS')}
              </Link>

              <Link
                to="/track"
                onClick={() => soundEffects.playClick()}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive('/track')
                    ? 'text-sentinel-cyan bg-[#16C7E8]/15 border border-[#16C7E8]/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                {t('nav.track', 'Track Code')}
              </Link>
            </nav>

            {/* Tactical Superpowers Bar */}
            <div className="hidden sm:flex items-center gap-2">
              {/* Tactical Language Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-200 flex items-center gap-1.5 transition-colors"
                  title="Switch Language"
                >
                  <Globe className="w-3.5 h-3.5 text-sentinel-cyan" />
                  <span className="font-bold">{currentLanguageOption.flag}</span>
                  <span className="hidden md:inline">{currentLanguageOption.name}</span>
                </button>

                {isLangDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-[#0B1E38] border border-sentinel-darkBorder shadow-2xl py-1.5 z-50 animate-scaleUp">
                    {languages.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code as SupportedLanguage);
                          setIsLangDropdownOpen(false);
                          soundEffects.playClick();
                        }}
                        className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between hover:bg-white/10 transition-colors ${
                          language === lang.code ? 'text-sentinel-cyan font-bold bg-white/5' : 'text-slate-300'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.nativeName}</span>
                        </span>
                        {language === lang.code && <span className="w-1.5 h-1.5 rounded-full bg-sentinel-cyan" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Voice AI Trigger */}
              <button
                onClick={() => setIsVoiceOpen(true)}
                className="px-2.5 py-2 rounded-xl bg-sentinel-cyan/15 hover:bg-sentinel-cyan/25 text-sentinel-cyan border border-sentinel-cyan/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all active:scale-95 glow-cyan"
                title="Launch AURA Voice Assistant"
              >
                <Mic className="w-4 h-4 text-sentinel-cyan animate-pulse" />
                <span className="hidden xl:inline">{t('nav.voiceAssistant', 'Voice AI')}</span>
              </button>

              {/* WhatsApp Emergency SOS Beacon Trigger */}
              <button
                onClick={() => setIsSosOpen(true)}
                className="px-2.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all active:scale-95 glow-emerald"
                title="Direct WhatsApp Emergency SOS (+91 7806869597)"
              >
                <LifeBuoy className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="hidden xl:inline">WhatsApp SOS</span>
              </button>

              {/* Rescue Strobe Trigger */}
              <button
                onClick={() => setIsStrobeOpen(true)}
                className="px-2.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all active:scale-95"
                title="Rescue Optical Strobe"
              >
                <Eye className="w-4 h-4 text-amber-400" />
                <span className="hidden xl:inline">{t('nav.rescueStrobe', 'Strobe')}</span>
              </button>

              {/* Audio Toggle */}
              <button
                onClick={handleAudioToggle}
                className={`p-2 rounded-xl border transition-all ${
                  audioEnabled
                    ? 'bg-[#16C7E8]/10 text-sentinel-cyan border-[#16C7E8]/30 shadow-[0_0_12px_rgba(22,199,232,0.2)]'
                    : 'bg-white/5 text-slate-500 border-white/10 hover:text-slate-300'
                }`}
                title={audioEnabled ? 'Mute Tactical Audio' : 'Enable Tactical Audio HUD'}
              >
                {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Dual Portal Gateway: Citizen Portal & Command Center */}
              <Link
                to="/citizen"
                onClick={() => soundEffects.playClick()}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all flex items-center gap-1.5"
                title="Citizen Emergency Portal"
              >
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden lg:inline">Citizen Portal</span>
              </Link>

              {/* Admin Command Center */}
              <Link
                to="/admin/dashboard"
                onClick={() => soundEffects.playClick()}
                className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-[#0B1E38] hover:bg-[#10284B] text-slate-200 hover:text-white border border-[#16C7E8]/40 hover:border-[#16C7E8] transition-all flex items-center gap-2 shadow-lg shadow-black/40 hover:glow-cyan"
              >
                <LayoutDashboard className="w-4 h-4 text-sentinel-cyan" />
                <span className="hidden md:inline">{t('nav.admin', 'COMMAND CENTER')}</span>
              </Link>
            </div>

            {/* Mobile controls */}
            <div className="flex sm:hidden items-center gap-1.5">
              <button
                onClick={() => setIsVoiceOpen(true)}
                className="p-2 rounded-xl bg-sentinel-cyan/15 text-sentinel-cyan border border-sentinel-cyan/30"
                title="Voice AI"
              >
                <Mic className="w-4 h-4 animate-pulse" />
              </button>

              <button
                onClick={() => setIsSosOpen(true)}
                className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                title="WhatsApp SOS (+91 7806869597)"
              >
                <LifeBuoy className="w-4 h-4 animate-pulse" />
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 border border-white/10 min-w-[38px] min-h-[38px] flex items-center justify-center"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-sentinel-cyan" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-[#16C7E8]/20 bg-[#071426]/98 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-3 animate-fadeIn shadow-2xl">
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

            {/* Mobile Language Selector */}
            <div className="p-2 rounded-xl bg-sentinel-darkSurface border border-white/10 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-sentinel-cyan" />
                Language:
              </span>
              <div className="flex items-center gap-1">
                {languages.map(l => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code as SupportedLanguage);
                      soundEffects.playClick();
                    }}
                    className={`px-2 py-1 rounded-lg text-xs font-mono transition-colors ${
                      language === l.code
                        ? 'bg-sentinel-cyan text-sentinel-navy font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {l.flag} {l.code.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <Link
                to="/"
                onClick={() => {
                  soundEffects.playClick();
                  setMobileMenuOpen(false);
                }}
                className={`block px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  isActive('/')
                    ? 'bg-[#16C7E8]/15 text-sentinel-cyan border border-[#16C7E8]/30'
                    : 'text-slate-200 hover:bg-white/5'
                }`}
              >
                {t('nav.overview', 'Public Portal')}
              </Link>
              <Link
                to="/report"
                onClick={() => {
                  soundEffects.playAlert();
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
                  {t('nav.report', 'Report SOS Emergency')}
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-sentinel-red/20 text-red-300 font-black">
                  URGENT
                </span>
              </Link>
              <Link
                to="/track"
                onClick={() => {
                  soundEffects.playClick();
                  setMobileMenuOpen(false);
                }}
                className={`block px-4 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${
                  isActive('/track')
                    ? 'bg-[#16C7E8]/15 text-sentinel-cyan border border-[#16C7E8]/30'
                    : 'text-slate-200 hover:bg-white/5'
                }`}
              >
                <Search className="w-4 h-4 text-sentinel-cyan" />
                {t('nav.track', 'Track Incident Code')}
              </Link>
            </div>

            {/* Mobile Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  setIsVoiceOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="py-2.5 px-3 rounded-xl bg-sentinel-cyan/15 border border-sentinel-cyan/30 text-sentinel-cyan text-xs font-mono font-bold flex items-center justify-center gap-1.5"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Voice AI</span>
              </button>

              <button
                onClick={() => {
                  setIsStrobeOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="py-2.5 px-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Rescue Strobe</span>
              </button>
            </div>

            <div className="pt-2 border-t border-white/10 space-y-2">
              <button
                onClick={() => {
                  setIsSosOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full py-3 rounded-2xl text-center font-extrabold bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 text-xs glow-emerald"
              >
                <LifeBuoy className="w-4 h-4" />
                WhatsApp Emergency SOS (+91 7806869597)
              </button>
              <Link
                to="/citizen"
                onClick={() => {
                  soundEffects.playClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-3 rounded-2xl text-center font-extrabold bg-[#071322] hover:bg-[#0A1A2E] text-white border border-cyan-500/30 flex items-center justify-center gap-2 text-xs shadow-lg"
              >
                <User className="w-4 h-4 text-cyan-400" />
                Citizen Emergency Portal
              </Link>
              <Link
                to="/admin/dashboard"
                onClick={() => {
                  soundEffects.playClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-3 rounded-2xl text-center font-extrabold bg-[#0B1E38] hover:bg-[#10284B] text-white border border-[#16C7E8]/40 flex items-center justify-center gap-2 text-xs shadow-lg"
              >
                <LayoutDashboard className="w-4 h-4 text-sentinel-cyan" />
                {t('nav.admin', 'Admin Command Center')}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
      />

      {/* Offline SOS Modal */}
      <EmergencySosModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
      />

      {/* Rescue Strobe Modal */}
      <RescueStrobeModal
        isOpen={isStrobeOpen}
        onClose={() => setIsStrobeOpen(false)}
      />
    </>
  );
};
