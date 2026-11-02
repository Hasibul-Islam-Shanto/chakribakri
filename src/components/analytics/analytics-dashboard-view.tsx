'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AnalyticsDashboardData, AnalyticsTimeframe } from '@/types/analytics';
import { KpiSummaryCards } from '@/components/analytics/kpi-summary-cards';
import { MonthlyTrajectoryChart } from '@/components/analytics/monthly-trajectory-chart';
import { ApplicationFunnelChart } from '@/components/analytics/application-funnel-chart';
import { StatusDonutChart } from '@/components/analytics/status-donut-chart';
import { TimeframeFilterTabs } from '@/components/analytics/timeframe-filter-tabs';
import { BarChart3, Inbox } from 'lucide-react';

export interface AnalyticsDashboardViewProps {
  initialAnalyticsData: AnalyticsDashboardData;
}

export const AnalyticsDashboardView: React.FC<AnalyticsDashboardViewProps> = ({
  initialAnalyticsData,
}) => {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = React.useState<boolean>(false);

  const currentTimeframe = initialAnalyticsData.timeframe;
  const hasJobs = initialAnalyticsData.kpiSummary.totalApplicationsCount > 0;

  const handleTimeframeChange = (selectedTimeframe: AnalyticsTimeframe): void => {
    if (selectedTimeframe === currentTimeframe) {
      return;
    }
    setIsTransitioning(true);
    router.push(`/analytics?timeframe=${selectedTimeframe}`);
    // Router push will re-render the server component
    setTimeout(() => {
      setIsTransitioning(false);
    }, 400);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header & Filtering Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
              Analytics &amp; Pipeline Insights
            </h1>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Aggregated conversion rates, monthly trends, and interview metrics
          </p>
        </div>

        {/* Date Range Selector */}
        <TimeframeFilterTabs
          currentTimeframe={currentTimeframe}
          onTimeframeChange={handleTimeframeChange}
          isDisabled={isTransitioning}
        />
      </div>

      {/* KPI Metric Cards */}
      <KpiSummaryCards kpiSummary={initialAnalyticsData.kpiSummary} />

      {/* Visual Analytics Sections */}
      {hasJobs ? (
        <div className="space-y-6">
          {/* Monthly Trajectory Chart (Full width) */}
          <MonthlyTrajectoryChart
            monthlyTrajectoryList={initialAnalyticsData.monthlyTrajectoryList}
          />

          {/* Funnel & Status Breakdown (2 Columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ApplicationFunnelChart funnelStageList={initialAnalyticsData.funnelStageList} />
            <StatusDonutChart
              statusOutcomeList={initialAnalyticsData.statusOutcomeList}
              totalApplicationsCount={initialAnalyticsData.kpiSummary.totalApplicationsCount}
            />
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200/70 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-12 text-center shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400 mb-3">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            No applications found in this timeframe
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
            Try switching the timeframe filter to &ldquo;All Time&rdquo; or start tracking new
            applications from your Kanban board.
          </p>
        </div>
      )}
    </div>
  );
};
