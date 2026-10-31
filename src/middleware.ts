import { NextRequest, NextResponse } from 'next/server';
import { verifySessionCookie, sessionCookieName } from '@/lib/session';

export const middleware = async (request: NextRequest): Promise<NextResponse> => {
  const currentPath = request.nextUrl.pathname;
  const sealedSessionCookie = request.cookies.get(sessionCookieName)?.value;
  const verifiedSession = await verifySessionCookie(sealedSessionCookie);
  const isAuthenticated = verifiedSession?.isAuthenticated ?? false;

  const isAuthRoute = currentPath.startsWith('/login');
  const isDashboardRoute = currentPath.startsWith('/dashboard') || currentPath === '/';

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
  matcher: ['/', '/dashboard/:path*', '/login'],
};
