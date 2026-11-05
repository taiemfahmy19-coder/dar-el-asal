import { NextRequest, NextResponse } from 'next/server';
import {
  getCurrentUser,
  verifySessionToken,
  createSessionToken,
  sessionCookieOptionsFor,
  AUTH_COOKIE_OPTIONS,
} from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null });
    }

    // Do not return password hash
    const { passwordHash, ...safeUser } = user;

    const response = NextResponse.json({ user: safeUser });

    // Sliding renewal: re-issue the session cookie with a fresh window so an
    // active user stays signed in across reloads / browser restarts, while an
    // abandoned session still expires (7d admin / 30d customer). Only the
    // signed JWT reference is stored — never the password.
    try {
      const currentToken = req.cookies.get(AUTH_COOKIE_OPTIONS.name)?.value;
      const currentSession = currentToken ? await verifySessionToken(currentToken) : null;
      const issuedAt = currentSession
        ? ((currentSession as { iat?: number }).iat ?? 0) * 1000
        : 0;
      const isOlderThanOneDay = Date.now() - issuedAt > 24 * 60 * 60 * 1000;

      if (isOlderThanOneDay) {
        const freshToken = await createSessionToken(user);
        const opts = sessionCookieOptionsFor(user);
        response.cookies.set(opts.name, freshToken, opts.options);
      }
    } catch {
      // Renewal is best-effort; the still-valid current cookie continues to work
    }

    return response;
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
