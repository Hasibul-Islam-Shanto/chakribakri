'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ViewMode, ViewModeSwitcher } from '@/components/dashboard/view-mode-switcher';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/ui/app-logo';
import { handleLogoutAction } from '@/actions/auth-actions';
import { LogOut, User, LayoutDashboard, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = React.useState<boolean>(false);

  const isAnalyticsActive = pathname?.startsWith('/analytics') ?? false;
  const isDashboardActive =
    (pathname?.startsWith('/dashboard') || pathname === '/') && !isAnalyticsActive;

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
        <div className="flex items-center gap-6">
          <AppLogo size="md" />

          {/* Navigation Links: Dashboard vs Analytics */}
          <nav
            aria-label="Main Navigation"
            className="hidden lg:flex items-center gap-1.5 p-1 rounded-xl bg-zinc-200/50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-white/5"
          >
            <Link
              href="/dashboard"
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
                isDashboardActive
                  ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-900 dark:text-white'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              )}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Pipeline</span>
            </Link>

            <Link
              href="/analytics"
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
                isAnalyticsActive
                  ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-900 dark:text-white'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              )}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </Link>
          </nav>
        </div>

        {/* Floating View Switcher (Kanban, Grid, Table) */}
        {showViewSwitcher && (
          <div className="hidden md:block">
            <ViewModeSwitcher currentView={currentView} />
          </div>
        )}

        {/* Right side controls: User badge, Theme toggle, Logout */}
        <div className="flex items-center gap-2">
          {/* Mobile Navigation icons */}
          <div className="flex lg:hidden items-center gap-1 mr-1">
            <Link
              href="/dashboard"
              aria-label="Dashboard Pipeline"
              className={cn(
                'p-2 rounded-lg text-xs font-semibold transition-all',
                isDashboardActive
                  ? 'bg-zinc-200 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
              )}
            >
              <LayoutDashboard className="w-4 h-4" />
            </Link>
            <Link
              href="/analytics"
              aria-label="Analytics Dashboard"
              className={cn(
                'p-2 rounded-lg text-xs font-semibold transition-all',
                isAnalyticsActive
                  ? 'bg-zinc-200 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
              )}
            >
              <BarChart3 className="w-4 h-4" />
            </Link>
          </div>

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
