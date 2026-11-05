import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_OPTIONS, verifySessionToken } from '@/lib/auth';
import { getDb, saveUser, syncCloudDbPush } from '@/lib/db';

export async function POST(req: NextRequest) {
  // Real session invalidation: bump the user's tokenVersion so that every
  // token previously issued for this user (including any copy on another
  // browser) is rejected server-side by getCurrentUser(). Also persists the
  // bump to the cloud DB, then clears the cookie.
  try {
    const token = req.cookies.get(AUTH_COOKIE_OPTIONS.name)?.value;
    if (token) {
      const session = await verifySessionToken(token);
      if (session?.userId) {
        const db = getDb();
        const user = db.users.find((u) => u.id === session.userId);
        if (user && (user.tokenVersion || 0) === ((session as { sv?: number }).sv ?? 0)) {
          user.tokenVersion = (user.tokenVersion || 0) + 1;
          saveUser(user);
          await syncCloudDbPush(getDb());
        }
      }
    }
  } catch (error) {
    console.error('Logout invalidation error:', error);
  }

  const response = NextResponse.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
  response.cookies.set(AUTH_COOKIE_OPTIONS.name, '', {
    ...AUTH_COOKIE_OPTIONS.options,
    maxAge: 0,
  });
  return response;
}
