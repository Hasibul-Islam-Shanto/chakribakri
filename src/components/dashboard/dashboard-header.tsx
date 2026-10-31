'use client';

import * as React from 'react';
import { CalendarDays, Sparkles } from 'lucide-react';
import { formatDateDisplay } from '@/lib/utils';

export interface DashboardHeaderProps {
  username: string;
  activeCount: number;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ username, activeCount }) => {
  const currentDateString = formatDateDisplay(new Date());

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-4 border-b border-zinc-200/60 dark:border-white/5">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-indigo-500 to-sky-500 bg-clip-text text-transparent capitalize">
              {username}
            </span>
          </h1>
          <Sparkles className="w-5 h-5 text-amber-500 shrink-0 hidden sm:inline-block animate-pulse" />
        </div>
        <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          Monitor your job search pipeline, interview stages, and status transitions.
        </p>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100/90 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-white/5 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
          <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
          <span>{currentDateString}</span>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/50 text-xs font-bold text-indigo-600 dark:text-indigo-400">
          {activeCount} Active
        </div>
      </div>
    </div>
  );
};
