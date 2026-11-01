'use client';

import * as React from 'react';
import { JobRecord, JobStatus } from '@/types/job';
import { KanbanBoard } from '@/components/dashboard/kanban-board';
import { JobTableView } from '@/components/dashboard/job-table-view';
import { Search, LayoutGrid, Table as TableIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PaginatedResult } from '@/types/pagination';

export type DashboardViewMode = 'kanban' | 'table';

export interface JobDashboardProps {
  initialJobList: JobRecord[];
  initialView?: DashboardViewMode;
  onEditJob?: (jobRecord: JobRecord) => void;
  onDeleteJob?: (jobRecord: JobRecord) => void;
  onOpenAddModal?: () => void;
}

export const JobDashboard: React.FC<JobDashboardProps> = ({
  initialJobList,
  initialView = 'kanban',
  onEditJob = () => {},
  onDeleteJob = () => {},
  onOpenAddModal = () => {},
}) => {
  const [activeViewMode, setActiveViewMode] = React.useState<DashboardViewMode>(initialView);
  const [searchFilterQuery, setSearchFilterQuery] = React.useState<string>('');

  const filteredJobList = React.useMemo(() => {
    const trimmedQuery = searchFilterQuery.trim().toLowerCase();
    if (!trimmedQuery) {
      return initialJobList;
    }

    return initialJobList.filter((jobRecord) => {
      const isCompanyMatched = jobRecord.company.toLowerCase().includes(trimmedQuery);
      const isPositionMatched = jobRecord.position.toLowerCase().includes(trimmedQuery);
      const isLocationMatched =
        Boolean(jobRecord.location) &&
        (jobRecord.location?.toLowerCase().includes(trimmedQuery) ?? false);

      return isCompanyMatched || isPositionMatched || isLocationMatched;
    });
  }, [initialJobList, searchFilterQuery]);

  const paginatedData: PaginatedResult<JobRecord> = React.useMemo(() => {
    return {
      itemList: filteredJobList,
      totalItemCount: filteredJobList.length,
      currentPage: 1,
      pageSize: Math.max(1, filteredJobList.length),
      totalPageCount: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }, [filteredJobList]);

  const handleClearSearch = (): void => {
    setSearchFilterQuery('');
  };

  return (
    <div className="space-y-6 w-full" data-testid="job-dashboard">
      {/* Search and View Mode Switcher Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            role="searchbox"
            aria-label="Search applications"
            placeholder="Search company, title, location..."
            value={searchFilterQuery}
            onChange={(event) => setSearchFilterQuery(event.target.value)}
            className="w-full h-10 pl-10 pr-9 text-xs rounded-xl border border-zinc-300/60 bg-zinc-100/80 dark:border-white/10 dark:bg-zinc-900/80 backdrop-blur-md text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm"
          />
          {searchFilterQuery.length > 0 && (
            <button
              type="button"
              onClick={handleClearSearch}
              aria-label="Clear search query"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center p-1 rounded-xl bg-zinc-100/90 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-white/5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveViewMode('kanban')}
            aria-label="Switch to Kanban view"
            aria-pressed={activeViewMode === 'kanban'}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
              activeViewMode === 'kanban'
                ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-900 dark:text-white'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Kanban</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveViewMode('table')}
            aria-label="Switch to Table view"
            aria-pressed={activeViewMode === 'table'}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
              activeViewMode === 'table'
                ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-900 dark:text-white'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            )}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* View Content */}
      {activeViewMode === 'kanban' && (
        <KanbanBoard
          initialJobList={filteredJobList}
          onEditJob={onEditJob}
          onDeleteJob={onDeleteJob}
          searchFilterQuery={searchFilterQuery}
        />
      )}

      {activeViewMode === 'table' && (
        <JobTableView
          paginatedData={paginatedData}
          onEditJob={onEditJob}
          onDeleteJob={onDeleteJob}
          onOpenAddJobModal={onOpenAddModal}
        />
      )}
    </div>
  );
};
