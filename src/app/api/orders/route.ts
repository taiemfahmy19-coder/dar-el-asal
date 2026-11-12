import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { isGovernorateSupported } from '@/lib/utils';
import { validateNewOrderPayload } from '@/lib/validation';
import { consumeOrderRateLimit } from '@/lib/rate-limit';
import { getOrders, syncCloudDb, syncCloudDbPush, getDb } from '@/lib/db';
import { verifyCaptchaAnswer, CAPTCHA_ERROR_MESSAGE } from '@/lib/captcha';
import { createOrderServerSide } from '@/lib/order-engine';
import { OrderStatus } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    await syncCloudDb();
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
    await syncCloudDb();
    const body = await req.json();
    const currentUser = await getCurrentUser();

    // ---- Server-side anti-fake-order gate (mirrors the client validation) ----
    // Validates name / phone / email / governorate / city / address /
    // delivery date / cart before anything is allowed to be saved. Prices are
    // independently re-computed inside createOrderServerSide from the trusted
    // server-side product store, never from client input.
    const check = validateNewOrderPayload(body, isGovernorateSupported);
    if (!check.ok) {
      return NextResponse.json(
        { error: check.error, errors: check.errors },
        { status: 400 }
      );
    }
    const input = check.normalized;

    // ---- Anti-spam rate limit (per IP): hard cap on order creation attempts ----
    // Vercel always sends x-forwarded-for; absent IP (tests) is simply allowed.
    const clientIp =
      req.headers
        ?.get('x-forwarded-for')
        ?.split(',')[0]
        ?.trim() || '';
    const verdict = consumeOrderRateLimit(clientIp);
    if (!verdict.allowed) {
      const minutes = Math.ceil((verdict.retryAfterSeconds || 60) / 60);
      return NextResponse.json(
        { error: `تم إرسال عدد كبير من الطلبات من هذا الجهاز مؤقتًا. حاول بعد ${minutes} دقيقة.` },
        { status: 429 }
      );
    }

    // ---- Duplicate-order guard (double-tap / repeated submit) ----
    // Instance-independent: compares against persisted orders from the last
    // 60 seconds with the same phone + same cart. The client ref-guard stays
    // as the first line; this closes it server-side.
    const sixtySecondsAgo = Date.now() - 60_000;
    const itemsKey = [...input.items]
      .map((i) => `${i.productId}:${i.quantity}`)
      .sort()
      .join('|');
    const duplicate = getOrders().find(
      (o) =>
        o.customerPhone === input.customerPhone &&
        Date.parse(o.createdAt || '') > sixtySecondsAgo &&
        Array.isArray(o.items) &&
        [...o.items].map((i) => `${i.productId}:${i.quantity}`).sort().join('|') === itemsKey
    );
    if (duplicate) {
      return NextResponse.json(
        { error: 'يبدو أن طلبك المماثل أُسجِّل قبل لحظات؛ سيتواصل معك فريقنا قريبًا.', duplicate: true },
        { status: 409 }
      );
    }

    // ---- Human-verification gate (last gate before the engine) ----
    // A valid field payload still needs a correct answer to a signed,
    // short-lived arithmetic challenge — blocks scripted fake-order bots.
    const captchaOk = await verifyCaptchaAnswer(
      typeof body.captchaToken === 'string' ? body.captchaToken : '',
      typeof body.captchaAnswer === 'string' || typeof body.captchaAnswer === 'number'
        ? body.captchaAnswer
        : ''
    );
    if (!captchaOk) {
      return NextResponse.json(
        { error: CAPTCHA_ERROR_MESSAGE, errors: { captcha: CAPTCHA_ERROR_MESSAGE } },
        { status: 400 }
      );
    }

    const result = createOrderServerSide({
      userId: currentUser?.id,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      governorate: input.governorate,
      city: input.city,
      streetAddress: input.streetAddress as string,
      buildingDetails: body.buildingDetails,
      notes: body.notes,
      deliveryDate: input.deliveryDate,
      deliveryTimeWindow:
        typeof body.deliveryTimeWindow === 'string' && body.deliveryTimeWindow.trim()
          ? body.deliveryTimeWindow.trim().slice(0, 60)
          : '12:00 م - 03:00 م (ظهراً)',
      items: input.items,
      paymentMethod: 'COD',
    });

    if (!result.success || !result.order) {
      return NextResponse.json({ error: result.error || 'فشل إنشاء الطلب' }, { status: 400 });
    }

    // Immediately push to cloud so PC admin can see this order in realtime
    await syncCloudDbPush(getDb());

    // Sanitize order for customer response
    const { totalCost, estimatedProfit, ...safeOrder } = result.order;
    return NextResponse.json({ success: true, order: safeOrder });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حفظ الطلب' }, { status: 500 });
  }
}
