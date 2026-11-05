'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowUp } from 'lucide-react';
import { useCart } from '@/components/context/CartContext';

/**
 * Floating "back to top" control for long pages.
 * Hidden on admin routes and until the user scrolls; respects
 * prefers-reduced-motion by jumping instantly instead of scrolling.
 * Position adapts so it never sits on top of the floating cart bar
 * or the mobile bottom navigation.
 */
export default function BackToTop() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (pathname?.startsWith('/admin') || !visible) return null;

  const cartBarVisible =
    totalItems > 0 && !['/cart', '/checkout'].includes(pathname || '');

  const bottomClass = cartBarVisible
    ? 'bottom-[148px] sm:bottom-6'
    : 'bottom-[76px] sm:bottom-6';

  const toTop = () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="العودة للأعلى"
      className={`fixed z-40 left-4 sm:left-6 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-forest-900/95 text-[#c59b27] border border-[#c59b27]/50 shadow-lg hover:bg-forest-800 active:scale-95 transition-all flex items-center justify-center ${bottomClass}`}
    >
      <ArrowUp className="w-5 h-5" aria-hidden="true" />
    </button>
  );
}
