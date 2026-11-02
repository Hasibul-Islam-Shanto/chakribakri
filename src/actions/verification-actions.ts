'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/session';
import { sendVerificationEmail, generateSecureOtpCode } from '@/lib/email-service';
import { VerificationActionResult, ResendCodeActionResult } from '@/types/verification';

const MAXIMUM_ALLOWED_ATTEMPTS = 5;
const TOKEN_EXPIRATION_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;

export const verifyOtpCodeAction = async (
  submittedEmail: string,
  submittedOtpCode: string
): Promise<VerificationActionResult> => {
  const normalizedEmail = submittedEmail.trim().toLowerCase();
  const sanitizedOtpCode = submittedOtpCode.trim();

  if (!normalizedEmail || normalizedEmail.length === 0) {
    return {
      isSuccess: false,
      hasError: true,
      errorMessage: 'Email address is required for verification.',
    };
  }

  if (!sanitizedOtpCode || sanitizedOtpCode.length !== 6 || !/^\d{6}$/.test(sanitizedOtpCode)) {
    return {
      isSuccess: false,
      hasError: true,
      errorMessage: 'Verification code must be exactly 6 digits.',
    };
  }

  try {
    const targetUserRecord = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!targetUserRecord) {
      return {
        isSuccess: false,
        hasError: true,
        errorMessage: 'User account not found with this email address.',
      };
    }

    if (targetUserRecord.isVerified) {
      // User is already verified, update session and return
      const currentSession = await getCurrentSession();
      currentSession.isAuthenticated = true;
      currentSession.isEmailVerified = true;
      currentSession.userId = targetUserRecord.id;
      currentSession.email = targetUserRecord.email;
      if (targetUserRecord.username) {
        currentSession.username = targetUserRecord.username;
      }
      await currentSession.save();

      return {
        isSuccess: true,
        hasError: false,
        isVerified: true,
      };
    }

    // Retrieve the most recent token for this email
    const verificationTokenRecord = await prisma.verificationToken.findFirst({
      where: { email: normalizedEmail },
      orderBy: { createdAt: 'desc' },
    });

    if (!verificationTokenRecord) {
      return {
        isSuccess: false,
        hasError: true,
        errorMessage: 'No active verification code found. Please request a new one.',
      };
    }

    // Check if token has expired
    const currentTimestamp = Date.now();
    const tokenExpirationMillis =
      verificationTokenRecord.expiresAt instanceof Date
        ? verificationTokenRecord.expiresAt.getTime()
        : new Date(verificationTokenRecord.expiresAt).getTime();
    const hasExpired = currentTimestamp > tokenExpirationMillis;
    if (hasExpired) {
      return {
        isSuccess: false,
        hasError: true,
        errorMessage: 'Verification code has expired. Please request a new code.',
      };
    }

    // Check if attempts exceeded
    const isAttemptsExceeded = verificationTokenRecord.attemptsCount >= MAXIMUM_ALLOWED_ATTEMPTS;
    if (isAttemptsExceeded) {
      return {
        isSuccess: false,
        hasError: true,
        errorMessage: 'Too many failed attempts. Please request a new verification code.',
      };
    }

    // Compare OTP code hash
    const isCodeValid = await bcrypt.compare(sanitizedOtpCode, verificationTokenRecord.codeHash);

    if (!isCodeValid) {
      const updatedAttemptsCount = verificationTokenRecord.attemptsCount + 1;
      await prisma.verificationToken.update({
        where: { id: verificationTokenRecord.id },
        data: { attemptsCount: updatedAttemptsCount },
      });

      const remainingAttempts = Math.max(0, MAXIMUM_ALLOWED_ATTEMPTS - updatedAttemptsCount);

      if (remainingAttempts === 0) {
        return {
          isSuccess: false,
          hasError: true,
          errorMessage: 'Too many failed attempts. Please request a new verification code.',
        };
      }

      return {
        isSuccess: false,
        hasError: true,
        errorMessage: `Invalid verification code. ${remainingAttempts} attempt${
          remainingAttempts === 1 ? '' : 's'
        } remaining.`,
      };
    }

    // OTP is valid! Mark user as verified
    await prisma.user.update({
      where: { id: targetUserRecord.id },
      data: { isVerified: true },
    });

    // Delete all verification tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { email: normalizedEmail },
    });

    // Upgrade active user session to fully verified
    const activeSession = await getCurrentSession();
    activeSession.isAuthenticated = true;
    activeSession.isEmailVerified = true;
    activeSession.userId = targetUserRecord.id;
    activeSession.email = targetUserRecord.email;
    if (targetUserRecord.username) {
      activeSession.username = targetUserRecord.username;
    }
    await activeSession.save();

    return {
      isSuccess: true,
      hasError: false,
      isVerified: true,
    };
  } catch (verificationError: unknown) {
    console.error('Email verification error:', verificationError);
    const errorMessage =
      verificationError instanceof Error
        ? verificationError.message
        : 'An unexpected error occurred during verification. Please try again.';
    return {
      isSuccess: false,
      hasError: true,
      errorMessage,
    };
  }
};

