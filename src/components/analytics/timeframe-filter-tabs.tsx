'use client';

import * as React from 'react';
import { AnalyticsTimeframe } from '@/types/analytics';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TimeframeFilterTabsProps {
  currentTimeframe: AnalyticsTimeframe;
  onTimeframeChange: (selectedTimeframe: AnalyticsTimeframe) => void;
  isDisabled?: boolean;
}

const TIMEFRAME_OPTIONS: Array<{ key: AnalyticsTimeframe; label: string }> = [
  { key: '30days', label: 'Last 30 Days' },
  { key: '6months', label: 'Last 6 Months' },
  { key: '1year', label: 'Last Year' },
  { key: 'all', label: 'All Time' },
];

export const TimeframeFilterTabs: React.FC<TimeframeFilterTabsProps> = ({
  currentTimeframe,
  onTimeframeChange,
  isDisabled = false,
}) => {
  return (
    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-200/60 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-white/5 backdrop-blur-md">
      <div className="hidden sm:flex items-center pl-2 pr-1 text-zinc-400">
        <Calendar className="w-3.5 h-3.5" />
      </div>

      {TIMEFRAME_OPTIONS.map((optionItem) => {
        const isActive = currentTimeframe === optionItem.key;

        return (
          <button
            key={optionItem.key}
            type="button"
            disabled={isDisabled}
            onClick={() => onTimeframeChange(optionItem.key)}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 select-none',
              isActive
                ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-900 dark:text-white'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white',
              isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none'
            )}
          >
            {optionItem.label}
          </button>
        );
      })}
    </div>
  );
};
