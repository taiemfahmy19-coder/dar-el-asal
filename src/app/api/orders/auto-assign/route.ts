import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getOrders, autoAssignOrder, syncCloudDb, syncCloudDbPush, getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    await syncCloudDb();
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'صلاحية التوزيع التلقائي للمدير فقط' }, { status: 403 });
    }

    const { orderId } = await req.json().catch(() => ({}));

    if (orderId) {
      // Auto assign specific order
      const result = autoAssignOrder(orderId, currentUser.id, currentUser.name);
      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: result.message, courier: result.courier });
    }

    // Auto assign all READY_FOR_DELIVERY orders that don't have an assigned courier yet
    const unassignedOrders = getOrders({ status: 'READY_FOR_DELIVERY' }).filter(
      (o) => !o.assignedAgentId
    );

    if (unassignedOrders.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'لا توجد طلبات جاهزة بانتظار التوزيع حالياً',
        assignedCount: 0,
      });
    }

    let assignedCount = 0;
    const errors: string[] = [];

    for (const ord of unassignedOrders) {
      const res = autoAssignOrder(ord.id, currentUser.id, currentUser.name);
      if (res.success) {
        assignedCount++;
      } else {
        errors.push(`${ord.orderNumber}: ${res.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `تم التوزيع التلقائي لعدد ${assignedCount} طلب بنجاح`,
      assignedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ أثناء تنفيذ التوزيع التلقائي' }, { status: 500 });
  }
}
