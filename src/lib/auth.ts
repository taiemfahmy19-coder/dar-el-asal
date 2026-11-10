import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { User, UserRole } from './types';
import { getUserById, syncCloudDb } from './db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dar-el-asal-olive-secure-secret-key-2026-production'
);

const COOKIE_NAME = 'darelasal_session';

export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: User): Promise<string> {
  return new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    // Session version: incremented on logout so every previously issued
    // token becomes invalid server-side, not merely cookie-removed.
    sv: user.tokenVersion || 0,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${sessionMaxAgeSeconds(user.role)}s`)
    .sign(JWT_SECRET);
}

/** True only when the token was issued against the user's current session version. */
export function sessionMatchesUser(
  session: SessionPayload | null,
  user: User | null | undefined
): boolean {
  if (!session || !user) return false;
  return (session as { sv?: number }).sv === (user.tokenVersion || 0);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const session = await verifySessionToken(token);
    if (!session || !session.userId) return null;

    // CRITICAL (2026-11-10): ensure the user store reflects the cloud before
    // matching. A cold serverless instance boots from the (possibly stale)
    // local file; without this pull, tokenVersion mismatches eject a validly
    // signed-in user the moment their request lands on a different instance.
    await syncCloudDb();

    const user = getUserById(session.userId);
    if (!user || user.status === 'suspended') return null;

    // Reject tokens whose session version no longer matches (e.g. after logout)
    if (!sessionMatchesUser(session, user)) return null;

    return user;
  } catch (err) {
    return null;
  }
}

export async function requireAuth(allowedRoles?: UserRole[]): Promise<{
  user: User | null;
  authorized: boolean;
  error?: string;
}> {
  const user = await getCurrentUser();

  if (!user) {
    return { user: null, authorized: false, error: 'يجب تسجيل الدخول أولاً' };
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return {
      user,
      authorized: false,
      error: 'ليس لديك صلاحية للوصول إلى هذه الصفحة أو الإجراء',
    };
  }

  return { user, authorized: true };
}

/** Long-lived "remember me" session: renewed (sliding window) from /api/auth/me.
 *  Customer: 30 days (renewed on each visit).
 *  Admin:    7 days (safe renewable window, never unbounded). */
export function sessionMaxAgeSeconds(role?: UserRole): number {
  return role === 'admin' ? 60 * 60 * 24 * 7 : 60 * 60 * 24 * 30;
}

export function sessionCookieOptionsFor(user: User) {
  return {
    name: COOKIE_NAME,
    options: {
      ...AUTH_COOKIE_OPTIONS.options,
      maxAge: sessionMaxAgeSeconds(user.role),
    },
  };
}

export const AUTH_COOKIE_OPTIONS = {
  name: COOKIE_NAME,
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  },
};
