import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'bazaar-dev-secret-key-change-in-production'
);

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/orders',
  '/checkout',
  '/cart',
  '/profile',
  '/favorites',
];

// Routes that require admin role
const ADMIN_ROUTES = ['/admin'];

// Routes that require delivery role
const DELIVERY_ROUTES = ['/delivery/dashboard'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is an admin route
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    const token = request.cookies.get('bazaar-auth-token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login?redirect=' + pathname, request.url));
    }
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      if (payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/auth/login?redirect=' + pathname, request.url));
    }
  }

  // Check delivery dashboard
  if (DELIVERY_ROUTES.some((route) => pathname.startsWith(route))) {
    const token = request.cookies.get('bazaar-auth-token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login?redirect=' + pathname, request.url));
    }
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      if (payload.role !== 'delivery' && payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/auth/login?redirect=' + pathname, request.url));
    }
  }

  // Check general protected routes
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    const token = request.cookies.get('bazaar-auth-token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login?redirect=' + pathname, request.url));
    }
    try {
      await jwtVerify(token, JWT_SECRET);
    } catch {
      return NextResponse.redirect(new URL('/auth/login?redirect=' + pathname, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/delivery/dashboard/:path*',
    '/orders/:path*',
    '/checkout/:path*',
    '/profile/:path*',
    '/favorites/:path*',
  ],
};
