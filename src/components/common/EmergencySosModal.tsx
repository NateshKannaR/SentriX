import React, { useState, useEffect } from 'react';
import {
  X,
  Radio,
  MapPin,
  Battery,
  Copy,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  PhoneCall,
  ShieldCheck,
  Send,
  Sparkles,
} from 'lucide-react';
import { getLiveLocation, LiveLocationResult } from '../../utils/geolocation';
import { soundEffects } from '../../utils/soundEffects';
import { useLanguage } from '../../context/LanguageContext';
import {
  EMERGENCY_WHATSAPP_NUMBER,
  EMERGENCY_WHATSAPP_DISPLAY,
  formatEmergencyDistressMessage,
  buildEmergencyWhatsAppUrl,
  dispatchDirectEmergencyWhatsApp,
} from '../../utils/whatsappSos';

interface EmergencySosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMERGENCY_PRESETS = [
  { id: 'medical', label: '🚑 Medical / Trauma Emergency', note: 'Severe medical trauma / unconscious casualty. Immediate paramedic ambulance needed!' },
  { id: 'fire', label: '🔥 Fire / Explosion / Trapped', note: 'Active fire hazard with smoke and trapped occupants. Immediate fire brigade rescue required!' },
  { id: 'accident', label: '🚗 Vehicle Collision / Highway', note: 'Major vehicular crash with road blockage and injured victims. Deploy highway patrol & rescue!' },
  { id: 'flood', label: '🌊 Flood / Collapse Disaster', note: 'Severe waterlogging / structural hazard. Evacuation and NDRF assistance needed!' },
  { id: 'safety', label: '🛡️ Women / Citizen Safety', note: 'Immediate threat to personal safety. Law enforcement rapid intervention requested!' },
  { id: 'general', label: '⚠️ General Life-Threatening SOS', note: 'Life-threatening distress at current coordinates. Dispatch nearest emergency unit immediately!' },
];

