import fs from 'fs';
import path from 'path';
import {
  AuditLog,
  Category,
  CourierProfile,
  CustomerAddress,
  DeliveryApplication,
  Notification,
  Order,
  OrderStatus,
  Product,
  Review,
  StoreSettings,
  Supplier,
  User,
} from './types';
import {
  SEED_CATEGORIES,
  SEED_COURIER_PROFILES,
  SEED_DELIVERY_APPLICATIONS,
  SEED_ORDERS,
  SEED_PRODUCTS,
  SEED_REVIEWS,
  SEED_STORE_SETTINGS,
  SEED_SUPPLIERS,
  SEED_USERS,
} from '@/data/seed';

export interface DatabaseState {
  users: User[];
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  orders: Order[];
  courierProfiles: CourierProfile[];
  deliveryApplications: DeliveryApplication[];
  reviews: Review[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  addresses: CustomerAddress[];
  favorites: { id: string; userId: string; productId: string; createdAt: string }[];
  settings: StoreSettings;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'darelasal-store.json');
const FALLBACK_TMP_FILE = path.join('/tmp', 'darelasal-store.json');

const CLOUD_GIST_ID = process.env.GITHUB_SYNC_GIST_ID || '6ff052b0bf27269c4937e5c2ca7d48b2';
const CLOUD_GIST_TOKEN = process.env.GITHUB_SYNC_TOKEN || '';
let lastCloudSyncTime = 0;
const SYNC_CACHE_TTL = 2000;

// In-memory cache
let inMemoryDb: DatabaseState | null = null;

function ensureDataDirectory() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {
    // Read-only filesystem in serverless environments (like Vercel)
  }
}

function getInitialDatabaseState(): DatabaseState {
  return {
    users: [...SEED_USERS],
    products: [...SEED_PRODUCTS],
    categories: [...SEED_CATEGORIES],
    suppliers: [...SEED_SUPPLIERS],
    orders: [...SEED_ORDERS],
    courierProfiles: [...SEED_COURIER_PROFILES],
    deliveryApplications: [...SEED_DELIVERY_APPLICATIONS],
    reviews: [...SEED_REVIEWS],
    notifications: [
      {
        id: 'notif-1',
        userId: 'user-admin-1',
        title: 'طلب انضمام مندوب جديد',
        message: 'قدم ياسر كمال طلباً للانضمام إلى فريق توصيل الإسكندرية.',
        link: '/admin/couriers',
        isRead: false,
        createdAt: '2026-10-24T14:35:00.000Z',
      },
      {
        id: 'notif-2',
        userId: 'user-courier-1',
        title: 'مهمة توصيل جديدة مسندة',
        message: 'تم إسناد الطلب رقم DO-2026-1001 في منطقة المنتزه بالإسكندرية إليك.',
        link: '/delivery/dashboard',
        isRead: false,
        createdAt: '2026-10-25T11:05:00.000Z',
      },
      {
        id: 'notif-3',
        userId: 'user-customer-1',
        title: 'شحنتك في الطريق!',
        message: 'خرج المندوب لتوصيل طلبك رقم DO-2026-1001.',
        link: '/orders/ord-1001',
        isRead: false,
        createdAt: '2026-10-25T11:32:00.000Z',
      },
    ],
    auditLogs: [
      {
        id: 'audit-1',
        userId: 'user-admin-1',
        userName: 'شادي محمد توفيق',
        userRole: 'admin',
        action: 'UPDATE_ORDER_STATUS',
        entityType: 'ORDER',
        entityId: 'ord-1001',
        details: 'تم تحديث حالة الطلب إلى CONFIRMED بعد التواصل مع المورد',
        createdAt: '2026-10-25T09:15:00.000Z',
      },
      {
        id: 'audit-2',
        userId: 'user-admin-1',
        userName: 'شادي محمد توفيق',
        userRole: 'admin',
        action: 'ASSIGN_COURIER',
        entityType: 'ORDER',
        entityId: 'ord-1001',
        details: 'تم إسناد الطلب للمندوب أحمد محمود النجار',
        createdAt: '2026-10-25T11:00:00.000Z',
      },
    ],
    addresses: [
      {
        id: 'addr-1',
        userId: 'user-customer-1',
        label: 'المنزل',
        recipientName: 'سارة عبد الله',
        phone: '01098765432',
        governorate: 'القاهرة',
        city: 'المعادي',
        streetAddress: 'شارع 9، دجلة المعادي',
        buildingDetails: 'عمارة 14، الدور الثالث',
        isDefault: true,
      },
    ],
    favorites: [
      {
        id: 'fav-1',
        userId: 'user-customer-1',
        productId: 'prod-honey-sidr',
        createdAt: '2026-10-20T10:00:00.000Z',
      },
    ],
    settings: { ...SEED_STORE_SETTINGS },
  };
}

