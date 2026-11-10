import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, syncCloudDb } from '@/lib/db';
import { comparePassword, createSessionToken, sessionCookieOptionsFor } from '@/lib/auth';

// ---- Brute-force guard (2026-11-06) ----
// Tracks failed attempts per identity key (email + IP): 5 failures inside a
// 10-minute window locks that key for 15 minutes. In-memory per instance — a
// lightweight, dependency-free deterrent that stops credential guessing.
const MAX_FAILURES = 5;
const WINDOW_MS = 10 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;

const attempts = new Map<string, { failures: number; windowStart: number; lockedUntil: number }>();

function clientKey(req: NextRequest, email: string): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  return `${email.toLowerCase()}|${ip}`;
}

function prunable(now: number): void {
  if (attempts.size < 200) return;
  attempts.forEach((v, k) => {
    if (now - v.windowStart > WINDOW_MS && v.lockedUntil < now) attempts.delete(k);
  });
}

export async function POST(req: NextRequest) {
  try {
    // Ensure the user store mirrors the cloud identity data (tokenVersion,
    // password hashes) so a session issued by this instance is accepted
    // everywhere, not just on instances holding the same warm state.
    await syncCloudDb();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' },
        { status: 400 }
      );
    }

    // ---- Rate limiting check ----
    const now = Date.now();
    prunable(now);
    const key = clientKey(req, String(email));
    const record = attempts.get(key);
    if (record && record.lockedUntil > now) {
      const minutes = Math.ceil((record.lockedUntil - now) / 60000);
      return NextResponse.json(
        { error: `محاولات كثيرة جدًا. حاول مرة أخرى بعد ${minutes} دقيقة.` },
        { status: 429 }
      );
    }

    const user = getUserByEmail(email);
    if (!user) {
      const rec = record && now - record.windowStart <= WINDOW_MS ? record : { failures: 0, windowStart: now, lockedUntil: 0 };
      rec.failures += 1;
      if (rec.failures >= MAX_FAILURES) {
        rec.lockedUntil = now + LOCK_MS;
        rec.failures = 0;
        rec.windowStart = now;
      }
      attempts.set(key, rec);
      return NextResponse.json(
        { error: 'بيانات الدخول غير صحيحة، تأكد من البريد أو كلمة المرور' },
        { status: 401 }
      );
    }

    if (user.status === 'suspended') {
      return NextResponse.json(
        { error: 'هذا الحساب موقوف حالياً، يرجى التواصل مع إدارة المتجر' },
        { status: 403 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      const rec = record && now - record.windowStart <= WINDOW_MS ? record : { failures: 0, windowStart: now, lockedUntil: 0 };
      rec.failures += 1;
      if (rec.failures >= MAX_FAILURES) {
        rec.lockedUntil = now + LOCK_MS;
        rec.failures = 0;
        rec.windowStart = now;
      }
      attempts.set(key, rec);
      return NextResponse.json(
        { error: 'بيانات الدخول غير صحيحة، تأكد من البريد أو كلمة المرور' },
        { status: 401 }
      );
    }

    // Successful login clears the failure counter entirely.
    attempts.delete(key);

    const token = await createSessionToken(user);

    const { passwordHash, ...safeUser } = user;
    const response = NextResponse.json({
      success: true,
      user: safeUser,
      message: 'تم تسجيل الدخول بنجاح',
    });

    response.cookies.set(
      sessionCookieOptionsFor(user).name,
      token,
      // Long-lived, renewable: 30d for customers, 7d for admins.
      // Only the session reference (JWT) is stored — never the password.
      sessionCookieOptionsFor(user).options
    );
    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم أثناء تسجيل الدخول' },
      { status: 500 }
    );
  }
}
