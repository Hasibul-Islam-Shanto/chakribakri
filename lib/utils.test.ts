import { describe, it, expect } from 'vitest';
import { formatDateDisplay, formatDateInput, getStatusBadgeStyle, cn } from '@/lib/utils';
import { JobStatus } from '@/types/job';

describe('Core Utility Functions (lib/utils.ts)', () => {
  describe('cn (Tailwind class merging)', () => {
    it('concatenates and resolves conflicting class names accurately', () => {
      const mergedClasses = cn('px-4 py-2', 'bg-blue-500', 'bg-red-500');
      expect(mergedClasses).toBe('px-4 py-2 bg-red-500');

      const conditionalClasses = cn('font-bold', false && 'hidden', true && 'text-sm');
      expect(conditionalClasses).toBe('font-bold text-sm');
    });
  });

  describe('formatDateDisplay', () => {
    it('formats valid Date instances and ISO strings into readable US date format', () => {
      const sampleDateObject = new Date('2026-03-25T12:00:00.000Z');
      const formattedDateString = formatDateDisplay(sampleDateObject);
      expect(formattedDateString).toContain('2026');
      expect(formattedDateString).toContain('Mar');

      const formattedIsoString = formatDateDisplay('2026-11-05T00:00:00.000Z');
      expect(formattedIsoString).toContain('2026');
      expect(formattedIsoString).toContain('Nov');
    });

    it('returns "N/A" for null, undefined, or invalid date values', () => {
      expect(formatDateDisplay(null)).toBe('N/A');
      expect(formatDateDisplay(undefined)).toBe('N/A');
      expect(formatDateDisplay('invalid-date-string')).toBe('N/A');
    });
  });

  describe('formatDateInput', () => {
    it('formats dates into YYYY-MM-DD format for HTML date inputs', () => {
      const targetDate = new Date('2026-08-15T00:00:00.000Z');
      const formattedInputDate = formatDateInput(targetDate);
      expect(formattedInputDate).toBe('2026-08-15');

      const formattedStringInput = formatDateInput('2026-12-01T00:00:00.000Z');
      expect(formattedStringInput).toBe('2026-12-01');
    });

    it("returns today's date formatted as YYYY-MM-DD for missing or invalid inputs", () => {
      const todayIsoDatePrefix = new Date().toISOString().split('T')[0];

      expect(formatDateInput(null)).toBe(todayIsoDatePrefix);
      expect(formatDateInput(undefined)).toBe(todayIsoDatePrefix);
      expect(formatDateInput('invalid-date-string')).toBe(todayIsoDatePrefix);
    });
  });

  describe('getStatusBadgeStyle', () => {
    it('returns distinct style classes and dot indicators for all JobStatus values', () => {
      const statusList: JobStatus[] = ['Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

      statusList.forEach((statusItem) => {
        const badgeStyle = getStatusBadgeStyle(statusItem);
        expect(badgeStyle).toHaveProperty('badgeClasses');
        expect(badgeStyle).toHaveProperty('dotClasses');
        expect(badgeStyle.badgeClasses.length).toBeGreaterThan(0);
        expect(badgeStyle.dotClasses.length).toBeGreaterThan(0);
      });

      // Specific color checks
      expect(getStatusBadgeStyle('Wishlist').badgeClasses).toContain('violet');
      expect(getStatusBadgeStyle('Applied').badgeClasses).toContain('blue');
      expect(getStatusBadgeStyle('Interviewing').badgeClasses).toContain('amber');
      expect(getStatusBadgeStyle('Offer').badgeClasses).toContain('emerald');
      expect(getStatusBadgeStyle('Rejected').badgeClasses).toContain('rose');
    });

    it('returns default fallback style when given an unrecognized status', () => {
      // @ts-expect-error Intentionally invalid status for fallback testing
      const fallbackBadgeStyle = getStatusBadgeStyle('Unrecognized');
      expect(fallbackBadgeStyle.badgeClasses).toContain('zinc');
      expect(fallbackBadgeStyle.dotClasses).toContain('bg-zinc-400');
    });
  });
});
