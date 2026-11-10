import React, { useState, useEffect } from 'react';
import {
  X,
  Radio,
  PhoneCall,
  MessageSquare,
  Share2,
  MapPin,
  Battery,
  AlertTriangle,
  Copy,
  CheckCircle2,
  ShieldAlert,
  Flame,
  LifeBuoy,
} from 'lucide-react';
import { getLiveLocation, LiveLocationResult } from '../../utils/geolocation';
import { soundEffects } from '../../utils/soundEffects';
import { useLanguage } from '../../context/LanguageContext';

interface EmergencySosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMERGENCY_HELPLINES = [
  { number: '112', title: 'Universal National Emergency', agency: 'Police, Fire & Medical Integration', icon: ShieldAlert, color: 'text-red-400 bg-red-500/15 border-red-500/30' },
  { number: '100', title: 'Police Rapid Response', agency: 'Law Enforcement Command', icon: PhoneCall, color: 'text-blue-400 bg-blue-500/15 border-blue-500/30' },
  { number: '101', title: 'Fire & Rescue Brigade', agency: 'Structural Collapse & Fire', icon: Flame, color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' },
  { number: '108', title: 'Emergency Medical Ambulance', agency: 'Trauma Paramedics & Life Support', icon: LifeBuoy, color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' },
  { number: '1077', title: 'Disaster Relief & Floods', agency: 'NDRF / Disaster Management Authority', icon: Radio, color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30' },
];

export const EmergencySosModal: React.FC<EmergencySosModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [location, setLocation] = useState<LiveLocationResult | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      soundEffects.playAlert();
      getLiveLocation().then(loc => setLocation(loc));

      // Attempt to inspect battery level
      if ('getBattery' in navigator) {
        (navigator as any).getBattery().then((battery: any) => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const lat = location?.latitude ?? 12.9716;
  const lon = location?.longitude ?? 77.5946;
  const mapsLink = `https://maps.google.com/?q=${lat},${lon}`;
  const distressMessage = `EMERGENCY SOS (SentriX): Life-threatening emergency! Coordinates: ${mapsLink} (Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}). Location: ${location?.address || 'GPS Position'}. Please dispatch rescue immediately!`;

  const smsUrl = `sms:112?body=${encodeURIComponent(distressMessage)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(distressMessage)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(distressMessage);
    setCopied(true);
    soundEffects.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 selection:bg-red-500/30 animate-fadeIn">
      <div className="w-full max-w-xl glass-panel bg-sentinel-navy rounded-3xl border-2 border-red-500/50 shadow-2xl overflow-hidden animate-scaleUp glow-red">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-red-600 via-rose-700 to-amber-700 text-white flex items-center justify-between border-b border-red-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner shrink-0">
              <Radio className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  {t('sos.title', 'Emergency Offline SOS Beacon')}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-mono font-bold">
                  ZERO-DATA FAILSAFE
                </span>
              </div>
              <p className="text-xs text-red-100 font-mono">
                {t('sos.subtitle', 'Zero-Internet Cellular Dispatch Link Generator')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/15 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Coordinates Telemetry Pill */}
        <div className="px-5 py-3 bg-[#050E1A] border-b border-red-500/20 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-white font-bold">GPS:</span>
            <span>{lat.toFixed(4)}, {lon.toFixed(4)}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
              {location ? `±${location.accuracy}m` : 'LOCKING...'}
            </span>
          </div>

          {batteryLevel !== null && (
            <div className="flex items-center gap-1.5 text-slate-400">
              <Battery className="w-3.5 h-3.5 text-amber-400" />
              <span>Battery: {batteryLevel}%</span>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          {/* 1-Tap SOS Dispatch Actions */}
          <div className="space-y-3">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-red-400">
              Instant Cellular & Satellite Dispatch:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={smsUrl}
                onClick={() => soundEffects.playCriticalSiren()}
                className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-red-600/30 transition-all active:scale-95 border border-red-400/40 glow-red"
              >
                <MessageSquare className="w-5 h-5 shrink-0" />
                <span>{t('sos.smsBtn', 'Send Emergency SMS to 112')}</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => soundEffects.playAlert()}
                className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-600/20 transition-all active:scale-95 border border-emerald-400/40"
              >
                <Share2 className="w-5 h-5 shrink-0" />
                <span>{t('sos.whatsappBtn', 'Send WhatsApp Emergency SOS')}</span>
              </a>
            </div>
          </div>

          {/* Copyable Distress Text Box */}
          <div className="p-3.5 rounded-2xl bg-sentinel-darkSurface border border-sentinel-darkBorder space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                Formatted Emergency Transmission String
              </span>
              <button
                onClick={handleCopy}
                className="text-xs text-sentinel-cyan hover:underline flex items-center gap-1 font-mono"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-300 font-mono bg-[#071426] p-2.5 rounded-xl border border-white/5 break-all select-all">
              {distressMessage}
            </p>
          </div>

          {/* Speed Dial Emergency Helplines */}
          <div className="space-y-3">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Direct Voice Speed Dial to Dispatch Authorities:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {EMERGENCY_HELPLINES.map(line => {
                const Icon = line.icon;
                return (
                  <a
                    key={line.number}
                    href={`tel:${line.number}`}
                    onClick={() => soundEffects.playBeep()}
                    className="p-3 rounded-2xl bg-sentinel-darkSurface hover:bg-slate-800/80 border border-sentinel-darkBorder flex items-center justify-between transition-all group active:scale-95"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${line.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-sentinel-cyan transition-colors">
                          {line.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {line.agency}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-sm font-black text-white px-2 py-1 rounded-lg bg-white/10 shrink-0">
                      📞 {line.number}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
