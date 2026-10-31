'use client';

import * as React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface PaginationControlsProps {
  currentPage: number;
  totalPageCount: number;
  pageSize: number;
  totalItemCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPageCount,
  pageSize,
  totalItemCount,
  hasNextPage,
  hasPreviousPage,
}) => {
  const router = useRouter();
  const currentPath = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (targetPage: number): void => {
    if (targetPage < 1 || targetPage > totalPageCount || targetPage === currentPage) {
      return;
    }
    const updatedParams = new URLSearchParams(searchParams.toString());
    updatedParams.set('page', targetPage.toString());
    router.push(`${currentPath}?${updatedParams.toString()}`);
  };

  if (totalItemCount === 0) {
    return null;
  }

  const startRecordNumber = (currentPage - 1) * pageSize + 1;
  const endRecordNumber = Math.min(currentPage * pageSize, totalItemCount);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t border-zinc-100 dark:border-zinc-800">
      <div className="text-xs text-zinc-500 dark:text-zinc-400">
        Showing{' '}
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{startRecordNumber}</span>{' '}
        to <span className="font-semibold text-zinc-900 dark:text-zinc-100">{endRecordNumber}</span>{' '}
        of <span className="font-semibold text-zinc-900 dark:text-zinc-100">{totalItemCount}</span>{' '}
        applications
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(1)}
          disabled={!hasPreviousPage}
          aria-label="First page"
          title="First page"
          className="h-8 w-8"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!hasPreviousPage}
          aria-label="Previous page"
          title="Previous page"
          className="h-8 w-8"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <span className="px-3 text-xs font-medium text-zinc-700 dark:text-zinc-300">
          Page {currentPage} of {totalPageCount}
        </span>

        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!hasNextPage}
          aria-label="Next page"
          title="Next page"
          className="h-8 w-8"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(totalPageCount)}
          disabled={!hasNextPage}
          aria-label="Last page"
          title="Last page"
          className="h-8 w-8"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
