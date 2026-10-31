'use client';

import * as React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { JobRecord, JobStatus } from '@/types/job';
import { JobCard } from '@/components/dashboard/job-card';
import { cn } from '@/lib/utils';

export interface DraggableJobCardProps {
  jobRecord: JobRecord;
  onEdit: (jobRecord: JobRecord) => void;
  onDelete: (jobRecord: JobRecord) => void;
  onStatusChange?: (jobId: string, newStatus: JobStatus) => void;
  isCompact?: boolean;
}

export const DraggableJobCard: React.FC<DraggableJobCardProps> = ({
  jobRecord,
  onEdit,
  onDelete,
  onStatusChange,
  isCompact = true,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: jobRecord.id,
    data: {
      jobRecord,
      status: jobRecord.status,
    },
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'touch-none transition-shadow',
        isDragging && 'opacity-30 scale-95 pointer-events-none'
      )}
      {...attributes}
      {...listeners}
    >
      <JobCard
        jobRecord={jobRecord}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
        isCompact={isCompact}
      />
    </div>
  );
};
