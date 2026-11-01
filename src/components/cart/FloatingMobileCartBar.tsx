'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '@/components/context/CartContext';
import { formatPrice } from '@/lib/utils';

export default function FloatingMobileCartBar() {
  const pathname = usePathname();
  const { totalItems, subtotal } = useCart();

  // Don't show floating bar on cart or checkout pages
  if (totalItems === 0 || pathname === '/cart' || pathname === '/checkout' || pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="fixed bottom-16 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-ivory-300 p-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:hidden animate-in slide-in-from-bottom duration-200">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3 text-right">
        
        {/* Cart Item Count & Subtotal */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-forest-900 text-gold-300 flex items-center justify-center font-bold text-xs shadow-sm border border-gold-400/50">
              <ShoppingBag className="w-4 h-4 text-gold-400" />
            </div>
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gold-500 text-forest-950 font-black text-[10px] flex items-center justify-center border-2 border-white shadow-sm">
              {totalItems}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-gray-500 block leading-tight">إجمالي السلة:</span>
            <span className="text-xs font-black text-forest-950">{formatPrice(subtotal)}</span>
          </div>
        </div>

        {/* Prominent Action Button: "إتمام عملية الشراء" */}
        <Link
          href="/cart"
          className="inline-flex items-center justify-center gap-1.5 py-2.5 px-5 rounded-xl bg-forest-900 text-gold-300 font-bold text-xs shadow-md border border-forest-700 active:scale-95 transition-all"
        >
          <span>إتمام عملية الشراء</span>
          <ArrowLeft className="w-3.5 h-3.5 text-gold-400" />
        </Link>

      </div>
    </div>
  );
}
