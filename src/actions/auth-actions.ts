'use server';

import bcrypt from 'bcryptjs';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import {
  checkRateLimit,
  getClientIpAddress,
  isRateLimitingEnabled,
  RateLimitConfig,
} from '@/lib/rate-limiter';

export interface AuthActionResult {
  hasError: boolean;
  errorMessage?: string;
  isSuccess?: boolean;
}

const AUTH_RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 15 * 60 * 1000,
};

const getClientIpAddressFromHeaders = (): string => {
  try {
    const requestHeaders = headers();
    return getClientIpAddress(requestHeaders);
  } catch (headersError: unknown) {
    return '127.0.0.1';
  }
};

const checkAuthRateLimit = (
  clientIpAddress: string,
  scope: 'signin' | 'signup' = 'signin'
): AuthActionResult | null => {
  if (!isRateLimitingEnabled()) {
    return null;
  }

  const rateLimitResult = checkRateLimit(
    `auth:${scope}:${clientIpAddress}`,
    AUTH_RATE_LIMIT_CONFIG
  );

  if (!rateLimitResult.isAllowed) {
    const remainingMilliseconds = Math.max(0, rateLimitResult.resetTimestamp - Date.now());
    const remainingMinutes = Math.max(1, Math.ceil(remainingMilliseconds / (60 * 1000)));

    return {
      hasError: true,
      errorMessage: `Too many attempts. Please try again in ${remainingMinutes} minutes.`,
    };
  }

  return null;
};

export const handleSignInAction = async (
  previousState: AuthActionResult | null,
  loginFormData: FormData
): Promise<AuthActionResult> => {
  const clientIpAddress = getClientIpAddressFromHeaders();
  const rateLimitError = checkAuthRateLimit(clientIpAddress, 'signin');
  if (rateLimitError) {
    return rateLimitError;
  }

  const rawIdentifier =
    loginFormData.get('email')?.toString().trim().toLowerCase() ||
    loginFormData.get('username')?.toString().trim().toLowerCase();
  const passwordInput = loginFormData.get('password')?.toString();

  if (!rawIdentifier || !passwordInput) {
    return {
      hasError: true,
      errorMessage: 'Email/username and password are required.',
    };
  }

  const existingUserRecord = await prisma.user.findFirst({
    where: {
      OR: [{ email: rawIdentifier }, { username: rawIdentifier }],
    },
  });

  if (!existingUserRecord) {
    return {
      hasError: true,
      errorMessage: 'Invalid username or password.',
    };
  }

  const isPasswordValid = await bcrypt.compare(passwordInput, existingUserRecord.passwordHash);
  if (!isPasswordValid) {
    return {
      hasError: true,
      errorMessage: 'Invalid username or password.',
    };
  }

  const userSession = await getCurrentSession();
  userSession.isAuthenticated = true;
  userSession.userId = existingUserRecord.id;
  userSession.email = existingUserRecord.email;
  userSession.username = existingUserRecord.username || existingUserRecord.email.split('@')[0];
  userSession.loginTimestamp = Date.now();
  await userSession.save();

  redirect('/dashboard');
};

export const handleSignUpAction = async (
  previousState: AuthActionResult | null,
  registerFormData: FormData
): Promise<AuthActionResult> => {
  const clientIpAddress = getClientIpAddressFromHeaders();
  const rateLimitError = checkAuthRateLimit(clientIpAddress, 'signup');
  if (rateLimitError) {
    return rateLimitError;
  }

  const emailRawInput = registerFormData.get('email')?.toString().trim().toLowerCase();
  const usernameInput = registerFormData.get('username')?.toString().trim().toLowerCase();
  const passwordInput = registerFormData.get('password')?.toString();
  const confirmPasswordInput = registerFormData.get('confirmPassword')?.toString();

  // If email is not supplied but username is supplied, derive an email for backward compatibility
  const effectiveEmail = emailRawInput || (usernameInput ? `${usernameInput}@example.com` : '');
  const effectiveUsername = usernameInput || (emailRawInput ? emailRawInput.split('@')[0] : '');

  if ((!emailRawInput && !usernameInput) || !passwordInput) {
    return {
      hasError: true,
      errorMessage: 'Email/username and password are required.',
    };
  }

  if (effectiveUsername && effectiveUsername.length < 3) {
    return {
      hasError: true,
      errorMessage: 'Username must be at least 3 characters long.',
    };
  }

  if (passwordInput.length < 6) {
    return {
      hasError: true,
      errorMessage: 'Password must be at least 6 characters long.',
    };
  }

  if (passwordInput !== confirmPasswordInput) {
    return {
      hasError: true,
      errorMessage: 'Passwords do not match.',
    };
  }

  // Check if user already exists
  const existingUserRecord = await prisma.user.findFirst({
    where: {
      OR: [
        { email: effectiveEmail },
        ...(effectiveUsername ? [{ username: effectiveUsername }] : []),
      ],
    },
  });

  if (existingUserRecord) {
    const isUsernameMatched = Boolean(
      effectiveUsername &&
      existingUserRecord.username?.toLowerCase() === effectiveUsername.toLowerCase()
    );
    return {
      hasError: true,
      errorMessage: isUsernameMatched
        ? 'This username is already taken. Please choose another.'
        : 'An account with this email already exists.',
    };
  }

  const sanitizedPassword = String(passwordInput);
  const passwordHash = await bcrypt.hash(sanitizedPassword, 10);

  const newUserRecord = await prisma.user.create({
    data: {
      email: effectiveEmail,
      username: effectiveUsername || null,
      passwordHash,
    },
  });

  // Assign any orphan initial sample applications to this first user if available
  await prisma.job.updateMany({
    where: { userId: null },
    data: { userId: newUserRecord.id },
  });

  const userSession = await getCurrentSession();
  userSession.isAuthenticated = true;
  userSession.userId = newUserRecord.id;
  userSession.email = newUserRecord.email;
  userSession.username = effectiveUsername || newUserRecord.email.split('@')[0];
  userSession.loginTimestamp = Date.now();
  await userSession.save();

  redirect('/dashboard');
};

export const handleLogoutAction = async (): Promise<void> => {
  const userSession = await getCurrentSession();
  userSession.destroy();
  redirect('/login');
};

export const signIn = handleSignInAction;
export const signUp = handleSignUpAction;
export const logout = handleLogoutAction;
