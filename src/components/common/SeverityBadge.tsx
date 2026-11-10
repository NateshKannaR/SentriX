import React from 'react';
import { SeverityLevel } from '../../types';
import { ShieldAlert, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SeverityBadgeProps {
  severity: SeverityLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  pulsing?: boolean;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  size = 'md',
  showIcon = true,
  pulsing = true,
}) => {
  let bgClass = '';
  let dotClass = '';
  let glowClass = '';
  let Icon = AlertCircle;

  switch (severity) {
    case 'Critical':
      bgClass = 'bg-red-500/15 text-red-400 border-red-500/40';
      dotClass = 'bg-red-500 shadow-[0_0_8px_#F04452]';
      glowClass = 'glow-red';
      Icon = ShieldAlert;
      break;
    case 'High':
      bgClass = 'bg-orange-500/15 text-orange-400 border-orange-500/40';
      dotClass = 'bg-orange-500 shadow-[0_0_8px_#FF7A00]';
      glowClass = '';
      Icon = AlertTriangle;
      break;
    case 'Medium':
      bgClass = 'bg-amber-500/15 text-amber-400 border-amber-500/40';
      dotClass = 'bg-amber-500 shadow-[0_0_8px_#F5A623]';
      glowClass = '';
      Icon = AlertCircle;
      break;
    case 'Low':
      bgClass = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40';
      dotClass = 'bg-emerald-500 shadow-[0_0_8px_#19B878]';
      glowClass = '';
      Icon = CheckCircle2;
      break;
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1.5 font-mono font-bold tracking-wider',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-mono font-bold tracking-wider',
    lg: 'text-xs px-3.5 py-1.5 gap-2 font-mono font-bold tracking-wider',
  };

  const iconSizes = {
    sm: 11,
    md: 13,
    lg: 15,
  };

  const isCritical = severity === 'Critical' && pulsing;

  return (
    <span
      className={`inline-flex items-center rounded-lg border uppercase backdrop-blur-md transition-all duration-300 ${bgClass} ${sizeClasses[size]} ${
        isCritical ? `${glowClass} animate-pulse ring-1 ring-red-500/50` : ''
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass} ${isCritical ? 'animate-ping' : ''}`} />
      {showIcon && <Icon size={iconSizes[size]} className="shrink-0" />}
      <span>{severity}</span>
    </span>
  );
};
