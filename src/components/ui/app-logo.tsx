'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showSubtitle?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  className,
  showSubtitle = true,
}) => {
  const sizeClasses = {
    sm: {
      badge: 'w-8 h-8 rounded-xl',
      cbText: 'text-sm font-black',
      title: 'text-sm',
      subtitle: 'text-[9px]',
    },
    md: {
      badge: 'w-11 h-11 rounded-xl shadow-lg shadow-indigo-500/25',
      cbText: 'text-lg font-black',
      title: 'text-base',
      subtitle: 'text-[11px]',
    },
    lg: {
      badge: 'w-16 h-16 rounded-2xl shadow-xl shadow-indigo-500/35',
      cbText: 'text-2xl font-black',
      title: 'text-2xl',
      subtitle: 'text-xs',
    },
  };

  const selectedSize = sizeClasses[size];

  return (
    <div className={cn('flex items-center gap-3 select-none group', className)}>
      {/* Animated CB Logo Badge with prominent text size */}
      <div
        className={cn(
          'relative flex items-center justify-center text-white shrink-0 overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-indigo-500/40 ring-1 ring-white/20',
          'bg-gradient-to-br from-indigo-600 via-purple-600 to-sky-400',
          selectedSize.badge
        )}
      >
        {/* Subtle animated shimmer sweep */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

        {/* Prominent CB Monogram */}
        <span
          className={cn(
            'relative z-10 tracking-tighter text-white drop-shadow-sm font-mono',
            selectedSize.cbText
          )}
        >
          CB
        </span>
      </div>

      <div>
        <div
          className={cn('font-extrabold tracking-tight flex items-baseline', selectedSize.title)}
        >
          <span className="text-zinc-900 dark:text-white">chakri</span>
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-400 bg-clip-text text-transparent font-black ml-0.5">
            Bakri
          </span>
        </div>
        {showSubtitle && (
          <span
            className={cn(
              'text-zinc-500 dark:text-zinc-400 font-medium block -mt-0.5',
              selectedSize.subtitle
            )}
          >
            Job Application Tracker
          </span>
        )}
      </div>
    </div>
  );
};
