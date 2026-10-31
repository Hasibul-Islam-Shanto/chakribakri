'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  ...restProps
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none rounded-lg';

  const variantClasses = {
    primary:
      'bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-950 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 shadow-sm',
    secondary:
      'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700/80 focus-visible:ring-zinc-400',
    outline:
      'border border-zinc-200 bg-transparent text-zinc-900 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-800 focus-visible:ring-zinc-400',
    ghost:
      'bg-transparent text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 focus-visible:ring-zinc-400',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 focus-visible:ring-rose-500 shadow-sm',
  };

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-9 px-4 text-sm gap-2',
    lg: 'h-11 px-6 text-base gap-2.5',
    icon: 'h-9 w-9 p-0',
  };

  return (
    <button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      disabled={disabled || isLoading}
      {...restProps}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          {size !== 'icon' && <span>{children}</span>}
        </>
      ) : (
        children
      )}
    </button>
  );
};
