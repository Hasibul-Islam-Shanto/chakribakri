import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  handleSignInAction,
  handleSignUpAction,
  handleLogoutAction,
  signIn,
  signUp,
  logout,
  AuthActionResult,
} from './auth-actions';
import {
  clearTestDatabase,
  getTestPrismaClient,
  createTestUser,
} from '../tests/test-db-setup';
import { resetRateLimitStore } from '@/lib/rate-limiter';
import bcrypt from 'bcryptjs';

const mockRedirect = vi.fn().mockImplementation((targetPath: string) => {
  throw new Error(`NEXT_REDIRECT:${targetPath}`);
});

vi.mock('next/navigation', () => ({
  redirect: (targetPath: string) => mockRedirect(targetPath),
}));

vi.mock('next/headers', () => ({
  headers: () => new Headers({ 'x-forwarded-for': '192.168.1.50' }),
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
  }),
}));

const mockSessionInstance = {
  isAuthenticated: false,
  userId: undefined as string | undefined,
  username: undefined as string | undefined,
  loginTimestamp: undefined as number | undefined,
  save: vi.fn().mockResolvedValue(undefined),
  destroy: vi.fn().mockReturnValue(undefined),
};

vi.mock('@/lib/session', () => ({
  getCurrentSession: vi.fn().mockImplementation(async () => mockSessionInstance),
  verifySessionCookie: vi.fn(),
  sessionCookieName: 'chakribakri_session',
}));

describe('Auth Server Actions with Test SQLite Database (actions/auth-actions.test.ts)', () => {
  const prismaClient = getTestPrismaClient();

  beforeEach(async () => {
    resetRateLimitStore();
    await clearTestDatabase();
    mockRedirect.mockClear();
    mockSessionInstance.isAuthenticated = false;
    mockSessionInstance.userId = undefined;
    mockSessionInstance.username = undefined;
    mockSessionInstance.save.mockClear();
    mockSessionInstance.destroy.mockClear();
  });

  afterEach(async () => {
    resetRateLimitStore();
    await clearTestDatabase();
  });

  it('registers a new user successfully, hashes password, saves session, and redirects to verify-email', async () => {
    const registrationFormData = new FormData();
    registrationFormData.append('username', 'newdeveloper');
    registrationFormData.append('password', 'SuperSecurePass123!');
    registrationFormData.append('confirmPassword', 'SuperSecurePass123!');

    let hasRedirectedToVerification = false;
    try {
      await handleSignUpAction(null, registrationFormData);
    } catch (redirectError: unknown) {
      if (String(redirectError).includes('NEXT_REDIRECT:/verify-email')) {
        hasRedirectedToVerification = true;
      }
    }

    expect(hasRedirectedToVerification).toBe(true);
    expect(mockSessionInstance.isAuthenticated).toBe(true);
    expect(mockSessionInstance.username).toBe('newdeveloper');
    expect(mockSessionInstance.save).toHaveBeenCalled();

    // Verify user record in test database
    const createdUser = await prismaClient.user.findUnique({
      where: { username: 'newdeveloper' },
    });

    expect(createdUser).not.toBeNull();
    expect(createdUser?.username).toBe('newdeveloper');

    const isPasswordHashValid = await bcrypt.compare(
      'SuperSecurePass123!',
      createdUser?.passwordHash || ''
    );
    expect(isPasswordHashValid).toBe(true);
  });

  it('rejects registration when username is already taken', async () => {
    await createTestUser('existinguser', 'somepassword');

    const duplicateSignUpFormData = new FormData();
    duplicateSignUpFormData.append('username', 'existinguser');
    duplicateSignUpFormData.append('password', 'password123');
    duplicateSignUpFormData.append('confirmPassword', 'password123');

    const registrationResult: AuthActionResult = await handleSignUpAction(
      null,
      duplicateSignUpFormData
    );

    expect(registrationResult.hasError).toBe(true);
    expect(registrationResult.errorMessage).toBe(
      'This username is already taken. Please choose another.'
    );
  });

  it('rejects registration when passwords do not match', async () => {
    const mismatchFormData = new FormData();
    mismatchFormData.append('username', 'mismatchuser');
    mismatchFormData.append('password', 'password123');
    mismatchFormData.append('confirmPassword', 'differentpassword');

    const registrationResult: AuthActionResult = await handleSignUpAction(
      null,
      mismatchFormData
    );

    expect(registrationResult.hasError).toBe(true);
    expect(registrationResult.errorMessage).toBe('Passwords do not match.');
  });

  it('authenticates valid credentials, updates session, and redirects', async () => {
    await createTestUser('loginuser', 'correctpassword');

    const loginFormData = new FormData();
    loginFormData.append('username', 'loginuser');
    loginFormData.append('password', 'correctpassword');

    let hasRedirectedToDashboard = false;
    try {
      await handleSignInAction(null, loginFormData);
    } catch (redirectError: unknown) {
      if (String(redirectError).includes('NEXT_REDIRECT:/dashboard')) {
        hasRedirectedToDashboard = true;
      }
    }

    expect(hasRedirectedToDashboard).toBe(true);
    expect(mockSessionInstance.isAuthenticated).toBe(true);
    expect(mockSessionInstance.username).toBe('loginuser');
  });

  it('rejects invalid password for an existing user', async () => {
    await createTestUser('registereduser', 'correctpassword');

    const wrongPasswordFormData = new FormData();
    wrongPasswordFormData.append('username', 'registereduser');
    wrongPasswordFormData.append('password', 'wrongpassword');

    const loginResult: AuthActionResult = await handleSignInAction(
      null,
      wrongPasswordFormData
    );

    expect(loginResult.hasError).toBe(true);
    expect(loginResult.errorMessage).toBe('Invalid username or password.');
  });

  it('throttles repeated failed login attempts after 5 tries', async () => {
    await createTestUser('targetuser', 'actualpassword');

    const invalidCredentialsFormData = new FormData();
    invalidCredentialsFormData.append('username', 'targetuser');
    invalidCredentialsFormData.append('password', 'invalidpassword');

    // First 5 failed login attempts return "Invalid username or password."
    for (let failedAttemptIndex = 1; failedAttemptIndex <= 5; failedAttemptIndex += 1) {
      const failedAttemptResult: AuthActionResult = await handleSignInAction(
        null,
        invalidCredentialsFormData
      );
      expect(failedAttemptResult.hasError).toBe(true);
      expect(failedAttemptResult.errorMessage).toBe('Invalid username or password.');
    }

    // 6th attempt should be blocked by auth rate limiter
    const throttledAttemptResult: AuthActionResult = await handleSignInAction(
      null,
      invalidCredentialsFormData
    );

    expect(throttledAttemptResult.hasError).toBe(true);
    expect(throttledAttemptResult.errorMessage).toContain('Too many attempts');
  });

  it('destroys session and redirects to /login on logout', async () => {
    let hasRedirectedToLogin = false;
    try {
      await handleLogoutAction();
    } catch (redirectError: unknown) {
      if (String(redirectError).includes('NEXT_REDIRECT:/login')) {
        hasRedirectedToLogin = true;
      }
    }

    expect(hasRedirectedToLogin).toBe(true);
    expect(mockSessionInstance.destroy).toHaveBeenCalled();
  });
});

