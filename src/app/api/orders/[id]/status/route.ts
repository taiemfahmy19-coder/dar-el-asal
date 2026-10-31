import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getOrderById, saveOrder, addAuditLog, getCourierProfileByUserId, saveCourierProfile, addNotification } from '@/lib/db';
import { executeOrderStatusTransition } from '@/lib/order-engine';
import { OrderStatus } from '@/lib/types';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول لتنفيذ هذا الإجراء' }, { status: 401 });
    }

    const order = getOrderById(params.id);
    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    const body = await req.json();
    const { action, newStatus, notes, courierId, failureReason, cancelReason } = body;

    // Action 1: Manual courier assignment (Admin only)
    if (action === 'ASSIGN_COURIER') {
      if (currentUser.role !== 'admin') {
        return NextResponse.json({ error: 'صلاحية إسناد الطلب للمدير فقط' }, { status: 403 });
      }

      if (!courierId) {
        return NextResponse.json({ error: 'يرجى اختيار مندوب التوصيل' }, { status: 400 });
      }

      const courier = getCourierProfileByUserId(courierId);
      if (!courier) {
        return NextResponse.json({ error: 'بيانات المندوب غير موجودة' }, { status: 404 });
      }

      if (courier.status === 'SUSPENDED') {
        return NextResponse.json({ error: 'لا يمكن إسناد الطلب لمندوب حسابه موقوف' }, { status: 400 });
      }

      const now = new Date().toISOString();
      const prevCourierId = order.assignedAgentId;

      // Adjust courier workload
      if (prevCourierId && prevCourierId !== courierId) {
        const oldCourier = getCourierProfileByUserId(prevCourierId);
        if (oldCourier) {
          oldCourier.activeOrdersCount = Math.max(0, oldCourier.activeOrdersCount - 1);
          saveCourierProfile(oldCourier);
        }
      }

      order.assignedAgentId = courier.userId;
      order.assignedAgentName = courier.fullName;
      order.assignedAgentPhone = courier.phone;
      order.assignedAt = now;
      order.orderStatus = 'ASSIGNED';
      order.updatedAt = now;

      courier.activeOrdersCount += 1;
      saveCourierProfile(courier);

      order.statusHistory.push({
        id: `hist-${Date.now()}`,
        orderId: order.id,
        previousStatus: order.orderStatus,
        newStatus: 'ASSIGNED',
        changedByUserId: currentUser.id,
        changedByName: currentUser.name,
        notes: `تم إسناد الطلب يدويًا للمندوب: ${courier.fullName}`,
        createdAt: now,
      });

      saveOrder(order);

      // Notify Courier
      addNotification({
        id: `notif-${Date.now()}`,
        userId: courier.userId,
        title: 'مهمة توصيل جديدة مسندة إليك',
        message: `تم إسناد الطلب رقم ${order.orderNumber} في ${order.city} إليك.`,
        link: '/delivery/dashboard',
        isRead: false,
        createdAt: now,
      });

      // Audit Log
      addAuditLog({
        id: `audit-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'MANUAL_ASSIGN_COURIER',
        entityType: 'ORDER',
        entityId: order.id,
        details: `إسناد الطلب للمندوب ${courier.fullName}`,
        createdAt: now,
      });

      return NextResponse.json({ success: true, message: 'تم إسناد الطلب بنجاح', order });
    }

    // Action 2: Standard State Machine Transition
    if (newStatus) {
      // If delivery courier is updating, ensure it's their assigned order
      if (currentUser.role === 'delivery' && order.assignedAgentId !== currentUser.id) {
        return NextResponse.json(
          { error: 'غير مصرح لك بتحديث حالة طلب غير مسند إليك' },
          { status: 403 }
        );
      }

      // If delivery failed, failureReason is mandatory
      if (newStatus === 'DELIVERY_FAILED' && !failureReason) {
        return NextResponse.json(
          { error: 'يجب توضيح سبب تعذر التسليم (مثل: العميل لم يرد، العنوان غير دقيق)' },
          { status: 400 }
        );
      }

      const result = executeOrderStatusTransition({
        orderId: order.id,
        newStatus: newStatus as OrderStatus,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        notes,
        failureReason,
        cancelReason,
      });

      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: result.message, order: result.order });
    }

    return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 });
  } catch (error) {
    console.error('Status transition error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم أثناء تحديث الحالة' }, { status: 500 });
  }
}
