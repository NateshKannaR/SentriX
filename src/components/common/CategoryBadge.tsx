import React from 'react';
import { EmergencyCategory } from '../../types';
import { Flame, Car, HeartPulse, Waves, Building2, AlertTriangle } from 'lucide-react';

interface CategoryBadgeProps {
  category: EmergencyCategory;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'badge' | 'card';
}

export const getCategoryIcon = (category: EmergencyCategory) => {
  switch (category) {
    case 'Fire Emergency':
      return Flame;
    case 'Road Accident':
      return Car;
    case 'Medical Emergency':
      return HeartPulse;
    case 'Flood':
      return Waves;
    case 'Building Collapse':
      return Building2;
    case 'Other Emergencies':
    default:
      return AlertTriangle;
  }
};

export const getCategoryColor = (category: EmergencyCategory) => {
  switch (category) {
    case 'Fire Emergency':
      return { text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' };
    case 'Road Accident':
      return { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    case 'Medical Emergency':
      return { text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
    case 'Flood':
      return { text: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' };
    case 'Building Collapse':
      return { text: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' };
    case 'Other Emergencies':
    default:
      return { text: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' };
  }
};

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, size = 'md' }) => {
  const Icon = getCategoryIcon(category);
  const colors = getCategoryColor(category);

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
      className={`inline-flex items-center rounded-lg border ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses[size]} font-medium`}
    >
      <Icon size={iconSizes[size]} className="shrink-0" />
      <span>{category}</span>
    </span>
  );
};
