'use client';

import * as React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { JobRecord, JobStatus } from '@/types/job';
import { DraggableJobCard } from '@/components/dashboard/draggable-job-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';

export interface KanbanColumnProps {
  status: JobStatus;
  jobList: JobRecord[];
  onEditJob: (jobRecord: JobRecord) => void;
  onDeleteJob: (jobRecord: JobRecord) => void;
  onStatusChange: (jobId: string, newStatus: JobStatus) => void;
}

const columnAccentMap: Record<JobStatus, { lineClass: string; badgeNumberClass: string }> = {
  Wishlist: {
    lineClass: 'bg-violet-500',
    badgeNumberClass: 'text-violet-600 bg-violet-100/80 dark:text-violet-300 dark:bg-violet-950/60',
  },
  Applied: {
    lineClass: 'bg-blue-500',
    badgeNumberClass: 'text-blue-600 bg-blue-100/80 dark:text-blue-300 dark:bg-blue-950/60',
  },
  Interviewing: {
    lineClass: 'bg-amber-500',
    badgeNumberClass: 'text-amber-600 bg-amber-100/80 dark:text-amber-300 dark:bg-amber-950/60',
  },
  Offer: {
    lineClass: 'bg-emerald-500',
    badgeNumberClass:
      'text-emerald-600 bg-emerald-100/80 dark:text-emerald-300 dark:bg-emerald-950/60',
  },
  Rejected: {
    lineClass: 'bg-rose-500',
    badgeNumberClass: 'text-rose-600 bg-rose-100/80 dark:text-rose-300 dark:bg-rose-950/60',
  },
};

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  jobList,
  onEditJob,
  onDeleteJob,
  onStatusChange,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      columnStatus: status,
    },
  });

  const accent = columnAccentMap[status];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col rounded-2xl bg-zinc-100/60 dark:bg-zinc-900/50 border border-zinc-300/50 dark:border-white/10 backdrop-blur-md p-3 min-w-[260px] xl:min-w-0 w-full flex-1 transition-all duration-200 shadow-sm overflow-hidden relative',
        isOver &&
          'ring-2 ring-indigo-500/70 border-indigo-500/70 bg-indigo-50/50 dark:bg-indigo-950/30'
      )}
    >
      {/* Top subtle status glow line */}
      <div className={cn('absolute top-0 left-0 right-0 h-[2px]', accent.lineClass)} />

      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 px-1 border-b border-zinc-100 dark:border-white/5 mb-3 pt-1">
        <StatusBadge status={status} size="sm" />
        <span
          className={cn(
            'text-[11px] font-bold px-2 py-0.5 rounded-full border border-black/5 dark:border-white/10',
            accent.badgeNumberClass
          )}
        >
          {jobList.length}
        </span>
      </div>

      {/* Cards container with smooth scroll */}
      <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-290px)] min-h-[140px] pr-0.5">
        {jobList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-zinc-200/80 dark:border-zinc-800/80 text-zinc-400 dark:text-zinc-500 bg-zinc-50/40 dark:bg-zinc-950/20">
            <span className="text-xs font-medium">Drop applications here</span>
          </div>
        ) : (
          jobList.map((jobItem) => (
            <DraggableJobCard
              key={jobItem.id}
              jobRecord={jobItem}
              onEdit={onEditJob}
              onDelete={onDeleteJob}
              onStatusChange={onStatusChange}
              isCompact={true}
            />
          ))
        )}
      </div>
    </div>
  );
};
