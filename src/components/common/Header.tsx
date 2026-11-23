import React, { useState } from 'react';
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

  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isStrobeOpen, setIsStrobeOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

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

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b1420]/95 text-white backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            <Link
              to="/"
              onClick={() => soundEffects.playClick()}
              className="flex shrink-0 items-center gap-2.5 text-xl font-semibold tracking-tight text-white"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                <ShieldAlert className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>Sentri<span className="text-cyan-300">X</span></span>
            </Link>

            {/* Navigation Links */}
            <nav aria-label="Main navigation" className="hidden items-center gap-1 whitespace-nowrap lg:flex">
              <Link
                to="/"
                aria-current={isActive('/') ? 'page' : undefined}
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
                aria-current={isActive('/report') ? 'page' : undefined}
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
                aria-current={isActive('/track') ? 'page' : undefined}
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
            <div className="hidden shrink-0 items-center gap-2 whitespace-nowrap lg:flex">
              {/* Tactical Language Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-200 flex items-center gap-1.5 transition-colors"
                  title="Switch language"
                  aria-label="Switch language"
                  aria-expanded={isLangDropdownOpen}
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
                className="px-2.5 py-2 rounded-xl bg-sentinel-cyan/15 hover:bg-sentinel-cyan/25 text-sentinel-cyan border border-sentinel-cyan/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all active:scale-95"
                title="Voice assistant"
                aria-label="Voice assistant"
              >
                <Mic className="w-4 h-4 text-sentinel-cyan" />
              </button>

              {/* WhatsApp Emergency SOS Beacon Trigger */}
              <button
                onClick={() => setIsSosOpen(true)}
                className="px-2.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all active:scale-95"
                title="WhatsApp SOS"
                aria-label="WhatsApp SOS"
              >
                <LifeBuoy className="w-4 h-4 text-emerald-400" />
              </button>

              {/* Rescue Strobe Trigger */}
              <button
                onClick={() => setIsStrobeOpen(true)}
                className="px-2.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all active:scale-95"
                title="Rescue strobe"
                aria-label="Rescue strobe"
              >
                <Eye className="w-4 h-4 text-amber-400" />
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
                title="Citizen tools"
                aria-label="Citizen tools"
              >
                <User className="w-3.5 h-3.5 text-cyan-400" />
              </Link>

              {/* Admin Command Center */}
              <Link
                to="/admin/dashboard"
                onClick={() => soundEffects.playClick()}
                className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-[#0B1E38] hover:bg-[#10284B] text-slate-200 hover:text-white border border-[#16C7E8]/40 hover:border-[#16C7E8] transition-all flex items-center gap-2 shadow-lg shadow-black/40 hover:glow-cyan"
              >
                <LayoutDashboard className="w-4 h-4 text-sentinel-cyan" />
                <span>Command center</span>
              </Link>
            </div>

            {/* Mobile controls */}
            <div className="flex lg:hidden items-center gap-1.5">
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
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
                aria-controls="public-navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-sentinel-cyan" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div id="public-navigation" className="lg:hidden max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-[#16C7E8]/20 bg-[#071426]/98 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-3 animate-fadeIn shadow-2xl">
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
                aria-current={isActive('/') ? 'page' : undefined}
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
                aria-current={isActive('/report') ? 'page' : undefined}
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
                aria-current={isActive('/track') ? 'page' : undefined}
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
