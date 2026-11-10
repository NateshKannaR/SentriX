import React, { useState, useEffect } from 'react';
import {
  Plane,
  X,
  Crosshair,
  Compass,
  Battery,
  Wind,
  Wifi,
  Eye,
  Radio,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Incident } from '../../types';
import { soundFx } from '../../utils/soundEffects';
import { useLanguage } from '../../context/LanguageContext';

interface AutonomousDroneModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetIncident?: Incident | null;
}

export const AutonomousDroneModal: React.FC<AutonomousDroneModalProps> = ({
  isOpen,
  onClose,
  targetIncident,
}) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'thermal' | 'optical'>('thermal');
  const [altitude, setAltitude] = useState(124);
  const [speed, setSpeed] = useState(48);
  const [battery, setBattery] = useState(87);
  const [beaconDeployed, setBeaconDeployed] = useState(false);
  const [telemetrySent, setTelemetrySent] = useState(false);

  // Telemetry drift simulator
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setAltitude(a => Math.round((a + (Math.random() * 2 - 1)) * 10) / 10);
      setSpeed(s => Math.round((s + (Math.random() * 1.5 - 0.75)) * 10) / 10);
    }, 2000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const lat = targetIncident && targetIncident.latitude != null ? targetIncident.latitude.toFixed(5) : '12.97160';
  const lng = targetIncident && targetIncident.longitude != null ? targetIncident.longitude.toFixed(5) : '77.59460';
  const code = targetIncident ? targetIncident.incidentCode : 'STX-2026-HQ';
  const incidentTitle = targetIncident ? targetIncident.title : 'Metro Commercial Sector Bravo';

  const handleDeployBeacon = () => {
    soundFx.playAlert();
    setBeaconDeployed(true);
    setTimeout(() => setBeaconDeployed(false), 6000);
  };

  const handleTransmitTelemetry = () => {
    soundFx.playSuccess();
    setTelemetrySent(true);
    setTimeout(() => setTelemetrySent(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-4xl bg-[#070D18] border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top UAV Status Bar */}
        <div className="px-5 py-4 bg-[#0A1324] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
              <Plane className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  {t('drone.droneId', 'UAV-7 FALCON RECON')}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  LIVE AUTONOMOUS PATROL
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">
                {t('drone.title', 'Autonomous Recon Drone UAV — Live Reconnaissance Feed')}
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video / FLIR HUD Canvas */}
        <div className="relative flex-1 bg-black min-h-[300px] sm:min-h-[380px] overflow-hidden flex items-center justify-center">
          {/* Simulated Camera Grain & Background Grid */}
          <div
            className={`absolute inset-0 transition-all duration-700 ${
              mode === 'thermal'
                ? 'bg-gradient-to-br from-indigo-950 via-purple-950/80 to-amber-950/70'
                : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950'
            }`}
          >
            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#16C7E8_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
          </div>

          {/* Central Targeting Reticle */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-full border border-cyan-400/40 border-dashed flex items-center justify-center animate-spin-slow">
              <Crosshair className="w-12 h-12 text-cyan-400/70" />
            </div>

            {/* Survivor Thermal Detection Bounding Box */}
            <div className="absolute -top-4 -right-16 sm:-right-24 p-2.5 rounded-xl bg-red-950/90 border-2 border-red-500 text-white shadow-2xl backdrop-blur-md animate-pulse">
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-red-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{t('drone.targetLocked', 'SURVIVOR HEAT SIGNATURE LOCATED (36.8°C)')}</span>
              </div>
              <div className="text-[10px] font-mono text-slate-300 mt-1">
                COORDS: {lat}, {lng}
              </div>
            </div>
          </div>

          {/* HUD Telemetry Overlays */}
          <div className="absolute top-4 left-4 z-20 space-y-1 font-mono text-xs text-cyan-300 bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>ALT: <strong>{altitude}m AGL</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-cyan-400" />
              <span>SPD: <strong>{speed} km/h</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Battery className="w-4 h-4 text-emerald-400" />
              <span>BATTERY: <strong>{battery}%</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-cyan-400" />
              <span>UPLINK: <strong>4G/5G STARLINK DUAL</strong></span>
            </div>
          </div>

          <div className="absolute top-4 right-4 z-20 font-mono text-right text-xs bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-slate-300">
            <div className="text-cyan-400 font-bold">TARGET INCIDENT</div>
            <div className="font-bold text-white text-sm truncate max-w-[200px]">{code}</div>
            <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{incidentTitle}</div>
          </div>

          {/* Mode Switcher Pill on Video */}
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-black/70 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
            <button
              onClick={() => {
                soundFx.playClick();
                setMode('thermal');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                mode === 'thermal'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🔥 {t('drone.thermalMode', 'Thermal FLIR')}
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setMode('optical');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                mode === 'optical'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📷 {t('drone.opticalMode', '4K Optical Zoom')}
            </button>
          </div>

          {/* Flare beacon active indicator */}
          {beaconDeployed && (
            <div className="absolute inset-0 z-30 bg-amber-500/20 flex items-center justify-center animate-pulse pointer-events-none">
              <div className="p-4 rounded-2xl bg-amber-950/90 border border-amber-400 text-amber-300 font-mono text-sm font-black shadow-2xl flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-400" />
                <span>GPS RESCUE FLARE DEPLOYED AT {lat}, {lng}</span>
              </div>
            </div>
          )}

          {telemetrySent && (
            <div className="absolute inset-0 z-30 bg-cyan-500/20 flex items-center justify-center animate-pulse pointer-events-none">
              <div className="p-4 rounded-2xl bg-cyan-950/90 border border-cyan-400 text-cyan-300 font-mono text-sm font-black shadow-2xl flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                <span>THERMAL TELEMETRY DISPATCHED TO FIELD UNITS</span>
              </div>
            </div>
          )}
        </div>

        {/* Tactical Command Actions */}
        <div className="p-4 bg-[#0A1324] border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>GEO-LOCK: {lat}° N, {lng}° E</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTransmitTelemetry}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-cyan-600/30"
            >
              <Radio className="w-4 h-4" />
              <span>{t('drone.transmitTelemetry', 'Transmit Telemetry to Field Units')}</span>
            </button>
            <button
              onClick={handleDeployBeacon}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-amber-600/30"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('drone.dropBeacon', 'Deploy GPS Flare Beacon')}</span>
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span>{t('drone.returnBase', 'Return to Base (RTL)')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
