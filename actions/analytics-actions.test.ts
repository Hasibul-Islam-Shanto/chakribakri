import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getAnalyticsDataAction } from '@/actions/analytics-actions';
import {
  clearTestDatabase,
  getTestPrismaClient,
  createTestUser,
  createTestJob,
} from '../tests/test-db-setup';

const mockSessionInstance = {
  isAuthenticated: true,
  userId: 'analytics-user-id' as string | undefined,
  email: 'analytics@example.com' as string | undefined,
  username: 'analyticsuser' as string | undefined,
  save: vi.fn().mockResolvedValue(undefined),
  destroy: vi.fn().mockReturnValue(undefined),
};

vi.mock('@/lib/session', () => ({
  getCurrentSession: vi.fn().mockImplementation(async () => mockSessionInstance),
  verifySessionCookie: vi.fn(),
  sessionCookieName: 'chakribakri_session',
}));

describe('Analytics Server Actions (actions/analytics-actions.test.ts)', () => {
  const prismaClient = getTestPrismaClient();

  beforeEach(async () => {
    await clearTestDatabase();
    mockSessionInstance.isAuthenticated = true;
    mockSessionInstance.userId = 'analytics-user-id';
    mockSessionInstance.email = 'analytics@example.com';

    await prismaClient.user.create({
      data: {
        id: 'analytics-user-id',
        username: 'analyticsuser',
        email: 'analytics@example.com',
        passwordHash: 'dummyhash',
      },
    });
  });

  afterEach(async () => {
    await clearTestDatabase();
  });

  it('rejects analytics query if user is unauthenticated', async () => {
    mockSessionInstance.isAuthenticated = false;
    mockSessionInstance.userId = undefined;

    const unauthenticatedResult = await getAnalyticsDataAction('6months');

    expect(unauthenticatedResult.isSuccess).toBe(false);
    expect(unauthenticatedResult.hasError).toBe(true);
    expect(unauthenticatedResult.errorMessage).toContain('Authentication required');
  });

  it('computes accurate KPI summary for user job application records', async () => {
    const today = new Date();
    const tenDaysAgo = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000);
    const twentyDaysAgo = new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000);

    // 1 Wishlist
    await createTestJob({
      userId: 'analytics-user-id',
      company: 'Wishlist Co',
      position: 'Designer',
      status: 'Wishlist',
      applicationDate: today,
    });

    // 1 Applied
    await createTestJob({
      userId: 'analytics-user-id',
      company: 'Stripe',
      position: 'Backend Engineer',
      status: 'Applied',
      applicationDate: twentyDaysAgo,
    });

    // 1 Interviewing (Responded: applicationDate 20 days ago, updated today = 20 days response)
    const interviewJob = await createTestJob({
      userId: 'analytics-user-id',
      company: 'Google',
      position: 'Software Engineer',
      status: 'Interviewing',
      applicationDate: twentyDaysAgo,
    });
    // Set updatedAt to simulate response time
    await prismaClient.job.update({
      where: { id: interviewJob.id },
      data: { updatedAt: today },
    });

    // 1 Offer (Responded: applicationDate 10 days ago, updated today = 10 days response)
    const offerJob = await createTestJob({
      userId: 'analytics-user-id',
      company: 'Vercel',
      position: 'Fullstack Engineer',
      status: 'Offer',
      applicationDate: tenDaysAgo,
    });
    await prismaClient.job.update({
      where: { id: offerJob.id },
      data: { updatedAt: today },
    });

    const analyticsResult = await getAnalyticsDataAction('all');

    expect(analyticsResult.isSuccess).toBe(true);
    expect(analyticsResult.hasError).toBe(false);
    expect(analyticsResult.analyticsData).toBeDefined();

    const kpiSummary = analyticsResult.analyticsData!.kpiSummary;
    expect(kpiSummary.totalApplicationsCount).toBe(4);
    expect(kpiSummary.wishlistCount).toBe(1);
    expect(kpiSummary.appliedCount).toBe(1);
    expect(kpiSummary.interviewCount).toBe(1);
    expect(kpiSummary.offerCount).toBe(1);

    // Interview conversion rate: (interviewing + offer) / total * 100 = 2/4 * 100 = 50%
    expect(kpiSummary.interviewConversionRate).toBe(50);

    // Offer acceptance rate: 1/4 * 100 = 25%
    expect(kpiSummary.offerAcceptanceRate).toBe(25);

    // Funnel stages
    const funnelStages = analyticsResult.analyticsData!.funnelStageList;
    expect(funnelStages).toHaveLength(4);
    expect(funnelStages[0].stageLabel).toBe('Wishlist');
    expect(funnelStages[0].count).toBe(4);

    // Status outcome breakdown
    const statusOutcomes = analyticsResult.analyticsData!.statusOutcomeList;
    expect(statusOutcomes).toHaveLength(5);
    const offerStatus = statusOutcomes.find((status) => status.statusLabel === 'Offer');
    expect(offerStatus?.count).toBe(1);
    expect(offerStatus?.percentage).toBe(25);
  });
});