export function getDb(): DatabaseState {
  if (inMemoryDb) {
    return inMemoryDb;
  }

  ensureDataDirectory();

  // 1. Check if serverless /tmp fallback has newer data
  if (fs.existsSync(FALLBACK_TMP_FILE)) {
    try {
      const tmpStats = fs.statSync(FALLBACK_TMP_FILE);
      let isTmpPreferred = true;

      if (fs.existsSync(DB_FILE)) {
        try {
          const dbStats = fs.statSync(DB_FILE);
          if (dbStats.mtimeMs > tmpStats.mtimeMs) {
            isTmpPreferred = false;
          }
        } catch {}
      }

      if (isTmpPreferred) {
        const tmpData = fs.readFileSync(FALLBACK_TMP_FILE, 'utf-8');
        inMemoryDb = JSON.parse(tmpData);
        return inMemoryDb!;
      }
    } catch (err) {
      console.warn('Failed reading fallback /tmp store:', err);
    }
  }

  // 2. Try reading from primary file
  if (fs.existsSync(DB_FILE)) {
    try {
      const fileData = fs.readFileSync(DB_FILE, 'utf-8');
      inMemoryDb = JSON.parse(fileData);
      return inMemoryDb!;
    } catch (err) {
      console.error('Failed reading primary store, checking fallback:', err);
    }
  }

  const initialState = getInitialDatabaseState();
  inMemoryDb = initialState;
  saveDb(initialState);
  return inMemoryDb;
}

// 2026-11-06 anti-wipe guard: remember the last cloud-observed orders count so
// no code path can quietly overwrite a non-empty cloud order list with an
// empty one (this exact failure mode once wiped the production orders from a
// cold serverless instance pushing a stale local file).
let lastSeenCloudOrdersCount: number | null = null;

export async function syncCloudDb(force: boolean = false): Promise<DatabaseState> {
  const now = Date.now();
  if (!force && inMemoryDb && now - lastCloudSyncTime < SYNC_CACHE_TTL) {
    return inMemoryDb;
  }

  try {
    const res = await fetch(`https://api.github.com/gists/${CLOUD_GIST_ID}`, {
      headers: {
        Authorization: `token ${CLOUD_GIST_TOKEN}`,
        'User-Agent': 'DarElAsal-App',
        Accept: 'application/vnd.github.v3+json',
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.files?.['db.json']?.content) {
        const remoteDb = JSON.parse(data.files['db.json'].content) as DatabaseState;
        if (remoteDb && Array.isArray(remoteDb.products)) {
          inMemoryDb = remoteDb;
          lastCloudSyncTime = now;
          lastSeenCloudOrdersCount = Array.isArray(remoteDb.orders) ? remoteDb.orders.length : 0;
          try {
            fs.writeFileSync(FALLBACK_TMP_FILE, JSON.stringify(remoteDb, null, 2), 'utf-8');
          } catch {}
          return inMemoryDb;
        }
      }
    }
  } catch (err) {
    console.warn('Cloud DB sync read fallback to local:', err);
  }

  return getDb();
}

export async function syncCloudDbPush(state: DatabaseState): Promise<void> {
  // WIPE-GUARD: a push that would clear a non-empty cloud order list is
  // refused unless the instance has actually pulled the cloud first and the
  // cloud itself is empty. Customer order data may never be auto-destroyed.
  const incomingCount = Array.isArray(state.orders) ? state.orders.length : 0;
  if (lastSeenCloudOrdersCount === null && CLOUD_GIST_ID) {
    // Unknown cloud state: pull before writing (best effort, fail-open).
    try { await syncCloudDb(true); } catch {}
  }
  if (incomingCount === 0 && (lastSeenCloudOrdersCount ?? 0) > 0) {
    console.error(
      'WIPE-GUARD: refused push of an empty orders list over a non-empty cloud DB (',
      lastSeenCloudOrdersCount,
      'orders were live). Nothing was written to the cloud.'
    );
    return;
  }

  inMemoryDb = state;
  lastCloudSyncTime = Date.now();

  try {
    await fetch(`https://api.github.com/gists/${CLOUD_GIST_ID}`, {
      method: 'PATCH',
      headers: {
        Authorization: `token ${CLOUD_GIST_TOKEN}`,
        'User-Agent': 'DarElAsal-App',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: {
          'db.json': {
            content: JSON.stringify(state),
          },
        },
      }),
    });
    lastSeenCloudOrdersCount = incomingCount;
  } catch (err) {
    console.warn('Cloud DB sync push error:', err);
  }
}

