import { cookies } from 'next/headers';
import { getIronSession, SessionOptions, unsealData } from 'iron-session';
import { SessionData } from '@/types/session';

export const sessionSecretKey =
  process.env.SESSION_SECRET ||
  'chakribakri_default_session_secret_at_least_32_characters_long_12345';

export const sessionCookieName = 'chakribakri_session';

export const sessionOptions: SessionOptions = {
  password: sessionSecretKey,
  cookieName: sessionCookieName,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export const defaultSessionData: SessionData = {
  isAuthenticated: false,
  username: '',
};

export const getCurrentSession = async () => {
  const cookieStore = cookies();
  const activeSession = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (activeSession.isAuthenticated === undefined) {
    activeSession.isAuthenticated = defaultSessionData.isAuthenticated;
    activeSession.username = defaultSessionData.username;
  }

  return activeSession;
};

export const verifySessionCookie = async (
  sealedCookie: string | undefined
): Promise<SessionData | null> => {
  if (!sealedCookie) {
    return null;
  }
  try {
    const unsealedPayload = (await unsealData(sealedCookie, {
      password: sessionSecretKey,
    })) as SessionData;

    if (unsealedPayload && unsealedPayload.isAuthenticated) {
      return unsealedPayload;
    }
    return null;
  } catch (verifyError: unknown) {
    console.error('Session cookie verification failed:', verifyError);
    return null;
  }
};
