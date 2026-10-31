'use client';

import * as React from 'react';
import { JobMetricsSummary } from '@/types/job';
import { Briefcase, Clock, Award, XCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MetricsBarProps {
  metricsSummary: JobMetricsSummary;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ metricsSummary }) => {
  const metricCards = [
    {
      title: 'Total Applications',
      value: metricsSummary.totalCount,
      icon: Briefcase,
      accentClasses:
        'text-indigo-600 bg-indigo-50/90 dark:text-indigo-400 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60',
      description: 'Tracked in pipeline',
    },
    {
      title: 'Active Pipeline',
      value: metricsSummary.activeCount,
      icon: TrendingUp,
      accentClasses:
        'text-sky-600 bg-sky-50/90 dark:text-sky-400 dark:bg-sky-950/60 border border-sky-200/60 dark:border-sky-800/60',
      description: 'Wishlist & in-progress',
    },
    {
      title: 'Interviewing',
      value: metricsSummary.interviewingCount,
      icon: Clock,
      accentClasses:
        'text-amber-600 bg-amber-50/90 dark:text-amber-400 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/60 animate-pulse',
      description: 'Active interview stages',
    },
    {
      title: 'Offers Received',
      value: metricsSummary.offerCount,
      icon: Award,
      accentClasses:
        'text-emerald-600 bg-emerald-50/90 dark:text-emerald-400 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60',
      description: 'Successful offers',
    },
    {
      title: 'Archived / Rejected',
      value: metricsSummary.rejectedCount,
      icon: XCircle,
      accentClasses:
        'text-rose-600 bg-rose-50/90 dark:text-rose-400 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-800/60',
      description: 'Closed opportunities',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-7">
      {metricCards.map((cardItem) => {
        const IconComponent = cardItem.icon;
        return (
          <div
            key={cardItem.title}
            className="group relative rounded-2xl border border-zinc-300/60 bg-zinc-100/80 dark:border-white/10 dark:bg-zinc-900/70 backdrop-blur-md p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-zinc-400/70 dark:hover:border-white/20 transition-all duration-200 overflow-hidden"
          >
            {/* Subtle top card glow line on hover */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/0 to-transparent group-hover:via-indigo-500/70 transition-all duration-300" />

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-tight">
                {cardItem.title}
              </span>
              <span
                className={cn(
                  'p-1.5 rounded-xl shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-110',
                  cardItem.accentClasses
                )}
              >
                <IconComponent className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                {cardItem.value}
              </span>
            </div>

            <div className="mt-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500 truncate">
              {cardItem.description}
            </div>
          </div>
        );
      })}
    </div>
  );
};
