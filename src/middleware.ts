import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Early gate for administrative routes.
 * Verifies the session JWT (cookie darelasal_session) before any admin page
 * is rendered. This is an edge-only, database-free check: the JWT claim is the
 * authoritative role signal here. Server-side API guards and the admin layout
 * remain the final layer (they also re-validate against the user store, e.g.
 * suspended accounts).
 *
 * - No session / invalid token  -> redirect to /auth/login?redirect=<path>
 * - Valid token, role != admin  -> silent redirect to /
 * - Valid admin token           -> pass through
 */

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dar-el-asal-olive-secure-secret-key-2026-production'
);

const SESSION_COOKIE_NAME = 'darelasal_session';

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return redirectToLogin(request);
  }

  let role: string | null = null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    role = (payload as { role?: string }).role ?? null;
  } catch {
    return redirectToLogin(request);
  }

  if (!role || role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL('/auth/login', request.url);
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*'],
};
