import { PrismaClient, Job, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { JobStatus } from '@/types/job';

let testPrismaInstance: PrismaClient | null = null;

export const getTestPrismaClient = (): PrismaClient => {
  if (!testPrismaInstance) {
    testPrismaInstance = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'file:./test.db',
        },
      },
      log: ['error'],
    });
  }
  return testPrismaInstance;
};

export const clearTestDatabase = async (): Promise<void> => {
  const prismaClient = getTestPrismaClient();
  await prismaClient.job.deleteMany();
  await prismaClient.user.deleteMany();
};

export const createTestUser = async (
  customUsername: string = 'testuser',
  rawPassword: string = 'password123'
): Promise<User> => {
  const prismaClient = getTestPrismaClient();
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  const createdUserRecord = await prismaClient.user.create({
    data: {
      username: customUsername.toLowerCase(),
      passwordHash,
    },
  });

  return createdUserRecord;
};

export interface TestJobInput {
  userId?: string | null;
  company?: string;
  position?: string;
  location?: string | null;
  salary?: string | null;
  status?: JobStatus;
  applicationDate?: Date;
  jobUrl?: string | null;
  notes?: string | null;
}

export const createTestJob = async (inputOverrides: TestJobInput = {}): Promise<Job> => {
  const prismaClient = getTestPrismaClient();

  const createdJobRecord = await prismaClient.job.create({
    data: {
      userId: inputOverrides.userId ?? null,
      company: inputOverrides.company ?? 'Acme Corp',
      position: inputOverrides.position ?? 'Frontend Engineer',
      location: inputOverrides.location ?? 'Remote',
      salary: inputOverrides.salary ?? '$120,000',
      status: inputOverrides.status ?? 'Wishlist',
      applicationDate: inputOverrides.applicationDate ?? new Date(),
      jobUrl: inputOverrides.jobUrl ?? 'https://example.com/jobs/frontend-engineer',
      notes: inputOverrides.notes ?? 'Applied through company portal',
    },
  });

  return createdJobRecord;
};

export const disconnectTestDatabase = async (): Promise<void> => {
  if (testPrismaInstance) {
    await testPrismaInstance.$disconnect();
    testPrismaInstance = null;
  }
};

