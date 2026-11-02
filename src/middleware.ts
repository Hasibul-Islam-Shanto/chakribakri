import { NextRequest, NextResponse } from 'next/server';
import { verifySessionCookie, sessionCookieName } from '@/lib/session';
import {
  checkRateLimit,
  getClientIpAddress,
  isRateLimitingEnabled,
  RateLimitConfig,
} from '@/lib/rate-limiter';

const ROUTE_RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequests: 120,
  windowMs: 60 * 1000,
};

export const middleware = async (request: NextRequest): Promise<NextResponse> => {
  const currentPath = request.nextUrl.pathname;

  const isProtectedRoute =
    currentPath.startsWith('/dashboard') ||
    currentPath.startsWith('/analytics') ||
    currentPath === '/';

  const isApiRoute = currentPath.startsWith('/api');
  const shouldApplyRateLimit = (isProtectedRoute || isApiRoute) && isRateLimitingEnabled();
  const isRscPrefetchRequest = request.headers.get('RSC') === '1';

  if (shouldApplyRateLimit && !isRscPrefetchRequest) {
    const clientIpAddress = getClientIpAddress(request.headers, request.ip);
    const rateLimitResult = checkRateLimit(
      `middleware:${clientIpAddress}`,
      ROUTE_RATE_LIMIT_CONFIG
    );

    if (!rateLimitResult.isAllowed) {
      const remainingMilliseconds = Math.max(0, rateLimitResult.resetTimestamp - Date.now());
      const retryAfterSeconds = Math.max(1, Math.ceil(remainingMilliseconds / 1000));

      return NextResponse.json(
        { hasError: true, errorMessage: 'Too many requests. Please slow down.' },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfterSeconds.toString(),
          },
        }
      );
    }
  }

  const sealedSessionCookie = request.cookies.get(sessionCookieName)?.value;
  const verifiedSession = await verifySessionCookie(sealedSessionCookie);

  const isAuthenticated = verifiedSession?.isAuthenticated ?? false;
  const isEmailVerified = verifiedSession?.isEmailVerified ?? false;

  const isAuthRoute = currentPath.startsWith('/login');
  const isVerificationRoute = currentPath.startsWith('/verify-email');

  // Case 1: Unauthenticated visitors
  if (!isAuthenticated) {
    if (isProtectedRoute) {
      const loginRedirectUrl = new URL('/login', request.url);
      if (currentPath !== '/') {
        loginRedirectUrl.searchParams.set('redirectUrl', currentPath);
      }
      return NextResponse.redirect(loginRedirectUrl);
    }

    if (isVerificationRoute) {
      const emailQueryParam = request.nextUrl.searchParams.get('email');
      const hasEmailParam = Boolean(emailQueryParam && emailQueryParam.trim().length > 0);
      if (!hasEmailParam) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }

    return NextResponse.next();
  }

  // Case 2: Authenticated but Unverified Users
  if (!isEmailVerified) {
    if (isProtectedRoute) {
      const verifyRedirectUrl = new URL('/verify-email', request.url);
      if (verifiedSession?.email) {
        verifyRedirectUrl.searchParams.set('email', verifiedSession.email);
      }
      return NextResponse.redirect(verifyRedirectUrl);
    }

    if (isAuthRoute) {
      const verifyRedirectUrl = new URL('/verify-email', request.url);
      if (verifiedSession?.email) {
        verifyRedirectUrl.searchParams.set('email', verifiedSession.email);
      }
      return NextResponse.redirect(verifyRedirectUrl);
    }

    return NextResponse.next();
  }

  // Case 3: Authenticated and Verified Users
  if (isVerificationRoute) {
    const dashboardRedirectUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardRedirectUrl);
  }

  if (isAuthRoute) {
    const dashboardRedirectUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardRedirectUrl);
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/analytics/:path*',
    '/verify-email',
    '/login',
    '/api/:path*',
  ],
};
