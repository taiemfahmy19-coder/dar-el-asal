import { NextRequest, NextResponse } from 'next/server';
import { saveDeliveryApplication, getDeliveryApplications, addNotification } from '@/lib/db';
import { DeliveryApplication } from '@/lib/types';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, phone, governorate, coveredAreas, vehicleType, nationalId, notes } = body;

    if (!fullName || !email || !phone || !governorate || !vehicleType) {
      return NextResponse.json(
        { error: 'يرجى استكمال البيانات الإلزامية (الاسم، البريد، الهاتف، المحافظة، وسيلة التوصيل)' },
        { status: 400 }
      );
    }

    const applications = getDeliveryApplications();
    const existing = applications.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() || a.phone === phone
    );

    if (existing && existing.status === 'PENDING') {
      return NextResponse.json(
        { error: 'يوجد طلب انضمام مسجل مسبقاً بهذا البريد أو الهاتف وهو قيد المراجعة حالياً' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newApp: DeliveryApplication = {
      id: `del-app-${Date.now()}`,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      governorate: governorate.trim(),
      coveredAreas: coveredAreas?.trim() || governorate.trim(),
      vehicleType: vehicleType.trim(),
      nationalId: nationalId?.trim() || 'قيد الاستيفاء',
      status: 'PENDING',
      notes: notes?.trim() || '',
      createdAt: now,
    };

    saveDeliveryApplication(newApp);

    // Notify Admins
    const db = getDb();
    const adminUsers = db.users.filter((u) => u.role === 'admin');
    for (const admin of adminUsers) {
      addNotification({
        id: `notif-${Date.now()}-${admin.id}`,
        userId: admin.id,
        title: 'طلب انضمام مندوب توصيل جديد',
        message: `قدم الكابتن ${fullName} طلب انضمام لتغطية منطقة ${governorate}.`,
        link: '/admin/couriers',
        isRead: false,
        createdAt: now,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'تم إرسال طلب الانضمام بنجاح، وحسابك قيد المراجعة من إدارة المتجر.',
      applicationId: newApp.id,
    });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ أثناء إرسال الطلب' }, { status: 500 });
  }
}
