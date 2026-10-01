import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import crypto from 'crypto';
import { type SessionData, SESSION_OPTIONS } from '@/lib/auth/session';

// Routes that don't require auth under /admin
const PUBLIC_ADMIN_ROUTES = ['/admin/login', '/admin/setup'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin/* routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Allow login and setup pages through
  if (PUBLIC_ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check session
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, SESSION_OPTIONS);

  if (!session.isLoggedIn || !session.adminId) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validate session fingerprint (anti session hijacking / token stealing)
  if (session.fingerprint) {
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const currentHash = crypto.createHash('sha256').update(userAgent).digest('hex').slice(0, 16);
    if (session.fingerprint !== currentHash) {
      session.destroy();
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Validate session age (max 8 hours)
  if (session.createdAt && Date.now() - session.createdAt > 8 * 60 * 60 * 1000) {
    session.destroy();
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
