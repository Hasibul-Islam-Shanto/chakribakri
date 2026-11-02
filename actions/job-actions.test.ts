import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createJob, updateJob, deleteJob, getJobs, JobActionResult } from '@/actions/job-actions';
import {
  clearTestDatabase,
  getTestPrismaClient,
  disconnectTestDatabase,
} from '../tests/test-db-setup';
import { resetRateLimitStore } from '@/lib/rate-limiter';
import { JobFormPayload } from '@/types/job';

vi.mock('next/headers', () => ({
  headers: () => new Headers({ 'x-forwarded-for': '127.0.0.1' }),
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
  }),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/session', () => ({
  getCurrentSession: vi.fn().mockResolvedValue({
    isAuthenticated: true,
    email: 'testuser@example.com',
    userId: 'isolated-test-user-id',
    username: 'testuser',
    save: vi.fn().mockResolvedValue(undefined),
    destroy: vi.fn().mockReturnValue(undefined),
  }),
  verifySessionCookie: vi.fn(),
  sessionCookieName: 'chakribakri_session',
}));

describe('Job Server Actions with Test SQLite Database (actions/job-actions.test.ts)', () => {
  const prismaClient = getTestPrismaClient();

  beforeEach(async () => {
    resetRateLimitStore();
    await clearTestDatabase();

    // Ensure the session user exists in the database to satisfy foreign key constraints
    await prismaClient.user.create({
      data: {
        id: 'isolated-test-user-id',
        username: 'testuser',
        email: 'testuser@example.com',
        passwordHash: 'dummyhash123',
      },
    });
  });

  afterEach(async () => {
    resetRateLimitStore();
    await clearTestDatabase();
  });

  it('creates a job record in the isolated database successfully', async () => {
    const jobCreationPayload: JobFormPayload = {
      company: 'Vercel',
      position: 'Senior Infrastructure Engineer',
      location: 'Remote',
      salary: '$180,000',
      status: 'Applied',
      applicationDate: '2026-04-01',
      jobUrl: 'https://vercel.com/careers/infra',
      notes: 'Applied via team referral.',
    };

    const creationResult: JobActionResult = await createJob(jobCreationPayload);

    expect(creationResult.isSuccess).toBe(true);
    expect(creationResult.hasError).toBe(false);
    expect(creationResult.createdJobId).toBeDefined();

    // Verify record in database
    const persistedJobRecord = await prismaClient.job.findUnique({
      where: { id: creationResult.createdJobId },
    });

    expect(persistedJobRecord).not.toBeNull();
    expect(persistedJobRecord?.company).toBe('Vercel');
    expect(persistedJobRecord?.position).toBe('Senior Infrastructure Engineer');
    expect(persistedJobRecord?.status).toBe('Applied');
  });

  it('fails gracefully when required fields are missing on creation', async () => {
    const invalidJobPayload: JobFormPayload = {
      company: '   ',
      position: 'Staff Engineer',
      status: 'Wishlist',
    };

    const creationResult: JobActionResult = await createJob(invalidJobPayload);

    expect(creationResult.isSuccess).toBe(false);
    expect(creationResult.hasError).toBe(true);
    expect(creationResult.errorMessage).toBe('Company name is required.');
  });

  it('updates an existing job record accurately in the database', async () => {
    // Seed initial job
    const initialJobRecord = await prismaClient.job.create({
      data: {
        userId: 'isolated-test-user-id',
        company: 'Stripe',
        position: 'Backend Engineer',
        location: 'Seattle, WA',
        salary: '$165,000',
        status: 'Wishlist',
      },
    });

    const updatePayload: JobFormPayload = {
      company: 'Stripe',
      position: 'Lead Backend Engineer',
      location: 'Remote',
      salary: '$195,000',
      status: 'Interviewing',
      notes: 'Passed screening round with engineering manager.',
    };

    const updateResult: JobActionResult = await updateJob(initialJobRecord.id, updatePayload);

    expect(updateResult.isSuccess).toBe(true);
    expect(updateResult.hasError).toBe(false);

    const updatedJobRecord = await prismaClient.job.findUnique({
      where: { id: initialJobRecord.id },
    });

    expect(updatedJobRecord?.position).toBe('Lead Backend Engineer');
    expect(updatedJobRecord?.status).toBe('Interviewing');
    expect(updatedJobRecord?.salary).toBe('$195,000');
  });

  it('deletes an existing job record from the database', async () => {
    const jobRecordToDelete = await prismaClient.job.create({
      data: {
        userId: 'isolated-test-user-id',
        company: 'Deprecated Corp',
        position: 'DevOps Specialist',
        status: 'Rejected',
      },
    });

    const deletionResult: JobActionResult = await deleteJob(jobRecordToDelete.id);

    expect(deletionResult.isSuccess).toBe(true);
    expect(deletionResult.hasError).toBe(false);

    const queriedDeletedRecord = await prismaClient.job.findUnique({
      where: { id: jobRecordToDelete.id },
    });

    expect(queriedDeletedRecord).toBeNull();
  });

  it('fetches all jobs belonging to the current user via getJobs', async () => {
    await prismaClient.user.create({
      data: {
        id: 'another-user-id',
        username: 'anotheruser',
        email: 'anotheruser@example.com',
        passwordHash: 'dummyhash456',
      },
    });

    await prismaClient.job.createMany({
      data: [
        {
          userId: 'isolated-test-user-id',
          company: 'Linear',
          position: 'Product Engineer',
          status: 'Interviewing',
        },
        {
          userId: 'isolated-test-user-id',
          company: 'Datadog',
          position: 'Systems Engineer',
          status: 'Offer',
        },
        {
          userId: 'another-user-id',
          company: 'External Corp',
          position: 'Security Engineer',
          status: 'Applied',
        },
      ],
    });

    const retrievedJobsList = await getJobs('isolated-test-user-id');

    expect(retrievedJobsList.length).toBe(2);
    const companyNames = retrievedJobsList.map((jobRecord) => jobRecord.company);
    expect(companyNames).toContain('Linear');
    expect(companyNames).toContain('Datadog');
    expect(companyNames).not.toContain('External Corp');
  });

  it('verifies write rate-limiting: consecutive createJob calls trigger write throttle after threshold', async () => {
    const validBasePayload: JobFormPayload = {
      company: 'RateLimit Test Co',
      position: 'QA Engineer',
      status: 'Wishlist',
    };

    // The threshold is 30 write operations per minute
    // First 30 calls should succeed
    for (let requestIndex = 0; requestIndex < 30; requestIndex += 1) {
      const allowedResult = await createJob(validBasePayload);
      expect(allowedResult.isSuccess).toBe(true);
      expect(allowedResult.hasError).toBe(false);
    }

    // The 31st call must trigger rate limit throttling
    const throttledResult = await createJob(validBasePayload);
    expect(throttledResult.isSuccess).toBe(false);
    expect(throttledResult.hasError).toBe(true);
    expect(throttledResult.errorMessage).toContain('Too many write operations');
  });
});
