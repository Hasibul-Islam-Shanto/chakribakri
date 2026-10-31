'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidthClasses?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidthClasses = 'max-w-lg',
}) => {
  const [hasMounted, setHasMounted] = React.useState<boolean>(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!hasMounted || !isOpen) {
    return null;
  }

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>): void => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md transition-opacity duration-200"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={cn(
          'w-full rounded-2xl border border-zinc-300/70 bg-zinc-50/95 dark:border-white/10 dark:bg-zinc-900/95 backdrop-blur-xl p-6 shadow-2xl shadow-black/30 dark:shadow-black/70 transition-all',
          'animate-modal-pop',
          maxWidthClasses
        )}
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-white/5">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white rounded-xl -mr-2 -mt-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>,
    document.body
  );
};
