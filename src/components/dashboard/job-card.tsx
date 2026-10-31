'use client';

import * as React from 'react';
import { JobRecord, JobStatus } from '@/types/job';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatDateDisplay } from '@/lib/utils';
import {
  Building2,
  MapPin,
  CircleDollarSign,
  Calendar,
  ExternalLink,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

export interface JobCardProps {
  jobRecord: JobRecord;
  onEdit: (jobRecord: JobRecord) => void;
  onDelete: (jobRecord: JobRecord) => void;
  onStatusChange?: (jobId: string, newStatus: JobStatus) => void;
  isCompact?: boolean;
}

const statusWorkflow: JobStatus[] = ['Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

export const JobCard: React.FC<JobCardProps> = ({
  jobRecord,
  onEdit,
  onDelete,
  onStatusChange,
  isCompact = false,
}) => {
  const currentStatusIndex = statusWorkflow.indexOf(jobRecord.status);
  const canMoveBackward = currentStatusIndex > 0 && Boolean(onStatusChange);
  const canMoveForward = currentStatusIndex < statusWorkflow.length - 1 && Boolean(onStatusChange);

  const handleAdvanceStatus = (event: React.MouseEvent): void => {
    event.stopPropagation();
    if (canMoveForward && onStatusChange) {
      const nextStatus = statusWorkflow[currentStatusIndex + 1];
      onStatusChange(jobRecord.id, nextStatus);
    }
  };

  const handleRegressStatus = (event: React.MouseEvent): void => {
    event.stopPropagation();
    if (canMoveBackward && onStatusChange) {
      const previousStatus = statusWorkflow[currentStatusIndex - 1];
      onStatusChange(jobRecord.id, previousStatus);
    }
  };

  return (
    <div className="group relative rounded-2xl border border-zinc-300/60 bg-zinc-100/90 dark:border-white/10 dark:bg-zinc-900/85 backdrop-blur-md p-4 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 hover:border-zinc-400/70 dark:hover:border-white/20 transition-all duration-200 flex flex-col justify-between overflow-hidden">
      {/* Subtle top card glow line on hover */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/0 to-transparent group-hover:via-indigo-500/50 transition-all duration-300" />

      <div>
        {/* Top Header: Company & Status Badge */}
        <div className="flex items-start justify-between gap-2.5 mb-2.5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate">
              <Building2 className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
              <span className="truncate">{jobRecord.company}</span>
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight mt-1 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {jobRecord.position}
            </h3>
          </div>
          <StatusBadge status={jobRecord.status} size="sm" />
        </div>

        {/* Metadata pills: location, salary, date */}
        <div className="space-y-1.5 my-3 text-xs text-zinc-600 dark:text-zinc-300 font-medium">
          {jobRecord.location && (
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-400 dark:text-zinc-500" />
              <span className="truncate">{jobRecord.location}</span>
            </div>
          )}

          {jobRecord.salary && (
            <div className="flex items-center gap-1.5 truncate">
              <CircleDollarSign className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
              <span className="truncate font-semibold text-zinc-800 dark:text-zinc-200">
                {jobRecord.salary}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 text-[11px]">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>Applied {formatDateDisplay(jobRecord.applicationDate)}</span>
          </div>
        </div>

        {/* Notes preview if not compact */}
        {!isCompact && jobRecord.notes && (
          <p className="mt-2.5 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50/80 dark:bg-zinc-800/40 p-2.5 rounded-xl border border-zinc-100 dark:border-white/5 line-clamp-2">
            {jobRecord.notes}
          </p>
        )}
      </div>

      {/* Card Footer: Quick status advance and Actions */}
      <div className="mt-3.5 pt-3 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {canMoveBackward && (
            <button
              type="button"
              onClick={handleRegressStatus}
              title={`Move back to ${statusWorkflow[currentStatusIndex - 1]}`}
              aria-label={`Move back to ${statusWorkflow[currentStatusIndex - 1]}`}
              className="p-1 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {canMoveForward && (
            <button
              type="button"
              onClick={handleAdvanceStatus}
              title={`Advance to ${statusWorkflow[currentStatusIndex + 1]}`}
              aria-label={`Advance to ${statusWorkflow[currentStatusIndex + 1]}`}
              className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 transition-colors"
            >
              <span>{statusWorkflow[currentStatusIndex + 1]}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 ml-auto">
          {jobRecord.jobUrl && (
            <a
              href={jobRecord.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open job link"
              aria-label="Open job link"
              className="p-1.5 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            type="button"
            onClick={() => onEdit(jobRecord)}
            title="Edit application"
            aria-label="Edit application"
            className="p-1.5 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(jobRecord)}
            title="Delete application"
            aria-label="Delete application"
            className="p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
