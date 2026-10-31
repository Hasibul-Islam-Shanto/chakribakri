import { prisma } from '@/lib/prisma';
import { JobRecord, JobStatus, JobFilterParams, JobMetricsSummary } from '@/types/job';
import { PaginatedResult } from '@/types/pagination';
import { Prisma } from '@prisma/client';

export const getJobMetricsSummary = async (userId?: string): Promise<JobMetricsSummary> => {
  const userCondition: Prisma.JobWhereInput = userId ? { userId } : {};

  const [totalCount, wishlistCount, appliedCount, interviewingCount, offerCount, rejectedCount] =
    await Promise.all([
      prisma.job.count({ where: userCondition }),
      prisma.job.count({ where: { ...userCondition, status: 'Wishlist' } }),
      prisma.job.count({ where: { ...userCondition, status: 'Applied' } }),
      prisma.job.count({ where: { ...userCondition, status: 'Interviewing' } }),
      prisma.job.count({ where: { ...userCondition, status: 'Offer' } }),
      prisma.job.count({ where: { ...userCondition, status: 'Rejected' } }),
    ]);

  const activeCount = wishlistCount + appliedCount + interviewingCount;

  return {
    totalCount,
    wishlistCount,
    appliedCount,
    interviewingCount,
    offerCount,
    rejectedCount,
    activeCount,
  };
};

export const getAllKanbanJobs = async (userId?: string): Promise<JobRecord[]> => {
  const userCondition: Prisma.JobWhereInput = userId ? { userId } : {};

  const jobList = await prisma.job.findMany({
    where: userCondition,
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return jobList.map((jobItem) => ({
    ...jobItem,
    status: jobItem.status as JobStatus,
  }));
};

export const getPaginatedJobs = async (
  filterParams: JobFilterParams,
  userId?: string
): Promise<PaginatedResult<JobRecord>> => {
  const currentPage = Math.max(1, Number(filterParams.pageNumber) || 1);
  const pageSize = Math.max(1, Math.min(100, Number(filterParams.pageSize) || 8));
  const skipCount = (currentPage - 1) * pageSize;

  const whereClause: Prisma.JobWhereInput = userId ? { userId } : {};

  if (filterParams.searchQuery && filterParams.searchQuery.trim().length > 0) {
    const trimmedSearch = filterParams.searchQuery.trim();
    whereClause.OR = [
      { company: { contains: trimmedSearch } },
      { position: { contains: trimmedSearch } },
      { location: { contains: trimmedSearch } },
      { notes: { contains: trimmedSearch } },
    ];
  }

  if (filterParams.statusFilter && filterParams.statusFilter !== 'All') {
    whereClause.status = filterParams.statusFilter;
  }

  const sortColumn = filterParams.sortBy || 'applicationDate';
  const sortDirection = filterParams.sortOrder === 'asc' ? 'asc' : 'desc';

  const [totalItemCount, rawJobList] = await Promise.all([
    prisma.job.count({ where: whereClause }),
    prisma.job.findMany({
      where: whereClause,
      skip: skipCount,
      take: pageSize,
      orderBy: {
        [sortColumn]: sortDirection,
      },
    }),
  ]);

  const totalPageCount = Math.max(1, Math.ceil(totalItemCount / pageSize));
  const hasNextPage = currentPage < totalPageCount;
  const hasPreviousPage = currentPage > 1;

  const jobRecordList: JobRecord[] = rawJobList.map((jobItem) => ({
    ...jobItem,
    status: jobItem.status as JobStatus,
  }));

  return {
    itemList: jobRecordList,
    totalItemCount,
    currentPage,
    pageSize,
    totalPageCount,
    hasNextPage,
    hasPreviousPage,
  };
};

export const getJobById = async (jobId: string): Promise<JobRecord | null> => {
  const foundJob = await prisma.job.findUnique({
    where: { id: jobId },
  });

  if (!foundJob) {
    return null;
  }

  return {
    ...foundJob,
    status: foundJob.status as JobStatus,
  };
};
