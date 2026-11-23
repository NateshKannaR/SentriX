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
    <div className="bg-[#241d15] text-amber-100 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-xs font-mono relative z-40 selection:bg-black selection:text-white">
      <div className="flex items-center gap-2.5 overflow-hidden">
        <span className="px-2 py-0.5 rounded bg-black/30 text-amber-200 font-semibold text-[10px] shrink-0 border border-amber-400/20">
          DEMO ADVISORY
        </span>
        <div className="flex items-center gap-2 truncate">
          <AlertTriangle className="w-4 h-4 text-amber-200 shrink-0" />
          <span className="font-bold truncate">
            Sample scenario for a monsoon flash flood and structural warning.
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
