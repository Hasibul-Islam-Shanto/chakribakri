import { prisma } from '@/lib/prisma';
import {
  AnalyticsDashboardData,
  AnalyticsKpiSummary,
  AnalyticsTimeframe,
  FunnelStageData,
  MonthlyTrajectoryPoint,
  StatusOutcomeData,
} from '@/types/analytics';
import { JobStatus } from '@/types/job';
import { Prisma } from '@prisma/client';

const STATUS_COLOR_MAP: Record<JobStatus, { hex: string; class: string }> = {
  Wishlist: { hex: '#a1a1aa', class: 'bg-zinc-400' },
  Applied: { hex: '#38bdf8', class: 'bg-sky-400' },
  Interviewing: { hex: '#818cf8', class: 'bg-indigo-400' },
  Offer: { hex: '#34d399', class: 'bg-emerald-400' },
  Rejected: { hex: '#fb7185', class: 'bg-rose-400' },
};

const calculateTimeframeCutoffDate = (timeframe: AnalyticsTimeframe): Date | null => {
  const currentTimestamp = new Date();
  if (timeframe === '30days') {
    return new Date(currentTimestamp.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  if (timeframe === '6months') {
    const sixMonthsAgo = new Date(currentTimestamp);
    sixMonthsAgo.setMonth(currentTimestamp.getMonth() - 6);
    return sixMonthsAgo;
  }
  if (timeframe === '1year') {
    const oneYearAgo = new Date(currentTimestamp);
    oneYearAgo.setFullYear(currentTimestamp.getFullYear() - 1);
    return oneYearAgo;
  }
  return null;
};

export const computeAnalyticsData = async (
  userId: string,
  timeframe: AnalyticsTimeframe = '6months'
): Promise<AnalyticsDashboardData> => {
  const cutoffDate = calculateTimeframeCutoffDate(timeframe);

  const baseWhereFilter: Prisma.JobWhereInput = {
    userId,
    ...(cutoffDate ? { applicationDate: { gte: cutoffDate } } : {}),
  };

  const matchingJobList = await prisma.job.findMany({
    where: baseWhereFilter,
    orderBy: { applicationDate: 'asc' },
  });

  const totalApplicationsCount = matchingJobList.length;

  let wishlistCount = 0;
  let appliedCount = 0;
  let interviewCount = 0;
  let offerCount = 0;
  let rejectedCount = 0;

  let totalResponseDaysAccumulator = 0;
  let respondedJobsCount = 0;

  for (const jobItem of matchingJobList) {
    const jobStatus = jobItem.status as JobStatus;

    if (jobStatus === 'Wishlist') {
      wishlistCount += 1;
    } else if (jobStatus === 'Applied') {
      appliedCount += 1;
    } else if (jobStatus === 'Interviewing') {
      interviewCount += 1;
    } else if (jobStatus === 'Offer') {
      offerCount += 1;
    } else if (jobStatus === 'Rejected') {
      rejectedCount += 1;
    }

    const hasReceivedResponse =
      jobStatus === 'Interviewing' || jobStatus === 'Offer' || jobStatus === 'Rejected';

    if (hasReceivedResponse) {
      const applicationDate =
        jobItem.applicationDate instanceof Date
          ? jobItem.applicationDate
          : new Date(jobItem.applicationDate);
      const updatedAtDate =
        jobItem.updatedAt instanceof Date ? jobItem.updatedAt : new Date(jobItem.updatedAt);
      const responseTimeInMilliseconds = updatedAtDate.getTime() - applicationDate.getTime();
      const responseTimeInDays = Math.max(0, responseTimeInMilliseconds / (1000 * 60 * 60 * 24));
      totalResponseDaysAccumulator += responseTimeInDays;
      respondedJobsCount += 1;
    }
  }

  // 1. KPI Calculations
  const totalInterviewAndOfferCount = interviewCount + offerCount;
  const interviewConversionRate =
    totalApplicationsCount > 0
      ? Math.round((totalInterviewAndOfferCount / totalApplicationsCount) * 1000) / 10
      : 0;

  const offerAcceptanceRate =
    totalApplicationsCount > 0 ? Math.round((offerCount / totalApplicationsCount) * 1000) / 10 : 0;

  const averageResponseTimeDays =
    respondedJobsCount > 0
      ? Math.round((totalResponseDaysAccumulator / respondedJobsCount) * 10) / 10
      : 0;

  const kpiSummary: AnalyticsKpiSummary = {
    totalApplicationsCount,
    interviewConversionRate,
    offerAcceptanceRate,
    averageResponseTimeDays,
    interviewCount,
    offerCount,
    rejectedCount,
    wishlistCount,
    appliedCount,
  };

  // 2. Monthly Application Trajectory (past 6-12 months)
  const trajectoryMap = new Map<
    string,
    { monthLabel: string; appliedCount: number; interviewsSecuredCount: number }
  >();

  // Pre-seed months based on timeframe or past 6 months to ensure smooth continuous chart
  const monthsToGenerate = timeframe === '1year' ? 12 : timeframe === '30days' ? 2 : 6;
  const currentDateReference = new Date();

  for (let monthOffset = monthsToGenerate - 1; monthOffset >= 0; monthOffset -= 1) {
    const historicalDate = new Date(
      currentDateReference.getFullYear(),
      currentDateReference.getMonth() - monthOffset,
      1
    );
    const monthKey = `${historicalDate.getFullYear()}-${String(
      historicalDate.getMonth() + 1
    ).padStart(2, '0')}`;
    const monthLabel = historicalDate.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });

    trajectoryMap.set(monthKey, {
      monthLabel,
      appliedCount: 0,
      interviewsSecuredCount: 0,
    });
  }

  for (const jobItem of matchingJobList) {
    const jobDate =
      jobItem.applicationDate instanceof Date
        ? jobItem.applicationDate
        : new Date(jobItem.applicationDate);
    const monthKey = `${jobDate.getFullYear()}-${String(jobDate.getMonth() + 1).padStart(2, '0')}`;

    const monthLabel = jobDate.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });

    const existingMonthRecord = trajectoryMap.get(monthKey) || {
      monthLabel,
      appliedCount: 0,
      interviewsSecuredCount: 0,
    };

    existingMonthRecord.appliedCount += 1;

    const isInterviewOrOffer = jobItem.status === 'Interviewing' || jobItem.status === 'Offer';
    if (isInterviewOrOffer) {
      existingMonthRecord.interviewsSecuredCount += 1;
    }

    trajectoryMap.set(monthKey, existingMonthRecord);
  }

  const sortedMonthKeys = Array.from(trajectoryMap.keys()).sort();
  const monthlyTrajectoryList: MonthlyTrajectoryPoint[] = sortedMonthKeys.map((monthSortKey) => {
    const monthData = trajectoryMap.get(monthSortKey)!;
    return {
      monthSortKey,
      monthLabel: monthData.monthLabel,
      appliedCount: monthData.appliedCount,
      interviewsSecuredCount: monthData.interviewsSecuredCount,
    };
  });

  // 3. Application Funnel Breakdown
  // Transitions: Wishlist -> Applied -> Interviewing -> Offer / Rejected
  // Total in pipeline funnel: Wishlist + Applied + Interviewing + (Offer + Rejected)
  const funnelWishlistStageCount = totalApplicationsCount;
  const funnelAppliedStageCount = appliedCount + interviewCount + offerCount + rejectedCount;
  const funnelInterviewStageCount = interviewCount + offerCount;
  const funnelOutcomeStageCount = offerCount + rejectedCount;

  const calculateFunnelPercentage = (numerator: number, denominator: number): number => {
    if (denominator <= 0) {
      return 0;
    }
    return Math.min(100, Math.round((numerator / denominator) * 100));
  };

  const funnelStageList: FunnelStageData[] = [
    {
      stageLabel: 'Wishlist',
      count: funnelWishlistStageCount,
      conversionPercentage: 100,
      colorClass: 'from-zinc-400 to-zinc-500',
    },
    {
      stageLabel: 'Applied',
      count: funnelAppliedStageCount,
      conversionPercentage: calculateFunnelPercentage(
        funnelAppliedStageCount,
        funnelWishlistStageCount
      ),
      colorClass: 'from-sky-500 to-blue-500',
    },
    {
      stageLabel: 'Interviewing',
      count: funnelInterviewStageCount,
      conversionPercentage: calculateFunnelPercentage(
        funnelInterviewStageCount,
        funnelAppliedStageCount
      ),
      colorClass: 'from-indigo-500 to-violet-500',
    },
    {
      stageLabel: 'Offer / Decided',
      count: funnelOutcomeStageCount,
      conversionPercentage: calculateFunnelPercentage(
        funnelOutcomeStageCount,
        funnelInterviewStageCount
      ),
      colorClass: 'from-emerald-500 to-teal-500',
    },
  ];

  // 4. Company Response Outcomes (Status breakdown)
  const statusCounts: Record<JobStatus, number> = {
    Wishlist: wishlistCount,
    Applied: appliedCount,
    Interviewing: interviewCount,
    Offer: offerCount,
    Rejected: rejectedCount,
  };

  const allStatuses: JobStatus[] = ['Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

  const statusOutcomeList: StatusOutcomeData[] = allStatuses.map((statusKey) => {
    const count = statusCounts[statusKey];
    const percentage =
      totalApplicationsCount > 0 ? Math.round((count / totalApplicationsCount) * 1000) / 10 : 0;

    return {
      statusLabel: statusKey,
      count,
      percentage,
      colorHex: STATUS_COLOR_MAP[statusKey].hex,
      badgeColorClass: STATUS_COLOR_MAP[statusKey].class,
    };
  });

  return {
    kpiSummary,
    monthlyTrajectoryList,
    funnelStageList,
    statusOutcomeList,
    timeframe,
  };
};
