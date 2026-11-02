'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, ShoppingBag, X, ArrowLeft } from 'lucide-react';
import { useCart } from '@/components/context/CartContext';
import { formatPrice } from '@/lib/utils';

export default function CartNotificationToast() {
  const { lastNotification, dismissNotification, totalItems } = useCart();

  useEffect(() => {
    if (!lastNotification) return;

    const timer = setTimeout(() => {
      dismissNotification();
    }, 4500);

    return () => clearTimeout(timer);
  }, [lastNotification, dismissNotification]);

  if (!lastNotification) return null;

  const { product, quantity } = lastNotification;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md animate-in fade-in slide-in-from-top-4 duration-200"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-gold-300/80 shadow-[0_12px_36px_rgba(20,56,35,0.18)] p-3.5 sm:p-4 text-right space-y-3">
        
        {/* Top Info Bar */}
        <div className="flex items-center justify-between gap-2 border-b border-ivory-200 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <span className="font-bold text-forest-950 text-xs sm:text-sm">
              تمت إضافة المنتج إلى السلة بنجاح
            </span>
          </div>

          <button
            type="button"
            onClick={dismissNotification}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="إغلاق"
            aria-label="إغلاق إشعار السلة"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Snippet */}
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-ivory-50 border border-ivory-200 shrink-0">
            <Image
              src={product.images[0] || '/images/honey/prod-honey-plain.jpg'}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-forest-950 text-xs sm:text-sm truncate">
              {product.name}
            </h4>
            <p className="text-[11px] text-gray-500">
              الكمية: {quantity} | السعر: {formatPrice(product.price * quantity)}
            </p>
          </div>
        </div>

        {/* Actions: "إتمام عملية الشراء" & "متابعة التسوق" */}
        <div className="flex items-center gap-2 pt-1">
          <Link
            href="/cart"
            onClick={dismissNotification}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-forest-900 hover:bg-forest-800 text-gold-300 font-bold text-xs shadow-sm transition-all active:scale-95 border border-forest-700"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-gold-400" />
            <span>إتمام عملية الشراء ({totalItems})</span>
          </Link>

          <button
            type="button"
            onClick={dismissNotification}
            className="py-2.5 px-3 rounded-xl bg-ivory-100 hover:bg-ivory-200 text-forest-950 font-bold text-xs transition-colors shrink-0"
          >
            متابعة التسوق
          </button>
        </div>

      </div>
    </div>
  );
}
