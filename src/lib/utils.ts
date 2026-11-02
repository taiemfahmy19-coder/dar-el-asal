import { OrderStatus, SupplierProductStatus, UserRole } from './types';

export function formatPrice(amount: number): string {
  return `${amount.toLocaleString('ar-EG')} ج.م`;
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function formatShortDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export const ORDER_STATUS_MAP: Record<
  OrderStatus,
  { label: string; description: string; color: string; bg: string; border: string; step: number }
> = {
  PENDING: {
    label: 'بانتظار التأكيد',
    description: 'تم استلام طلبك وجارٍ مراجعته من فريق العمل',
    color: 'text-amber-800',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    step: 1,
  },
  AWAITING_SUPPLIER: {
    label: 'بانتظار تأكيد المورد',
    description: 'نتواصل حالياً مع المورد لتأكيد الجودة والتوفر',
    color: 'text-orange-800',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    step: 2,
  },
  CONFIRMED: {
    label: 'تم تأكيد التوفر والطلب',
    description: 'تم اعتماد توفر المنتج وتأكيد طلبك بنجاح',
    color: 'text-blue-800',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    step: 3,
  },
  PREPARING: {
    label: 'جارٍ تجهيز الطلب',
    description: 'يتم الآن فحص وتغليف المنتجات بعناية',
    color: 'text-indigo-800',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    step: 4,
  },
  READY_FOR_DELIVERY: {
    label: 'جاهز للتسليم للمندوب',
    description: 'الطلب مُجهّز وبانتظار استلام مندوب التوصيل',
    color: 'text-cyan-800',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    step: 5,
  },
  ASSIGNED: {
    label: 'تم إسناد الطلب للمندوب',
    description: 'تم تعيين مندوب التوصيل لاستلام الشحنة',
    color: 'text-purple-800',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    step: 6,
  },
  OUT_FOR_DELIVERY: {
    label: 'خرج للتوصيل',
    description: 'المندوب في طريقه إليك لتسليم الطلب',
    color: 'text-emerald-800',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    step: 7,
  },
  DELIVERED: {
    label: 'تم التسليم بنجاح',
    description: 'تم تسليم الطلب للعميل، بالهناء والشفاء',
    color: 'text-green-900',
    bg: 'bg-green-100',
    border: 'border-green-400',
    step: 8,
  },
  DELIVERY_FAILED: {
    label: 'تعذر التسليم',
    description: 'تعذر إتمام التوصيل وجارٍ متابعة السبب من الإدارة',
    color: 'text-rose-800',
    bg: 'bg-rose-50',
    border: 'border-rose-300',
    step: 0,
  },
  CANCELLED: {
    label: 'تم إلغاء الطلب',
    description: 'تم إلغاء هذا الطلب',
    color: 'text-zinc-700',
    bg: 'bg-zinc-100',
    border: 'border-zinc-300',
    step: 0,
  },
  RETURNED: {
    label: 'مرتجع',
    description: 'تم إرجاع الطلب إلى مستودع المتجر',
    color: 'text-slate-800',
    bg: 'bg-slate-100',
    border: 'border-slate-300',
    step: 0,
  },
};

export const SUPPLIER_STATUS_MAP: Record<
  SupplierProductStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  AVAILABLE: {
    label: 'متاح للطلب المباشر',
    color: 'text-emerald-800',
    bg: 'bg-emerald-50 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  NEEDS_CONFIRMATION: {
    label: 'حسب الطلب (يتطلب تأكيد التوفر)',
    color: 'text-amber-800',
    bg: 'bg-amber-50 border-amber-200',
    dot: 'bg-amber-500',
  },
  UNAVAILABLE: {
    label: 'غير متوفر حالياً',
    color: 'text-rose-800',
    bg: 'bg-rose-50 border-rose-200',
    dot: 'bg-rose-500',
  },
};

export const USER_ROLE_MAP: Record<UserRole, { label: string; color: string; bg: string }> = {
  customer: { label: 'عميل', color: 'text-blue-800', bg: 'bg-blue-50 border-blue-200' },
  delivery: { label: 'عامل توصيل (مندوب)', color: 'text-purple-800', bg: 'bg-purple-50 border-purple-200' },
  admin: { label: 'مدير النظام', color: 'text-forest-900', bg: 'bg-forest-100 border-forest-300' },
};

export const EGYPTIAN_GOVERNORATES = [
  { name: 'القاهرة', fee: 40 },
  { name: 'الجيزة', fee: 40 },
  { name: 'الإسكندرية', fee: 55 },
  { name: 'القليوبية', fee: 50 },
  { name: 'الشرقية', fee: 60 },
  { name: 'الدقهلية', fee: 60 },
  { name: 'البحيرة', fee: 65 },
  { name: 'الغربية', fee: 60 },
  { name: 'المنوفية', fee: 55 },
  { name: 'دمياط', fee: 65 },
  { name: 'كفر الشيخ', fee: 65 },
  { name: 'الإسماعيلية', fee: 65 },
  { name: 'السويس', fee: 65 },
  { name: 'بورسعيد', fee: 65 },
  { name: 'الفيوم', fee: 70 },
  { name: 'بني سويف', fee: 75 },
  { name: 'المنيا', fee: 80 },
  { name: 'أسيوط', fee: 85 },
  { name: 'سوهاج', fee: 90 },
  { name: 'قنا', fee: 95 },
  { name: 'الأقصر', fee: 100 },
  { name: 'أسوان', fee: 105 },
  { name: 'البحر الأحمر', fee: 110 },
  { name: 'مطروح', fee: 100 },
];

/**
 * النطاق الجغرافي الفعلي المعتمد للتدشين.
 * أي محافظة غير موجودة هنا لا يمكن اختيارها في الدفع ولا إنشاء طلب لها.
 */
export const ACTIVE_GOVERNORATES = EGYPTIAN_GOVERNORATES.filter(
  (governorate) => governorate.name === 'الإسكندرية'
);

export const PLANNED_GOVERNORATES = EGYPTIAN_GOVERNORATES.filter(
  (governorate) => governorate.name !== 'الإسكندرية'
);

export function isGovernorateSupported(governorate: string): boolean {
  return ACTIVE_GOVERNORATES.some((active) => active.name === governorate);
}

export function getDeliveryFee(governorate: string): number {
  const found = ACTIVE_GOVERNORATES.find((active) => active.name === governorate);
  return found ? found.fee : 0;
}

/**
 * توحيد معرفات التصنيفات بين الروابط القديمة والبيانات الحالية.
 * يدعم المعرّف (cat-olive-oil) والاسم اللطيف (olive-oil) في نفس الرابط.
 */
export function normalizeCategoryId(value: string | null | undefined): string {
  if (!value) return '';

  const normalized = value.trim();
  const aliases: Record<string, string> = {
    'cat-honey': 'cat-honey',
    'natural-honey': 'cat-honey',
    honey: 'cat-honey',
    'cat-olive-oil': 'cat-olive-oil',
    'olive-oil': 'cat-olive-oil',
    olive: 'cat-olive-oil',
  };

  return aliases[normalized] || normalized;
}
