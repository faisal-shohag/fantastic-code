// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/auth'

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico$|$|circle/[^/]+$).*)',
  ],
};

export async function middleware(req: NextRequest) {
  const session = await auth();

  // Check if user is logged in
  if (session?.user) {
    // List of pages that don't require username
    const publicPaths = [
      '/username',
      '/api/username/check',
      '/api/username/set',
      '/api/auth/session'
    ]

    // If no username and not on username page, redirect to username selection
    if (!session.user.username && !publicPaths.some(path => req.nextUrl.pathname.startsWith(path))) {
      const url = req.nextUrl.clone();
      url.pathname = '/username';
      return NextResponse.redirect(url);
    }
  } else {
    // If not logged in, redirect to signin
    const url = req.nextUrl.clone();
    url.pathname = '/api/auth/signin';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}