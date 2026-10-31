'use client';

import * as React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { handleSignInAction, handleSignUpAction, AuthActionResult } from '@/actions/auth-actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { AppLogo } from '@/components/ui/app-logo';
import { ArrowRight, AlertCircle, UserPlus, LogIn, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

type AuthMode = 'sign-in' | 'sign-up';

const SubmitButton: React.FC<{ mode: AuthMode }> = ({ mode }) => {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      size="md"
      isLoading={pending}
      className="w-full mt-2 font-bold text-sm bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all rounded-xl h-10"
    >
      <span className="text-white font-bold">
        {mode === 'sign-in' ? 'Sign in' : 'Create account'}
      </span>
      {!pending && <ArrowRight className="w-4 h-4 ml-1.5 text-white" />}
    </Button>
  );
};

const LoginPage: React.FC = () => {
  const [authMode, setAuthMode] = React.useState<AuthMode>('sign-in');
  const [isPasswordVisible, setIsPasswordVisible] = React.useState<boolean>(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = React.useState<boolean>(false);

  const [signInState, signInAction] = useFormState<AuthActionResult | null, FormData>(
    handleSignInAction,
    null
  );

  const [signUpState, signUpAction] = useFormState<AuthActionResult | null, FormData>(
    handleSignUpAction,
    null
  );

  const currentFormState = authMode === 'sign-in' ? signInState : signUpState;
  const currentAction = authMode === 'sign-in' ? signInAction : signUpAction;

  const handleTogglePasswordVisibility = (): void => {
    setIsPasswordVisible((previousState) => !previousState);
  };

  const handleToggleConfirmPasswordVisibility = (): void => {
    setIsConfirmPasswordVisible((previousState) => !previousState);
  };

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

      {/* Main Auth Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md rounded-2xl border border-zinc-300/70 bg-zinc-100/90 dark:border-white/10 dark:bg-zinc-900/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-zinc-900/10 dark:shadow-black/70 animate-modal-pop">
          {/* Header & Logo */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <AppLogo size="lg" showSubtitle={false} />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white mt-1">
              {authMode === 'sign-in' ? 'Sign in' : 'Create an account'}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {authMode === 'sign-in'
                ? 'Sign in to access your job application pipeline'
                : 'Get started tracking your applications and interviews'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-zinc-100/90 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-white/5 mb-5">
            <button
              type="button"
              onClick={() => {
                setAuthMode('sign-in');
                setIsPasswordVisible(false);
                setIsConfirmPasswordVisible(false);
              }}
              className={cn(
                'flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all',
                authMode === 'sign-in'
                  ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-900 dark:text-white'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              )}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign in</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('sign-up');
                setIsPasswordVisible(false);
                setIsConfirmPasswordVisible(false);
              }}
              className={cn(
                'flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all',
                authMode === 'sign-up'
                  ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-900 dark:text-white'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              )}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create account</span>
            </button>
          </div>

          {/* Error Message */}
          {currentFormState?.hasError && (
            <div className="mb-4 flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                {currentFormState.errorMessage || 'Something went wrong. Please check your inputs.'}
              </span>
            </div>
          )}

          {/* Form */}
          <form action={currentAction} className="space-y-4">
            <Input
              label="Username"
              name="username"
              type="text"
              placeholder="e.g. alex"
              autoComplete="username"
              required
            />

            <Input
              label="Password"
              name="password"
              type={isPasswordVisible ? 'text' : 'password'}
              placeholder="••••••••••••"
              autoComplete={authMode === 'sign-in' ? 'current-password' : 'new-password'}
              required
              rightElement={
                <button
                  type="button"
                  onClick={handleTogglePasswordVisibility}
                  aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                  title={isPasswordVisible ? 'Hide password' : 'Show password'}
                  className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors focus:outline-none"
                >
                  {isPasswordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            {authMode === 'sign-up' && (
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type={isConfirmPasswordVisible ? 'text' : 'password'}
                placeholder="••••••••••••"
                autoComplete="new-password"
                required
                rightElement={
                  <button
                    type="button"
                    onClick={handleToggleConfirmPasswordVisibility}
                    aria-label={isConfirmPasswordVisible ? 'Hide password' : 'Show password'}
                    title={isConfirmPasswordVisible ? 'Hide password' : 'Show password'}
                    className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors focus:outline-none"
                  >
                    {isConfirmPasswordVisible ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
              />
            )}

            <SubmitButton mode={authMode} />
          </form>

          {/* Switch link */}
          <div className="mt-5 text-center text-xs text-zinc-500 dark:text-zinc-400">
            {authMode === 'sign-in' ? (
              <span>
                Don&apos;t have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('sign-up');
                    setIsPasswordVisible(false);
                    setIsConfirmPasswordVisible(false);
                  }}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Create one now
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('sign-in');
                    setIsPasswordVisible(false);
                    setIsConfirmPasswordVisible(false);
                  }}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Sign in here
                </button>
              </span>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center text-xs text-zinc-400 dark:text-zinc-500 py-3">
        chakriBakri &copy; 2026 &bull; Personal Job Application Pipeline
      </footer>
    </div>
  );
};

export default LoginPage;
