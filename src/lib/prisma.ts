import { PrismaClient } from '@prisma/client';

const getGlobalPrismaInstance = (): { prisma?: PrismaClient } => {
  return globalThis as unknown as { prisma?: PrismaClient };
};

const createPrismaClient = (): PrismaClient => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
};

const globalStore = getGlobalPrismaInstance();

export const prisma: PrismaClient = globalStore.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalStore.prisma = prisma;
}
