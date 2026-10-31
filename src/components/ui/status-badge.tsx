'use client';

import * as React from 'react';
import { JobStatus } from '@/types/job';
import { cn, getStatusBadgeStyle } from '@/lib/utils';

export interface StatusBadgeProps {
  status: JobStatus;
  size?: 'sm' | 'md';
  className?: string;
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className,
  showDot = true,
}) => {
  const { badgeClasses, dotClasses } = getStatusBadgeStyle(status);

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5 font-medium',
    md: 'text-xs px-2.5 py-1 gap-2 font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border transition-colors select-none tracking-wide',
        sizeClasses[size],
        badgeClasses,
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            'rounded-full shrink-0',
            size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2',
            dotClasses
          )}
        />
      )}
      <span>{status}</span>
    </span>
  );
};
