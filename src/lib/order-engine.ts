import { Order, OrderItem, OrderStatus, UserRole } from './types';
import {
  addAuditLog,
  addNotification,
  getDb,
  getProductById,
  getOrderById,
  saveOrder,
  getCourierProfileByUserId,
  saveCourierProfile,
} from './db';
import { getDeliveryFee } from './utils';

// State machine definition: permitted next states
export const PERMITTED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['AWAITING_SUPPLIER', 'CONFIRMED', 'CANCELLED'],
  AWAITING_SUPPLIER: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY_FOR_DELIVERY', 'CANCELLED'],
  READY_FOR_DELIVERY: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['OUT_FOR_DELIVERY', 'READY_FOR_DELIVERY', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'DELIVERY_FAILED'],
  DELIVERY_FAILED: ['READY_FOR_DELIVERY', 'RETURNED', 'CANCELLED'],
  CANCELLED: [],
  DELIVERED: ['RETURNED'],
  RETURNED: [],
};

// Roles permitted to trigger specific transitions
export function canUserPerformTransition(
  userRole: UserRole,
  fromStatus: OrderStatus,
  toStatus: OrderStatus,
  order?: Order
): { allowed: boolean; reason?: string } {
  if (userRole === 'admin') {
    return { allowed: true };
  }

  if (userRole === 'delivery') {
    if (fromStatus === 'ASSIGNED' && toStatus === 'OUT_FOR_DELIVERY') return { allowed: true };
    if (fromStatus === 'OUT_FOR_DELIVERY' && (toStatus === 'DELIVERED' || toStatus === 'DELIVERY_FAILED')) return { allowed: true };
    return { allowed: false, reason: 'صلاحيات المندوب تقتصر على بدء التوصيل أو تأكيد الاستلام/التعذر للطلبات المسندة إليه فقط' };
  }

  if (userRole === 'customer') {
    if ((fromStatus === 'PENDING' || fromStatus === 'AWAITING_SUPPLIER') && toStatus === 'CANCELLED') {
      // Strictly enforce 6-hour cancellation policy (Directive Sec 11)
      if (order?.cancellationDeadline) {
        const deadlineMs = new Date(order.cancellationDeadline).getTime();
        const nowMs = Date.now();
        if (nowMs > deadlineMs) {
          return {
            allowed: false,
            reason: 'لا يمكن إلغاء الطلب ذاتياً: تبقت أقل من 6 ساعات على موعد التوصيل المجدول وفق سياسة المتجر.',
          };
        }
      }
      return { allowed: true };
    }
    return { allowed: false, reason: 'لا يمكن للعميل إلغاء الطلب بعد دخوله مرحلة التجهيز أو خروجه للتوصيل' };
  }

  return { allowed: false, reason: 'صلاحيات غير كافية لتنفيذ هذا الإجراء' };
}

export function isValidTransition(fromStatus: OrderStatus, toStatus: OrderStatus): boolean {
  const allowed = PERMITTED_TRANSITIONS[fromStatus] || [];
  return allowed.includes(toStatus);
}

export interface CreateOrderInput {
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  governorate: string;
  city: string;
  streetAddress: string;
  buildingDetails?: string;
  notes?: string;
  deliveryDate?: string;
  deliveryTimeWindow?: string;
  items: { productId: string; quantity: number }[];
  paymentMethod: 'COD';
}

function calculateCancellationDeadline(deliveryDate?: string, deliveryTimeWindow?: string): string {
  // If delivery date is specified (e.g. YYYY-MM-DD)
  if (deliveryDate) {
    const d = new Date(deliveryDate);
    // Parse start hour from window or default to 12:00 PM (noon)
    let startHour = 12;
    if (deliveryTimeWindow) {
      if (deliveryTimeWindow.includes('09:00') || deliveryTimeWindow.includes('9:00') || deliveryTimeWindow.includes('صباحاً')) {
        startHour = 9;
      } else if (deliveryTimeWindow.includes('12:00') || deliveryTimeWindow.includes('ظهراً')) {
        startHour = 12;
      } else if (deliveryTimeWindow.includes('03:00') || deliveryTimeWindow.includes('3:00') || deliveryTimeWindow.includes('عصراً')) {
        startHour = 15;
      } else if (deliveryTimeWindow.includes('06:00') || deliveryTimeWindow.includes('6:00') || deliveryTimeWindow.includes('مساءً')) {
        startHour = 18;
      }
    }
    d.setHours(startHour, 0, 0, 0);
    // 6-hour policy: deadline is exactly 6 hours before scheduled start
    const deadlineMs = d.getTime() - (6 * 60 * 60 * 1000);
    return new Date(deadlineMs).toISOString();
  }

  // Fallback: 24 hours from creation time (if scheduled 30h out)
  return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
}

