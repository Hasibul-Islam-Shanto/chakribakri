'use client';

import * as React from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { JobRecord } from '@/types/job';
import { AlertTriangle } from 'lucide-react';

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobRecord: JobRecord | null;
  onConfirmDelete: (jobId: string) => Promise<void>;
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  jobRecord,
  onConfirmDelete,
  isDeleting = false,
}) => {
  if (!jobRecord) {
    return null;
  }

  const handleDelete = async (): Promise<void> => {
    await onConfirmDelete(jobRecord.id);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Job Application"
      description="This action cannot be undone. Please confirm you want to proceed."
      maxWidthClasses="max-w-md"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200/70 dark:bg-rose-950/30 dark:border-rose-900/50">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-900 dark:text-rose-200 leading-relaxed">
            Are you sure you want to delete the application for{' '}
            <strong className="font-semibold text-rose-950 dark:text-rose-100">
              {jobRecord.position}
            </strong>{' '}
            at{' '}
            <strong className="font-semibold text-rose-950 dark:text-rose-100">
              {jobRecord.company}
            </strong>
            ?
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Delete Application
          </Button>
        </div>
      </div>
    </Modal>
  );
};
