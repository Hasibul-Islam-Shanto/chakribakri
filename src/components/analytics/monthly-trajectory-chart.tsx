'use client';

import * as React from 'react';
import { MonthlyTrajectoryPoint } from '@/types/analytics';
import { TrendingUp, Layers } from 'lucide-react';

export interface MonthlyTrajectoryChartProps {
  monthlyTrajectoryList: MonthlyTrajectoryPoint[];
}

export const MonthlyTrajectoryChart: React.FC<MonthlyTrajectoryChartProps> = ({
  monthlyTrajectoryList,
}) => {
  const [hoveredPointIndex, setHoveredPointIndex] = React.useState<number | null>(null);

  const hasData = monthlyTrajectoryList && monthlyTrajectoryList.length > 0;

  // Chart layout dimensions
  const chartWidth = 640;
  const chartHeight = 240;
  const paddingLeft = 40;
  const paddingRight = 24;
  const paddingTop = 28;
  const paddingBottom = 40;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  // Find maximum value for vertical scale
  const maximumDataValue = React.useMemo(() => {
    if (!hasData) {
      return 5;
    }
    const highestVal = Math.max(
      ...monthlyTrajectoryList.map((pointItem) =>
        Math.max(pointItem.appliedCount, pointItem.interviewsSecuredCount)
      )
    );
    return Math.max(5, Math.ceil(highestVal * 1.25));
  }, [monthlyTrajectoryList, hasData]);

  // Compute (x, y) coordinates for points
  const pointsData = React.useMemo(() => {
    if (!hasData) {
      return [];
    }

    const totalPoints = monthlyTrajectoryList.length;
    const stepX = totalPoints > 1 ? innerWidth / (totalPoints - 1) : innerWidth;

    return monthlyTrajectoryList.map((pointItem, pointIndex) => {
      const coordinateX = paddingLeft + pointIndex * stepX;
      const appliedY =
        paddingTop + innerHeight - (pointItem.appliedCount / maximumDataValue) * innerHeight;
      const interviewY =
        paddingTop +
        innerHeight -
        (pointItem.interviewsSecuredCount / maximumDataValue) * innerHeight;

      return {
        ...pointItem,
        coordinateX,
        appliedY,
        interviewY,
      };
    });
  }, [monthlyTrajectoryList, hasData, innerWidth, innerHeight, maximumDataValue]);

  // Generate SVG path strings
  const appliedLinePath = React.useMemo(() => {
    if (pointsData.length === 0) {
      return '';
    }
    return pointsData.reduce((pathString, currentPoint, pointIndex) => {
      if (pointIndex === 0) {
        return `M ${currentPoint.coordinateX} ${currentPoint.appliedY}`;
      }
      return `${pathString} L ${currentPoint.coordinateX} ${currentPoint.appliedY}`;
    }, '');
  }, [pointsData]);

  const appliedAreaPath = React.useMemo(() => {
    if (pointsData.length === 0) {
      return '';
    }
    const baselineY = paddingTop + innerHeight;
    const firstPoint = pointsData[0];
    const lastPoint = pointsData[pointsData.length - 1];
    return `${appliedLinePath} L ${lastPoint.coordinateX} ${baselineY} L ${firstPoint.coordinateX} ${baselineY} Z`;
  }, [pointsData, appliedLinePath, paddingTop, innerHeight]);

  const interviewLinePath = React.useMemo(() => {
    if (pointsData.length === 0) {
      return '';
    }
    return pointsData.reduce((pathString, currentPoint, pointIndex) => {
      if (pointIndex === 0) {
        return `M ${currentPoint.coordinateX} ${currentPoint.interviewY}`;
      }
      return `${pathString} L ${currentPoint.coordinateX} ${currentPoint.interviewY}`;
    }, '');
  }, [pointsData]);

  const interviewAreaPath = React.useMemo(() => {
    if (pointsData.length === 0) {
      return '';
    }
    const baselineY = paddingTop + innerHeight;
    const firstPoint = pointsData[0];
    const lastPoint = pointsData[pointsData.length - 1];
    return `${interviewLinePath} L ${lastPoint.coordinateX} ${baselineY} L ${firstPoint.coordinateX} ${baselineY} Z`;
  }, [pointsData, interviewLinePath, paddingTop, innerHeight]);

  const activeHoveredPoint = hoveredPointIndex !== null ? pointsData[hoveredPointIndex] : null;

  return (
    <div className="rounded-2xl border border-zinc-200/70 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-5 sm:p-6 shadow-lg shadow-zinc-900/5 dark:shadow-black/40">
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <h2 className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Application Trajectory
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Month-over-month applications vs. interviews secured
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 ring-2 ring-sky-400/30" />
            <span className="text-zinc-600 dark:text-zinc-300">Applications</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-2 ring-indigo-500/30" />
            <span className="text-zinc-600 dark:text-zinc-300">Interviews</span>
          </div>
        </div>
      </div>

      {/* Interactive Chart Container */}
      <div className="relative w-full aspect-[16/7] sm:aspect-[16/6] min-h-[220px]">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Gradient for Applications Area */}
            <linearGradient id="appliedAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>

            {/* Gradient for Interviews Area */}
            <linearGradient id="interviewAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((scaleFactor) => {
            const gridLineY = paddingTop + innerHeight * (1 - scaleFactor);
            const gridValue = Math.round(maximumDataValue * scaleFactor);

            return (
              <g key={`grid-${scaleFactor}`}>
                <line
                  x1={paddingLeft}
                  y1={gridLineY}
                  x2={chartWidth - paddingRight}
                  y2={gridLineY}
                  stroke="currentColor"
                  className="text-zinc-200/60 dark:text-zinc-800/60 stroke-dasharray-[3,3]"
                  strokeDasharray="3 3"
                />
                <text
                  x={paddingLeft - 8}
                  y={gridLineY + 3}
                  textAnchor="end"
                  className="text-[10px] fill-zinc-400 dark:fill-zinc-500 font-mono"
                >
                  {gridValue}
                </text>
              </g>
            );
          })}

          {/* Filled Area Paths */}
          {appliedAreaPath && <path d={appliedAreaPath} fill="url(#appliedAreaGradient)" />}
          {interviewAreaPath && <path d={interviewAreaPath} fill="url(#interviewAreaGradient)" />}

          {/* Stroke Lines */}
          {appliedLinePath && (
            <path
              d={appliedLinePath}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {interviewLinePath && (
            <path
              d={interviewLinePath}
              fill="none"
              stroke="#818cf8"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive vertical hover indicator line */}
          {activeHoveredPoint && (
            <line
              x1={activeHoveredPoint.coordinateX}
              y1={paddingTop}
              x2={activeHoveredPoint.coordinateX}
              y2={paddingTop + innerHeight}
              stroke="#6366f1"
              strokeWidth="1.5"
              strokeDasharray="2 2"
              className="opacity-75"
            />
          )}

          {/* Points & Labels */}
          {pointsData.map((pointItem, pointIndex) => {
            const isPointHovered = hoveredPointIndex === pointIndex;

            return (
              <g
                key={`point-${pointItem.monthSortKey}`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPointIndex(pointIndex)}
                onMouseLeave={() => setHoveredPointIndex(null)}
              >
                {/* Invisible hover trigger column */}
                <rect
                  x={pointItem.coordinateX - innerWidth / pointsData.length / 2}
                  y={paddingTop}
                  width={innerWidth / pointsData.length}
                  height={innerHeight}
                  fill="transparent"
                />

                {/* Applied Point dot */}
                <circle
                  cx={pointItem.coordinateX}
                  cy={pointItem.appliedY}
                  r={isPointHovered ? 6 : 4}
                  fill="#0284c7"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all duration-150 drop-shadow-sm"
                />

                {/* Interview Point dot */}
                <circle
                  cx={pointItem.coordinateX}
                  cy={pointItem.interviewY}
                  r={isPointHovered ? 6 : 4}
                  fill="#4f46e5"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all duration-150 drop-shadow-sm"
                />

                {/* Month label on X axis */}
                <text
                  x={pointItem.coordinateX}
                  y={chartHeight - 12}
                  textAnchor="middle"
                  className={`text-[11px] font-medium transition-colors ${
                    isPointHovered
                      ? 'fill-indigo-600 dark:fill-indigo-400 font-bold'
                      : 'fill-zinc-500 dark:fill-zinc-400'
                  }`}
                >
                  {pointItem.monthLabel}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip Card */}
        {activeHoveredPoint && (
          <div
            className="absolute top-2 pointer-events-none -translate-x-1/2 rounded-xl bg-zinc-900/90 dark:bg-zinc-800/90 text-white p-2.5 text-xs shadow-xl border border-white/10 backdrop-blur-md transition-all duration-150 z-20"
            style={{
              left: `${(activeHoveredPoint.coordinateX / chartWidth) * 100}%`,
            }}
          >
            <div className="font-bold text-zinc-200 border-b border-white/10 pb-1 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-indigo-400" />
              <span>{activeHoveredPoint.monthLabel}</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sky-300">Applications:</span>
                <span className="font-mono font-bold">{activeHoveredPoint.appliedCount}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-indigo-300">Interviews:</span>
                <span className="font-mono font-bold">
                  {activeHoveredPoint.interviewsSecuredCount}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
