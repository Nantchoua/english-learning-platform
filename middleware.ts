import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isInstructorPath = req.nextUrl.pathname.startsWith('/instructor');

  if (isInstructorPath) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (token.role !== 'INSTRUCTOR' && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Only run on instructor page routes, NOT on API routes or Server Actions
  matcher: ['/instructor/:path*'],
};
