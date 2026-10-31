import * as React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = async ({ children }: DashboardLayoutProps) => {
  const currentSession = await getCurrentSession();

  if (!currentSession.isAuthenticated) {
    redirect('/login');
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground transition-colors selection:bg-indigo-500/20">
      {/* Ambient Radial Spotlight Glows */}
      <div className="ambient-glow-top" />
      <div className="ambient-glow-bottom" />

      {/* Persistent Background Grid */}
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none z-0 opacity-80" />

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">{children}</div>
    </div>
  );
};

export default DashboardLayout;
