import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import {
  verifyOtpCodeAction,
  resendVerificationCodeAction,
} from './verification-actions';
import { generateSecureOtpCode } from '@/lib/email-service';
import {
  clearTestDatabase,
  getTestPrismaClient,
  createTestUser,
} from '../tests/test-db-setup';

const mockSessionInstance = {
  isAuthenticated: false,
  isEmailVerified: false,
  userId: undefined as string | undefined,
  email: undefined as string | undefined,
  username: undefined as string | undefined,
  save: vi.fn().mockResolvedValue(undefined),
  destroy: vi.fn().mockReturnValue(undefined),
};

vi.mock('@/lib/session', () => ({
  getCurrentSession: vi.fn().mockImplementation(async () => mockSessionInstance),
  verifySessionCookie: vi.fn(),
  sessionCookieName: 'chakribakri_session',
}));

describe('Email Verification Actions (actions/verification-actions.test.ts)', () => {
  const prismaClient = getTestPrismaClient();

  beforeEach(async () => {
    await clearTestDatabase();
    mockSessionInstance.isAuthenticated = false;
    mockSessionInstance.isEmailVerified = false;
    mockSessionInstance.userId = undefined;
    mockSessionInstance.email = undefined;
    mockSessionInstance.username = undefined;
    mockSessionInstance.save.mockClear();
    mockSessionInstance.destroy.mockClear();
  });

  afterEach(async () => {
    await clearTestDatabase();
  });

  it('generates a 6-digit numeric OTP code', () => {
    const generatedOtp = generateSecureOtpCode();
    expect(generatedOtp).toHaveLength(6);
    expect(/^\d{6}$/.test(generatedOtp)).toBe(true);
  });

  it('verifies a valid OTP code successfully, marks user verified, and upgrades session', async () => {
    const testUser = await createTestUser('alexdev', 'password123', false, 'alex@example.com');
    const plainOtp = '123456';
    const codeHash = await bcrypt.hash(plainOtp, 10);

    await prismaClient.verificationToken.create({
      data: {
        userId: testUser.id,
        email: 'alex@example.com',
        codeHash,
        attemptsCount: 0,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const verificationResult = await verifyOtpCodeAction('alex@example.com', '123456');

    expect(verificationResult.isSuccess).toBe(true);
    expect(verificationResult.hasError).toBe(false);
    expect(verificationResult.isVerified).toBe(true);

    // Verify database state
    const updatedUser = await prismaClient.user.findUnique({
      where: { id: testUser.id },
    });
    expect(updatedUser?.isVerified).toBe(true);

    // Verify tokens were cleared
    const remainingTokens = await prismaClient.verificationToken.findMany({
      where: { email: 'alex@example.com' },
    });
    expect(remainingTokens).toHaveLength(0);

    // Verify session was upgraded
    expect(mockSessionInstance.isAuthenticated).toBe(true);
    expect(mockSessionInstance.isEmailVerified).toBe(true);
    expect(mockSessionInstance.save).toHaveBeenCalled();
  });

  it('rejects invalid OTP code and increments attemptsCount', async () => {
    const testUser = await createTestUser('sarahdev', 'password123', false, 'sarah@example.com');
    const plainOtp = '654321';
    const codeHash = await bcrypt.hash(plainOtp, 10);

    await prismaClient.verificationToken.create({
      data: {
        userId: testUser.id,
        email: 'sarah@example.com',
        codeHash,
        attemptsCount: 0,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const failedAttemptResult = await verifyOtpCodeAction('sarah@example.com', '000000');

    expect(failedAttemptResult.isSuccess).toBe(false);
    expect(failedAttemptResult.hasError).toBe(true);
    expect(failedAttemptResult.errorMessage).toContain('4 attempts remaining');

    const tokenAfterFailure = await prismaClient.verificationToken.findFirst({
      where: { email: 'sarah@example.com' },
    });
    expect(tokenAfterFailure?.attemptsCount).toBe(1);
  });

  it('blocks verification after 5 failed attempts', async () => {
    const testUser = await createTestUser('lockeduser', 'password123', false, 'locked@example.com');
    const plainOtp = '777888';
    const codeHash = await bcrypt.hash(plainOtp, 10);

    await prismaClient.verificationToken.create({
      data: {
        userId: testUser.id,
        email: 'locked@example.com',
        codeHash,
        attemptsCount: 5,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const lockedAttemptResult = await verifyOtpCodeAction('locked@example.com', '777888');

    expect(lockedAttemptResult.isSuccess).toBe(false);
    expect(lockedAttemptResult.hasError).toBe(true);
    expect(lockedAttemptResult.errorMessage).toContain('Too many failed attempts');
  });

  it('rejects expired OTP tokens', async () => {
    const testUser = await createTestUser('expireduser', 'password123', false, 'expired@example.com');
    const plainOtp = '112233';
    const codeHash = await bcrypt.hash(plainOtp, 10);

    await prismaClient.verificationToken.create({
      data: {
        userId: testUser.id,
        email: 'expired@example.com',
        codeHash,
        attemptsCount: 0,
        expiresAt: new Date(Date.now() - 5 * 60 * 1000), // Expired 5 minutes ago
      },
    });

    const expiredResult = await verifyOtpCodeAction('expired@example.com', '112233');

    expect(expiredResult.isSuccess).toBe(false);
    expect(expiredResult.hasError).toBe(true);
    expect(expiredResult.errorMessage).toContain('expired');
  });

  it('handles resend verification code and enforces 60-second cooldown throttle', async () => {
    await createTestUser('resenduser', 'password123', false, 'resend@example.com');

    // First resend request succeeds
    const initialResendResult = await resendVerificationCodeAction('resend@example.com');
    expect(initialResendResult.isSuccess).toBe(true);
    expect(initialResendResult.hasError).toBe(false);
    expect(initialResendResult.cooldownSeconds).toBe(60);

    // Immediate second resend request is throttled
    const throttledResendResult = await resendVerificationCodeAction('resend@example.com');
    expect(throttledResendResult.isSuccess).toBe(false);
    expect(throttledResendResult.hasError).toBe(true);
    expect(throttledResendResult.errorMessage).toContain('Please wait');
  });
});

