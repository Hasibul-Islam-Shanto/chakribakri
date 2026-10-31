import * as React from 'react';
import { Navbar } from '@/components/layout/navbar';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { MetricsBar } from '@/components/dashboard/metrics-bar';
import { DashboardContent } from '@/components/dashboard/dashboard-content';
import { ViewMode } from '@/components/dashboard/view-mode-switcher';
import { getJobMetricsSummary, getAllKanbanJobs, getPaginatedJobs } from '@/lib/job-service';
import { getCurrentSession } from '@/lib/session';
import { JobStatus } from '@/types/job';

export interface DashboardPageProps {
  searchParams: {
    view?: string;
    page?: string;
    q?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

export const revalidate = 0; // Ensure fresh data on every request

const DashboardPage = async ({ searchParams }: DashboardPageProps) => {
  const currentSession = await getCurrentSession();

  const rawViewParam = searchParams.view;
  const currentView: ViewMode =
    rawViewParam === 'grid' || rawViewParam === 'table' ? rawViewParam : 'kanban';

  const currentPage = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);
  const searchQuery = searchParams.q || '';
  const statusFilter = (searchParams.status as JobStatus | 'All') || 'All';
  const sortBy =
    (searchParams.sortBy as 'applicationDate' | 'company' | 'position' | 'status') ||
    'applicationDate';
  const sortOrder = (searchParams.sortOrder as 'asc' | 'desc') || 'desc';

  // Fetch metrics summary and jobs in parallel scoped to current user
  const [metricsSummary, kanbanJobList, paginatedJobs] = await Promise.all([
    getJobMetricsSummary(currentSession.userId),
    currentView === 'kanban' ? getAllKanbanJobs(currentSession.userId) : Promise.resolve([]),
    currentView !== 'kanban'
      ? getPaginatedJobs(
          {
            pageNumber: currentPage,
            pageSize: currentView === 'grid' ? 8 : 10,
            searchQuery,
            statusFilter,
            sortBy,
            sortOrder,
          },
          currentSession.userId
        )
      : Promise.resolve({
          itemList: [],
          totalItemCount: 0,
          currentPage: 1,
          pageSize: 10,
          totalPageCount: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        }),
  ]);

  return (
    <>
      <Navbar
        currentView={currentView}
        username={currentSession.username || 'admin'}
        showViewSwitcher={true}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 w-full flex-1">
        {/* Page Header */}
        <DashboardHeader
          username={currentSession.username || 'Friend'}
          activeCount={metricsSummary.activeCount}
        />

        {/* Top Summary Metrics */}
        <MetricsBar metricsSummary={metricsSummary} />

        {/* Dynamic Content Views */}
        <DashboardContent
          currentView={currentView}
          kanbanJobList={kanbanJobList}
          paginatedJobs={paginatedJobs}
        />
      </main>

      <footer className="border-t border-zinc-200/60 dark:border-white/5 py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
        chakriBakri &bull; Personal Job Application Pipeline &bull; SQLite &bull; Next.js App Router
      </footer>
    </>
  );
};

export default DashboardPage;