export function createOrderServerSide(input: CreateOrderInput): {
  success: boolean;
  order?: Order;
  error?: string;
} {
  const db = getDb();

  if (!input.items || input.items.length === 0) {
    return { success: false, error: 'سلة المشتريات فارغة' };
  }

  const orderItems: OrderItem[] = [];
  let subtotal = 0;
  let totalCost = 0;
  let hasNeedsConfirmationItem = false;

  const orderId = `ord-${Date.now()}`;

  for (const item of input.items) {
    const product = getProductById(item.productId);
    if (!product || !product.isActive) {
      return { success: false, error: `المنتج غير متوفر أو تم حذفه` };
    }

    if (product.status === 'UNAVAILABLE') {
      return { success: false, error: `المنتج "${product.name}" غير متوفر حالياً لدى المورد` };
    }

    if (product.status === 'NEEDS_CONFIRMATION') {
      hasNeedsConfirmationItem = true;
    }

    const qty = Math.max(1, item.quantity);
    const itemTotal = product.price * qty;
    const itemCostTotal = product.costPrice * qty;

    subtotal += itemTotal;
    totalCost += itemCostTotal;

    orderItems.push({
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orderId,
      productId: product.id,
      productName: product.name,
      productImage: product.images[0] || '',
      unitPrice: product.price,
      costPrice: product.costPrice,
      quantity: qty,
      totalPrice: itemTotal,
    });
  }

  const deliveryFee = getDeliveryFee(input.governorate);
  const totalAmount = subtotal + deliveryFee;
  const estimatedProfit = subtotal - totalCost;

  const now = new Date().toISOString();
  const nextOrderNumberSeq = db.orders.length + 1001;
  const orderNumber = `DO-2026-${nextOrderNumberSeq}`;

  // Initial order status: starts as PENDING / AWAITING_SUPPLIER
  const initialStatus: OrderStatus = hasNeedsConfirmationItem ? 'AWAITING_SUPPLIER' : 'PENDING';

  const cancellationDeadline = calculateCancellationDeadline(input.deliveryDate, input.deliveryTimeWindow);

  const order: Order = {
    id: orderId,
    orderNumber,
    userId: input.userId,
    customerName: input.customerName.trim(),
    customerEmail: input.customerEmail.trim(),
    customerPhone: input.customerPhone.trim(),
    governorate: input.governorate,
    city: input.city.trim(),
    streetAddress: input.streetAddress.trim(),
    buildingDetails: input.buildingDetails?.trim(),
    notes: input.notes?.trim(),
    deliveryDate: input.deliveryDate,
    deliveryTimeWindow: input.deliveryTimeWindow,
    cancellationDeadline,
    quotationStatus: 'NOT_ISSUED',
    subtotal,
    deliveryFee,
    totalAmount,
    totalCost,
    estimatedProfit,
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    orderStatus: initialStatus,
    supplierStatus: hasNeedsConfirmationItem ? 'PENDING' : 'CONFIRMED',
    items: orderItems,
    statusHistory: [
      {
        id: `hist-${Date.now()}`,
        orderId,
        previousStatus: null,
        newStatus: initialStatus,
        changedByUserId: input.userId || 'guest',
        changedByName: input.customerName,
        notes: hasNeedsConfirmationItem
          ? 'تم تسجيل طلب رغبة الشراء بنجاح، ويتضمن منتجات قيد تأكيد توفر الدفعة لدى المورد'
          : 'تم تسجيل طلب رغبة الشراء بنجاح وجارٍ مراجعته من الإدارة لتأكيد عرض السعر',
        createdAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  saveOrder(order);

  // Notify admin
  const adminUsers = db.users.filter((u) => u.role === 'admin');
  for (const admin of adminUsers) {
    addNotification({
      id: `notif-${Date.now()}-${admin.id}`,
      userId: admin.id,
      title: `طلب جديد: ${orderNumber}`,
      message: `طلب جديد بقيمة ${totalAmount} ج.م من العميل ${input.customerName}`,
      link: `/admin/orders/${order.id}`,
      isRead: false,
      createdAt: now,
    });
  }

  // Audit log
  addAuditLog({
    id: `audit-${Date.now()}`,
    userId: input.userId || 'guest',
    userName: input.customerName,
    userRole: input.userId ? 'customer' : 'customer',
    action: 'CREATE_ORDER',
    entityType: 'ORDER',
    entityId: order.id,
    details: `إنشاء الطلب رقم ${orderNumber} بإجمالي ${totalAmount} ج.م`,
    createdAt: now,
  });

  return { success: true, order };
}

export function executeOrderStatusTransition(params: {
  orderId: string;
  newStatus: OrderStatus;
  userId: string;
  userName: string;
  userRole: UserRole;
  notes?: string;
  failureReason?: string;
  cancelReason?: string;
}): { success: boolean; message: string; order?: Order } {
  const order = getOrderById(params.orderId);
  if (!order) {
    return { success: false, message: 'الطلب غير موجود' };
  }

  // Check state machine permission
  if (!isValidTransition(order.orderStatus, params.newStatus)) {
    return {
      success: false,
      message: `لا يمكن نقل الطلب من حالة "${order.orderStatus}" إلى "${params.newStatus}" مباشرة`,
    };
  }

  // Check role authorization with 6-hour cancellation check
  const authCheck = canUserPerformTransition(params.userRole, order.orderStatus, params.newStatus, order);
  if (!authCheck.allowed) {
    return {
      success: false,
      message: authCheck.reason || 'ليس لديك صلاحية تنفيذ هذا الانتقال',
    };
  }

  const prevStatus = order.orderStatus;
  const now = new Date().toISOString();

  order.orderStatus = params.newStatus;
  order.updatedAt = now;

  if (params.cancelReason) order.cancelReason = params.cancelReason;
  if (params.failureReason) order.failureReason = params.failureReason;

  if (params.newStatus === 'CONFIRMED') {
    order.supplierStatus = 'CONFIRMED';
  }

  // Courier workload updates
  if (order.assignedAgentId) {
    const courier = getCourierProfileByUserId(order.assignedAgentId);
    if (courier) {
      if (params.newStatus === 'DELIVERED') {
        courier.activeOrdersCount = Math.max(0, courier.activeOrdersCount - 1);
        courier.totalDeliveredCount += 1;
        saveCourierProfile(courier);
      } else if (params.newStatus === 'DELIVERY_FAILED' || params.newStatus === 'CANCELLED') {
        courier.activeOrdersCount = Math.max(0, courier.activeOrdersCount - 1);
        saveCourierProfile(courier);
      }
    }
  }

  order.statusHistory.push({
    id: `hist-${Date.now()}`,
    orderId: order.id,
    previousStatus: prevStatus,
    newStatus: params.newStatus,
    changedByUserId: params.userId,
    changedByName: params.userName,
    notes: params.notes || params.failureReason || params.cancelReason,
    createdAt: now,
  });

  saveOrder(order);

  // Notify customer if registered
  if (order.userId) {
    addNotification({
      id: `notif-${Date.now()}-${order.userId}`,
      userId: order.userId,
      title: `تحديث لطلبك ${order.orderNumber}`,
      message: params.notes || `تم تحديث حالة طلبك إلى: ${params.newStatus}`,
      link: `/orders/${order.id}`,
      isRead: false,
      createdAt: now,
    });
  }

  // Audit log
  addAuditLog({
    id: `audit-${Date.now()}`,
    userId: params.userId,
    userName: params.userName,
    userRole: params.userRole,
    action: 'UPDATE_ORDER_STATUS',
    entityType: 'ORDER',
    entityId: order.id,
    details: `تحديث الحالة من ${prevStatus} إلى ${params.newStatus}. ملاحظات: ${params.notes || ''}`,
    createdAt: now,
  });

  return { success: true, message: 'تم تحديث حالة الطلب بنجاح', order };
}

// ---------------- QUOTATION WORKFLOW (Directive Sec 7 & 12) ----------------

export function prepareOrderQuotation(params: {
  orderId: string;
  deliveryFee: number;
  adminUserId: string;
  adminUserName: string;
  notes?: string;
}): { success: boolean; message: string; order?: Order } {
  const order = getOrderById(params.orderId);
  if (!order) {
    return { success: false, message: 'الطلب غير موجود' };
  }

  const now = new Date().toISOString();
  order.deliveryFee = Math.max(0, params.deliveryFee);
  order.totalAmount = order.subtotal + order.deliveryFee;
  order.quotationStatus = 'SENT';
  order.quotationNumber = `Q-${order.orderNumber}`;
  order.quotationSentAt = now;
  order.updatedAt = now;

  order.statusHistory.push({
    id: `hist-${Date.now()}`,
    orderId: order.id,
    previousStatus: order.orderStatus,
    newStatus: order.orderStatus,
    changedByUserId: params.adminUserId,
    changedByName: params.adminUserName,
    notes: `تم إصدار عرض السعر النهائي رقم ${order.quotationNumber} بقيمة إجمالية ${order.totalAmount} ج.م (شاملة الشحن ${order.deliveryFee} ج.م). ${params.notes || ''}`,
    createdAt: now,
  });

  saveOrder(order);

  // Notify customer
  if (order.userId) {
    addNotification({
      id: `notif-${Date.now()}-${order.userId}`,
      userId: order.userId,
      title: `عرض سعر نهائي لطلبك ${order.orderNumber}`,
      message: `أصدرت الإدارة عرض السعر رقم ${order.quotationNumber} بقيمة إجمالية ${order.totalAmount} ج.م. يرجى مراجعته واعتماده لتأكيد خروج الشحنة.`,
      link: `/orders/${order.id}`,
      isRead: false,
      createdAt: now,
    });
  }

  // Audit log
  addAuditLog({
    id: `audit-${Date.now()}`,
    userId: params.adminUserId,
    userName: params.adminUserName,
    userRole: 'admin',
    action: 'PREPARE_QUOTATION',
    entityType: 'ORDER',
    entityId: order.id,
    details: `إصدار عرض السعر رقم ${order.quotationNumber} برسوم توصيل ${order.deliveryFee} ج.م`,
    createdAt: now,
  });

  return { success: true, message: 'تم إعداد وإرسال عرض السعر النهائي بنجاح', order };
}

export function customerAcceptQuotation(params: {
  orderId: string;
  userId: string;
  userName: string;
}): { success: boolean; message: string; order?: Order } {
  const order = getOrderById(params.orderId);
  if (!order) {
    return { success: false, message: 'الطلب غير موجود' };
  }

  if (order.quotationStatus !== 'SENT') {
    return { success: false, message: 'لا يوجد عرض سعر معلق بانتظار الاعتماد' };
  }

  const now = new Date().toISOString();
  order.quotationStatus = 'ACCEPTED';
  order.quotationAcceptedAt = now;
  order.orderStatus = 'CONFIRMED';
  order.supplierStatus = 'CONFIRMED';
  order.updatedAt = now;

  order.statusHistory.push({
    id: `hist-${Date.now()}`,
    orderId: order.id,
    previousStatus: 'PENDING',
    newStatus: 'CONFIRMED',
    changedByUserId: params.userId,
    changedByName: params.userName,
    notes: `قام العميل بقبول واعتماد عرض السعر النهائي (${order.totalAmount} ج.م) وتم تأكيد الطلب رسمياً للبدء في التجهيز والشحن.`,
    createdAt: now,
  });

  saveOrder(order);

  addAuditLog({
    id: `audit-${Date.now()}`,
    userId: params.userId,
    userName: params.userName,
    userRole: 'customer',
    action: 'ACCEPT_QUOTATION',
    entityType: 'ORDER',
    entityId: order.id,
    details: `موافقة العميل على عرض السعر ${order.quotationNumber} والانتقال للحالة CONFIRMED`,
    createdAt: now,
  });

  return { success: true, message: 'تم اعتماد عرض السعر وتأكيد الطلب بنجاح', order };
}

export function customerRejectQuotation(params: {
  orderId: string;
  userId: string;
  userName: string;
  reason?: string;
}): { success: boolean; message: string; order?: Order } {
  const order = getOrderById(params.orderId);
  if (!order) {
    return { success: false, message: 'الطلب غير موجود' };
  }

  const now = new Date().toISOString();
  order.quotationStatus = 'REJECTED';
  order.orderStatus = 'CANCELLED';
  order.cancelReason = params.reason || 'رفض العميل عرض السعر النهائي';
  order.updatedAt = now;

  order.statusHistory.push({
    id: `hist-${Date.now()}`,
    orderId: order.id,
    previousStatus: 'PENDING',
    newStatus: 'CANCELLED',
    changedByUserId: params.userId,
    changedByName: params.userName,
    notes: `قام العميل برفض عرض السعر النهائي. سبب الإلغاء: ${order.cancelReason}`,
    createdAt: now,
  });

  saveOrder(order);

  addAuditLog({
    id: `audit-${Date.now()}`,
    userId: params.userId,
    userName: params.userName,
    userRole: 'customer',
    action: 'REJECT_QUOTATION',
    entityType: 'ORDER',
    entityId: order.id,
    details: `رفض العميل لعرض السعر ${order.quotationNumber}. السبب: ${order.cancelReason}`,
    createdAt: now,
  });

  return { success: true, message: 'تم إلغاء الطلب بناءً على رفض عرض السعر', order };
}
