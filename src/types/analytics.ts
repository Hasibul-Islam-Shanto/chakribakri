export type AnalyticsTimeframe = '30days' | '6months' | '1year' | 'all';

export interface AnalyticsKpiSummary {
  totalApplicationsCount: number;
  interviewConversionRate: number;
  offerAcceptanceRate: number;
  averageResponseTimeDays: number;
  interviewCount: number;
  offerCount: number;
  rejectedCount: number;
  wishlistCount: number;
  appliedCount: number;
}

export interface MonthlyTrajectoryPoint {
  monthLabel: string;
  monthSortKey: string;
  appliedCount: number;
  interviewsSecuredCount: number;
}

export interface FunnelStageData {
  stageLabel: string;
  count: number;
  conversionPercentage: number;
  colorClass: string;
}

export interface StatusOutcomeData {
  statusLabel: string;
  count: number;
  percentage: number;
  colorHex: string;
  badgeColorClass: string;
}

export interface AnalyticsDashboardData {
  kpiSummary: AnalyticsKpiSummary;
  monthlyTrajectoryList: MonthlyTrajectoryPoint[];
  funnelStageList: FunnelStageData[];
  statusOutcomeList: StatusOutcomeData[];
  timeframe: AnalyticsTimeframe;
}

export interface AnalyticsActionResult {
  isSuccess: boolean;
  hasError: boolean;
  errorMessage?: string;
  analyticsData?: AnalyticsDashboardData;
}
