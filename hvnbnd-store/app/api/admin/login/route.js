import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  const { password } = await request.json();
  const expected = process.env.ADMIN_PASSWORD || '';

  const a = Buffer.from(password || '');
  const b = Buffer.from(expected);
  // timing-safe comparison + length check (timingSafeEqual throws on length mismatch)
  const valid = expected.length > 0 && a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!valid) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('hvnbnd_admin', process.env.SESSION_SECRET, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}
