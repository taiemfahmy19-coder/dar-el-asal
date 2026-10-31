import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'الصلاحية للمدير فقط' }, { status: 403 });
    }

    const db = getDb();
    // Strip sensitive fields before returning
    const safeUsers = db.users
      .filter((u) => u.role === 'customer')
      .map(({ passwordHash: _, ...rest }) => rest);

    return NextResponse.json({ users: safeUsers });
  } catch {
    return NextResponse.json({ error: 'فشل تحميل بيانات العملاء' }, { status: 500 });
  }
}
