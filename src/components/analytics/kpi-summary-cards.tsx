'use client';

import * as React from 'react';
import { AnalyticsKpiSummary } from '@/types/analytics';
import { Briefcase, Award, TrendingUp, Clock } from 'lucide-react';

export interface KpiSummaryCardsProps {
  kpiSummary: AnalyticsKpiSummary;
}

export const KpiSummaryCards: React.FC<KpiSummaryCardsProps> = ({ kpiSummary }) => {
  const metricCardConfigs = [
    {
      identifier: 'total-applications',
      title: 'Total Applications',
      metricValue: kpiSummary.totalApplicationsCount.toString(),
      subtextValue: `${kpiSummary.appliedCount} currently in active review`,
      iconElement: <Briefcase className="w-5 h-5 text-sky-500" />,
      accentGradientClass: 'from-sky-500/15 via-sky-500/5 to-transparent',
      borderColorClass: 'border-sky-500/20 dark:border-sky-500/30',
      badgeText: 'All Submissions',
      badgeClass: 'text-sky-700 bg-sky-100/80 dark:text-sky-300 dark:bg-sky-950/50',
    },
    {
      identifier: 'interview-rate',
      title: 'Interview Rate',
      metricValue: `${kpiSummary.interviewConversionRate}%`,
      subtextValue: `${kpiSummary.interviewCount} applications reached interview`,
      iconElement: <TrendingUp className="w-5 h-5 text-indigo-500" />,
      accentGradientClass: 'from-indigo-500/15 via-indigo-500/5 to-transparent',
      borderColorColor: 'border-indigo-500/20 dark:border-indigo-500/30',
      badgeText: 'Applied → Interview',
      badgeClass: 'text-indigo-700 bg-indigo-100/80 dark:text-indigo-300 dark:bg-indigo-950/50',
    },
    {
      identifier: 'offer-rate',
      title: 'Offer Success Rate',
      metricValue: `${kpiSummary.offerAcceptanceRate}%`,
      subtextValue: `${kpiSummary.offerCount} formal job offer${
        kpiSummary.offerCount === 1 ? '' : 's'
      } received`,
      iconElement: <Award className="w-5 h-5 text-emerald-500" />,
      accentGradientClass: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
      borderColorClass: 'border-emerald-500/20 dark:border-emerald-500/30',
      badgeText: 'Pipeline Win',
      badgeClass: 'text-emerald-700 bg-emerald-100/80 dark:text-emerald-300 dark:bg-emerald-950/50',
    },
    {
      identifier: 'avg-response-time',
      title: 'Avg. Response Time',
      metricValue: `${kpiSummary.averageResponseTimeDays} d`,
      subtextValue: 'From application to employer status update',
      iconElement: <Clock className="w-5 h-5 text-amber-500" />,
      accentGradientClass: 'from-amber-500/15 via-amber-500/5 to-transparent',
      borderColorClass: 'border-amber-500/20 dark:border-amber-500/30',
      badgeText: 'Company Velocity',
      badgeClass: 'text-amber-700 bg-amber-100/80 dark:text-amber-300 dark:bg-amber-950/50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {metricCardConfigs.map((cardConfig) => (
        <div
          key={cardConfig.identifier}
          className="relative overflow-hidden rounded-2xl border border-zinc-200/70 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-5 shadow-lg shadow-zinc-900/5 dark:shadow-black/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
        >
          {/* Subtle top corner gradient spotlight */}
          <div
            className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${cardConfig.accentGradientClass} blur-2xl pointer-events-none`}
          />

          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              {cardConfig.title}
            </span>
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/50 dark:border-zinc-700/50">
              {cardConfig.iconElement}
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              {cardConfig.metricValue}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cardConfig.badgeClass}`}
            >
              {cardConfig.badgeText}
            </span>
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
            {cardConfig.subtextValue}
          </p>
        </div>
      ))}
    </div>
  );
};
