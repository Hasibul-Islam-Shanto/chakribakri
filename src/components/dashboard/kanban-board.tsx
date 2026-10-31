'use client';

import * as React from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { JobRecord, JobStatus } from '@/types/job';
import { KanbanColumn } from '@/components/dashboard/kanban-column';
import { JobCard } from '@/components/dashboard/job-card';
import { updateJobStatusAction } from '@/actions/job-actions';

export interface KanbanBoardProps {
  initialJobList: JobRecord[];
  onEditJob: (jobRecord: JobRecord) => void;
  onDeleteJob: (jobRecord: JobRecord) => void;
  searchFilterQuery?: string;
}

const kanbanColumns: JobStatus[] = ['Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  initialJobList,
  onEditJob,
  onDeleteJob,
  searchFilterQuery = '',
}) => {
  const [currentJobList, setCurrentJobList] = React.useState<JobRecord[]>(initialJobList);
  const [activeDraggedJob, setActiveDraggedJob] = React.useState<JobRecord | null>(null);

  React.useEffect(() => {
    setCurrentJobList(initialJobList);
  }, [initialJobList]);

  // Configure pointer sensor with activation constraint so clicks on buttons don't trigger drag
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  });

  const sensors = useSensors(pointerSensor);

  const handleStatusChange = async (jobId: string, newStatus: JobStatus): Promise<void> => {
    // Optimistic UI update
    setCurrentJobList((prevList) =>
      prevList.map((job) => (job.id === jobId ? { ...job, status: newStatus } : job))
    );

    const result = await updateJobStatusAction(jobId, newStatus);
    if (result.hasError) {
      setCurrentJobList(initialJobList);
    }
  };

  const handleDragStart = (event: DragStartEvent): void => {
    const draggedJobId = String(event.active.id);
    const foundJob = currentJobList.find((job) => job.id === draggedJobId) || null;
    setActiveDraggedJob(foundJob);
  };

  const handleDragEnd = async (event: DragEndEvent): Promise<void> => {
    const { active, over } = event;
    setActiveDraggedJob(null);

    if (!over) {
      return;
    }

    const draggedJobId = String(active.id);
    const overTargetId = String(over.id);

    // Over target can be a column status (e.g., 'Applied') or another job card
    let targetStatus: JobStatus | null = null;

    if (kanbanColumns.includes(overTargetId as JobStatus)) {
      targetStatus = overTargetId as JobStatus;
    } else {
      // It was dropped over another job card, find that card's status
      const targetJob = currentJobList.find((job) => job.id === overTargetId);
      if (targetJob) {
        targetStatus = targetJob.status;
      }
    }

    if (!targetStatus) {
      return;
    }

    const currentJob = currentJobList.find((job) => job.id === draggedJobId);
    if (!currentJob || currentJob.status === targetStatus) {
      return;
    }

    await handleStatusChange(draggedJobId, targetStatus);
  };

  // Filter jobs based on active searchFilterQuery
  const filteredJobList = React.useMemo(() => {
    if (!searchFilterQuery.trim()) {
      return currentJobList;
    }
    const query = searchFilterQuery.toLowerCase();
    return currentJobList.filter(
      (job) =>
        job.company.toLowerCase().includes(query) ||
        job.position.toLowerCase().includes(query) ||
        (job.location && job.location.toLowerCase().includes(query)) ||
        (job.notes && job.notes.toLowerCase().includes(query))
    );
  }, [currentJobList, searchFilterQuery]);

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex xl:grid xl:grid-cols-5 gap-3.5 overflow-x-auto xl:overflow-x-visible pb-6 pt-1 items-start scroll-smooth">
        {kanbanColumns.map((columnStatus) => {
          const columnJobs = filteredJobList.filter((job) => job.status === columnStatus);
          return (
            <KanbanColumn
              key={columnStatus}
              status={columnStatus}
              jobList={columnJobs}
              onEditJob={onEditJob}
              onDeleteJob={onDeleteJob}
              onStatusChange={handleStatusChange}
            />
          );
        })}
      </div>

      {/* Floating Drag Overlay */}
      <DragOverlay dropAnimation={null}>
        {activeDraggedJob ? (
          <div className="opacity-95 rotate-2 scale-105 shadow-2xl shadow-indigo-500/30 rounded-2xl ring-2 ring-indigo-500 pointer-events-none cursor-grabbing">
            <JobCard
              jobRecord={activeDraggedJob}
              onEdit={() => {}}
              onDelete={() => {}}
              isCompact={true}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
