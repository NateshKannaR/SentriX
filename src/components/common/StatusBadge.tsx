import React from 'react';
import { IncidentStatus } from '../../types';
import { Clock, Hourglass, Activity, CheckCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: IncidentStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let bgClass = '';
  let Icon = Clock;

  switch (status) {
    case 'Reported':
      bgClass = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      Icon = Clock;
      break;
    case 'Pending':
      bgClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      Icon = Hourglass;
      break;
    case 'In Progress':
      bgClass = 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
      Icon = Activity;
      break;
    case 'Resolved':
      bgClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      Icon = CheckCircle;
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

  return (
    <span
      className={`inline-flex items-center rounded-full border ${bgClass} ${sizeClasses[size]} tracking-wide`}
    >
      <Icon size={iconSizes[size]} className="shrink-0" />
      <span>{status}</span>
    </span>
  );
};
