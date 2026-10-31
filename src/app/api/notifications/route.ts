import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { Notification } from '@/lib/types';

// GET /api/notifications — get notifications for current user
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
    }

    const db = getDb();
    const notifications = (db.notifications || [])
      .filter((n: Notification) => n.userId === user.id)
      .sort(
        (a: Notification, b: Notification) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 50);

    const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch {
    return NextResponse.json({ error: 'فشل جلب الإشعارات' }, { status: 500 });
  }
}

// PATCH /api/notifications — mark all as read
export async function PATCH() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
    }

    const db = getDb();
    if (!db.notifications) db.notifications = [];

    db.notifications = db.notifications.map((n: Notification) =>
      n.userId === user.id ? { ...n, isRead: true } : n
    );

    saveDb(db);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'فشل تحديث الإشعارات' }, { status: 500 });
  }
}

// POST /api/notifications — create a notification (admin only)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'الصلاحية للمدير فقط' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, title, message, type, link } = body;

    if (!userId || !title || !message) {
      return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 });
    }

    const db = getDb();
    if (!db.notifications) db.notifications = [];

    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      title,
      message,
      type: type || 'info',
      isRead: false,
      link,
      createdAt: new Date().toISOString(),
    };

    db.notifications.push(notification);
    saveDb(db);

    return NextResponse.json({ notification }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'فشل إنشاء الإشعار' }, { status: 500 });
  }
}
