import { Job, User, VerificationToken } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { JobStatus } from '@/types/job';
import { vi } from 'vitest';

// In-memory data collections for test isolation
const userStore = new Map<string, User>();
const jobStore = new Map<string, Job>();
const verificationTokenStore = new Map<string, VerificationToken>();

let currentIdSequence = 1;
const generateUniqueId = (prefix: string = 'test-id'): string => {
  currentIdSequence += 1;
  return `${prefix}-${currentIdSequence}-${Date.now()}`;
};

export const createInMemoryPrismaClient = () => {
  return {
    user: {
      create: async ({ data }: { data: any }): Promise<User> => {
        const userId = data.id || generateUniqueId('user');
        const userRecord: User = {
          id: userId,
          email: data.email || `${data.username || 'user'}@example.com`,
          username: data.username || null,
          passwordHash: data.passwordHash || '',
          isVerified: Boolean(data.isVerified ?? false),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        userStore.set(userId, userRecord);
        return userRecord;
      },
      findUnique: async ({ where }: { where: any }): Promise<User | null> => {
        for (const userRecord of Array.from(userStore.values())) {
          if (where.id && userRecord.id === where.id) return userRecord;
          if (where.email && userRecord.email?.toLowerCase() === where.email.toLowerCase()) return userRecord;
          if (where.username && userRecord.username?.toLowerCase() === where.username.toLowerCase()) return userRecord;
        }
        return null;
      },
      findFirst: async ({ where }: { where: any }): Promise<User | null> => {
        if (!where) {
          const firstUser = Array.from(userStore.values())[0];
          return firstUser || null;
        }
        for (const userRecord of Array.from(userStore.values())) {
          if (where.id && userRecord.id === where.id) return userRecord;
          if (where.email && userRecord.email?.toLowerCase() === where.email.toLowerCase()) return userRecord;
          if (where.username && userRecord.username?.toLowerCase() === where.username.toLowerCase()) return userRecord;
          if (where.OR && Array.isArray(where.OR)) {
            const hasMatch = where.OR.some((condition: any) => {
              if (condition.email && userRecord.email?.toLowerCase() === condition.email.toLowerCase()) return true;
              if (condition.username && userRecord.username?.toLowerCase() === condition.username.toLowerCase()) return true;
              return false;
            });
            if (hasMatch) return userRecord;
          }
        }
        return null;
      },
      findMany: async ({ where }: { where?: any } = {}): Promise<User[]> => {
        return Array.from(userStore.values());
      },
      update: async ({ where, data }: { where: any; data: any }): Promise<User> => {
        let targetUser: User | null = null;
        for (const userRecord of Array.from(userStore.values())) {
          if (where.id && userRecord.id === where.id) {
            targetUser = userRecord;
            break;
          }
          if (where.email && userRecord.email === where.email) {
            targetUser = userRecord;
            break;
          }
        }
        if (!targetUser) throw new Error('User not found');
        const updatedUser: User = {
          ...targetUser,
          ...data,
          updatedAt: new Date(),
        };
        userStore.set(updatedUser.id, updatedUser);
        return updatedUser;
      },
      updateMany: async ({ where, data }: { where?: any; data: any }): Promise<{ count: number }> => {
        let count = 0;
        for (const userRecord of Array.from(userStore.values())) {
          userStore.set(userRecord.id, { ...userRecord, ...data, updatedAt: new Date() });
          count += 1;
        }
        return { count };
      },
      deleteMany: async (): Promise<{ count: number }> => {
        const count = userStore.size;
        userStore.clear();
        return { count };
      },
    },

    job: {
      create: async ({ data }: { data: any }): Promise<Job> => {
        const jobId = data.id || generateUniqueId('job');
        const jobRecord: Job = {
          id: jobId,
          userId: data.userId || null,
          company: data.company,
          position: data.position,
          location: data.location || null,
          salary: data.salary || null,
          status: data.status || 'Wishlist',
          applicationDate: data.applicationDate instanceof Date ? data.applicationDate : new Date(data.applicationDate || Date.now()),
          jobUrl: data.jobUrl || null,
          notes: data.notes || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        jobStore.set(jobId, jobRecord);
        return jobRecord;
      },
      createMany: async ({ data }: { data: any[] }): Promise<{ count: number }> => {
        for (const item of data) {
          const jobId = item.id || generateUniqueId('job');
          const jobRecord: Job = {
            id: jobId,
            userId: item.userId || null,
            company: item.company,
            position: item.position,
            location: item.location || null,
            salary: item.salary || null,
            status: item.status || 'Wishlist',
            applicationDate: item.applicationDate instanceof Date ? item.applicationDate : new Date(item.applicationDate || Date.now()),
            jobUrl: item.jobUrl || null,
            notes: item.notes || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          jobStore.set(jobId, jobRecord);
        }
        return { count: data.length };
      },
      findUnique: async ({ where }: { where: any }): Promise<Job | null> => {
        return jobStore.get(where.id) || null;
      },
      findFirst: async ({ where }: { where: any }): Promise<Job | null> => {
        for (const job of Array.from(jobStore.values())) {
          if (where.id && job.id === where.id) return job;
        }
        return null;
      },
      findMany: async ({ where, orderBy, skip, take }: { where?: any; orderBy?: any; skip?: number; take?: number } = {}): Promise<Job[]> => {
        let results = Array.from(jobStore.values());

        if (where) {
          if (where.userId !== undefined) {
            results = results.filter((job) => job.userId === where.userId);
          }
          if (where.status) {
            results = results.filter((job) => job.status === where.status);
          }
          if (where.applicationDate?.gte) {
            const cutoff = where.applicationDate.gte;
            results = results.filter((job) => job.applicationDate >= cutoff);
          }
          if (where.OR && Array.isArray(where.OR)) {
            results = results.filter((job) => {
              return where.OR.some((condition: any) => {
                if (condition.company?.contains && job.company.toLowerCase().includes(condition.company.contains.toLowerCase())) return true;
                if (condition.position?.contains && job.position.toLowerCase().includes(condition.position.contains.toLowerCase())) return true;
                if (condition.location?.contains && job.location?.toLowerCase().includes(condition.location.contains.toLowerCase())) return true;
                if (condition.notes?.contains && job.notes?.toLowerCase().includes(condition.notes.contains.toLowerCase())) return true;
                return false;
              });
            });
          }
        }

        if (orderBy) {
          const sortKey = Object.keys(orderBy)[0] as keyof Job;
          const sortDirection = orderBy[sortKey];
          results.sort((a, b) => {
            const aVal = a[sortKey];
            const bVal = b[sortKey];
            if (aVal === bVal) return 0;
            if (sortDirection === 'asc') return aVal! > bVal! ? 1 : -1;
            return aVal! < bVal! ? 1 : -1;
          });
        }

        if (skip) {
          results = results.slice(skip);
        }
        if (take) {
          results = results.slice(0, take);
        }

        return results;
      },
      count: async ({ where }: { where?: any } = {}): Promise<number> => {
        let results = Array.from(jobStore.values());
        if (where) {
          if (where.userId !== undefined) {
            results = results.filter((job) => job.userId === where.userId);
          }
          if (where.status) {
            results = results.filter((job) => job.status === where.status);
          }
          if (where.applicationDate?.gte) {
            const cutoff = where.applicationDate.gte;
            results = results.filter((job) => job.applicationDate >= cutoff);
          }
        }
        return results.length;
      },
      update: async ({ where, data }: { where: any; data: any }): Promise<Job> => {
        const existingJob = jobStore.get(where.id);
        if (!existingJob) throw new Error('Job not found');
        const updatedJob: Job = {
          ...existingJob,
          ...data,
          updatedAt: new Date(),
        };
        jobStore.set(updatedJob.id, updatedJob);
        return updatedJob;
      },
      updateMany: async ({ where, data }: { where?: any; data: any }): Promise<{ count: number }> => {
        let count = 0;
        for (const job of Array.from(jobStore.values())) {
          if (where && where.userId === null && job.userId !== null) continue;
          jobStore.set(job.id, { ...job, ...data, updatedAt: new Date() });
          count += 1;
        }
        return { count };
      },
      delete: async ({ where }: { where: any }): Promise<Job> => {
        const existingJob = jobStore.get(where.id);
        if (!existingJob) throw new Error('Job not found');
        jobStore.delete(where.id);
        return existingJob;
      },
      deleteMany: async (): Promise<{ count: number }> => {
        const count = jobStore.size;
        jobStore.clear();
        return { count };
      },
    },

    verificationToken: {
      create: async ({ data }: { data: any }): Promise<VerificationToken> => {
        const tokenId = data.id || generateUniqueId('token');
        const tokenRecord: VerificationToken = {
          id: tokenId,
          userId: data.userId,
          email: data.email.toLowerCase(),
          codeHash: data.codeHash,
          attemptsCount: data.attemptsCount || 0,
          expiresAt: data.expiresAt instanceof Date ? data.expiresAt : new Date(data.expiresAt),
          createdAt: new Date(),
        };
        verificationTokenStore.set(tokenId, tokenRecord);
        return tokenRecord;
      },
      findFirst: async ({ where, orderBy }: { where: any; orderBy?: any }): Promise<VerificationToken | null> => {
        let results = Array.from(verificationTokenStore.values());
        if (where.email) {
          results = results.filter((tok) => tok.email.toLowerCase() === where.email.toLowerCase());
        }
        if (where.userId) {
          results = results.filter((tok) => tok.userId === where.userId);
        }
        if (orderBy?.createdAt === 'desc') {
          results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        }
        return results[0] || null;
      },
      findMany: async ({ where }: { where?: any } = {}): Promise<VerificationToken[]> => {
        let results = Array.from(verificationTokenStore.values());
        if (where?.email) {
          results = results.filter((tok) => tok.email.toLowerCase() === where.email.toLowerCase());
        }
        return results;
      },
      update: async ({ where, data }: { where: any; data: any }): Promise<VerificationToken> => {
        const existingToken = verificationTokenStore.get(where.id);
        if (!existingToken) throw new Error('Token not found');
        const updatedToken: VerificationToken = {
          ...existingToken,
          ...data,
        };
        verificationTokenStore.set(updatedToken.id, updatedToken);
        return updatedToken;
      },
      deleteMany: async ({ where }: { where?: any } = {}): Promise<{ count: number }> => {
        let count = 0;
        if (!where) {
          count = verificationTokenStore.size;
          verificationTokenStore.clear();
          return { count };
        }
        for (const [id, tok] of Array.from(verificationTokenStore.entries())) {
          if (where.email && tok.email.toLowerCase() === where.email.toLowerCase()) {
            verificationTokenStore.delete(id);
            count += 1;
          }
        }
        return { count };
      },
    },

    $disconnect: async (): Promise<void> => {},
  };
};

const sharedInMemoryClient = createInMemoryPrismaClient();

export const getTestPrismaClient = (): any => {
  return sharedInMemoryClient;
};

export const clearTestDatabase = async (): Promise<void> => {
  userStore.clear();
  jobStore.clear();
  verificationTokenStore.clear();
};

export const createTestUser = async (
  customUsername: string = 'testuser',
  rawPassword: string = 'password123',
  isVerified: boolean = true,
  customEmail?: string
): Promise<User> => {
  const prismaClient = getTestPrismaClient();
  const passwordHash = await bcrypt.hash(rawPassword, 10);
  const email = customEmail || `${customUsername.toLowerCase()}@example.com`;

  const createdUserRecord = await prismaClient.user.create({
    data: {
      username: customUsername.toLowerCase(),
      email,
      passwordHash,
      isVerified,
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
  userStore.clear();
  jobStore.clear();
  verificationTokenStore.clear();
};
