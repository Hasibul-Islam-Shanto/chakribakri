import { describe, it, expect } from 'vitest';
import {
  validateJobPayload,
  isValidJobStatus,
  isValidHttpUrl,
  isValidDateString,
  VALID_JOB_STATUSES,
} from './job-validation';
import { JobFormPayload } from '@/types/job';

describe('Job Input Validation Schemas & Utilities (lib/job-validation.ts)', () => {
  it('validates a complete, correctly-formed job payload successfully', () => {
    const validJobPayload: JobFormPayload = {
      company: 'Acme Systems',
      position: 'Senior Fullstack Engineer',
      location: 'San Francisco, CA',
      salary: '$160,000 - $185,000',
      status: 'Interviewing',
      applicationDate: '2026-05-15',
      jobUrl: 'https://careers.acmesystems.com/jobs/123',
      notes: 'Passed initial screening interview with technical recruiter.',
    };

    const validationResult = validateJobPayload(validJobPayload);

    expect(validationResult.isValid).toBe(true);
    expect(validationResult.validationErrors).toEqual({});
  });

  it('rejects payloads missing mandatory company name or containing only whitespace', () => {
    const payloadWithEmptyCompany: Partial<JobFormPayload> = {
      company: '   ',
      position: 'Software Engineer',
      status: 'Applied',
    };

    const validationResult = validateJobPayload(payloadWithEmptyCompany);

    expect(validationResult.isValid).toBe(false);
    expect(validationResult.validationErrors.company).toBe('Company name is required.');
  });

  it('rejects payloads missing mandatory position title or containing only whitespace', () => {
    const payloadWithEmptyPosition: Partial<JobFormPayload> = {
      company: 'Linear',
      position: '   ',
      status: 'Applied',
    };

    const validationResult = validateJobPayload(payloadWithEmptyPosition);

    expect(validationResult.isValid).toBe(false);
    expect(validationResult.validationErrors.position).toBe('Position title is required.');
  });

  it('verifies valid status enums and flags unrecognized statuses', () => {
    VALID_JOB_STATUSES.forEach((validStatus) => {
      expect(isValidJobStatus(validStatus)).toBe(true);
    });

    expect(isValidJobStatus('UnderReview')).toBe(false);
    expect(isValidJobStatus('Pending')).toBe(false);
    expect(isValidJobStatus(null)).toBe(false);
    expect(isValidJobStatus(undefined)).toBe(false);
    expect(isValidJobStatus(12345)).toBe(false);

    const payloadWithInvalidStatus: Partial<JobFormPayload> = {
      company: 'Stripe',
      position: 'Backend Developer',
      // @ts-expect-error Intentionally invalid status for validation testing
      status: 'UnknownStatus',
    };

    const validationResult = validateJobPayload(payloadWithInvalidStatus);
    expect(validationResult.isValid).toBe(false);
    expect(validationResult.validationErrors.status).toBe(
      'Status must be Wishlist, Applied, Interviewing, Offer, or Rejected.'
    );
  });

  it('validates optional URL formats, allowing empty/omitted URLs while flagging invalid protocols', () => {
    expect(isValidHttpUrl(undefined)).toBe(true);
    expect(isValidHttpUrl('')).toBe(true);
    expect(isValidHttpUrl('   ')).toBe(true);
    expect(isValidHttpUrl('https://example.com/job/456')).toBe(true);
    expect(isValidHttpUrl('http://localhost:3000')).toBe(true);

    expect(isValidHttpUrl('ftp://ftp.example.com')).toBe(false);
    expect(isValidHttpUrl('not-a-valid-url')).toBe(false);
    expect(isValidHttpUrl('javascript:alert(1)')).toBe(false);

    const payloadWithInvalidUrl: Partial<JobFormPayload> = {
      company: 'GitHub',
      position: 'Staff Engineer',
      status: 'Applied',
      jobUrl: 'invalid-url-schema',
    };

    const validationResult = validateJobPayload(payloadWithInvalidUrl);
    expect(validationResult.isValid).toBe(false);
    expect(validationResult.validationErrors.jobUrl).toBe(
      'Job URL must be a valid HTTP or HTTPS web address.'
    );
  });

  it('validates optional application date strings, flagging invalid date formats', () => {
    expect(isValidDateString(undefined)).toBe(true);
    expect(isValidDateString('')).toBe(true);
    expect(isValidDateString('2026-10-31')).toBe(true);
    expect(isValidDateString('2026-02-14T10:00:00.000Z')).toBe(true);

    expect(isValidDateString('invalid-date-string')).toBe(false);

    const payloadWithInvalidDate: Partial<JobFormPayload> = {
      company: 'Figma',
      position: 'Product Designer',
      status: 'Wishlist',
      applicationDate: 'not-a-date',
    };

    const validationResult = validateJobPayload(payloadWithInvalidDate);
    expect(validationResult.isValid).toBe(false);
    expect(validationResult.validationErrors.applicationDate).toBe(
      'Application date must be a valid date.'
    );
  });
});

