import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const pathname = req.nextUrl.pathname;
  const isInstructorPath = pathname.startsWith('/instructor');

  if (isInstructorPath) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (token.role !== 'INSTRUCTOR' && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Clone headers and set x-pathname for Server Component visibility
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-pathname', pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    }
  });
}

export const config = {
  // Run middleware globally but ignore static assets, API calls, or Next internals
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.svg|api/).*)'],
};
