import React, { useState } from 'react';
import {
  Hospital,
  X,
  Bed,
  Activity,
  HeartPulse,
  Flame,
  CheckCircle2,
  Navigation,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';
import { useLanguage } from '../../context/LanguageContext';
import { SAFE_MUSTER_ZONES } from '../../data/safeZones';

interface HospitalResourceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HospitalResourceDrawer: React.FC<HospitalResourceDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useLanguage();
  const [reservedIds, setReservedIds] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const hospitals = SAFE_MUSTER_ZONES.filter(z => z.type === 'Hospital');

  const handleReserve = (id: string) => {
    soundFx.playSuccess();
    setReservedIds(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-fadeIn select-none">
      <div className="w-full max-w-lg bg-[#070D18] border-l border-cyan-500/30 h-full flex flex-col shadow-2xl animate-slideLeft">
        {/* Header */}
        <div className="p-5 bg-[#0A1324] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
              <Hospital className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                {t('hospital.title', 'Regional Trauma Center & ICU Bed Allocator')}
              </span>
              <h3 className="text-sm font-bold text-white">
                Live Medical Infrastructure Telemetry
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

        {/* Content List */}
        <div className="flex-1 p-5 space-y-4 overflow-y-auto">
          {hospitals.map(hosp => {
            const isReserved = Boolean(reservedIds[hosp.id]);
            return (
              <div
                key={hosp.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  isReserved
                    ? 'bg-emerald-950/20 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                    : 'bg-[#0A1324] border-white/10 hover:border-cyan-500/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                        LEVEL-1 TRAUMA
                      </span>
                      {isReserved && (
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> RESERVED
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-white mt-1.5">{hosp.name}</h4>
                    <p className="text-xs text-slate-400">{hosp.address}</p>
                  </div>
                </div>

                {/* Telemetry Grid */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center font-mono text-[11px]">
                  <div className="p-2 rounded-xl bg-white/5">
                    <span className="text-cyan-400 font-bold block">{hosp.capacity}</span>
                    <span className="text-slate-400 text-[9px] uppercase">ICU Beds</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5">
                    <span className="text-emerald-400 font-bold block">100% Full</span>
                    <span className="text-slate-400 text-[9px] uppercase">O2 Reserve</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5">
                    <span className="text-amber-400 font-bold block">O- / A+ Avail</span>
                    <span className="text-slate-400 text-[9px] uppercase">Blood Bank</span>
                  </div>
                </div>

                {/* Contact & Reserve Action */}
                <div className="pt-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
                    <Phone className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{hosp.contactPhone}</span>
                  </div>

                  <button
                    onClick={() => handleReserve(hosp.id)}
                    disabled={isReserved}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                      isReserved
                        ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 cursor-default'
                        : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30'
                    }`}
                  >
                    <Bed className="w-3.5 h-3.5" />
                    <span>
                      {isReserved
                        ? t('hospital.reserved', 'Bays Reserved & Locked')
                        : t('hospital.reserveBed', 'Reserve 2 Trauma Bays')}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0A1324] border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>CENTRAL HEALTH TELEMETRY GRID</span>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
