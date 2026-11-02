import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export interface VerifiedAuthContext {
  userId: string;
  email: string;
  isVerified: boolean;
  username: string;
}

export const ensureVerifiedUser = async (): Promise<VerifiedAuthContext> => {
  const activeSession = await getCurrentSession();

  const isUserAuthenticated = Boolean(activeSession.isAuthenticated && activeSession.userId);

  if (!isUserAuthenticated || !activeSession.userId) {
    throw new Error('Authentication required. Please sign in.');
  }

  // Fast path: session already indicates verified status
  if (activeSession.isEmailVerified === true) {
    return {
      userId: activeSession.userId,
      email: activeSession.email || '',
      isVerified: true,
      username: activeSession.username || '',
    };
  }

  // Check database for ground truth
  const targetUserRecord = await prisma.user.findUnique({
    where: { id: activeSession.userId },
  });

  if (!targetUserRecord) {
    throw new Error('User account not found.');
  }

  const isEmailVerified = Boolean(targetUserRecord.isVerified);

  if (!isEmailVerified) {
    throw new Error(
      'Email verification required. Please verify your email to access this resource.'
    );
  }

  // Sync verified status to session
  activeSession.isEmailVerified = true;
  activeSession.email = targetUserRecord.email;
  if (targetUserRecord.username) {
    activeSession.username = targetUserRecord.username;
  }
  await activeSession.save();

  return {
    userId: targetUserRecord.id,
    email: targetUserRecord.email,
    isVerified: true,
    username: targetUserRecord.username || '',
  };
};
