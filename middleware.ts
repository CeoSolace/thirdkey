import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from './lib/dbConnect';
import { SiteState } from './models/SiteState';
import { auth } from './lib/auth';

export async function middleware(req: NextRequest) {
  await dbConnect();

  // 1. Check site state
  const siteStateDoc = await SiteState.findOne();
  const siteState = siteStateDoc?.state || 'open';
  const path = req.nextUrl.pathname;

  if (siteState === 'maintenance' && !path.startsWith('/maintenance')) {
    return NextResponse.redirect(new URL('/maintenance', req.url));
  }

  if (siteState === 'closed' && !path.startsWith('/closed')) {
    return NextResponse.redirect(new URL('/closed', req.url));
  }

  // 2. Auth guard for protected routes
  const protectedRoutes = ['/artist', '/admin', '/account', '/premium'];
  const isProtected = protectedRoutes.some(route => path.startsWith(route));

  if (isProtected) {
    const session = await auth();
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
  }

  // 3. Streaming guard (for /api/stream or audio routes — assumed)
  if (path.startsWith('/api/stream') || path.endsWith('.mp3')) {
    const session = await auth();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await (await import('./models/User')).User.findOne({ email: session.user.email });
    if (!user || user.isBanned) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const now = new Date();
    const canStream = user.isEmailVerified ||
      (user.tempVerified && user.tempVerifiedUntil > now) ||
      user.isPremium;

    if (!canStream) {
      return new NextResponse('Verification required', { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|.*\\.(?:jpg|jpeg|png|gif|webp|mp3|wav|ogg)$).*)',
    '/api/:path*',
    '/artist/:path*',
    '/admin/:path*',
    '/account/:path*',
    '/premium/:path*',
  ],
};
