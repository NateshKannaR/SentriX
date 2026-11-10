import React, { useState, useEffect, useRef } from 'react';
import { X, Volume2, VolumeX, Eye, AlertOctagon, Radio } from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';

interface RescueStrobeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RescueStrobeModal: React.FC<RescueStrobeModalProps> = ({ isOpen, onClose }) => {
  const [strobeColor, setStrobeColor] = useState<'red' | 'white'>('red');
  const [opticalActive, setOpticalActive] = useState(true);
  const [acousticActive, setAcousticActive] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  const strobeTimerRef = useRef<number | null>(null);
  const morseTimerRef = useRef<number | null>(null);

  // Optical Strobe Loop
  useEffect(() => {
    if (!isOpen || !opticalActive) {
      if (strobeTimerRef.current) clearInterval(strobeTimerRef.current);
      return;
    }

    strobeTimerRef.current = window.setInterval(() => {
      setStrobeColor(c => (c === 'red' ? 'white' : 'red'));
    }, 180); // ~5.5Hz rapid rescue strobe

    return () => {
      if (strobeTimerRef.current) clearInterval(strobeTimerRef.current);
    };
  }, [isOpen, opticalActive]);

  // Acoustic S.O.S Morse Code Audio Loop: · · ·   — — —   · · ·
  useEffect(() => {
    if (!isOpen || !acousticActive) {
      if (morseTimerRef.current) clearInterval(morseTimerRef.current);
      return;
    }

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    audioContextRef.current = ctx;

    const playBeep = (durationMs: number, freq = 1800) => {
      try {
        if (ctx.state === 'suspended') ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + durationMs / 1000);
      } catch {
        // Audio error ignored
      }
    };

    // Play S-O-S pattern: 3 dots (120ms), 3 dashes (320ms), 3 dots (120ms)
    const playSosSequence = () => {
      // S: · · ·
      setTimeout(() => playBeep(120), 0);
      setTimeout(() => playBeep(120), 200);
      setTimeout(() => playBeep(120), 400);

      // O: — — —
      setTimeout(() => playBeep(320), 800);
      setTimeout(() => playBeep(320), 1250);
      setTimeout(() => playBeep(320), 1700);

      // S: · · ·
      setTimeout(() => playBeep(120), 2200);
      setTimeout(() => playBeep(120), 2400);
      setTimeout(() => playBeep(120), 2600);
    };

    playSosSequence();
    morseTimerRef.current = window.setInterval(playSosSequence, 3800);

    return () => {
      if (morseTimerRef.current) clearInterval(morseTimerRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [isOpen, acousticActive]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-between p-6 transition-colors duration-100 ${
        opticalActive
          ? strobeColor === 'red'
            ? 'bg-red-600 text-white'
            : 'bg-white text-slate-900'
          : 'bg-slate-950 text-white'
      }`}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 text-white backdrop-blur-md text-xs font-mono font-black">
          <AlertOctagon className="w-4 h-4 text-amber-400 animate-spin" />
          <span>RESCUE DISTRESS STROBE ACTIVE</span>
        </div>

        <button
          onClick={onClose}
          className="p-3 rounded-2xl bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-all active:scale-95"
          aria-label="Close Strobe"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Center Guidance Text */}
      <div className="text-center space-y-4 max-w-lg mx-auto">
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter drop-shadow-md">
          S.O.S BEACON
        </h1>
        <p className="text-base sm:text-lg font-bold font-mono px-4 py-2 rounded-2xl bg-black/40 text-white backdrop-blur-md inline-block">
          Point screen toward search aircraft or rescue teams
        </p>
      </div>

      {/* Controls Drawer */}
      <div className="max-w-md w-full mx-auto space-y-3 bg-black/60 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/20 text-white">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setOpticalActive(o => !o)}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 border transition-all ${
              opticalActive
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-white/10 text-slate-400 border-white/10'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Light: {opticalActive ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setAcousticActive(a => !a)}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 border transition-all ${
              acousticActive
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-white/10 text-slate-400 border-white/10'
            }`}
          >
            {acousticActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>Audio SOS: {acousticActive ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-sm uppercase tracking-wider shadow-xl transition-all active:scale-95"
        >
          STOP EMERGENCY BEACON
        </button>
      </div>
    </div>
  );
};
