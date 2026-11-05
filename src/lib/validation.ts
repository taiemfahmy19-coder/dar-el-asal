/**
 * Shared, framework-free validation rules used by BOTH the checkout UI
 * (client) and the orders API (server), so a bypass of the browser can never
 * produce an invalid or fake order.
 */

export const EGYPT_PHONE_ERROR =
  'من فضلك أدخل رقم هاتف مصري صحيح مكوّن من 11 رقمًا ويبدأ بـ010 أو 011 أو 012 أو 015.';

export const ORDER_EMAIL_ERROR = 'من فضلك أدخل بريدًا إلكترونيًا صحيحًا، مثال: name@example.com';

/** Arabic-Indic ٠-٩ and Eastern-Arabic ۰-۹ digits → ASCII 0-9 */
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const EASTERN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

function convertArabicDigits(raw: string): string {
  let out = '';
  for (const ch of raw) {
    const a = ARABIC_DIGITS.indexOf(ch);
    const e = EASTERN_DIGITS.indexOf(ch);
    out += a >= 0 ? String(a) : e >= 0 ? String(e) : ch;
  }
  return out;
}

/**
 * Unifies a phone input (Arabic or English digits, spaces/dashes/dots) and
 * returns the 11-digit national Egyptian number, or null when it is NOT a
 * valid Egyptian mobile number (010/011/012/015 prefix, exactly 11 digits).
 *
 * International formats (with "+", country codes) are rejected, per spec.
 */
export function normalizeEgyptianPhone(raw: unknown): string | null {
  if (raw === null || raw === undefined || typeof raw !== 'string') return null;

  // Anything with a plus/country-code marker is international → reject.
  if (/[+\-]/.test(raw)) return null;

  const digits = convertArabicDigits(raw).replace(/[\s()\u066C_.]/g, '');
  if (!/^\d{11}$/.test(digits)) return null;
  if (!/^01[0125]\d{8}$/.test(digits)) return null;
  return digits;
}

export function isValidEgyptianPhone(raw: unknown): boolean {
  return normalizeEgyptianPhone(raw) !== null;
}

/** Pragmatic email shape check (no regex gods): local@domain.tld */
export function isValidEmail(raw: unknown): boolean {
  if (raw === null || raw === undefined || typeof raw !== 'string') return false;
  const email = raw.trim();
  if (!email || email.length > 254) return false;
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(email);
}

const MAX_DELIVERY_AHEAD_DAYS = 30;

/**
 * Delivery date must be a real calendar date, today-or-later (DST-safe compare
 * on the calendar date only) and at most 30 days ahead.
 */
export function isValidDeliveryDate(raw: unknown): boolean {
  if (typeof raw !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return false;
  const [y, m, d] = raw.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return false;

  const today = new Date();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffDays = Math.round((date.getTime() - todayOnly.getTime()) / 86400000);
  return diffDays >= 0 && diffDays <= MAX_DELIVERY_AHEAD_DAYS;
}

export interface OrderPayloadCheck {
  ok: boolean;
  /** Single human message (Arabic) for the API response */
  error?: string;
  /** Field-level strings for the UI */
  errors?: Partial<Record<'customerName' | 'customerPhone' | 'customerEmail' | 'governorate' | 'city' | 'streetAddress' | 'deliveryDate' | 'items', string>>;
  normalized: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    governorate: string;
    city: string;
    streetAddress: string | undefined;
    deliveryDate: string;
    items: { productId: string; quantity: number }[];
  };
}

/**
 * Full server-side sanity gate before ANY order is saved:
 * name / phone / email / governorate / city / address / date / cart.
 * Returns a normalized copy of the payload when everything is valid.
 */
export function validateNewOrderPayload(body: Record<string, unknown>, isSupportedGovernorate: (g: string) => boolean): OrderPayloadCheck {
  const errors: OrderPayloadCheck['errors'] = {};

  const customerName = typeof body.customerName === 'string' ? body.customerName.trim() : '';
  if (customerName.length < 3 || customerName.length > 80) {
    errors.customerName = 'من فضلك أدخل الاسم الكامل للمستلم (3 أحرف على الأقل).';
  }

  const customerPhone = normalizeEgyptianPhone(
    typeof body.customerPhone === 'string' ? body.customerPhone : ''
  );
  if (!customerPhone) {
    errors.customerPhone = EGYPT_PHONE_ERROR;
  }

  const customerEmailRaw = typeof body.customerEmail === 'string' ? body.customerEmail.trim() : '';
  if (!isValidEmail(customerEmailRaw)) {
    errors.customerEmail = ORDER_EMAIL_ERROR;
  }

  const governorate = typeof body.governorate === 'string' ? body.governorate.trim() : '';
  if (!governorate || !isSupportedGovernorate(governorate)) {
    errors.governorate = 'المحافظة غير مدعومة حاليًا. التوصيل متاح في الإسكندرية فقط.';
  }

  const city = typeof body.city === 'string' ? body.city.trim() : '';
  if (city.length < 2 || city.length > 60) {
    errors.city = 'من فضلك أدخل المدينة أو الحي.';
  }

  const streetAddress = typeof body.streetAddress === 'string' ? body.streetAddress.trim() : '';
  if (streetAddress.length < 5 || streetAddress.length > 200) {
    errors.streetAddress = 'من فضلك أدخل العنوان بالتفصيل (اسم الشارع ورقم العقار).';
  }

  const deliveryDate = typeof body.deliveryDate === 'string' ? body.deliveryDate : '';
  if (!isValidDeliveryDate(deliveryDate)) {
    errors.deliveryDate = 'من فضلك اختر تاريخ استلام صحيحًا ضمن 30 يومًا قادمة وليس في الماضي.';
  }

  let items: { productId: string; quantity: number }[] = [];
  if (Array.isArray(body.items) && body.items.length > 0 && body.items.length <= 50) {
    items = body.items
      .filter(
        (i): i is { productId: string; quantity: number } =>
          i !== null &&
          typeof i === 'object' &&
          typeof (i as { productId?: unknown }).productId === 'string' &&
          (i as { productId: string }).productId.length > 0
      )
      .map((i) => ({
        productId: i.productId.trim(),
        quantity: Math.min(99, Math.max(1, Math.floor(Number(i.quantity) || 1))),
      }));
    if (items.length === 0) items = [];
  }
  if (items.length === 0) {
    errors.items = 'سلة المشتريات فارغة أو غير صالحة.';
  }

  if (Object.keys(errors).length > 0) {
    const ordered = ['customerName', 'customerPhone', 'customerEmail', 'governorate', 'city', 'streetAddress', 'deliveryDate', 'items'] as const;
    const first = ordered.find((k) => errors[k]) as keyof typeof errors;
    return { ok: false, error: errors[first], errors, normalized: { customerName, customerPhone: customerPhone || '', customerEmail: customerEmailRaw, governorate, city, streetAddress: streetAddress || undefined, deliveryDate, items } };
  }

  return {
    ok: true,
    normalized: {
      customerName,
      customerPhone: customerPhone as string,
      customerEmail: customerEmailRaw,
      governorate,
      city,
      streetAddress,
      deliveryDate,
      items,
    },
  };
}
