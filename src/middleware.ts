import { NextResponse, type NextRequest } from 'next/server';

import { FIREBASE_SESSION_COOKIE } from '@/lib/expo360/session-cookie';

function isProtectedWorkspace(pathname: string) {
  return (
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname === '/studio' ||
    pathname.startsWith('/studio/')
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/admin/signin') {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  if (isProtectedWorkspace(pathname)) {
    const hasFirebaseSession = Boolean(
      request.cookies.get(FIREBASE_SESSION_COOKIE)?.value
    );

    if (!hasFirebaseSession) {
      const signInUrl = new URL('/signin', request.url);
      signInUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|pdf)$).*)',
  ],
};
