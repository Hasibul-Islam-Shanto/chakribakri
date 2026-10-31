import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { JobStatus } from '@/types/job';

export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs));
};

export const formatDateDisplay = (dateValue: Date | string | null | undefined): string => {
  if (!dateValue) {
    return 'N/A';
  }
  const dateObject = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
  if (isNaN(dateObject.getTime())) {
    return 'N/A';
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(dateObject);
};

export const formatDateInput = (dateValue: Date | string | null | undefined): string => {
  if (!dateValue) {
    return new Date().toISOString().split('T')[0];
  }
  const dateObject = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
  if (isNaN(dateObject.getTime())) {
    return new Date().toISOString().split('T')[0];
  }
  return dateObject.toISOString().split('T')[0];
};

export const getStatusBadgeStyle = (
  status: JobStatus
): { badgeClasses: string; dotClasses: string } => {
  switch (status) {
    case 'Wishlist':
      return {
        badgeClasses:
          'bg-violet-50/90 text-violet-700 border-violet-200/80 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-700/60 shadow-sm',
        dotClasses: 'bg-violet-500 dark:bg-violet-400',
      };
    case 'Applied':
      return {
        badgeClasses:
          'bg-blue-50/90 text-blue-700 border-blue-200/80 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700/60 shadow-sm',
        dotClasses: 'bg-blue-500 dark:bg-blue-400',
      };
    case 'Interviewing':
      return {
        badgeClasses:
          'bg-amber-50/90 text-amber-700 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700/60 shadow-sm',
        dotClasses: 'bg-amber-500 dark:bg-amber-400 animate-pulse',
      };
    case 'Offer':
      return {
        badgeClasses:
          'bg-emerald-50/90 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/60 shadow-sm',
        dotClasses: 'bg-emerald-500 dark:bg-emerald-400',
      };
    case 'Rejected':
      return {
        badgeClasses:
          'bg-rose-50/90 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700/60 shadow-sm',
        dotClasses: 'bg-rose-500 dark:bg-rose-400',
      };
    default:
      return {
        badgeClasses:
          'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
        dotClasses: 'bg-zinc-400',
      };
  }
};
