'use client';

import * as React from 'react';
import { Modal } from '@/components/ui/modal';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { JobRecord, JobFormPayload, JobStatus } from '@/types/job';
import { formatDateInput } from '@/lib/utils';

export interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialJobRecord?: JobRecord | null;
  onSubmitForm: (payload: JobFormPayload, jobId?: string) => Promise<boolean>;
  isSubmitting?: boolean;
}

const statusOptions: JobStatus[] = ['Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

export const JobFormModal: React.FC<JobFormModalProps> = ({
  isOpen,
  onClose,
  initialJobRecord,
  onSubmitForm,
  isSubmitting = false,
}) => {
  const isEditMode = Boolean(initialJobRecord);

  const [company, setCompany] = React.useState<string>('');
  const [position, setPosition] = React.useState<string>('');
  const [location, setLocation] = React.useState<string>('');
  const [salary, setSalary] = React.useState<string>('');
  const [status, setStatus] = React.useState<JobStatus>('Wishlist');
  const [applicationDate, setApplicationDate] = React.useState<string>(formatDateInput(new Date()));
  const [jobUrl, setJobUrl] = React.useState<string>('');
  const [notes, setNotes] = React.useState<string>('');

  const [validationErrors, setValidationErrors] = React.useState<{
    company?: string;
    position?: string;
  }>({});

  React.useEffect(() => {
    if (initialJobRecord) {
      setCompany(initialJobRecord.company);
      setPosition(initialJobRecord.position);
      setLocation(initialJobRecord.location || '');
      setSalary(initialJobRecord.salary || '');
      setStatus(initialJobRecord.status);
      setApplicationDate(formatDateInput(initialJobRecord.applicationDate));
      setJobUrl(initialJobRecord.jobUrl || '');
      setNotes(initialJobRecord.notes || '');
    } else {
      setCompany('');
      setPosition('');
      setLocation('');
      setSalary('');
      setStatus('Wishlist');
      setApplicationDate(formatDateInput(new Date()));
      setJobUrl('');
      setNotes('');
    }
    setValidationErrors({});
  }, [initialJobRecord, isOpen]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const errors: { company?: string; position?: string } = {};
    if (!company.trim()) {
      errors.company = 'Company name is required';
    }
    if (!position.trim()) {
      errors.position = 'Position title is required';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const payload: JobFormPayload = {
      company: company.trim(),
      position: position.trim(),
      location: location.trim() || undefined,
      salary: salary.trim() || undefined,
      status,
      applicationDate,
      jobUrl: jobUrl.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    const isSuccess = await onSubmitForm(payload, initialJobRecord?.id);
    if (isSuccess) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Job Application' : 'Add New Job Application'}
      description={
        isEditMode
          ? 'Update the details and current stage of this application.'
          : 'Track a new application or job opportunity you are targeting.'
      }
      maxWidthClasses="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Company *"
            placeholder="e.g. Stripe, Linear, Vercel"
            value={company}
            onChange={(event) => {
              setCompany(event.target.value);
              if (validationErrors.company) {
                setValidationErrors((prev) => ({ ...prev, company: undefined }));
              }
            }}
            hasError={Boolean(validationErrors.company)}
            helperText={validationErrors.company}
            disabled={isSubmitting}
            required
          />

          <Input
            label="Position *"
            placeholder="e.g. Senior Software Engineer"
            value={position}
            onChange={(event) => {
              setPosition(event.target.value);
              if (validationErrors.position) {
                setValidationErrors((prev) => ({ ...prev, position: undefined }));
              }
            }}
            hasError={Boolean(validationErrors.position)}
            helperText={validationErrors.position}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Location"
            placeholder="e.g. Remote, San Francisco, CA"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            disabled={isSubmitting}
          />

          <Input
            label="Salary / Compensation"
            placeholder="e.g. $160k - $190k + Equity"
            value={salary}
            onChange={(event) => setSalary(event.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="w-full space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Stage / Status
            </label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as JobStatus)}
              disabled={isSubmitting}
              className="flex h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-400"
            >
              {statusOptions.map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {statusOption}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Application Date"
            type="date"
            value={applicationDate}
            onChange={(event) => setApplicationDate(event.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <Input
          label="Job URL"
          type="url"
          placeholder="https://company.com/careers/role"
          value={jobUrl}
          onChange={(event) => setJobUrl(event.target.value)}
          disabled={isSubmitting}
        />

        <Textarea
          label="Notes & Interview Context"
          placeholder="Recruiter contacts, interview rounds, prep notes, next steps..."
          rows={3}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          disabled={isSubmitting}
        />

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            {isEditMode ? 'Save Changes' : 'Create Application'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
