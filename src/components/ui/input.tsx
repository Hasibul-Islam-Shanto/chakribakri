'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  label?: string;
  helperText?: string;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      hasError = false,
      label,
      helperText,
      rightElement,
      id,
      ...restProps
    },
    ref
  ) => {
    const inputIdentifier = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputIdentifier}
            className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
          >
            {label}
          </label>
        )}
        <div className="relative w-full">
          <input
            id={inputIdentifier}
            type={type}
            ref={ref}
            className={cn(
              'flex h-10 w-full rounded-xl border bg-zinc-100/90 px-3 py-2 text-sm transition-colors',
              'border-zinc-300/70 text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500',
              'dark:border-white/10 dark:bg-zinc-900/90 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:ring-indigo-500/50',
              rightElement && 'pr-10',
              hasError && 'border-rose-500 focus:ring-rose-500 dark:border-rose-600',
              className
            )}
            {...restProps}
          />
          {rightElement && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
              {rightElement}
            </div>
          )}
        </div>
        {helperText && (
          <p
            className={cn(
              'text-xs text-zinc-500 dark:text-zinc-400',
              hasError && 'text-rose-600 dark:text-rose-400'
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
  label?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError = false, label, helperText, id, rows = 3, ...restProps }, ref) => {
    const textareaIdentifier = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={textareaIdentifier}
            className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaIdentifier}
          rows={rows}
          ref={ref}
          className={cn(
            'flex w-full rounded-xl border bg-zinc-100/90 px-3 py-2 text-sm transition-colors',
            'border-zinc-300/70 text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500',
            'dark:border-white/10 dark:bg-zinc-900/90 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:ring-indigo-500/50',
            hasError && 'border-rose-500 focus:ring-rose-500 dark:border-rose-600',
            className
          )}
          {...restProps}
        />
        {helperText && (
          <p
            className={cn(
              'text-xs text-zinc-500 dark:text-zinc-400',
              hasError && 'text-rose-600 dark:text-rose-400'
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
