import * as React from 'react';
import { Metadata } from 'next';
import { Navbar } from '@/components/layout/navbar';
import { AnalyticsDashboardView } from '@/components/analytics/analytics-dashboard-view';
import { computeAnalyticsData } from '@/lib/analytics-service';
import { ensureAuthenticatedUser } from '@/lib/auth-guard';
import { AnalyticsTimeframe } from '@/types/analytics';

export const metadata: Metadata = {
  title: 'Analytics & Pipeline Insights | chakriBakri',
  description:
    'Interactive analytics dashboard displaying application velocity, funnel conversions, and monthly trajectories.',
};

export const revalidate = 0;

export interface AnalyticsPageProps {
  searchParams: {
    timeframe?: string;
  };
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = async ({ searchParams }) => {
  const authenticatedUser = await ensureAuthenticatedUser();

  const validTimeframes: AnalyticsTimeframe[] = ['30days', '6months', '1year', 'all'];
  const requestedTimeframe = searchParams.timeframe as AnalyticsTimeframe;
  const effectiveTimeframe: AnalyticsTimeframe = validTimeframes.includes(requestedTimeframe)
    ? requestedTimeframe
    : '6months';

  const analyticsDashboardData = await computeAnalyticsData(
    authenticatedUser.userId,
    effectiveTimeframe
  );

  return (
    <>
      <Navbar
        username={authenticatedUser.username || authenticatedUser.email.split('@')[0]}
        showViewSwitcher={false}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 w-full flex-1">
        <AnalyticsDashboardView initialAnalyticsData={analyticsDashboardData} />
      </main>

      <footer className="border-t border-zinc-200/60 dark:border-white/5 py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
        chakriBakri &bull; Personal Job Application Pipeline &bull; Analytics Dashboard
      </footer>
    </>
  );
};

export default AnalyticsPage;