export function saveDb(state: DatabaseState): void {
  ensureDataDirectory();
  inMemoryDb = state;

  let savedToPrimary = false;
  // Try saving to primary file
  try {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(state, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    savedToPrimary = true;
  } catch (err) {
    // Read-only filesystem in serverless environments (like Vercel)
  }

  // Always keep /tmp in sync as well for serverless continuity
  try {
    fs.writeFileSync(FALLBACK_TMP_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (tmpErr) {
    if (!savedToPrimary) {
      console.warn('Persistence warning: memory-only mode active in current execution context');
    }
  }

  // Asynchronously sync to cloud Gist
  syncCloudDbPush(state).catch(() => {});
}

export function resetDatabaseStatsAndOrders(): DatabaseState {
  const db = getDb();
  // SAFETY (2026-11-06): real customer orders are never destroyed by a stats
  // reset. Only recalibratable counters are zeroed; the order history and the
  // audit trail stay intact (the wipe killed 8 orders).
  if (db.courierProfiles) {
    db.courierProfiles.forEach((c) => {
      c.activeOrdersCount = 0;
    });
  }
  const log = {
    id: `audit-${Date.now()}`,
    userId: 'system-reset',
    userName: 'النظام',
    userRole: 'admin',
    entityType: 'stats',
    entityId: 'flags',
    action: 'reset_admin_stats',
    details: 'تم تصفير عدادات الإحصائيات فقط (الطلبات الحقيقية محفوظة)',
    createdAt: new Date().toISOString(),
  } as unknown as AuditLog;
  if (Array.isArray(db.auditLogs)) {
    db.auditLogs.push(log);
  } else {
    db.auditLogs = [log];
  }
  saveDb(db);
  return db;
}

// ---------------- PRODUCTS ----------------

export function getProducts(options?: {
  categoryId?: string;
  search?: string;
  status?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price-asc' | 'price-desc' | 'newest' | 'rating';
}): Product[] {
  const db = getDb();
  let list = db.products.filter((p) => p.isActive);

  if (options?.categoryId) {
    list = list.filter((p) => p.categoryId === options.categoryId);
  }

  if (options?.featured) {
    list = list.filter((p) => p.isFeatured);
  }

  if (options?.status) {
    list = list.filter((p) => p.status === options.status);
  }

  if (options?.search) {
    const q = options.search.trim().toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.origin.toLowerCase().includes(q)
    );
  }

  if (options?.minPrice !== undefined) {
    list = list.filter((p) => p.price >= options.minPrice!);
  }

  if (options?.maxPrice !== undefined) {
    list = list.filter((p) => p.price <= options.maxPrice!);
  }

  if (options?.sortBy === 'price-asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (options?.sortBy === 'price-desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (options?.sortBy === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  } else {
    // Default newest
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return list;
}

export function getAllProductsAdmin(): Product[] {
  const db = getDb();
  return [...db.products].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getProductById(id: string): Product | null {
  const db = getDb();
  return db.products.find((p) => p.id === id) || null;
}

export function getProductBySlug(slug: string): Product | null {
  const db = getDb();
  return db.products.find((p) => p.slug === slug || p.id === slug) || null;
}

export function saveProduct(product: Product): Product {
  const db = getDb();
  const index = db.products.findIndex((p) => p.id === product.id);
  if (index >= 0) {
    db.products[index] = { ...product, updatedAt: new Date().toISOString() };
  } else {
    db.products.unshift({
      ...product,
      createdAt: product.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  saveDb(db);
  return product;
}

export function deleteProduct(id: string): boolean {
  const db = getDb();
  const initialLength = db.products.length;
  db.products = db.products.filter((p) => p.id !== id);
  if (db.products.length !== initialLength) {
    saveDb(db);
    return true;
  }
  return false;
}

// ---------------- CATEGORIES ----------------

export function getCategories(): Category[] {
  const db = getDb();
  return db.categories.map((c) => ({
    ...c,
    productCount: db.products.filter((p) => p.categoryId === c.id && p.isActive).length,
  }));
}

export function getCategoryById(id: string): Category | null {
  const db = getDb();
  return db.categories.find((c) => c.id === id || c.slug === id) || null;
}

// ---------------- SUPPLIERS ----------------

export function getSuppliers(): Supplier[] {
  const db = getDb();
  return db.suppliers;
}

export function getSupplierById(id: string): Supplier | null {
  const db = getDb();
  return db.suppliers.find((s) => s.id === id) || null;
}

export function saveSupplier(supplier: Supplier): Supplier {
  const db = getDb();
  const index = db.suppliers.findIndex((s) => s.id === supplier.id);
  if (index >= 0) {
    db.suppliers[index] = supplier;
  } else {
    db.suppliers.unshift(supplier);
  }
  saveDb(db);
  return supplier;
}

// ---------------- USERS & AUTH ----------------

export function getUsers(): User[] {
  const db = getDb();
  return db.users;
}

export function getUserById(id: string): User | null {
  const db = getDb();
  return db.users.find((u) => u.id === id) || null;
}

export function getUserByEmail(email: string): User | null {
  const db = getDb();
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export function saveUser(user: User): User {
  const db = getDb();
  const index = db.users.findIndex((u) => u.id === user.id);
  if (index >= 0) {
    db.users[index] = { ...user, updatedAt: new Date().toISOString() };
  } else {
    db.users.push(user);
  }
  saveDb(db);
  return user;
}

// ---------------- COURIERS & APPLICATIONS ----------------

export function getCourierProfiles(): CourierProfile[] {
  const db = getDb();
  return db.courierProfiles;
}

export function getCourierProfileByUserId(userId: string): CourierProfile | null {
  const db = getDb();
  return db.courierProfiles.find((c) => c.userId === userId) || null;
}

export function saveCourierProfile(profile: CourierProfile): CourierProfile {
  const db = getDb();
  const index = db.courierProfiles.findIndex((c) => c.id === profile.id || c.userId === profile.userId);
  if (index >= 0) {
    db.courierProfiles[index] = profile;
  } else {
    db.courierProfiles.push(profile);
  }
  saveDb(db);
  return profile;
}

export function getDeliveryApplications(): DeliveryApplication[] {
  const db = getDb();
  return [...db.deliveryApplications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function saveDeliveryApplication(app: DeliveryApplication): DeliveryApplication {
  const db = getDb();
  const index = db.deliveryApplications.findIndex((a) => a.id === app.id);
  if (index >= 0) {
    db.deliveryApplications[index] = app;
  } else {
    db.deliveryApplications.unshift(app);
  }
  saveDb(db);
  return app;
}

// ---------------- ORDERS ----------------

export function getOrders(options?: {
  userId?: string;
  courierId?: string;
  status?: OrderStatus;
  limit?: number;
}): Order[] {
  const db = getDb();
  let list = [...db.orders];

  if (options?.userId) {
    list = list.filter((o) => o.userId === options.userId);
  }

  if (options?.courierId) {
    list = list.filter((o) => o.assignedAgentId === options.courierId);
  }

  if (options?.status) {
    list = list.filter((o) => o.orderStatus === options.status);
  }

  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (options?.limit) {
    list = list.slice(0, options.limit);
  }

  return list;
}

export function getOrderById(id: string): Order | null {
  const db = getDb();
  return db.orders.find((o) => o.id === id || o.orderNumber === id) || null;
}

export async function getOrderByIdAsync(id: string): Promise<Order | null> {
  let order = getOrderById(id);
  if (!order) {
    await syncCloudDb(true);
    order = getOrderById(id);
  }
  return order;
}

export function saveOrder(order: Order): Order {
  const db = getDb();
  const index = db.orders.findIndex((o) => o.id === order.id);
  if (index >= 0) {
    db.orders[index] = { ...order, updatedAt: new Date().toISOString() };
  } else {
    db.orders.unshift({
      ...order,
      createdAt: order.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  saveDb(db);
  return order;
}

// ---------------- AUTO ASSIGNMENT ENGINE ----------------

export function autoAssignOrder(
  orderId: string,
  adminUserId: string,
  adminName: string
): { success: boolean; message: string; courier?: CourierProfile } {
  const db = getDb();
  const order = db.orders.find((o) => o.id === orderId);

  if (!order) {
    return { success: false, message: 'الطلب غير موجود' };
  }

  if (order.assignedAgentId) {
    return { success: false, message: 'الطلب مسند بالفعل لمندوب آخر' };
  }

  // Find eligible couriers: active in system, AVAILABLE status
  const eligibleCouriers = db.courierProfiles.filter((c) => {
    const user = db.users.find((u) => u.id === c.userId);
    return user && user.status === 'active' && c.status === 'AVAILABLE';
  });

  if (eligibleCouriers.length === 0) {
    return {
      success: false,
      message: 'لا يوجد مندوبون متاحون حالياً في النظام لتوزيع هذا الطلب',
    };
  }

  // Sort by lowest active order count, then random or governorate match
  eligibleCouriers.sort((a, b) => a.activeOrdersCount - b.activeOrdersCount);
  const chosenCourier = eligibleCouriers[0];

  const now = new Date().toISOString();

  // Atomically assign
  order.assignedAgentId = chosenCourier.userId;
  order.assignedAgentName = chosenCourier.fullName;
  order.assignedAgentPhone = chosenCourier.phone;
  order.assignedAt = now;
  order.orderStatus = 'ASSIGNED';
  order.updatedAt = now;

  order.statusHistory.push({
    id: `hist-auto-${Date.now()}`,
    orderId: order.id,
    previousStatus: 'READY_FOR_DELIVERY',
    newStatus: 'ASSIGNED',
    changedByUserId: adminUserId,
    changedByName: adminName,
    notes: `تم التوزيع التلقائي الذكي للطلب للمندوب ${chosenCourier.fullName}`,
    createdAt: now,
  });

  chosenCourier.activeOrdersCount += 1;

  // Add notification to courier
  db.notifications.push({
    id: `notif-${Date.now()}`,
    userId: chosenCourier.userId,
    title: 'مهمة توصيل جديدة مسندة تلقائياً',
    message: `تم إسناد الطلب ${order.orderNumber} في ${order.city} إليك للتسليم.`,
    link: '/delivery/dashboard',
    isRead: false,
    createdAt: now,
  });

  // Log audit
  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    userId: adminUserId,
    userName: adminName,
    userRole: 'admin',
    action: 'AUTO_ASSIGN_ORDER',
    entityType: 'ORDER',
    entityId: order.id,
    details: `تم الإسناد التلقائي للطلب ${order.orderNumber} إلى المندوب ${chosenCourier.fullName}`,
    createdAt: now,
  });

  saveDb(db);

  return {
    success: true,
    message: `تم إسناد الطلب بنجاح إلى المندوب: ${chosenCourier.fullName}`,
    courier: chosenCourier,
  };
}

// ---------------- REVIEWS ----------------

export function getReviews(productId?: string): Review[] {
  const db = getDb();
  if (productId) {
    return db.reviews.filter((r) => r.productId === productId);
  }
  return db.reviews;
}

export function addReview(review: Review): Review {
  const db = getDb();
  db.reviews.unshift(review);

  // Recalculate product rating
  const productReviews = db.reviews.filter((r) => r.productId === review.productId);
  const avg =
    productReviews.reduce((sum, r) => sum + r.rating, 0) / (productReviews.length || 1);

  const product = db.products.find((p) => p.id === review.productId);
  if (product) {
    product.rating = Number(avg.toFixed(2));
    product.reviewCount = productReviews.length;
  }

  saveDb(db);
  return review;
}

// ---------------- NOTIFICATIONS ----------------

export function getNotifications(userId: string): Notification[] {
  const db = getDb();
  return db.notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addNotification(notification: Notification): void {
  const db = getDb();
  db.notifications.unshift(notification);
  saveDb(db);
}

export function markNotificationAsRead(id: string): void {
  const db = getDb();
  const n = db.notifications.find((item) => item.id === id);
  if (n) {
    n.isRead = true;
    saveDb(db);
  }
}

// ---------------- AUDIT LOGS ----------------

export function getAuditLogs(): AuditLog[] {
  const db = getDb();
  return [...db.auditLogs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function addAuditLog(log: AuditLog): void {
  const db = getDb();
  db.auditLogs.unshift(log);
  saveDb(db);
}

// ---------------- SETTINGS ----------------

export function getStoreSettings(): StoreSettings {
  const db = getDb();
  return db.settings;
}

export function updateStoreSettings(settings: Partial<StoreSettings>): StoreSettings {
  const db = getDb();
  db.settings = { ...db.settings, ...settings };
  saveDb(db);
  return db.settings;
}
