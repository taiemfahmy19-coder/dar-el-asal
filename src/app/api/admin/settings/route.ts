import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getStoreSettings, updateStoreSettings } from '@/lib/db';

export async function GET() {
  try {
    const settings = getStoreSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: 'فشل جلب الإعدادات' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'الصلاحية للمدير فقط' }, { status: 403 });
    }

    const body = await req.json();
    const updated = updateStoreSettings(body);
    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    return NextResponse.json({ error: 'فشل تحديث الإعدادات' }, { status: 500 });
  }
}
