import { NextRequest, NextResponse } from 'next/server';
import { verifySessionCookie, sessionCookieName } from '@/lib/session';
import { checkRateLimit, getClientIpAddress, RateLimitConfig } from '@/lib/rate-limiter';

const ROUTE_RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequests: 120,
  windowMs: 60 * 1000,
};

export const middleware = async (request: NextRequest): Promise<NextResponse> => {
  const currentPath = request.nextUrl.pathname;

  const isDashboardRoute = currentPath.startsWith('/dashboard') || currentPath === '/';
  const isApiRoute = currentPath.startsWith('/api');
  const shouldApplyRateLimit = currentPath.startsWith('/dashboard') || isApiRoute;
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

  const isAuthRoute = currentPath.startsWith('/login');

  if (isDashboardRoute && !isAuthenticated) {
    const loginRedirectUrl = new URL('/login', request.url);
    if (currentPath !== '/') {
      loginRedirectUrl.searchParams.set('redirectUrl', currentPath);
    }
    return NextResponse.redirect(loginRedirectUrl);
  }

  if (isAuthRoute && isAuthenticated) {
    const dashboardRedirectUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardRedirectUrl);
  }

  return NextResponse.next();
};

export const config = {
  matcher: ['/', '/dashboard/:path*', '/login', '/api/:path*'],
};
