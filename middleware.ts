import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Build base URL safely
  const baseUrl = 
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    (req.nextUrl.port
      ? `${req.nextUrl.protocol}//${req.nextUrl.hostname}:${req.nextUrl.port}`
      : `${req.nextUrl.protocol}//${req.nextUrl.hostname}`) ||
    'https://thirdkey.org';

  // ✅ Site state check — but don't block on failure
  let siteState = { state: 'open', message: '' };
  try {
    const res = await fetch(`${baseUrl}/api/public/site-state`, {
      cache: 'no-store',
      next: { revalidate: 0 },
      headers: { 'User-Agent': 'ThirdKey-Middleware' },
    });

    if (res.ok) {
      siteState = await res.json();
    }
  } catch (err) {
    console.warn('Site state fetch failed — defaulting to "open"');
    // Proceed with default "open" state
  }

  // Enforce site state
  if (siteState.state === 'maintenance' && !path.startsWith('/maintenance')) {
    return NextResponse.redirect(new URL('/maintenance', req.url));
  }
  if (siteState.state === 'closed' && !path.startsWith('/closed')) {
    return NextResponse.redirect(new URL('/closed', req.url));
  }

  // Auth guard
  const protectedRoutes = ['/artist', '/admin', '/dashboard', '/premium'];
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

  // Streaming guard
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
    '/dashboard/:path*',
    '/premium/:path*',
  ],
};import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Build base URL safely
  const baseUrl = 
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    (req.nextUrl.port
      ? `${req.nextUrl.protocol}//${req.nextUrl.hostname}:${req.nextUrl.port}`
      : `${req.nextUrl.protocol}//${req.nextUrl.hostname}`) ||
    'https://thirdkey.org';

  // ✅ Site state check — but don't block on failure
  let siteState = { state: 'open', message: '' };
  try {
    const res = await fetch(`${baseUrl}/api/public/site-state`, {
      cache: 'no-store',
      next: { revalidate: 0 },
      headers: { 'User-Agent': 'ThirdKey-Middleware' },
    });

    if (res.ok) {
      siteState = await res.json();
    }
  } catch (err) {
    console.warn('Site state fetch failed — defaulting to "open"');
    // Proceed with default "open" state
  }

  // Enforce site state
  if (siteState.state === 'maintenance' && !path.startsWith('/maintenance')) {
    return NextResponse.redirect(new URL('/maintenance', req.url));
  }
  if (siteState.state === 'closed' && !path.startsWith('/closed')) {
    return NextResponse.redirect(new URL('/closed', req.url));
  }

  // Auth guard
  const protectedRoutes = ['/artist', '/admin', '/dashboard', '/premium'];
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

  // Streaming guard
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
    '/dashboard/:path*',
    '/premium/:path*',
  ],
};
