'use client';

import * as React from 'react';
import { JobRecord, JobStatus } from '@/types/job';
import { PaginatedResult } from '@/types/pagination';
import { JobCard } from '@/components/dashboard/job-card';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { updateJobStatusAction } from '@/actions/job-actions';
import { Inbox } from 'lucide-react';

export interface JobGridViewProps {
  paginatedData: PaginatedResult<JobRecord>;
  onEditJob: (jobRecord: JobRecord) => void;
  onDeleteJob: (jobRecord: JobRecord) => void;
  onOpenAddJobModal: () => void;
}

export const JobGridView: React.FC<JobGridViewProps> = ({
  paginatedData,
  onEditJob,
  onDeleteJob,
  onOpenAddJobModal,
}) => {
  const handleStatusChange = async (jobId: string, newStatus: JobStatus): Promise<void> => {
    await updateJobStatusAction(jobId, newStatus);
  };

  if (paginatedData.itemList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50">
        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-3">
          <Inbox className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          No applications found
        </h4>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
          No job applications match your current filters. Try searching with different terms or add
          a new application.
        </p>
        <button
          type="button"
          onClick={onOpenAddJobModal}
          className="mt-4 text-xs font-medium text-zinc-900 dark:text-zinc-100 underline underline-offset-4 hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          Add your first application
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {paginatedData.itemList.map((jobItem) => (
          <JobCard
            key={jobItem.id}
            jobRecord={jobItem}
            onEdit={onEditJob}
            onDelete={onDeleteJob}
            onStatusChange={handleStatusChange}
            isCompact={false}
          />
        ))}
      </div>

      <PaginationControls
        currentPage={paginatedData.currentPage}
        totalPageCount={paginatedData.totalPageCount}
        pageSize={paginatedData.pageSize}
        totalItemCount={paginatedData.totalItemCount}
        hasNextPage={paginatedData.hasNextPage}
        hasPreviousPage={paginatedData.hasPreviousPage}
      />
    </div>
  );
};
