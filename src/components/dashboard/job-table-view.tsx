'use client';

import * as React from 'react';
import { JobRecord, JobStatus } from '@/types/job';
import { PaginatedResult } from '@/types/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { formatDateDisplay } from '@/lib/utils';
import { updateJobStatusAction } from '@/actions/job-actions';
import {
  ExternalLink,
  Edit2,
  Trash2,
  Inbox,
  Building2,
  MapPin,
  CircleDollarSign,
} from 'lucide-react';

export interface JobTableViewProps {
  paginatedData: PaginatedResult<JobRecord>;
  onEditJob: (jobRecord: JobRecord) => void;
  onDeleteJob: (jobRecord: JobRecord) => void;
  onOpenAddJobModal: () => void;
}

const statusOptions: JobStatus[] = ['Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

export const JobTableView: React.FC<JobTableViewProps> = ({
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
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-zinc-200/80 dark:border-white/10 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md">
        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-3">
          <Inbox className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          No applications found
        </h4>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
          No job applications match your current filters.
        </p>
        <button
          type="button"
          onClick={onOpenAddJobModal}
          className="mt-4 text-xs font-medium text-indigo-600 dark:text-indigo-400 underline underline-offset-4 hover:opacity-80 transition-opacity"
        >
          Add your first application
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-300/60 dark:border-white/10 bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200/70 dark:border-white/5 bg-zinc-50/80 dark:bg-zinc-900/90 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Role & Company</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Salary</th>
                <th className="py-3.5 px-4">Status Stage</th>
                <th className="py-3.5 px-4">Applied Date</th>
                <th className="py-3.5 px-4">Notes</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
              {paginatedData.itemList.map((jobItem) => (
                <tr
                  key={jobItem.id}
                  className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors group"
                >
                  {/* Company & Title */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-white/5 flex items-center justify-center shrink-0 text-indigo-500">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-zinc-900 dark:text-white truncate">
                          {jobItem.position}
                        </div>
                        <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 truncate">
                          {jobItem.company}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-300 font-medium">
                    {jobItem.location ? (
                      <div className="flex items-center gap-1.5 truncate max-w-[140px]">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="truncate">{jobItem.location}</span>
                      </div>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>

                  {/* Salary */}
                  <td className="py-3.5 px-4 text-zinc-700 dark:text-zinc-300">
                    {jobItem.salary ? (
                      <div className="flex items-center gap-1.5 font-semibold truncate max-w-[150px]">
                        <CircleDollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{jobItem.salary}</span>
                      </div>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3.5 px-4">
                    <div className="inline-flex items-center">
                      <select
                        value={jobItem.status}
                        onChange={(event) =>
                          handleStatusChange(jobItem.id, event.target.value as JobStatus)
                        }
                        className="text-xs bg-transparent border-0 cursor-pointer focus:ring-0 p-0 font-medium"
                      >
                        {statusOptions.map((statusOption) => (
                          <option
                            key={statusOption}
                            value={statusOption}
                            className="dark:bg-zinc-900"
                          >
                            {statusOption}
                          </option>
                        ))}
                      </select>
                      <StatusBadge
                        status={jobItem.status}
                        size="sm"
                        className="ml-2 pointer-events-none"
                      />
                    </div>
                  </td>

                  {/* Application Date */}
                  <td className="py-3.5 px-4 text-zinc-500 dark:text-zinc-400 whitespace-nowrap text-xs font-medium">
                    {formatDateDisplay(jobItem.applicationDate)}
                  </td>

                  {/* Notes */}
                  <td className="py-3.5 px-4 text-zinc-500 dark:text-zinc-400 max-w-[200px]">
                    <span className="line-clamp-1 text-xs">
                      {jobItem.notes || <span className="text-zinc-300 dark:text-zinc-600">—</span>}
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {jobItem.jobUrl && (
                        <a
                          href={jobItem.jobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open job link"
                          className="p-1.5 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => onEditJob(jobItem)}
                        title="Edit application"
                        className="p-1.5 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteJob(jobItem)}
                        title="Delete application"
                        className="p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