export const EmergencySosModal: React.FC<EmergencySosModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [location, setLocation] = useState<LiveLocationResult | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('general');
  const [customNote, setCustomNote] = useState<string>('');

  const fetchLocation = async () => {
    setIsLocating(true);
    try {
      const loc = await getLiveLocation();
      setLocation(loc);
    } finally {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      soundEffects.playAlert();
      fetchLocation();

      // Battery inspection
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

  const presetObj = EMERGENCY_PRESETS.find(p => p.id === selectedPreset) || EMERGENCY_PRESETS[5];
  const activeNote = customNote.trim() || presetObj.note;

  const distressMessage = formatEmergencyDistressMessage({
    latitude: lat,
    longitude: lon,
    address: location?.address,
    accuracy: location?.accuracy,
    batteryLevel,
    incidentType: presetObj.label.replace(/^[^\w\s]+/, '').trim(),
    customNote: activeNote,
  });

  const whatsappDirectUrl = buildEmergencyWhatsAppUrl(distressMessage);

  const handleDispatchWhatsApp = () => {
    soundEffects.playCriticalSiren();
    dispatchDirectEmergencyWhatsApp({
      latitude: lat,
      longitude: lon,
      address: location?.address,
      accuracy: location?.accuracy,
      batteryLevel,
      incidentType: presetObj.label.replace(/^[^\w\s]+/, '').trim(),
      customNote: activeNote,
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(distressMessage);
    setCopied(true);
    soundEffects.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 selection:bg-emerald-500/30 animate-fadeIn select-none">
      <div className="w-full max-w-xl bg-[#070D18] rounded-3xl border border-emerald-500/40 shadow-2xl overflow-hidden animate-scaleUp glow-emerald flex flex-col max-h-[92vh]">
        {/* Header with WhatsApp Branding */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-[#071F18] to-[#0A1424] text-white flex items-center justify-between border-b border-emerald-500/30">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/20">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  WhatsApp Emergency SOS
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  DIRECT TO {EMERGENCY_WHATSAPP_NUMBER}
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 font-mono">
                Direct Dispatch Line: <span className="text-emerald-400 font-bold">{EMERGENCY_WHATSAPP_DISPLAY}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verified Dispatch Line Ribbon */}
        <div className="px-4 py-2.5 bg-emerald-950/40 border-b border-emerald-500/20 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">
              Official Emergency WhatsApp Line: <span className="font-mono text-white underline font-bold">{EMERGENCY_WHATSAPP_DISPLAY}</span>
            </span>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
            24/7 Rapid Response Desk
          </span>
        </div>

        {/* Live GPS Telemetry Strip */}
        <div className="px-4 sm:px-5 py-2.5 bg-[#050C16] border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="text-white font-bold">GPS:</span>
            <span>{lat.toFixed(5)}, {lon.toFixed(5)}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
              {location ? `±${location.accuracy}m` : 'LOCKING...'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {batteryLevel !== null && (
              <div className="flex items-center gap-1.5 text-slate-400">
                <Battery className="w-3.5 h-3.5 text-amber-400" />
                <span>Battery: {batteryLevel}%</span>
              </div>
            )}
            <button
              onClick={fetchLocation}
              disabled={isLocating}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline"
            >
              <RefreshCw className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Emergency Vertical Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Select Emergency Situation:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EMERGENCY_PRESETS.map(preset => {
                const isSelected = selectedPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      soundEffects.playClick();
                      setSelectedPreset(preset.id);
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/15 text-white font-bold shadow-md shadow-emerald-500/20'
                        : 'border-white/10 hover:border-white/20 bg-white/[0.02] text-slate-300'
                    }`}
                  >
                    <span>{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Custom Note */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Additional Distress Information (Optional):
            </label>
            <input
              type="text"
              value={customNote}
              onChange={e => setCustomNote(e.target.value)}
              placeholder="e.g. 2 people injured, trapped on 2nd floor, water rising..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-sentinel-darkSurface border border-white/10 text-white placeholder-slate-500 text-xs font-mono focus:border-emerald-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Big Direct WhatsApp Dispatch Button */}
          <div className="pt-2">
            <a
              href={whatsappDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDispatchWhatsApp}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm sm:text-base flex items-center justify-center gap-3 shadow-2xl shadow-emerald-500/40 transition-all active:scale-[0.98] border border-emerald-400/50 glow-emerald"
            >
              <svg className="w-6 h-6 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>SEND SOS IN WHATSAPP TO {EMERGENCY_WHATSAPP_DISPLAY}</span>
              <Send className="w-4 h-4 ml-1 animate-pulse" />
            </a>
            <p className="text-center text-[11px] text-slate-400 font-mono mt-2">
              Opens WhatsApp chat directly with <span className="text-emerald-400 font-bold">{EMERGENCY_WHATSAPP_DISPLAY}</span> with pre-filled GPS coordinates.
            </p>
          </div>

          {/* Formatted Message Preview */}
          <div className="p-3.5 rounded-2xl bg-[#050C16] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-emerald-400 uppercase font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Live Pre-formatted WhatsApp Transmission String:
              </span>
              <button
                onClick={handleCopy}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-mono"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="text-[11px] text-slate-300 font-mono bg-black/40 p-3 rounded-xl border border-white/5 whitespace-pre-wrap break-all select-all max-h-36 overflow-y-auto">
              {distressMessage}
            </pre>
          </div>

          {/* Direct Speed-Dial Fallback to 7806869597 */}
          <div className="pt-1 flex flex-col sm:flex-row items-center gap-2">
            <a
              href={`tel:+${EMERGENCY_WHATSAPP_NUMBER}`}
              onClick={() => soundEffects.playBeep()}
              className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>Voice Call: {EMERGENCY_WHATSAPP_DISPLAY}</span>
            </a>
            <a
              href={`tel:112`}
              onClick={() => soundEffects.playBeep()}
              className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all"
            >
              <PhoneCall className="w-4 h-4 text-rose-400" />
              <span>Call National 112</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
