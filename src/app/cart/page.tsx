'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, ShoppingBag, ArrowLeft, ShieldCheck, ArrowRight, Truck, Info, Clock } from 'lucide-react';
import { useCart } from '@/components/context/CartContext';
import { formatPrice } from '@/lib/utils';
import SupplierStatusBadge from '@/components/products/SupplierStatusBadge';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center py-16 px-4 text-right bg-[#fcfaf6]">
        <div className="card p-8 sm:p-12 max-w-lg w-full border border-ivory-300 bg-white text-center space-y-5 rounded-3xl shadow-subtle">
          <div className="w-20 h-20 rounded-2xl bg-ivory-100 text-forest-900 mx-auto flex items-center justify-center border border-ivory-200">
            <ShoppingBag className="w-10 h-10 text-gold-600" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-forest-950 font-cairo tracking-tight">
              سلة المشتريات فارغة
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
              لم تقم بإضافة أي منتجات إلى سلتك بعد. استكشف مجموعتنا الفاخرة من أعسال وزيوت دار العسل والزيتون الطبيعية المفحوصة مخبرياً.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-forest-900 text-gold-300 font-bold text-xs hover:bg-forest-800 transition-all shadow-md active:scale-95 border border-forest-700"
            >
              <span>تصفح قائمة المنتجات الآن</span>
              <ArrowLeft className="w-4 h-4 text-gold-400" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfaf6] min-h-screen py-8 sm:py-12 text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-ivory-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-forest-950 font-cairo tracking-tight">
                سلة المشتريات
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gold-100 text-forest-950 border border-gold-300">
                {totalItems} {totalItems === 1 ? 'منتج' : 'منتجات'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              راجع منتجاتك الطبيعية والكميات قبل المتابعة لإدخال عنوان التوصيل
            </p>
          </div>

          <button
            onClick={clearCart}
            className="text-xs text-rose-600 hover:text-rose-700 hover:underline font-bold self-start sm:self-auto"
          >
            تفريغ السلة بالكامل
          </button>
        </div>

        {/* Delivery Tariff Clarification Banner (Alexandria Tariff Policy) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-ivory-300 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center shrink-0 border border-forest-100">
            <Truck className="w-6 h-6 text-gold-600" />
          </div>
          <div className="flex-1 text-xs space-y-1">
            <h4 className="font-bold text-forest-950 text-sm flex items-center gap-1.5">
              <span>سياسة التوصيل واحتساب الشحن (الإسكندرية)</span>
            </h4>
            <p className="text-gray-600 leading-relaxed">
              يتم احتساب رسوم التوصيل بدقة وفقاً لتعرفة شركة الشحن بمنطقتك في الإسكندرية عند مراجعة الإدارة للطلب وإصدار عرض السعر النهائي المعتمد (Quotation) قبل التأكيد.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-forest-900 font-semibold">
              <span className="flex items-center gap-1 text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                الدفع نقداً عند الاستلام فقط (COD) بعد المعاينة
              </span>
              <span className="flex items-center gap-1 text-gray-500">
                <Clock className="w-3.5 h-3.5 text-gold-600" />
                إمكانية الإلغاء الذاتي متاحة حتى 6 ساعات قبل موعد التوصيل
              </span>
            </div>
          </div>
        </div>

        {/* Cart Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-ivory-300 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4 transition-all hover:border-gold-300"
              >
                {/* Product Media & Info */}
                <div className="flex items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-ivory-50 overflow-hidden relative shrink-0 border border-ivory-200">
                    <Image
                      src={product.images[0] || '/images/honey/prod-honey-plain.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <SupplierStatusBadge status={product.status} size="sm" />
                      <span className="text-[10px] text-gray-500 bg-ivory-100 px-2 py-0.5 rounded-md font-semibold">
                        {product.weightVolume}
                      </span>
                    </div>

                    <Link
                      href={`/products/${product.id}`}
                      className="font-bold text-sm sm:text-base text-forest-950 hover:text-gold-600 line-clamp-1 transition-colors"
                    >
                      {product.name}
                    </Link>

                    <p className="text-[11px] text-gray-500 truncate">
                      المصدر: {product.origin}
                    </p>

                    <p className="text-xs font-bold text-forest-900 sm:hidden">
                      سعر الوحدة: {formatPrice(product.price)}
                    </p>
                  </div>
                </div>

                {/* Quantity Controls & Total & Remove */}
                <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-ivory-100">
                  
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-ivory-300 rounded-xl bg-ivory-50 p-1 shadow-inner">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white flex items-center justify-center font-bold text-forest-950 shadow-sm hover:bg-ivory-200 active:scale-95 transition-all"
                      title="تقليل الكمية"
                    >
                      -
                    </button>
                    <span className="w-9 sm:w-10 text-center text-xs sm:text-sm font-extrabold text-forest-950">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white flex items-center justify-center font-bold text-forest-950 shadow-sm hover:bg-ivory-200 active:scale-95 transition-all"
                      title="زيادة الكمية"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal Display */}
                  <div className="text-left w-24 sm:w-28 shrink-0">
                    <p className="text-sm sm:text-base font-black text-forest-950">
                      {formatPrice(product.price * quantity)}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {formatPrice(product.price)} / للعبوة
                    </p>
                  </div>

                  {/* Delete Item */}
                  <button
                    onClick={() => removeItem(product.id)}
                    className="p-2 text-gray-400 hover:text-rose-600 transition-colors rounded-xl hover:bg-rose-50 shrink-0"
                    title="حذف المنتج من السلة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>

              </div>
            ))}

            {/* Back to Products CTA */}
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-xs font-bold text-forest-800 hover:text-forest-950 transition-colors"
              >
                <ArrowRight className="w-4 h-4 text-gold-600" />
                <span>متابعة التسوق وإضافة منتجات طبيعية أخرى</span>
              </Link>
            </div>
          </div>

          {/* Order Summary Sticky Card */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-ivory-300 shadow-premium sticky top-24 space-y-5 text-xs">
              
              <h3 className="font-extrabold text-base text-forest-950 border-b border-ivory-200 pb-3 flex items-center justify-between">
                <span>ملخص الطلب</span>
                <span className="text-[11px] font-normal text-gray-400">
                  {totalItems} {totalItems === 1 ? 'عنصر' : 'عناصر'}
                </span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-gray-600">
                  <span>المجموع الفرعي للمنتجات:</span>
                  <span className="font-bold text-forest-950 text-sm">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex items-start justify-between text-gray-600 gap-2">
                  <span>رسوم التوصيل:</span>
                  <span className="font-bold text-forest-800 text-left text-[11px]">
                    تُحدد بعرض السعر النهائي (حسب المنطقة)
                  </span>
                </div>

                <div className="pt-3 border-t border-ivory-200 flex items-center justify-between text-forest-950">
                  <span className="font-bold text-sm">إجمالي المنتجات المبدئي:</span>
                  <span className="font-black text-xl text-forest-950">{formatPrice(subtotal)}</span>
                </div>
              </div>

              {/* Payment & Review Clause */}
              <div className="p-3.5 bg-ivory-50 rounded-2xl text-[11px] text-gray-600 space-y-1.5 border border-ivory-200">
                <p className="font-bold text-forest-950 flex items-center gap-1">
                  <span>طريقة الدفع:</span>
                  <span className="text-emerald-800">نقداً عند الاستلام (COD)</span>
                </p>
                <p className="leading-relaxed">
                  بعد إرسال الطلب، تتواصل معك الإدارة بعرض سعر نهائي يتضمن مصاريف الشحن لاعتماده قبل خروج الشحنة.
                </p>
              </div>

              {/* Primary Action Button: Continue to Checkout */}
              <Link
                href="/checkout"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-forest-900 text-gold-300 font-bold text-xs hover:bg-forest-800 shadow-md border border-forest-700 hover:scale-[1.01] active:scale-95 transition-all"
              >
                <span>المتابعة إلى إدخال عنوان التوصيل وإتمام الشراء</span>
                <ArrowLeft className="w-4 h-4 text-gold-400" />
              </Link>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>جميع الأعسال والزيوت مفحوصة مخبرياً ومضمونة 100%</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
