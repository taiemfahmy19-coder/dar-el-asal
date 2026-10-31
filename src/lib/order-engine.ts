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
  toStatus: OrderStatus
): boolean {
  if (userRole === 'admin') {
    return true; // Admin can manage transitions
  }

  if (userRole === 'delivery') {
    // Delivery agent can only perform specific lifecycle transitions on assigned orders:
    // ASSIGNED -> OUT_FOR_DELIVERY
    // OUT_FOR_DELIVERY -> DELIVERED or DELIVERY_FAILED
    if (fromStatus === 'ASSIGNED' && toStatus === 'OUT_FOR_DELIVERY') return true;
    if (fromStatus === 'OUT_FOR_DELIVERY' && (toStatus === 'DELIVERED' || toStatus === 'DELIVERY_FAILED')) return true;
    return false;
  }

  if (userRole === 'customer') {
    // Customer can only cancel their order while still PENDING
    if (fromStatus === 'PENDING' && toStatus === 'CANCELLED') return true;
    return false;
  }

  return false;
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
  items: { productId: string; quantity: number }[];
  paymentMethod: 'COD' | 'CARD' | 'INSTAPAY';
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
  const orderNumber = `BZR-2026-${nextOrderNumberSeq}`;

  // Initial order status based on products: if any item needs confirmation, set to AWAITING_SUPPLIER, otherwise PENDING
  const initialStatus: OrderStatus = hasNeedsConfirmationItem ? 'AWAITING_SUPPLIER' : 'PENDING';

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
    subtotal,
    deliveryFee,
    totalAmount,
    totalCost,
    estimatedProfit,
    paymentMethod: input.paymentMethod,
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
          ? 'تم إنشاء الطلب بنجاح، ويتضمن منتجات تتطلب تأكيد التوفر لدى المورد'
          : 'تم إنشاء الطلب وجارٍ مراجعته وتجهيزه',
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

  // Check role authorization
  if (!canUserPerformTransition(params.userRole, order.orderStatus, params.newStatus)) {
    return {
      success: false,
      message: 'ليس لديك صلاحية تنفيذ هذا الانتقال',
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
