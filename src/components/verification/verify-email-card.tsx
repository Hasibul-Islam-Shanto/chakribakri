'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { verifyOtpCodeAction, resendVerificationCodeAction } from '@/actions/verification-actions';
import { OtpInput } from '@/components/otp-input';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/ui/app-logo';
import { Mail, ArrowRight, RefreshCw, AlertCircle, CheckCircle2, Lock } from 'lucide-react';

export interface VerifyEmailCardProps {
  initialEmail?: string;
  showDecorations?: boolean;
}

export const VerifyEmailCard: React.FC<VerifyEmailCardProps> = ({
  initialEmail = '',
  showDecorations = true,
}) => {
  const router = useRouter();

  const [emailInput, setEmailInput] = React.useState<string>(initialEmail);
  const [isEditingEmail, setIsEditingEmail] = React.useState<boolean>(initialEmail.length === 0);
  const [otpCodeInput, setOtpCodeInput] = React.useState<string>('');

  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [isResending, setIsResending] = React.useState<boolean>(false);

  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // 60-second cooldown timer for resend
  const [remainingCooldownSeconds, setRemainingCooldownSeconds] = React.useState<number>(0);

  const hasCooldownActive = remainingCooldownSeconds > 0;
  const canSubmitVerification =
    otpCodeInput.trim().length === 6 && emailInput.trim().length > 0 && !isSubmitting;

  React.useEffect(() => {
    if (!hasCooldownActive) {
      return;
    }

    const intervalTimer = setInterval(() => {
      setRemainingCooldownSeconds((previousSeconds) => {
        if (previousSeconds <= 1) {
          return 0;
        }
        return previousSeconds - 1;
      });
    }, 1000);

    return () => {
      clearInterval(intervalTimer);
    };
  }, [hasCooldownActive]);

  const handleVerifySubmit = async (event?: React.FormEvent<HTMLFormElement>): Promise<void> => {
    if (event) {
      event.preventDefault();
    }

    const normalizedEmail = emailInput.trim();
    const cleanOtp = otpCodeInput.trim();

    if (normalizedEmail.length === 0) {
      setErrorMessage('Please provide your email address.');
      return;
    }

    if (cleanOtp.length !== 6) {
      setErrorMessage('Please enter all 6 digits of your verification code.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const verificationResult = await verifyOtpCodeAction(normalizedEmail, cleanOtp);

      if (verificationResult.hasError) {
        setErrorMessage(verificationResult.errorMessage || 'Invalid verification code.');
      } else if (verificationResult.isSuccess) {
        setSuccessMessage('Email verified successfully! Redirecting...');
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 800);
      }
    } catch (submitError: unknown) {
      console.error('Failed to execute email verification action:', submitError);
      setErrorMessage('Failed to verify code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async (): Promise<void> => {
    const normalizedEmail = emailInput.trim();
    if (normalizedEmail.length === 0) {
      setErrorMessage('Please provide an email address to resend the code.');
      return;
    }

    if (hasCooldownActive || isResending) {
      return;
    }

    setIsResending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const resendResult = await resendVerificationCodeAction(normalizedEmail);

      if (resendResult.hasError) {
        setErrorMessage(resendResult.errorMessage || 'Failed to resend code. Please wait.');
        if (resendResult.cooldownSeconds) {
          setRemainingCooldownSeconds(resendResult.cooldownSeconds);
        }
      } else if (resendResult.isSuccess) {
        if (resendResult.devOtpCode) {
          setSuccessMessage(`New verification code sent! [Dev Code: ${resendResult.devOtpCode}]`);
        } else {
          setSuccessMessage('A new 6-digit code has been dispatched to your inbox.');
        }
        setRemainingCooldownSeconds(resendResult.cooldownSeconds || 60);
        setOtpCodeInput('');
      }
    } catch (resendError: unknown) {
      console.error('Failed to resend code action:', resendError);
      setErrorMessage('Failed to resend code. Please try again later.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-300/70 bg-zinc-100/90 dark:border-white/10 dark:bg-zinc-900/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-zinc-900/10 dark:shadow-black/70 animate-modal-pop">
      {/* Header with App Logo */}
      <div className="text-center mb-6">
        {showDecorations && (
          <div className="flex justify-center mb-3">
            <AppLogo size="lg" showSubtitle={false} />
          </div>
        )}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 mb-3 border border-indigo-500/20">
          <Mail className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Verify your email
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
          We sent a 6-digit verification code to your email. Enter it below to unlock your job
          application pipeline.
        </p>
      </div>

      {/* Target Email Badge & Switcher */}
      <div className="mb-6 p-3 rounded-xl bg-zinc-100/90 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-white/5">
        {isEditingEmail ? (
          <div className="space-y-2">
            <label
              htmlFor="verificationEmailField"
              className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300"
            >
              Target Email Address
            </label>
            <input
              id="verificationEmailField"
              type="email"
              value={emailInput}
              onChange={(event) => setEmailInput(event.target.value)}
              placeholder="e.g. dev@example.com"
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex justify-end gap-2 mt-1">
              <button
                type="button"
                onClick={() => setIsEditingEmail(false)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                {emailInput || 'No email provided'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingEmail(true)}
              className="text-xs font-medium text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ml-2 shrink-0"
            >
              Change
            </button>
          </div>
        )}
      </div>

      {/* Error state alert */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-5 flex items-center gap-2.5 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900 animate-fade-in"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success state alert */}
      {successMessage && (
        <div
          role="status"
          className="mb-5 flex items-center gap-2.5 p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 animate-fade-in"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* OTP Input Form */}
      <form onSubmit={handleVerifySubmit} className="space-y-6">
        <div>
          <label className="block text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-3">
            Enter 6-digit numeric code
          </label>
          <OtpInput
            digitCount={6}
            currentValue={otpCodeInput}
            onOtpChange={(newValue) => {
              setOtpCodeInput(newValue);
              if (errorMessage) {
                setErrorMessage(null);
              }
            }}
            hasError={Boolean(errorMessage)}
            isDisabled={isSubmitting}
            isAutoFocused={true}
          />
        </div>

        <Button
          type="submit"
          size="md"
          isLoading={isSubmitting}
          disabled={!canSubmitVerification}
          className="w-full font-bold text-sm bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all rounded-xl h-11 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Lock className="w-4 h-4 mr-2" />
          <span>Verify &amp; Continue</span>
          {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
      </form>

      {/* Resend Code Section with Cooldown Timer */}
      <div className="mt-6 pt-5 border-t border-zinc-200/60 dark:border-white/5 text-center">
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
          Didn&apos;t receive the code? Check spam or resend.
        </p>

        <button
          type="button"
          onClick={handleResendCode}
          disabled={hasCooldownActive || isResending}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 disabled:text-zinc-400 dark:disabled:text-zinc-600 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
          <span>
            {hasCooldownActive
              ? `Resend code in ${remainingCooldownSeconds}s`
              : isResending
                ? 'Sending code...'
                : 'Resend verification code'}
          </span>
        </button>
      </div>

      {/* Back to sign in */}
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          Back to sign in
        </button>
      </div>

      {/* Dev mode notice */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="mt-4 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            💡 Dev Mode: Check terminal logs for the OTP code, or click &quot;Resend verification
            code&quot;.
          </p>
        </div>
      )}
    </div>
  );
};
