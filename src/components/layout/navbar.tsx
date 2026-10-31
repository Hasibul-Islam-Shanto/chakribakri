'use client';

import * as React from 'react';
import { ViewMode, ViewModeSwitcher } from '@/components/dashboard/view-mode-switcher';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/ui/app-logo';
import { handleLogoutAction } from '@/actions/auth-actions';
import { LogOut, User } from 'lucide-react';

export interface NavbarProps {
  currentView?: ViewMode;
  username?: string;
  showViewSwitcher?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView = 'kanban',
  username = 'admin',
  showViewSwitcher = true,
}) => {
  const [isLoggingOut, setIsLoggingOut] = React.useState<boolean>(false);

  const handleLogout = async (): Promise<void> => {
    setIsLoggingOut(true);
    try {
      await handleLogoutAction();
    } catch {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-4 z-40 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="rounded-2xl border border-zinc-300/60 dark:border-white/10 bg-zinc-100/85 dark:bg-zinc-900/80 backdrop-blur-xl shadow-xl shadow-zinc-900/5 dark:shadow-black/50 px-4 sm:px-6 h-16 flex items-center justify-between gap-4 transition-all duration-200">
        {/* Animated Brand Logo with CB */}
        <AppLogo size="md" />

        {/* Floating View Switcher (Kanban, Grid, Table) */}
        {showViewSwitcher && (
          <div className="hidden md:block">
            <ViewModeSwitcher currentView={currentView} />
          </div>
        )}

        {/* Right side controls: User badge, Theme toggle, Logout */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100/90 dark:bg-zinc-800/80 border border-zinc-200/50 dark:border-zinc-700/50 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <User className="w-3.5 h-3.5 text-indigo-500" />
            <span>{username}</span>
          </div>

          <div className="border-l border-zinc-200 dark:border-zinc-800 h-5 mx-1 hidden sm:block" />

          <ThemeToggle />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            isLoading={isLoggingOut}
            aria-label="Log out of chakriBakri"
            className="text-xs text-zinc-600 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 hover:bg-rose-50/80 dark:hover:bg-rose-950/40 rounded-xl gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      {/* Mobile view switcher row */}
      {showViewSwitcher && (
        <div className="md:hidden mt-3 flex justify-center">
          <ViewModeSwitcher currentView={currentView} />
        </div>
      )}
    </header>
  );
};
