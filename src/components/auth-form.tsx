'use client';

import * as React from 'react';
import { handleSignInAction, handleSignUpAction, AuthActionResult } from '@/actions/auth-actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/ui/app-logo';
import { ArrowRight, AlertCircle, UserPlus, LogIn, Eye, EyeOff, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AuthMode = 'sign-in' | 'sign-up';

export interface AuthFormProps {
  onSignIn?: (formData: FormData) => Promise<AuthActionResult>;
  onSignUp?: (formData: FormData) => Promise<AuthActionResult>;
  initialMode?: AuthMode;
  initialFormState?: AuthActionResult | null;
  showDecorations?: boolean;
}

export interface ClientValidationErrors {
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  onSignIn,
  onSignUp,
  initialMode = 'sign-in',
  initialFormState = null,
  showDecorations = true,
}) => {
  const [authMode, setAuthMode] = React.useState<AuthMode>(initialMode);
  const [isPasswordVisible, setIsPasswordVisible] = React.useState<boolean>(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = React.useState<boolean>(false);

  const [emailInput, setEmailInput] = React.useState<string>('');
  const [usernameInput, setUsernameInput] = React.useState<string>('');
  const [passwordInput, setPasswordInput] = React.useState<string>('');
  const [confirmPasswordInput, setConfirmPasswordInput] = React.useState<string>('');

  const [clientErrors, setClientErrors] = React.useState<ClientValidationErrors>({});
  const [serverActionResult, setServerActionResult] = React.useState<AuthActionResult | null>(
    initialFormState
  );
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  // Rate limiting countdown state
  const [isRateLimited, setIsRateLimited] = React.useState<boolean>(false);
  const [remainingRetrySeconds, setRemainingRetrySeconds] = React.useState<number>(0);

  // Extract retry seconds from error message if rate limited
  const parseRateLimitWaitSeconds = (errorMessage?: string): number => {
    if (!errorMessage) {
      return 0;
    }
    const minuteMatch = errorMessage.match(/(\d+)\s*minute/i);
    if (minuteMatch) {
      return parseInt(minuteMatch[1], 10) * 60;
    }
    const secondMatch = errorMessage.match(/(\d+)\s*second/i);
    if (secondMatch) {
      return parseInt(secondMatch[1], 10);
    }
    const hasRateLimitKeywords =
      errorMessage.toLowerCase().includes('too many') ||
      errorMessage.toLowerCase().includes('rate limit');
    return hasRateLimitKeywords ? 60 : 0;
  };

  const checkAndApplyRateLimit = React.useCallback((result: AuthActionResult | null): void => {
    if (result?.hasError && result.errorMessage) {
      const parsedSeconds = parseRateLimitWaitSeconds(result.errorMessage);
      if (parsedSeconds > 0) {
        setIsRateLimited(true);
        setRemainingRetrySeconds(parsedSeconds);
      }
    }
  }, []);

  React.useEffect(() => {
    if (initialFormState) {
      setServerActionResult(initialFormState);
      checkAndApplyRateLimit(initialFormState);
    }
  }, [initialFormState, checkAndApplyRateLimit]);

  // Countdown timer when rate limited
  React.useEffect(() => {
    if (!isRateLimited || remainingRetrySeconds <= 0) {
      if (isRateLimited && remainingRetrySeconds <= 0) {
        setIsRateLimited(false);
      }
      return;
    }

    const timerInterval = setInterval(() => {
      setRemainingRetrySeconds((previousSeconds) => {
        if (previousSeconds <= 1) {
          setIsRateLimited(false);
          return 0;
        }
        return previousSeconds - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerInterval);
    };
  }, [isRateLimited, remainingRetrySeconds]);

  const handleTogglePasswordVisibility = (): void => {
    setIsPasswordVisible((previousState) => !previousState);
  };

  const handleToggleConfirmPasswordVisibility = (): void => {
    setIsConfirmPasswordVisible((previousState) => !previousState);
  };

  const handleSwitchMode = (targetMode: AuthMode): void => {
    setAuthMode(targetMode);
    setIsPasswordVisible(false);
    setIsConfirmPasswordVisible(false);
    setClientErrors({});
    setServerActionResult(null);
  };

  const validateClientInputs = (): boolean => {
    const detectedErrors: ClientValidationErrors = {};

    const trimmedUsername = usernameInput.trim();
    const trimmedEmail = emailInput.trim();

    if (authMode === 'sign-up') {
      if (trimmedEmail.length > 0) {
        const isEmailFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
        if (!isEmailFormatValid) {
          detectedErrors.email = 'Please enter a valid email address.';
        }
      } else if (trimmedUsername.length === 0) {
        detectedErrors.email = 'Email address is required.';
      }
    }

    if (trimmedUsername.length === 0) {
      if (authMode === 'sign-in') {
        detectedErrors.username = 'Username is required.';
      } else if (trimmedEmail.length === 0) {
        detectedErrors.username = 'Username is required.';
      }
    } else if (authMode === 'sign-up' && trimmedUsername.length < 3) {
      detectedErrors.username = 'Username must be at least 3 characters long.';
    }

    if (passwordInput.length === 0) {
      detectedErrors.password = 'Password is required.';
    } else if (authMode === 'sign-up' && passwordInput.length < 6) {
      detectedErrors.password = 'Password must be at least 6 characters long.';
    }

    if (authMode === 'sign-up' && passwordInput !== confirmPasswordInput) {
      detectedErrors.confirmPassword = 'Passwords do not match.';
    }

    setClientErrors(detectedErrors);
    const hasDetectedErrors = Object.keys(detectedErrors).length > 0;
    return !hasDetectedErrors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (isRateLimited) {
      return;
    }

    const isClientValid = validateClientInputs();
    if (!isClientValid) {
      return;
    }

    setIsSubmitting(true);
    setServerActionResult(null);

    const trimmedUsername = usernameInput.trim();
    const trimmedEmail = emailInput.trim();
    const effectiveEmail =
      trimmedEmail ||
      (trimmedUsername.includes('@') ? trimmedUsername : `${trimmedUsername}@example.com`);
    const effectiveUsername = trimmedUsername || (trimmedEmail ? trimmedEmail.split('@')[0] : '');

    const submissionFormData = new FormData();
    submissionFormData.append('email', effectiveEmail);
    submissionFormData.append('username', effectiveUsername);
    submissionFormData.append('password', passwordInput);
    if (authMode === 'sign-up') {
      submissionFormData.append('confirmPassword', confirmPasswordInput);
    }

    try {
      let actionResult: AuthActionResult;
      if (authMode === 'sign-in') {
        actionResult = onSignIn
          ? await onSignIn(submissionFormData)
          : await handleSignInAction(null, submissionFormData);
      } else {
        actionResult = onSignUp
          ? await onSignUp(submissionFormData)
          : await handleSignUpAction(null, submissionFormData);
      }

      setServerActionResult(actionResult);
      checkAndApplyRateLimit(actionResult);
    } catch (submissionError: unknown) {
      // In Next.js, redirect() throws an error that should propagate
      const errorString = String(submissionError);
      if (errorString.includes('NEXT_REDIRECT')) {
        throw submissionError;
      }
      console.error('Auth submission error:', submissionError);
      let errorMessage =
        submissionError instanceof Error
          ? submissionError.message
          : 'An unexpected error occurred. Please try again.';
      if (
        errorMessage.includes('Server Components render') ||
        errorMessage.includes('digest property')
      ) {
        errorMessage =
          'A server error occurred during account creation. Please verify database connectivity or check server logs.';
      }
      setServerActionResult({
        hasError: true,
        errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCountdownDisplay = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-300/70 bg-zinc-100/90 dark:border-white/10 dark:bg-zinc-900/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-zinc-900/10 dark:shadow-black/70 animate-modal-pop">
      {/* Header & Logo */}
      <div className="text-center mb-6">
        {showDecorations && (
          <div className="flex justify-center mb-3">
            <AppLogo size="lg" showSubtitle={false} />
          </div>
        )}
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
          onClick={() => handleSwitchMode('sign-in')}
          aria-label="Switch to sign in"
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
          onClick={() => handleSwitchMode('sign-up')}
          aria-label="Switch to create account"
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

      {/* Server Rate Limit Error Banner with Countdown */}
      {isRateLimited && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-4 flex items-center gap-2 p-3 text-xs text-amber-900 bg-amber-50 border border-amber-300 rounded-xl dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800"
        >
          <Clock className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 animate-pulse" />
          <div>
            <span className="font-semibold">Too many attempts.</span> Submission throttled. Retry in{' '}
            <span className="font-bold">{formatCountdownDisplay(remainingRetrySeconds)}</span>.
          </div>
        </div>
      )}

      {/* General Server Error Message (when not rate-limited) */}
      {!isRateLimited && serverActionResult?.hasError && (
        <div
          role="alert"
          className="mb-4 flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            {serverActionResult.errorMessage || 'Something went wrong. Please check your inputs.'}
          </span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email Field on Sign Up */}
        {authMode === 'sign-up' && (
          <div>
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="e.g. alex@example.com"
              autoComplete="email"
              value={emailInput}
              onChange={(event) => {
                setEmailInput(event.target.value);
                if (clientErrors.email) {
                  setClientErrors((prevErrors) => ({ ...prevErrors, email: undefined }));
                }
              }}
              hasError={Boolean(clientErrors.email)}
              helperText={clientErrors.email}
              disabled={isSubmitting || isRateLimited}
              required
            />
          </div>
        )}

        <div>
          <Input
            label={authMode === 'sign-in' ? 'Username or Email' : 'Username'}
            name="username"
            type="text"
            placeholder={authMode === 'sign-in' ? 'e.g. alex or alex@example.com' : 'e.g. alex'}
            autoComplete="username"
            value={usernameInput}
            onChange={(event) => {
              setUsernameInput(event.target.value);
              if (clientErrors.username) {
                setClientErrors((prevErrors) => ({ ...prevErrors, username: undefined }));
              }
            }}
            hasError={Boolean(clientErrors.username)}
            helperText={clientErrors.username}
            disabled={isSubmitting || isRateLimited}
            required
          />
        </div>

        <div>
          <Input
            label="Password"
            name="password"
            type={isPasswordVisible ? 'text' : 'password'}
            placeholder="••••••••••••"
            autoComplete={authMode === 'sign-in' ? 'current-password' : 'new-password'}
            value={passwordInput}
            onChange={(event) => {
              setPasswordInput(event.target.value);
              if (clientErrors.password) {
                setClientErrors((prevErrors) => ({ ...prevErrors, password: undefined }));
              }
            }}
            hasError={Boolean(clientErrors.password)}
            helperText={clientErrors.password}
            disabled={isSubmitting || isRateLimited}
            required
            rightElement={
              <button
                type="button"
                onClick={handleTogglePasswordVisibility}
                aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                title={isPasswordVisible ? 'Hide password' : 'Show password'}
                disabled={isSubmitting || isRateLimited}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors focus:outline-none"
              >
                {isPasswordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
        </div>

        {authMode === 'sign-up' && (
          <div>
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type={isConfirmPasswordVisible ? 'text' : 'password'}
              placeholder="••••••••••••"
              autoComplete="new-password"
              value={confirmPasswordInput}
              onChange={(event) => {
                setConfirmPasswordInput(event.target.value);
                if (clientErrors.confirmPassword) {
                  setClientErrors((prevErrors) => ({
                    ...prevErrors,
                    confirmPassword: undefined,
                  }));
                }
              }}
              hasError={Boolean(clientErrors.confirmPassword)}
              helperText={clientErrors.confirmPassword}
              disabled={isSubmitting || isRateLimited}
              required
              rightElement={
                <button
                  type="button"
                  onClick={handleToggleConfirmPasswordVisibility}
                  aria-label={isConfirmPasswordVisible ? 'Hide password' : 'Show password'}
                  title={isConfirmPasswordVisible ? 'Hide password' : 'Show password'}
                  disabled={isSubmitting || isRateLimited}
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
          </div>
        )}

        <Button
          type="submit"
          size="md"
          isLoading={isSubmitting}
          disabled={isSubmitting || isRateLimited}
          aria-disabled={isSubmitting || isRateLimited}
          className="w-full mt-2 font-bold text-sm bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all rounded-xl h-10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-white font-bold">
            {authMode === 'sign-in' ? 'Sign in' : 'Create account'}
          </span>
          {!isSubmitting && <ArrowRight className="w-4 h-4 ml-1.5 text-white" />}
        </Button>
      </form>

      {/* Switch link */}
      <div className="mt-5 text-center text-xs text-zinc-500 dark:text-zinc-400">
        {authMode === 'sign-in' ? (
          <span>
            Don&apos;t have an account yet?{' '}
            <button
              type="button"
              onClick={() => handleSwitchMode('sign-up')}
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
              onClick={() => handleSwitchMode('sign-in')}
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Sign in here
            </button>
          </span>
        )}
      </div>
    </div>
  );
};
