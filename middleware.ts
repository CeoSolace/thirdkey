import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // 1. Determine absolute base URL for server-side fetch
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    process.env.VERCEL_URL ||
    req.nextUrl.origin ||
    'https://www.thirdkey.org'; // fallback

  // 2. Check site state via PUBLIC API
  try {
    const siteStateRes = await fetch(`${baseUrl}/api/public/site-state`, {
      cache: 'no-store',
    });

    if (siteStateRes.ok) {
      const siteState = await siteStateRes.json();

      if (siteState.state === 'maintenance' && !path.startsWith('/maintenance')) {
        return NextResponse.redirect(new URL('/maintenance', req.url));
      }
      if (siteState.state === 'closed' && !path.startsWith('/closed')) {
        return NextResponse.redirect(new URL('/closed', req.url));
      }
    } else {
      console.warn('Site state check failed:', siteStateRes.status);
    }
  } catch (err) {
    console.error('Error fetching site state:', err);
    // Don’t block the request if the fetch fails
  }

  // 3. Auth guard: JWT only (no DB)
  const protectedRoutes = ['/artist', '/admin', '/account', '/premium'];
  const isProtected = protectedRoutes.some((route) => path.startsWith(route));

  if (isProtected) {
    const token = req.cookies.get('session')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
    } catch (err) {
      console.error('JWT verification failed:', err);
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
  }

  // 4. Streaming guard (for audio routes)
  if (path.endsWith('.mp3') || path.startsWith('/api/stream')) {
    const token = req.cookies.get('session')?.value;
    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
    } catch (err) {
      console.error('JWT verification failed (stream):', err);
      return new NextResponse('Unauthorized', { status: 401 });
    }
  }

  // Default: allow through
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
