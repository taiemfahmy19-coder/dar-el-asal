'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, ShoppingBag, ArrowLeft, ShieldCheck, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '@/components/context/CartContext';
import { formatPrice } from '@/lib/utils';
import SupplierStatusBadge from '@/components/products/SupplierStatusBadge';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, totalItems } = useCart();

  const freeShippingThreshold = 1200;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const qualifiesForFreeShipping = subtotal >= freeShippingThreshold;

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-16 px-4 text-right bg-[#f5f5f7]">
        <div className="card p-10 max-w-md w-full border border-[#d2d2d7]/50 text-center space-y-4 !rounded-[18px]">
          <div className="w-16 h-16 rounded-[14px] bg-blue-50 text-[#0071e3] mx-auto flex items-center justify-center">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">سلة المشتريات فارغة</h2>
          <p className="text-xs sm:text-sm text-[#515154] leading-relaxed">
            لم تقم بإضافة أي منتجات إلى سلتك بعد. استكشف مجموعتنا الفاخرة من الأغذية الطبيعية المفحوصة.
          </p>
          <Link
            href="/products"
            className="btn inline-flex items-center gap-2 px-6 py-3 rounded-[980px] bg-[#0071e3] text-white font-medium text-xs hover:bg-[#0077ed]"
          >
            <span>تصفح المنتجات الآن</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f5f7] min-h-screen py-10 text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] tracking-tight">
              سلة المشتريات ({totalItems} منتجات)
            </h1>
            <p className="text-xs text-[#515154] mt-1">
              راجع منتجاتك الطبيعية قبل المتابعة إلى إتمام الطلب
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs text-rose-600 hover:underline font-medium"
          >
            تفريغ السلة بالكامل
          </button>
        </div>

        {/* Free Shipping Progress Alert */}
        <div className="card mb-8 p-4 border border-[#d2d2d7]/50 flex items-center gap-3 !rounded-[18px]">
          <div className="w-10 h-10 rounded-[12px] bg-[#143823]/10 text-[#143823] flex items-center justify-center shrink-0 border border-[#c59b27]/30">
            <Truck className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs">
            {qualifiesForFreeShipping ? (
              <p className="font-semibold text-emerald-700">
                تهانينا! طلبيتك مؤهلة للشحن المجاني لمحافظات القاهرة والجيزة والإسكندرية 🎉
              </p>
            ) : (
              <p className="text-[#1d1d1f]">
                أضف منتجات بقيمة <span className="font-bold text-[#c59b27]">{formatPrice(remainingForFreeShipping)}</span> إضافية للحصول على شحن مجاني!
              </p>
            )}
            <div className="w-full bg-gray-200 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[#c59b27] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Cart Content (Items list + Summary) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Items List */}
          <div className="lg:col-span-8 space-y-4">
            {items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="card p-4 sm:p-5 border border-[#d2d2d7]/50 flex flex-col sm:flex-row items-center justify-between gap-4 !rounded-[18px] !mb-4"
              >
                {/* Product thumbnail & Info */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-20 h-20 rounded-[12px] bg-[#f5f5f7] overflow-hidden relative shrink-0 border border-[#d2d2d7]/50">
                    <Image
                      src={product.images[0] || '/images/honey/prod-honey-plain.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="mb-1">
                      <SupplierStatusBadge status={product.status} size="sm" />
                    </div>
                    <Link
                      href={`/products/${product.id}`}
                      className="font-semibold text-sm sm:text-base text-[#1d1d1f] hover:text-[#c59b27] line-clamp-1 tracking-tight"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-[#515154]">
                      الوزن: {product.weightVolume} | المصدر: {product.origin}
                    </p>
                    <p className="text-xs font-bold text-[#1d1d1f] sm:hidden">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </div>

                {/* Quantity Controls & Total */}
                <div className="flex items-center justify-between w-full sm:w-auto gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#d2d2d7]/40">
                  <div className="flex items-center border border-[#d2d2d7]/80 rounded-[980px] bg-[#f5f5f7] p-1">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-[#1d1d1f] shadow-sm hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="w-10 text-center text-xs font-semibold text-[#1d1d1f]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-[#1d1d1f] shadow-sm hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>

                  <div className="hidden sm:block text-left w-24">
                    <p className="text-sm font-bold text-[#1d1d1f]">
                      {formatPrice(product.price * quantity)}
                    </p>
                    <p className="text-[11px] text-[#515154]">
                      {formatPrice(product.price)} / للقطعة
                    </p>
                  </div>

                  <button
                    onClick={() => removeItem(product.id)}
                    className="p-2 text-gray-400 hover:text-rose-600 transition-colors rounded-full hover:bg-rose-50"
                    title="حذف المنتج من السلة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}

            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#0066cc] hover:underline"
              >
                <ArrowRight className="w-4 h-4" />
                <span>متابعة التسوق وإضافة منتجات أخرى</span>
              </Link>
            </div>
          </div>

          {/* Order Summary Box */}
          <div className="lg:col-span-4">
            <div className="card p-6 border border-[#d2d2d7]/50 sticky top-24 space-y-5 !rounded-[18px]">
              <h3 className="font-semibold text-base text-[#1d1d1f] border-b border-[#d2d2d7]/40 pb-3 tracking-tight">
                ملخص الطلب
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-[#515154]">
                  <span>المجموع الفرعي:</span>
                  <span className="font-bold text-[#1d1d1f] text-sm">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between text-[#515154]">
                  <span>رسوم التوصيل المقدرة:</span>
                  <span className="font-semibold text-emerald-700">
                    {qualifiesForFreeShipping ? 'مجاناً' : 'تُحسب حسب المحافظة في الخطوة التالية'}
                  </span>
                </div>

                <div className="pt-3 border-t border-[#d2d2d7]/40 flex items-center justify-between text-[#1d1d1f]">
                  <span className="font-semibold text-sm">الإجمالي المبدئي:</span>
                  <span className="font-bold text-xl text-[#1d1d1f]">{formatPrice(subtotal)}</span>
                </div>
              </div>

              <div className="p-3.5 bg-[#f5f5f7] rounded-[12px] text-[11px] text-[#515154] space-y-1 border border-[#d2d2d7]/40">
                <p className="font-semibold text-[#1d1d1f]">طريقة الدفع:</p>
                <p>الدفع نقداً عند الاستلام بعد المعاينة، أو عبر تطبيق InstaPay والبطاقات البنكية.</p>
              </div>

              <Link
                href="/checkout"
                className="btn w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-[980px] bg-[#143823] text-[#f5ebd2] font-semibold text-sm hover:bg-[#1a4a2f] border border-[#c59b27]/60 hover:scale-[1.02] active:scale-95 transition-all shadow-sm"
              >
                <span>المتابعة إلى صفحة إتمام الطلب</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#515154] pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>طلبك محمي بضمان الجودة والاسترجاع</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
