import { NextResponse } from 'next/server';

// Protects /admin/dashboard and all /api/admin/* routes (except the login
// route itself). This runs on Vercel's Edge network before the page or API
// route ever executes, so an unauthenticated visitor can never reach the
// dashboard or its data — the /admin login page itself stays public so you
// have somewhere to sign in.
export function middleware(request) {
  const { pathname } = request.nextUrl;

  const isProtectedPage = pathname.startsWith('/admin/dashboard');
  const isProtectedApi =
    pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/login');

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get('hvnbnd_admin')?.value;
  const valid = !!cookie && !!process.env.SESSION_SECRET && cookie === process.env.SESSION_SECRET;

  if (!valid) {
    if (isProtectedApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/dashboard/:path*', '/api/admin/:path*'],
};
