'use server';

import bcrypt from 'bcryptjs';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIpAddress, RateLimitConfig } from '@/lib/rate-limiter';

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

const checkAuthRateLimit = (clientIpAddress: string): AuthActionResult | null => {
  const rateLimitResult = checkRateLimit(`auth:${clientIpAddress}`, AUTH_RATE_LIMIT_CONFIG);

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
  const rateLimitError = checkAuthRateLimit(clientIpAddress);
  if (rateLimitError) {
    return rateLimitError;
  }

  const usernameInput = loginFormData.get('username')?.toString().trim().toLowerCase();
  const passwordInput = loginFormData.get('password')?.toString();

  if (!usernameInput || !passwordInput) {
    return {
      hasError: true,
      errorMessage: 'Username and password are required.',
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: { username: usernameInput },
  });

  if (!existingUser) {
    return {
      hasError: true,
      errorMessage: 'Invalid username or password.',
    };
  }

  const isPasswordValid = await bcrypt.compare(passwordInput, existingUser.passwordHash);
  if (!isPasswordValid) {
    return {
      hasError: true,
      errorMessage: 'Invalid username or password.',
    };
  }

  const userSession = await getCurrentSession();
  userSession.isAuthenticated = true;
  userSession.userId = existingUser.id;
  userSession.username = existingUser.username;
  userSession.loginTimestamp = Date.now();
  await userSession.save();

  redirect('/dashboard');
};

export const handleSignUpAction = async (
  previousState: AuthActionResult | null,
  registerFormData: FormData
): Promise<AuthActionResult> => {
  const clientIpAddress = getClientIpAddressFromHeaders();
  const rateLimitError = checkAuthRateLimit(clientIpAddress);
  if (rateLimitError) {
    return rateLimitError;
  }

  const usernameInput = registerFormData.get('username')?.toString().trim().toLowerCase();
  const passwordInput = registerFormData.get('password')?.toString();
  const confirmPasswordInput = registerFormData.get('confirmPassword')?.toString();

  if (!usernameInput || !passwordInput) {
    return {
      hasError: true,
      errorMessage: 'Username and password are required.',
    };
  }

  if (usernameInput.length < 3) {
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

  const existingUser = await prisma.user.findUnique({
    where: { username: usernameInput },
  });

  if (existingUser) {
    return {
      hasError: true,
      errorMessage: 'This username is already taken. Please choose another.',
    };
  }

  const passwordHash = await bcrypt.hash(passwordInput, 10);

  const newUser = await prisma.user.create({
    data: {
      username: usernameInput,
      passwordHash,
    },
  });

  // Assign any orphan initial sample applications to this first user if available
  await prisma.job.updateMany({
    where: { userId: null },
    data: { userId: newUser.id },
  });

  const userSession = await getCurrentSession();
  userSession.isAuthenticated = true;
  userSession.userId = newUser.id;
  userSession.username = newUser.username;
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
