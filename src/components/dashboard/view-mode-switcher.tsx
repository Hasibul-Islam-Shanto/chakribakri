'use client';

import * as React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Columns3, LayoutGrid, TableProperties } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ViewMode = 'kanban' | 'grid' | 'table';

export interface ViewModeSwitcherProps {
  currentView: ViewMode;
}

export const ViewModeSwitcher: React.FC<ViewModeSwitcherProps> = ({ currentView }) => {
  const router = useRouter();
  const currentPath = usePathname();
  const searchParams = useSearchParams();

  const handleSelectView = (targetView: ViewMode): void => {
    if (targetView === currentView) {
      return;
    }
    const updatedParams = new URLSearchParams(searchParams.toString());
    updatedParams.set('view', targetView);
    if (targetView !== 'kanban') {
      updatedParams.set('page', '1');
    }
    router.push(`${currentPath}?${updatedParams.toString()}`);
  };

  const viewOptions: { id: ViewMode; label: string; icon: React.ElementType }[] = [
    { id: 'kanban', label: 'Kanban', icon: Columns3 },
    { id: 'grid', label: 'Grid', icon: LayoutGrid },
    { id: 'table', label: 'List / Table', icon: TableProperties },
  ];

  return (
    <div className="flex items-center rounded-xl bg-zinc-100/80 dark:bg-zinc-800/60 p-1 border border-zinc-200/60 dark:border-white/5 backdrop-blur-md">
      {viewOptions.map((viewOption) => {
        const IconComponent = viewOption.icon;
        const isSelected = currentView === viewOption.id;

        return (
          <button
            key={viewOption.id}
            type="button"
            onClick={() => handleSelectView(viewOption.id)}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 select-none',
              isSelected
                ? 'bg-white text-zinc-950 shadow-sm shadow-zinc-900/10 dark:bg-zinc-900 dark:text-white dark:shadow-black/50 font-semibold scale-[1.02]'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/40'
            )}
          >
            <IconComponent className={cn('w-3.5 h-3.5', isSelected && 'text-indigo-500')} />
            <span>{viewOption.label}</span>
          </button>
        );
      })}
    </div>
  );
};
