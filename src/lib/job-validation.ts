import { JobFormPayload, JobStatus } from '@/types/job';

export const VALID_JOB_STATUSES: readonly JobStatus[] = [
  'Wishlist',
  'Applied',
  'Interviewing',
  'Offer',
  'Rejected',
] as const;

export interface JobValidationErrorMap {
  company?: string;
  position?: string;
  status?: string;
  jobUrl?: string;
  applicationDate?: string;
}

export interface JobValidationResult {
  isValid: boolean;
  validationErrors: JobValidationErrorMap;
}

export const isValidJobStatus = (candidateStatus: unknown): candidateStatus is JobStatus => {
  if (typeof candidateStatus !== 'string') {
    return false;
  }
  return VALID_JOB_STATUSES.includes(candidateStatus as JobStatus);
};

export const isValidHttpUrl = (candidateUrl?: string | null): boolean => {
  if (!candidateUrl || candidateUrl.trim().length === 0) {
    return true; // Optional URL field is valid when omitted or empty
  }

  const trimmedUrl = candidateUrl.trim();
  try {
    const parsedUrl = new URL(trimmedUrl);
    const hasValidProtocol = parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    return hasValidProtocol && parsedUrl.hostname.length > 0;
  } catch {
    return false;
  }
};

export const isValidDateString = (candidateDateString?: string | null): boolean => {
  if (!candidateDateString || candidateDateString.trim().length === 0) {
    return true; // Optional date is valid when empty
  }

  const parsedDate = new Date(candidateDateString.trim());
  const isDateNumeric = !isNaN(parsedDate.getTime());
  return isDateNumeric;
};

export const validateJobPayload = (
  candidatePayload: Partial<JobFormPayload>
): JobValidationResult => {
  const validationErrors: JobValidationErrorMap = {};

  const trimmedCompany = candidatePayload.company?.trim() ?? '';
  if (trimmedCompany.length === 0) {
    validationErrors.company = 'Company name is required.';
  }

  const trimmedPosition = candidatePayload.position?.trim() ?? '';
  if (trimmedPosition.length === 0) {
    validationErrors.position = 'Position title is required.';
  }

  const candidateStatus = candidatePayload.status;
  if (!candidateStatus || !isValidJobStatus(candidateStatus)) {
    validationErrors.status = 'Status must be Wishlist, Applied, Interviewing, Offer, or Rejected.';
  }

  const isJobUrlFormatValid = isValidHttpUrl(candidatePayload.jobUrl);
  if (!isJobUrlFormatValid) {
    validationErrors.jobUrl = 'Job URL must be a valid HTTP or HTTPS web address.';
  }

  const isApplicationDateFormatValid = isValidDateString(candidatePayload.applicationDate);
  if (!isApplicationDateFormatValid) {
    validationErrors.applicationDate = 'Application date must be a valid date.';
  }

  const hasValidationErrors = Object.keys(validationErrors).length > 0;

  return {
    isValid: !hasValidationErrors,
    validationErrors,
  };
};
