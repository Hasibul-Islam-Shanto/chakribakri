import * as React from 'react';
import { Metadata } from 'next';
import { VerifyEmailCard } from '@/components/verification/verify-email-card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { AppLogo } from '@/components/ui/app-logo';
import { getCurrentSession } from '@/lib/session';

export const metadata: Metadata = {
  title: 'Verify Your Email | chakriBakri',
  description: 'Enter your 6-digit verification code to access your job applications dashboard.',
};

export interface VerifyEmailPageProps {
  searchParams: {
    email?: string;
  };
}

const VerifyEmailPage: React.FC<VerifyEmailPageProps> = async ({ searchParams }) => {
  const currentSession = await getCurrentSession();
  const initialEmail = searchParams.email || currentSession.email || '';

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-background text-foreground p-4 sm:p-6 transition-colors overflow-hidden">
      {/* Background Grid Pattern & Ambient Radial Glows */}
      <div className="ambient-glow-top" />
      <div className="ambient-glow-bottom" />
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none z-0 opacity-80" />

      {/* Top Floating Bar */}
      <header className="relative z-10 flex items-center justify-between max-w-5xl mx-auto w-full py-2">
        <AppLogo size="md" />
        <ThemeToggle />
      </header>

      {/* Main Verification Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-12">
        <VerifyEmailCard initialEmail={initialEmail} />
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center text-xs text-zinc-400 dark:text-zinc-500 py-3">
        chakriBakri &copy; 2026 &bull; Personal Job Application Pipeline
      </footer>
    </div>
  );
};

export default VerifyEmailPage;
