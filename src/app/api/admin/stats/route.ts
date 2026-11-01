import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb, syncCloudDb, syncCloudDbPush, resetDatabaseStatsAndOrders } from '@/lib/db';

export async function GET() {
  try {
    await syncCloudDb();
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'الصلاحية للمدير فقط' }, { status: 403 });
    }

    const db = getDb();
    const orders = db.orders;

    // Status breakdown
    const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'PENDING').length;
    const awaitingSupplierCount = orders.filter((o) => o.orderStatus === 'AWAITING_SUPPLIER').length;
    const preparingCount = orders.filter((o) => o.orderStatus === 'PREPARING').length;
    const readyForDeliveryCount = orders.filter((o) => o.orderStatus === 'READY_FOR_DELIVERY').length;
    const assignedCount = orders.filter((o) => o.orderStatus === 'ASSIGNED').length;
    const outForDeliveryCount = orders.filter((o) => o.orderStatus === 'OUT_FOR_DELIVERY').length;
    const deliveredCount = orders.filter((o) => o.orderStatus === 'DELIVERED').length;
    const failedOrCancelledCount = orders.filter(
      (o) => o.orderStatus === 'CANCELLED' || o.orderStatus === 'DELIVERY_FAILED' || o.orderStatus === 'RETURNED'
    ).length;

    // Financial calculations (excluding cancelled orders from active revenue)
    const validOrders = orders.filter(
      (o) => o.orderStatus !== 'CANCELLED' && o.orderStatus !== 'DELIVERY_FAILED'
    );

    const totalRevenue = validOrders.reduce((sum, o) => sum + o.subtotal, 0);
    const totalCostOfGoods = validOrders.reduce((sum, o) => sum + o.totalCost, 0);
    const estimatedNetProfit = totalRevenue - totalCostOfGoods;

    // Low stock products (< 15 units)
    const lowStockProducts = db.products.filter((p) => p.isActive && p.stockQuantity <= 15);

    // Pending courier applications
    const pendingApplicationsCount = db.deliveryApplications.filter((a) => a.status === 'PENDING').length;

    return NextResponse.json({
      stats: {
        totalOrders: orders.length,
        pendingOrdersCount,
        awaitingSupplierCount,
        preparingCount,
        readyForDeliveryCount,
        assignedCount,
        outForDeliveryCount,
        deliveredCount,
        failedOrCancelledCount,
        totalRevenue,
        totalCostOfGoods,
        estimatedNetProfit,
        lowStockProductsCount: lowStockProducts.length,
        pendingApplicationsCount,
        activeCouriersCount: db.courierProfiles.filter((c) => c.status === 'AVAILABLE').length,
        totalCustomersCount: db.users.filter((u) => u.role === 'customer').length,
      },
      lowStockProducts,
      recentOrders: orders.slice(0, 5),
    });
  } catch (error) {
    return NextResponse.json({ error: 'فشل احتساب الإحصائيات' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'الصلاحية للمدير فقط' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    if (body.action === 'reset' || body.action === 'zero_all') {
      const resetDb = resetDatabaseStatsAndOrders();
      await syncCloudDbPush(resetDb);
      return NextResponse.json({
        success: true,
        message: 'تم تصفير كافة الأرباح والإحصائيات والطلبات بنجاح وبدء الحساب من الصفر (0)',
      });
    }

    return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'فشل تصفير الإحصائيات' }, { status: 500 });
  }
}