export const resendVerificationCodeAction = async (
  targetEmail: string
): Promise<ResendCodeActionResult> => {
  const normalizedEmail = targetEmail.trim().toLowerCase();

  if (!normalizedEmail || normalizedEmail.length === 0) {
    return {
      isSuccess: false,
      hasError: true,
      errorMessage: 'Email address is required.',
    };
  }

  try {
    const existingUserRecord = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!existingUserRecord) {
      return {
        isSuccess: false,
        hasError: true,
        errorMessage: 'No account found with this email address.',
      };
    }

    if (existingUserRecord.isVerified) {
      return {
        isSuccess: true,
        hasError: false,
        errorMessage: 'Email is already verified. You can proceed to the dashboard.',
      };
    }

    // Check cooldown based on the most recent token creation time
    const latestTokenRecord = await prisma.verificationToken.findFirst({
      where: { email: normalizedEmail },
      orderBy: { createdAt: 'desc' },
    });

    if (latestTokenRecord && latestTokenRecord.createdAt) {
      const createdAtDate =
        latestTokenRecord.createdAt instanceof Date
          ? latestTokenRecord.createdAt
          : new Date(latestTokenRecord.createdAt);
      const createdAtMillis = createdAtDate.getTime();

      if (!isNaN(createdAtMillis)) {
        const elapsedMilliseconds = Date.now() - createdAtMillis;
        const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);

        if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
          const remainingCooldownSeconds = RESEND_COOLDOWN_SECONDS - elapsedSeconds;
          return {
            isSuccess: false,
            hasError: true,
            errorMessage: `Please wait ${remainingCooldownSeconds} second${
              remainingCooldownSeconds === 1 ? '' : 's'
            } before requesting a new code.`,
            cooldownSeconds: remainingCooldownSeconds,
          };
        }
      }
    }

    // Generate new 6-digit OTP and hash it
    const plainOtpCode = await generateSecureOtpCode();
    const sanitizedOtpCode = String(plainOtpCode);
    const hashedOtpCode = await bcrypt.hash(sanitizedOtpCode, 10);
    const expirationTimestamp = new Date(Date.now() + TOKEN_EXPIRATION_MINUTES * 60 * 1000);

    // Delete older tokens for this email to avoid clutter
    await prisma.verificationToken.deleteMany({
      where: { email: normalizedEmail },
    });

    // Save new verification token
    await prisma.verificationToken.create({
      data: {
        userId: existingUserRecord.id,
        email: normalizedEmail,
        codeHash: hashedOtpCode,
        attemptsCount: 0,
        expiresAt: expirationTimestamp,
      },
    });

    // Send plain OTP code via email service
    await sendVerificationEmail(normalizedEmail, sanitizedOtpCode);

    const isDevelopment = process.env.NODE_ENV !== 'production';

    return {
      isSuccess: true,
      hasError: false,
      cooldownSeconds: RESEND_COOLDOWN_SECONDS,
      devOtpCode: isDevelopment ? sanitizedOtpCode : undefined,
    };
  } catch (resendError: unknown) {
    console.error('Failed to resend verification code:', resendError);
    const errorMessage =
      resendError instanceof Error
        ? resendError.message
        : 'Failed to send new verification code. Please try again.';
    return {
      isSuccess: false,
      hasError: true,
      errorMessage,
    };
  }
};

export const verifyOtpCode = verifyOtpCodeAction;
export const resendVerificationCode = resendVerificationCodeAction;
