import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getOrders } from '@/lib/db';
import { createOrderServerSide } from '@/lib/order-engine';
import { OrderStatus } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول لعرض الطلبات' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = (searchParams.get('status') as OrderStatus) || undefined;

    let orders;

    if (currentUser.role === 'admin') {
      const courierId = searchParams.get('courierId') || undefined;
      orders = getOrders({ status, courierId });
    } else if (currentUser.role === 'delivery') {
      orders = getOrders({ courierId: currentUser.id, status });
      // Couriers must NOT see supplier purchase costs or profits!
      orders = orders.map((o) => {
        const { totalCost, estimatedProfit, items, ...rest } = o;
        const safeItems = items.map((i) => {
          const { costPrice, ...iRest } = i;
          return iRest;
        });
        return { ...rest, items: safeItems };
      });
    } else {
      // Customer
      orders = getOrders({ userId: currentUser.id, status });
      // Customers must NOT see supplier purchase costs or profits!
      orders = orders.map((o) => {
        const { totalCost, estimatedProfit, items, ...rest } = o;
        const safeItems = items.map((i) => {
          const { costPrice, ...iRest } = i;
          return iRest;
        });
        return { ...rest, items: safeItems };
      });
    }

    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json({ error: 'فشل جلب الطلبات' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const currentUser = await getCurrentUser();

    if (!body.customerName || !body.customerPhone || !body.governorate || !body.streetAddress) {
      return NextResponse.json(
        { error: 'يرجى استكمال بيانات التوصيل (الاسم، رقم الهاتف، المحافظة، العنوان بالتفصيل)' },
        { status: 400 }
      );
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: 'سلة المشتريات فارغة' }, { status: 400 });
    }

    const result = createOrderServerSide({
      userId: currentUser?.id,
      customerName: body.customerName,
      customerEmail: body.customerEmail || currentUser?.email || 'guest@bazaar.local',
      customerPhone: body.customerPhone,
      governorate: body.governorate,
      city: body.city || body.governorate,
      streetAddress: body.streetAddress,
      buildingDetails: body.buildingDetails,
      notes: body.notes,
      items: body.items,
      paymentMethod: body.paymentMethod || 'COD',
    });

    if (!result.success || !result.order) {
      return NextResponse.json({ error: result.error || 'فشل إنشاء الطلب' }, { status: 400 });
    }

    // Sanitize order for customer response
    const { totalCost, estimatedProfit, ...safeOrder } = result.order;
    return NextResponse.json({ success: true, order: safeOrder });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حفظ الطلب' }, { status: 500 });
  }
}
