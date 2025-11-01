import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // 1. Check site state via PUBLIC API (no DB)
  const siteStateRes = await fetch(`${req.nextUrl.origin}/api/public/site-state`);
  const siteState = await siteStateRes.json();

  if (siteState.state === 'maintenance' && !path.startsWith('/maintenance')) {
    return NextResponse.redirect(new URL('/maintenance', req.url));
  }
  if (siteState.state === 'closed' && !path.startsWith('/closed')) {
    return NextResponse.redirect(new URL('/closed', req.url));
  }

  // 2. Auth guard: JWT only (no DB)
  const protectedRoutes = ['/artist', '/admin', '/account', '/premium'];
  const isProtected = protectedRoutes.some(route => path.startsWith(route));

  if (isProtected) {
    const token = req.cookies.get('session')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
    } catch {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
  }

  // 3. Streaming guard (for audio routes)
  if (path.endsWith('.mp3') || path.startsWith('/api/stream')) {
    const token = req.cookies.get('session')?.value;
    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
    } catch {
      return new NextResponse('Unauthorized', { status: 401 });
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
