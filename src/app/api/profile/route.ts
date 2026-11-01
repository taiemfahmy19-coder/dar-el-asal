import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb, saveDb, getUserById } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const db = getDb();
    const userAddresses = db.addresses ? db.addresses.filter((a) => a.userId === user.id) : [];

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      addresses: userAddresses,
    });
  } catch (error) {
    return NextResponse.json({ error: 'فشل جلب بيانات الحساب' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const body = await req.json();
    const db = getDb();

    // Update user profile in database
    const userIndex = db.users.findIndex((u) => u.id === user.id);
    if (userIndex === -1) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    if (body.name) {
      db.users[userIndex].name = body.name.trim();
    }
    if (body.phone !== undefined) {
      db.users[userIndex].phone = body.phone.trim();
    }
    db.users[userIndex].updatedAt = new Date().toISOString();

    // Handle address addition/updating if provided
    if (body.newAddress) {
      if (!db.addresses) db.addresses = [];
      const newAddr = {
        id: `addr-${Date.now()}`,
        userId: user.id,
        label: body.newAddress.label || 'المنزل',
        recipientName: body.newAddress.recipientName || db.users[userIndex].name,
        phone: body.newAddress.phone || db.users[userIndex].phone,
        governorate: body.newAddress.governorate || 'الإسكندرية',
        city: body.newAddress.city || 'الإسكندرية',
        streetAddress: body.newAddress.streetAddress || '',
        buildingDetails: body.newAddress.buildingDetails || '',
        isDefault: db.addresses.filter((a) => a.userId === user.id).length === 0,
      };
      db.addresses.push(newAddr);
    }

    saveDb(db);

    return NextResponse.json({
      success: true,
      user: {
        id: db.users[userIndex].id,
        name: db.users[userIndex].name,
        email: db.users[userIndex].email,
        phone: db.users[userIndex].phone,
        role: db.users[userIndex].role,
      },
      addresses: db.addresses.filter((a) => a.userId === user.id),
      message: 'تم تحديث بيانات الحساب بنجاح',
    });
  } catch (error) {
    return NextResponse.json({ error: 'فشل تحديث البيانات' }, { status: 500 });
  }
}
