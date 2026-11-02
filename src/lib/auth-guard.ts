import { getCurrentSession } from '@/lib/session';

export interface AuthenticatedUserContext {
  userId: string;
  email: string;
  username: string;
}

export const ensureAuthenticatedUser = async (): Promise<AuthenticatedUserContext> => {
  const activeSession = await getCurrentSession();

  const isUserAuthenticated = Boolean(activeSession.isAuthenticated && activeSession.userId);

  if (!isUserAuthenticated || !activeSession.userId) {
    throw new Error('Authentication required. Please sign in.');
  }

  return {
    userId: activeSession.userId,
    email: activeSession.email || '',
    username: activeSession.username || '',
  };
};
