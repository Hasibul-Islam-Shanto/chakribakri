'use server';

import { ensureAuthenticatedUser } from '@/lib/auth-guard';
import { computeAnalyticsData } from '@/lib/analytics-service';
import { AnalyticsActionResult, AnalyticsTimeframe } from '@/types/analytics';

export const getAnalyticsDataAction = async (
  requestedTimeframe: AnalyticsTimeframe = '6months'
): Promise<AnalyticsActionResult> => {
  try {
    const authenticatedUser = await ensureAuthenticatedUser();

    const analyticsDashboardData = await computeAnalyticsData(
      authenticatedUser.userId,
      requestedTimeframe
    );

    return {
      isSuccess: true,
      hasError: false,
      analyticsData: analyticsDashboardData,
    };
  } catch (analyticsError: unknown) {
    const errorMessage =
      analyticsError instanceof Error
        ? analyticsError.message
        : 'Failed to retrieve analytics data.';

    return {
      isSuccess: false,
      hasError: true,
      errorMessage,
    };
  }
};

export const getAnalyticsData = getAnalyticsDataAction;
