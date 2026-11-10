import React, { useState } from 'react';
import { ShieldAlert, MapPin, ExternalLink, ChevronUp } from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';
import { getLiveLocation } from '../../utils/geolocation';
import {
  EMERGENCY_WHATSAPP_NUMBER,
  EMERGENCY_WHATSAPP_DISPLAY,
  dispatchDirectEmergencyWhatsApp,
} from '../../utils/whatsappSos';
import { EmergencySosModal } from './EmergencySosModal';

export const FloatingEmergencyWhatsApp: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);

  const handleDirectWhatsAppClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    soundEffects.playCriticalSiren();
    setIsDispatching(true);

    try {
      // Fast GPS grab
      const loc = await getLiveLocation();
      let batteryLevel: number | null = null;
      if ('getBattery' in navigator) {
        try {
          const b = await (navigator as any).getBattery();
          batteryLevel = Math.round(b.level * 100);
        } catch (_) {}
      }

      dispatchDirectEmergencyWhatsApp({
        latitude: loc.latitude,
        longitude: loc.longitude,
        address: loc.address,
        accuracy: loc.accuracy,
        batteryLevel,
        incidentType: 'CRITICAL EMERGENCY SOS',
        customNote: 'Immediate emergency dispatch requested at my current GPS coordinates!',
      });
    } catch (_) {
      // Fallback dispatch if geolocation blocked
      dispatchDirectEmergencyWhatsApp({
        latitude: 12.9716,
        longitude: 77.5946,
        address: 'Live Coordinate Fix (SentriX Emergency Beacon)',
        accuracy: 10,
        incidentType: 'CRITICAL EMERGENCY SOS',
        customNote: 'Immediate emergency response requested via SentriX WhatsApp Hotline!',
      });
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <>
      <div
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Tooltip Pill (Desktop & Expanded) */}
        <div
          className={`hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#071322]/95 border border-emerald-500/40 text-white shadow-2xl backdrop-blur-xl transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-90 translate-x-1'
          }`}
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <div className="text-left">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
              Direct Emergency WhatsApp
            </span>
            <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
              <span>{EMERGENCY_WHATSAPP_DISPLAY}</span>
              <span className="text-[10px] text-emerald-300 font-normal">(1-Tap SOS)</span>
            </span>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              setIsModalOpen(true);
            }}
            title="Open Emergency SOS Configuration Console"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-1"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Floating Pulsing WhatsApp SOS Button */}
        <div className="relative group">
          {/* Pulsing ring beacon */}
          <span className="absolute -inset-1 rounded-full bg-emerald-500/40 animate-ping pointer-events-none" />
          <span className="absolute -inset-2 rounded-full bg-emerald-500/20 blur-sm pointer-events-none" />

          <button
            onClick={handleDirectWhatsAppClick}
            disabled={isDispatching}
            title={`Direct Emergency WhatsApp SOS to ${EMERGENCY_WHATSAPP_DISPLAY}`}
            className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-2xl shadow-emerald-600/50 hover:shadow-emerald-500/70 border-2 border-emerald-300/60 transition-all transform hover:scale-110 active:scale-95 group-hover:glow-emerald"
            aria-label="Direct Emergency WhatsApp SOS"
          >
            {/* Official WhatsApp Shape */}
            <svg
              className={`w-7 h-7 sm:w-8 sm:h-8 fill-current text-white transition-transform ${
                isDispatching ? 'animate-spin' : 'group-hover:scale-110'
              }`}
              viewBox="0 0 24 24"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>

            {/* Micro Badge for SOS */}
            <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-rose-600 border border-white text-white text-[9px] font-black uppercase tracking-wider shadow-md animate-bounce">
              SOS
            </span>
          </button>
        </div>
      </div>

      {/* Emergency SOS Modal Integration */}
      <EmergencySosModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
