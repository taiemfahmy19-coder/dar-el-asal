import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  getCourierProfiles,
  getDeliveryApplications,
  saveDeliveryApplication,
  saveCourierProfile,
  getUserByEmail,
  saveUser,
  addAuditLog,
  addNotification,
} from '@/lib/db';
import { CourierProfile, User } from '@/lib/types';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'الصلاحية للمدير فقط' }, { status: 403 });
    }

    const applications = getDeliveryApplications();
    const couriers = getCourierProfiles();

    return NextResponse.json({ applications, couriers });
  } catch (error) {
    return NextResponse.json({ error: 'فشل جلب بيانات المندوبين' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'الصلاحية للمدير فقط' }, { status: 403 });
    }

    const { action, applicationId, courierId, status } = await req.json();

    // 1. Approve Application
    if (action === 'APPROVE_APPLICATION') {
      const apps = getDeliveryApplications();
      const app = apps.find((a) => a.id === applicationId);
      if (!app) {
        return NextResponse.json({ error: 'طلب الانضمام غير موجود' }, { status: 404 });
      }

      app.status = 'APPROVED';
      app.reviewedBy = currentUser.id;
      app.reviewedAt = new Date().toISOString();
      saveDeliveryApplication(app);

      // Create or update user account with role 'delivery'
      let user = getUserByEmail(app.email);
      const now = new Date().toISOString();

      if (!user) {
        const passwordHash = bcrypt.hashSync('courier123', 10);
        user = {
          id: `user-courier-${Date.now()}`,
          name: app.fullName,
          email: app.email,
          phone: app.phone,
          passwordHash,
          role: 'delivery',
          status: 'active',
          createdAt: now,
          updatedAt: now,
        };
        saveUser(user);
      } else {
        user.role = 'delivery';
        user.status = 'active';
        user.updatedAt = now;
        saveUser(user);
      }

      // Create Courier Profile
      const courierProfile: CourierProfile = {
        id: `courier-prof-${Date.now()}`,
        userId: user.id,
        fullName: app.fullName,
        phone: app.phone,
        email: app.email,
        governorate: app.governorate,
        coveredAreas: app.coveredAreas,
        vehicleType: app.vehicleType,
        nationalId: app.nationalId,
        status: 'AVAILABLE',
        rating: 5.0,
        activeOrdersCount: 0,
        totalDeliveredCount: 0,
        createdAt: now,
      };
      saveCourierProfile(courierProfile);

      // Audit Log
      addAuditLog({
        id: `audit-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: 'admin',
        action: 'APPROVE_COURIER_APPLICATION',
        entityType: 'DELIVERY_APPLICATION',
        entityId: app.id,
        details: `الموافقة على انضمام المندوب ${app.fullName} لمنطقة ${app.governorate}`,
        createdAt: now,
      });

      return NextResponse.json({
        success: true,
        message: `تمت الموافقة على المندوب ${app.fullName} وتفعيل حسابه بنجاح`,
      });
    }

    // 2. Reject Application
    if (action === 'REJECT_APPLICATION') {
      const apps = getDeliveryApplications();
      const app = apps.find((a) => a.id === applicationId);
      if (!app) {
        return NextResponse.json({ error: 'طلب الانضمام غير موجود' }, { status: 404 });
      }

      app.status = 'REJECTED';
      app.reviewedBy = currentUser.id;
      app.reviewedAt = new Date().toISOString();
      saveDeliveryApplication(app);

      addAuditLog({
        id: `audit-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: 'admin',
        action: 'REJECT_COURIER_APPLICATION',
        entityType: 'DELIVERY_APPLICATION',
        entityId: app.id,
        details: `رفض طلب انضمام ${app.fullName}`,
        createdAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        message: 'تم رفض طلب الانضمام',
      });
    }

    // 3. Update Courier Status (AVAILABLE, BUSY, SUSPENDED)
    if (action === 'UPDATE_COURIER_STATUS') {
      const couriers = getCourierProfiles();
      const courier = couriers.find((c) => c.id === courierId || c.userId === courierId);
      if (!courier) {
        return NextResponse.json({ error: 'المندوب غير موجود' }, { status: 404 });
      }

      courier.status = status;
      saveCourierProfile(courier);

      return NextResponse.json({
        success: true,
        message: `تم تحديث حالة المندوب إلى: ${status}`,
        courier,
      });
    }

    return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
