import React from 'react';

interface PriorityGaugeProps {
  score: number; // 0 to 100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const PriorityGauge: React.FC<PriorityGaugeProps> = ({
  score,
  size = 'md',
  showLabel = true,
}) => {
  const clampedScore = Math.max(0, Math.min(100, score));

  let color = '#19B878'; // Low
  let label = 'Low Priority';
  let badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let glowColor = 'rgba(25, 184, 120, 0.4)';

  if (clampedScore >= 75) {
    color = '#F04452'; // Critical
    label = 'Critical Priority';
    badgeBg = 'bg-red-500/15 text-red-400 border-red-500/40';
    glowColor = 'rgba(240, 68, 82, 0.5)';
  } else if (clampedScore >= 50) {
    color = '#FF7A00'; // High
    label = 'High Priority';
    badgeBg = 'bg-orange-500/15 text-orange-400 border-orange-500/40';
    glowColor = 'rgba(255, 122, 0, 0.4)';
  } else if (clampedScore >= 30) {
    color = '#F5A623'; // Medium
    label = 'Medium Priority';
    badgeBg = 'bg-amber-500/15 text-amber-400 border-amber-500/40';
    glowColor = 'rgba(245, 166, 35, 0.4)';
  }

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-16 bg-slate-800/80 h-2 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
          <div
            className="h-full rounded-full transition-all duration-500 shadow-sm"
            style={{
              width: `${clampedScore}%`,
              backgroundColor: color,
              boxShadow: `0 0 8px ${glowColor}`,
            }}
          />
        </div>
        <span
          className="font-mono text-xs font-bold"
          style={{ color, textShadow: `0 0 10px ${glowColor}` }}
        >
          {clampedScore}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        {showLabel && (
          <span className={`text-[10px] px-2 py-0.5 rounded-md border font-mono font-bold uppercase tracking-wider ${badgeBg}`}>
            {label}
          </span>
        )}
        <div className="flex items-baseline gap-1 font-mono">
          <span
            className="text-base font-black tracking-tight"
            style={{ color, textShadow: `0 0 12px ${glowColor}` }}
          >
            {clampedScore}
          </span>
          <span className="text-slate-500 text-xs font-normal">/ 100</span>
        </div>
      </div>

      {/* Segmented Tactical Bar */}
      <div className="relative w-full bg-slate-900/90 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700/60 shadow-inner">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${clampedScore}%`,
            backgroundColor: color,
            boxShadow: `0 0 12px ${glowColor}`,
          }}
        />
      </div>
    </div>
  );
};
