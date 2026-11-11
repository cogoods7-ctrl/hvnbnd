import { NextResponse } from 'next/server';

// Paths that are always reachable regardless of the site-wide lock: the
// password/interest-form page itself, the endpoint it submits to, static
// product images (so that page can show the logo), Stripe's webhook (so
// payments already in flight don't break), and the admin login page.
const ALWAYS_PUBLIC = ['/enter', '/api/site-access', '/api/webhook', '/admin'];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // --- Admin gate: unchanged from before, checked first so the dashboard
  // always works for you regardless of whether the site-wide lock is on. ---
  const isAdminPage = pathname.startsWith('/admin/dashboard');
  const isAdminApi = pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/login');

  if (isAdminPage || isAdminApi) {
    const cookie = request.cookies.get('hvnbnd_admin')?.value;
    const valid = !!cookie && !!process.env.SESSION_SECRET && cookie === process.env.SESSION_SECRET;
    if (!valid) {
      if (isAdminApi) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // --- Always-public paths (bypass the site-wide lock entirely). ---
  if (
    ALWAYS_PUBLIC.includes(pathname) ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // --- Site-wide "coming soon" lock. Only active when SITE_PASSWORD is
  // set — remove that environment variable (or leave it blank) to open
  // the site back up to everyone with no code changes needed. ---
  if (process.env.SITE_PASSWORD) {
    const siteCookie = request.cookies.get('hvnbnd_site')?.value;
    const validSite = !!siteCookie && !!process.env.SESSION_SECRET && siteCookie === process.env.SESSION_SECRET;
    if (!validSite) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Site is currently locked' }, { status: 503 });
      }
      return NextResponse.redirect(new URL('/enter', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
