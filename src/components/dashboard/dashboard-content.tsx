'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { JobRecord, JobFormPayload } from '@/types/job';
import { PaginatedResult } from '@/types/pagination';
import { ViewMode } from '@/components/dashboard/view-mode-switcher';
import { SearchFilterBar } from '@/components/dashboard/search-filter-bar';
import { KanbanBoard } from '@/components/dashboard/kanban-board';
import { JobGridView } from '@/components/dashboard/job-grid-view';
import { JobTableView } from '@/components/dashboard/job-table-view';
import { JobFormModal } from '@/components/jobs/job-form-modal';
import { DeleteConfirmModal } from '@/components/jobs/delete-confirm-modal';
import { createJobAction, updateJobAction, deleteJobAction } from '@/actions/job-actions';

export interface DashboardContentProps {
  currentView: ViewMode;
  kanbanJobList: JobRecord[];
  paginatedJobs: PaginatedResult<JobRecord>;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
  currentView,
  kanbanJobList,
  paginatedJobs,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSearchQuery = searchParams.get('q') || '';

  const [isAddModalOpen, setIsAddModalOpen] = React.useState<boolean>(false);
  const [selectedJobForEdit, setSelectedJobForEdit] = React.useState<JobRecord | null>(null);
  const [selectedJobForDelete, setSelectedJobForDelete] = React.useState<JobRecord | null>(null);

  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false);

  const handleOpenAddModal = (): void => {
    setSelectedJobForEdit(null);
    setIsAddModalOpen(true);
  };

  const handleCloseFormModal = (): void => {
    setIsAddModalOpen(false);
    setSelectedJobForEdit(null);
  };

  const handleEditJob = (jobRecord: JobRecord): void => {
    setSelectedJobForEdit(jobRecord);
    setIsAddModalOpen(true);
  };

  const handleDeleteJobPrompt = (jobRecord: JobRecord): void => {
    setSelectedJobForDelete(jobRecord);
  };

  const handleCloseDeleteModal = (): void => {
    setSelectedJobForDelete(null);
  };

  const handleFormSubmit = async (
    formPayload: JobFormPayload,
    jobId?: string
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      if (jobId) {
        const updateResult = await updateJobAction(jobId, formPayload);
        if (updateResult.hasError) {
          alert(updateResult.errorMessage || 'Failed to update job application.');
          return false;
        }
      } else {
        const createResult = await createJobAction(formPayload);
        if (createResult.hasError) {
          alert(createResult.errorMessage || 'Failed to create job application.');
          return false;
        }
      }

      router.refresh();
      return true;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async (jobId: string): Promise<void> => {
    setIsDeleting(true);
    try {
      const deleteResult = await deleteJobAction(jobId);
      if (deleteResult.hasError) {
        alert(deleteResult.errorMessage || 'Failed to delete job application.');
        return;
      }
      setSelectedJobForDelete(null);
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* Filtering Bar with Search enabled on all views including Kanban */}
      <SearchFilterBar onOpenAddJobModal={handleOpenAddModal} showFilters={true} />

      {currentView === 'kanban' && (
        <KanbanBoard
          initialJobList={kanbanJobList}
          onEditJob={handleEditJob}
          onDeleteJob={handleDeleteJobPrompt}
          searchFilterQuery={activeSearchQuery}
        />
      )}

      {currentView === 'grid' && (
        <JobGridView
          paginatedData={paginatedJobs}
          onEditJob={handleEditJob}
          onDeleteJob={handleDeleteJobPrompt}
          onOpenAddJobModal={handleOpenAddModal}
        />
      )}

      {currentView === 'table' && (
        <JobTableView
          paginatedData={paginatedJobs}
          onEditJob={handleEditJob}
          onDeleteJob={handleDeleteJobPrompt}
          onOpenAddJobModal={handleOpenAddModal}
        />
      )}

      {/* Add / Edit Form Modal */}
      <JobFormModal
        isOpen={isAddModalOpen}
        onClose={handleCloseFormModal}
        initialJobRecord={selectedJobForEdit}
        onSubmitForm={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(selectedJobForDelete)}
        onClose={handleCloseDeleteModal}
        jobRecord={selectedJobForDelete}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};
