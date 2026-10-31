import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getOrderById } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const order = getOrderById(params.id);
    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    const currentUser = await getCurrentUser();

    // Check authorization
    if (currentUser) {
      if (currentUser.role === 'admin') {
        return NextResponse.json({ order });
      }

      if (currentUser.role === 'delivery') {
        if (order.assignedAgentId !== currentUser.id) {
          return NextResponse.json(
            { error: 'غير مصرح لك بالاطلاع على هذا الطلب' },
            { status: 403 }
          );
        }
        // Mask costs
        const { totalCost, estimatedProfit, items, ...rest } = order;
        const safeItems = items.map(({ costPrice, ...iRest }) => iRest);
        return NextResponse.json({ order: { ...rest, items: safeItems } });
      }

      // Customer
      if (order.userId && order.userId !== currentUser.id) {
        return NextResponse.json(
          { error: 'غير مصرح لك بالاطلاع على هذا الطلب' },
          { status: 403 }
        );
      }
    }

    // Public / Customer view: strip confidential supplier costs
    const { totalCost, estimatedProfit, items, ...rest } = order;
    const safeItems = items.map(({ costPrice, ...iRest }) => iRest);
    return NextResponse.json({ order: { ...rest, items: safeItems } });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب الطلب' }, { status: 500 });
  }
}
