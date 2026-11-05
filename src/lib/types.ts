export type UserRole = 'customer' | 'delivery' | 'admin';

export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  /** Server-side session invalidation counter, bumped on logout. */
  tokenVersion?: number;
  createdAt: string;
  updatedAt: string;
}

export type SupplierProductStatus = 'AVAILABLE' | 'NEEDS_CONFIRMATION' | 'UNAVAILABLE';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;              // Retail price to customer
  originalPrice?: number;     // For discounted display
  costPrice: number;          // Purchase cost from supplier (Internal / Admin only)
  categoryId: string;
  categoryName?: string;
  weightVolume: string;       // e.g. "500 جرام", "1 لتر"
  ingredients?: string;
  nutritionalInfo?: string;   // e.g. "سعرات: 304 | بروتين: 0.3g"
  origin: string;             // e.g. "مزارع الواحات البحرية", "معاصر سيوة"
  supplierId: string;
  supplierName?: string;
  status: SupplierProductStatus;
  stockQuantity: number;
  images: string[];
  videoUrl?: string;
  isFeatured: boolean;
  isNew: boolean;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  displayOrder: number;
  productCount?: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  productsSupplied: string;
  notes?: string;
  lastVerifiedAt: string;
  priceHistory?: { date: string; note: string }[];
  createdAt: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'AWAITING_SUPPLIER'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_DELIVERY'
  | 'ASSIGNED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'DELIVERY_FAILED'
  | 'CANCELLED'
  | 'RETURNED';

export type PaymentMethod = 'COD' | 'CARD' | 'INSTAPAY';
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string;
  unitPrice: number;
  costPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface OrderStatusHistoryItem {
  id: string;
  orderId: string;
  previousStatus: OrderStatus | null;
  newStatus: OrderStatus;
  changedByUserId: string;
  changedByName: string;
  notes?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  governorate: string;
  city: string;
  streetAddress: string;
  buildingDetails?: string;
  notes?: string;
  
  // Financials
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  totalCost: number;       // Admin only: sum of items cost
  estimatedProfit: number; // Admin only: subtotal - totalCost
  
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  
  // Workflow
  orderStatus: OrderStatus;
  supplierStatus: 'PENDING' | 'CONFIRMED' | 'OUT_OF_STOCK';
  assignedAgentId?: string;
  assignedAgentName?: string;
  assignedAgentPhone?: string;
  assignedAt?: string;

  // Delivery Scheduling & Quotation Workflow (Directive Sec 7, 10, 11)
  deliveryDate?: string;
  deliveryTimeWindow?: string;
  cancellationDeadline?: string; // 6-hour policy strictly calculated on backend
  quotationStatus?: 'NOT_ISSUED' | 'PENDING_REVIEW' | 'SENT' | 'ACCEPTED' | 'REJECTED';
  quotationNumber?: string;
  quotationSentAt?: string;
  quotationAcceptedAt?: string;
  
  cancelReason?: string;
  failureReason?: string;
  
  items: OrderItem[];
  statusHistory: OrderStatusHistoryItem[];
  
  createdAt: string;
  updatedAt: string;
}

export type CourierStatus = 'AVAILABLE' | 'BUSY' | 'SUSPENDED';

export interface CourierProfile {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  governorate: string;
  coveredAreas: string;
  vehicleType: string;
  nationalId: string;
  status: CourierStatus;
  rating: number;
  activeOrdersCount: number;
  totalDeliveredCount: number;
  createdAt: string;
}

export type DeliveryApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface DeliveryApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  governorate: string;
  coveredAreas: string;
  vehicleType: string;
  nationalId: string;
  status: DeliveryApplicationStatus;
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface CustomerAddress {
  id: string;
  userId: string;
  label: string; // e.g. "المنزل", "العمل"
  recipientName: string;
  phone: string;
  governorate: string;
  city: string;
  streetAddress: string;
  buildingDetails?: string;
  isDefault: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'order';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  storePhone: string;
  storeEmail: string;
  storeAddress: string;
  currency: string;
  freeShippingThreshold: number;
  defaultDeliveryFee: number;
  governorateDeliveryFees: Record<string, number>;
  minOrderAmount: number;
  orderConfirmationNote: string;
  enableAutoAssignment: boolean;
  autoAssignMaxOrdersPerCourier: number;
}
