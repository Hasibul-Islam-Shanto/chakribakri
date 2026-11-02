'use client';

import * as React from 'react';
import { StatusOutcomeData } from '@/types/analytics';
import { PieChart } from 'lucide-react';

export interface StatusDonutChartProps {
  statusOutcomeList: StatusOutcomeData[];
  totalApplicationsCount: number;
}

export const StatusDonutChart: React.FC<StatusDonutChartProps> = ({
  statusOutcomeList,
  totalApplicationsCount,
}) => {
  const [hoveredStatusIndex, setHoveredStatusIndex] = React.useState<number | null>(null);

  // SVG Donut geometry constants
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Compute strokeDasharray and strokeDashoffset for each slice
  const donutSlices = React.useMemo(() => {
    let accumulatedOffset = 0;

    return statusOutcomeList.map((statusItem, index) => {
      const sliceFraction =
        totalApplicationsCount > 0 ? statusItem.count / totalApplicationsCount : 0;
      const strokeLength = sliceFraction * circumference;
      const strokeDashoffset = -accumulatedOffset;
      accumulatedOffset += strokeLength;

      return {
        ...statusItem,
        strokeLength,
        strokeDashoffset,
        index,
      };
    });
  }, [statusOutcomeList, totalApplicationsCount, circumference]);

  const activeHoveredSlice = hoveredStatusIndex !== null ? donutSlices[hoveredStatusIndex] : null;

  return (
    <div className="rounded-2xl border border-zinc-200/70 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-5 sm:p-6 shadow-lg shadow-zinc-900/5 dark:shadow-black/40 flex flex-col justify-between">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-emerald-500" />
          <h2 className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Status Breakdown
          </h2>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Distribution of applications across status categories
        </p>
      </div>

      {/* Donut Chart & Center Metric */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-2">
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="rotate-[-90deg]"
          >
            {/* Background track circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-zinc-100 dark:text-zinc-800/80"
            />

            {/* Slices */}
            {donutSlices.map((sliceItem) => {
              const isSliceHovered = hoveredStatusIndex === sliceItem.index;

              return (
                <circle
                  key={sliceItem.statusLabel}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={sliceItem.colorHex}
                  strokeWidth={isSliceHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={`${sliceItem.strokeLength} ${
                    circumference - sliceItem.strokeLength
                  }`}
                  strokeDashoffset={sliceItem.strokeDashoffset}
                  strokeLinecap="round"
                  onMouseEnter={() => setHoveredStatusIndex(sliceItem.index)}
                  onMouseLeave={() => setHoveredStatusIndex(null)}
                  className="transition-all duration-200 cursor-pointer"
                />
              );
            })}
          </svg>

          {/* Center Callout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            {activeHoveredSlice ? (
              <>
                <span className="text-2xl font-extrabold text-zinc-900 dark:text-white font-mono">
                  {activeHoveredSlice.count}
                </span>
                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                  {activeHoveredSlice.statusLabel}
                </span>
                <span className="text-[10px] text-zinc-400">
                  ({activeHoveredSlice.percentage}%)
                </span>
              </>
            ) : (
              <>
                <span className="text-2xl font-extrabold text-zinc-900 dark:text-white font-mono">
                  {totalApplicationsCount}
                </span>
                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                  Total Jobs
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend List */}
        <div className="flex-1 w-full space-y-2">
          {donutSlices.map((sliceItem) => {
            const isRowHovered = hoveredStatusIndex === sliceItem.index;

            return (
              <div
                key={sliceItem.statusLabel}
                onMouseEnter={() => setHoveredStatusIndex(sliceItem.index)}
                onMouseLeave={() => setHoveredStatusIndex(null)}
                className={`flex items-center justify-between p-1.5 px-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150 ${
                  isRowHovered
                    ? 'bg-zinc-100 dark:bg-zinc-800'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: sliceItem.colorHex }}
                  />
                  <span className="text-zinc-700 dark:text-zinc-300">{sliceItem.statusLabel}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-zinc-900 dark:text-zinc-100">
                    {sliceItem.count}
                  </span>
                  <span className="text-[10px] text-zinc-400 w-9 text-right font-mono">
                    {sliceItem.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-zinc-200/60 dark:border-white/5 text-[11px] text-zinc-400 text-center">
        Hover over donut segments or list items to isolate status metrics
      </div>
    </div>
  );
};
