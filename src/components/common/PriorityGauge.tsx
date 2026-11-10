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
  let badgeBg = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';

  if (clampedScore >= 75) {
    color = '#F04452'; // Critical
    label = 'Critical Priority';
    badgeBg = 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30';
  } else if (clampedScore >= 50) {
    color = '#FF7A00'; // High
    label = 'High Priority';
    badgeBg = 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30';
  } else if (clampedScore >= 30) {
    color = '#F5A623'; // Medium
    label = 'Medium Priority';
    badgeBg = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
  }

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-12 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${clampedScore}%`, backgroundColor: color }}
          />
        </div>
        <span className="font-mono text-xs font-bold" style={{ color }}>
          {clampedScore}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        {showLabel && (
          <span className={`text-xs px-2 py-0.5 rounded border font-medium ${badgeBg}`}>
            {label}
          </span>
        )}
        <span className="font-mono text-sm font-bold tracking-tight" style={{ color }}>
          {clampedScore}<span className="text-slate-400 text-xs font-normal">/100</span>
        </span>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${clampedScore}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};
