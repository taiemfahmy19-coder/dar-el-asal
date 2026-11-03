'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

const PROMO_ITEMS = [
  'عروض توفير مميزة',
  '100% طبيعي ومفحوص',
  'توصيل مبرد داخل الإسكندرية',
  'معاينة الطلب قبل الدفع',
  'اطلب الآن حسب الطلب',
];

/**
 * Promotional marquee ticker rendered under the announcement bar.
 * CSS-only animation: duplicates the content for a seamless loop,
 * pauses on hover/focus and respects prefers-reduced-motion.
 * The repeated copy is aria-hidden and no aria-live is used so screen
 * readers are not spammed by continuous movement.
 */
export default function PromoMarquee() {
  return (
    <div
      role="region"
      aria-label="شريط العروض المتحركة"
      className="promo-marquee bg-[#143823] text-[#f5ebd2] text-[11px] sm:text-xs py-2 border-b border-[#c59b27]/25 overflow-hidden"
    >
      <div className="promo-marquee-track">
        {[0, 1].map((copyIndex) => (
          <ul
            key={copyIndex}
            aria-hidden={copyIndex === 1 ? true : undefined}
            className="flex shrink-0 items-center gap-0 list-none pl-0 m-0"
          >
            {PROMO_ITEMS.map((item, index) => (
              <li
                key={`${copyIndex}-${index}`}
                className="flex items-center gap-3 px-5 whitespace-nowrap"
                dir="rtl"
              >
                {index === 0 && (
                  <Sparkles className="w-3 h-3 text-[#c59b27]" aria-hidden="true" />
                )}
                <span className="font-semibold">{item}</span>
                <span className="text-[#c59b27]" aria-hidden="true">
                  •
                </span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
