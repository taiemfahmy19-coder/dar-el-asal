import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { User, UserRole } from './types';
import { getUserById } from './db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'bazaar-premium-arabic-ecommerce-secret-key-2026-secure'
);

const COOKIE_NAME = 'bazaar_session';

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
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
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

    const user = getUserById(session.userId);
    if (!user || user.status === 'suspended') return null;

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
