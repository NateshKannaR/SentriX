import React, { useState, useEffect } from 'react';
import { AlertTriangle, Radio, X, Volume2 } from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';

export const CivilDefenseBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(() => {
    return localStorage.getItem('sentrix_civil_defense_dismissed') !== 'true';
  });

  const handleDismiss = () => {
    soundEffects.playClick();
    setIsVisible(false);
    localStorage.setItem('sentrix_civil_defense_dismissed', 'true');
  };

  const handleReplayChime = () => {
    soundEffects.playAlert();
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white border-b border-red-400/40 px-4 py-2 flex items-center justify-between text-xs font-mono shadow-lg relative z-40 selection:bg-black selection:text-white">
      <div className="flex items-center gap-2.5 overflow-hidden">
        <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping shrink-0" />
        <span className="px-2 py-0.5 rounded bg-black/30 text-white font-black text-[10px] shrink-0 border border-white/20">
          CIVIL DEFENSE ADVISORY
        </span>
        <div className="flex items-center gap-2 truncate">
          <AlertTriangle className="w-4 h-4 text-amber-200 shrink-0" />
          <span className="font-bold truncate">
            MONSOON FLASH FLOOD & STRUCTURAL WARNING: Ground rescue units deployed across low-lying metro sectors. Citizens urged to use Emergency Intake portal.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-3">
        <button
          onClick={handleReplayChime}
          className="p-1 rounded bg-black/20 hover:bg-black/40 text-white transition-colors"
          title="Play Audio Chime"
        >
          <Volume2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleDismiss}
          className="p-1 rounded bg-black/20 hover:bg-black/40 text-white transition-colors"
          title="Dismiss Banner"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
