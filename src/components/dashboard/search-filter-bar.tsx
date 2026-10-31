'use client';

import * as React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, Plus, Filter, ArrowUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JobStatus } from '@/types/job';

export interface SearchFilterBarProps {
  onOpenAddJobModal: () => void;
  showFilters?: boolean;
}

const statusOptions: (JobStatus | 'All')[] = [
  'All',
  'Wishlist',
  'Applied',
  'Interviewing',
  'Offer',
  'Rejected',
];

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  onOpenAddJobModal,
  showFilters = true,
}) => {
  const router = useRouter();
  const currentPath = usePathname();
  const searchParams = useSearchParams();

  const activeSearch = searchParams.get('q') || '';
  const activeStatus = searchParams.get('status') || 'All';
  const activeSortBy = searchParams.get('sortBy') || 'applicationDate';
  const activeSortOrder = searchParams.get('sortOrder') || 'desc';

  const [searchInput, setSearchInput] = React.useState<string>(activeSearch);

  React.useEffect(() => {
    setSearchInput(activeSearch);
  }, [activeSearch]);

  const updateQueryParams = (updates: Record<string, string | null>): void => {
    const updatedParams = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'All') {
        updatedParams.delete(key);
      } else {
        updatedParams.set(key, value);
      }
    });
    updatedParams.set('page', '1');
    router.push(`${currentPath}?${updatedParams.toString()}`);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    updateQueryParams({ q: searchInput.trim() });
  };

  const handleStatusChange = (newStatus: string): void => {
    updateQueryParams({ status: newStatus });
  };

  const handleSortChange = (newSortBy: string): void => {
    updateQueryParams({ sortBy: newSortBy });
  };

  const handleToggleSortOrder = (): void => {
    const nextOrder = activeSortOrder === 'asc' ? 'desc' : 'asc';
    updateQueryParams({ sortOrder: nextOrder });
  };

  const handleClearFilters = (): void => {
    setSearchInput('');
    updateQueryParams({ q: null, status: null, sortBy: null, sortOrder: null });
  };

  const hasActiveFilters = Boolean(
    activeSearch || (activeStatus && activeStatus !== 'All') || activeSortBy !== 'applicationDate'
  );

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 mb-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
        {/* Search input form */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search company, title, location..."
            className="w-full h-10 pl-10 pr-8 text-xs rounded-xl border border-zinc-300/60 bg-zinc-100/80 dark:border-white/10 dark:bg-zinc-900/80 backdrop-blur-md text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 shadow-sm"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                updateQueryParams({ q: null });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {showFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status dropdown */}
            <div className="relative">
              <select
                value={activeStatus}
                onChange={(event) => handleStatusChange(event.target.value)}
                aria-label="Filter by application status"
                className="h-10 pl-3 pr-8 text-xs rounded-xl border border-zinc-300/60 bg-zinc-100/80 dark:border-white/10 dark:bg-zinc-900/80 backdrop-blur-md text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 appearance-none cursor-pointer transition-all duration-200 shadow-sm font-medium"
              >
                {statusOptions.map((statusOption) => (
                  <option key={statusOption} value={statusOption} className="dark:bg-zinc-900">
                    Status: {statusOption}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <select
                value={activeSortBy}
                onChange={(event) => handleSortChange(event.target.value)}
                aria-label="Sort applications by"
                className="h-10 pl-3 pr-8 text-xs rounded-xl border border-zinc-300/60 bg-zinc-100/80 dark:border-white/10 dark:bg-zinc-900/80 backdrop-blur-md text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 appearance-none cursor-pointer transition-all duration-200 shadow-sm font-medium"
              >
                <option value="applicationDate" className="dark:bg-zinc-900">
                  Sort: Date
                </option>
                <option value="company" className="dark:bg-zinc-900">
                  Sort: Company
                </option>
                <option value="position" className="dark:bg-zinc-900">
                  Sort: Position
                </option>
                <option value="status" className="dark:bg-zinc-900">
                  Sort: Status
                </option>
              </select>
            </div>

            {/* Sort order toggle button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleSortOrder}
              aria-label={`Sort ${activeSortOrder === 'asc' ? 'ascending' : 'descending'}`}
              title={`Sort ${activeSortOrder === 'asc' ? 'ascending' : 'descending'}`}
              className="h-10 px-3 text-xs text-zinc-600 dark:text-zinc-400 rounded-xl border-zinc-200/80 dark:border-white/10 dark:bg-zinc-900/80"
            >
              <ArrowUpDown className="w-3.5 h-3.5 mr-1 text-zinc-400" />
              {activeSortOrder.toUpperCase()}
            </Button>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-10 px-2.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-xl"
              >
                Clear
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add application button with glowing gradient */}
      <button
        type="button"
        onClick={onOpenAddJobModal}
        className="h-10 px-4 shrink-0 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 active:scale-95 transition-all duration-200"
      >
        <Plus className="w-4 h-4" />
        <span>Add Application</span>
      </button>
    </div>
  );
};
