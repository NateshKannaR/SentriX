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
  let textClass = '';
  let borderClass = '';
  let Icon = AlertCircle;

  switch (severity) {
    case 'Critical':
      bgClass = 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30';
      borderClass = 'border-red-500/30';
      Icon = ShieldAlert;
      break;
    case 'High':
      bgClass = 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30';
      borderClass = 'border-orange-500/30';
      Icon = AlertTriangle;
      break;
    case 'Medium':
      bgClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      borderClass = 'border-amber-500/30';
      Icon = AlertCircle;
      break;
    case 'Low':
      bgClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      borderClass = 'border-emerald-500/30';
      Icon = CheckCircle2;
      break;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  const isCritical = severity === 'Critical' && pulsing;

  return (
    <span
      className={`inline-flex items-center rounded-full border ${bgClass} ${borderClass} ${sizeClasses[size]} tracking-wide uppercase transition-all duration-200 ${
        isCritical ? 'animate-pulse ring-2 ring-red-500/20' : ''
      }`}
    >
      {showIcon && <Icon size={iconSizes[size]} className="shrink-0" />}
      <span>{severity}</span>
    </span>
  );
};
