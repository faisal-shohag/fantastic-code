import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@/auth';

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico$|$|circle/[^/]+$).*)',
  ],
};

export async function middleware(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    const url = req.nextUrl.clone();
    url.pathname = '/api/auth/signin';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}