'use client';

import * as React from 'react';
import { FunnelStageData } from '@/types/analytics';
import { Filter, ArrowDown, CheckCircle2 } from 'lucide-react';

export interface ApplicationFunnelChartProps {
  funnelStageList: FunnelStageData[];
}

export const ApplicationFunnelChart: React.FC<ApplicationFunnelChartProps> = ({
  funnelStageList,
}) => {
  const [hoveredStageIndex, setHoveredStageIndex] = React.useState<number | null>(null);

  const baselineWishlistCount = funnelStageList.length > 0 ? funnelStageList[0].count : 0;

  return (
    <div className="rounded-2xl border border-zinc-200/70 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-5 sm:p-6 shadow-lg shadow-zinc-900/5 dark:shadow-black/40 flex flex-col justify-between">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-sky-500" />
          <h2 className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Application Pipeline Funnel
          </h2>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Volume drop-off and conversion rates through hiring stages
        </p>
      </div>

      {/* Funnel Stages */}
      <div className="space-y-4">
        {funnelStageList.map((stageItem, stageIndex) => {
          const isHovered = hoveredStageIndex === stageIndex;
          const percentageOfMax =
            baselineWishlistCount > 0
              ? Math.max(8, Math.round((stageItem.count / baselineWishlistCount) * 100))
              : 8;

          return (
            <div
              key={stageItem.stageLabel}
              onMouseEnter={() => setHoveredStageIndex(stageIndex)}
              onMouseLeave={() => setHoveredStageIndex(null)}
              className="relative transition-all duration-200"
            >
              {/* Row Header */}
              <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-800 dark:text-zinc-200">{stageItem.stageLabel}</span>
                  {stageIndex > 0 && (
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-normal">
                      ({stageItem.conversionPercentage}% of previous)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-zinc-900 dark:text-white font-mono">
                    {stageItem.count}
                  </span>
                  <span className="text-[10px] text-zinc-400">jobs</span>
                </div>
              </div>

              {/* Funnel Stage Bar */}
              <div className="h-6 w-full rounded-xl bg-zinc-100 dark:bg-zinc-800/60 overflow-hidden p-0.5 border border-zinc-200/50 dark:border-white/5">
                <div
                  style={{ width: `${percentageOfMax}%` }}
                  className={`h-full rounded-lg bg-gradient-to-r ${stageItem.colorClass} transition-all duration-500 flex items-center justify-end px-2 shadow-sm ${
                    isHovered ? 'brightness-110 shadow-md ring-2 ring-white/20' : ''
                  }`}
                >
                  {percentageOfMax > 25 && (
                    <span className="text-[10px] font-bold text-white tracking-wide">
                      {stageItem.count}
                    </span>
                  )}
                </div>
              </div>

              {/* Down Arrow between stages */}
              {stageIndex < funnelStageList.length - 1 && (
                <div className="flex justify-center -my-1 text-zinc-300 dark:text-zinc-700">
                  <ArrowDown className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Insight */}
      <div className="mt-6 pt-4 border-t border-zinc-200/60 dark:border-white/5 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Stage Progression: Wishlist &rarr; Interview &rarr; Offer</span>
        </div>
      </div>
    </div>
  );
};
