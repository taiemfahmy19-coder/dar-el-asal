'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

const PROMO_ITEMS = [
  'عروض توفير مميزة',
  'طبيعي ومفحوص مخبرياً',
  'توصيل مبرد داخل الإسكندرية',
  'معاينة الطلب قبل الدفع',
  'اطلب الآن حسب الطلب',
];

/**
 * Each half of the marquee must always be wider than the widest supported
 * viewport so the -50% translate loop never exposes an empty edge on large
 * screens. One pass of the 5 items is ~1k wide, so each half repeats the
 * sequence twice (~2k), covering up to ~1920px viewports seamlessly.
 */
const SEQUENCE_REPEATS_PER_COPY = 2;

/** Visual sequence for one half: items repeated N times. */
const SEQUENCE = Array.from(
  { length: SEQUENCE_REPEATS_PER_COPY * PROMO_ITEMS.length },
  (_, i) => PROMO_ITEMS[i % PROMO_ITEMS.length]
);

/**
 * Promotional marquee ticker rendered under the announcement bar.
 * CSS-only seamless infinite loop: the track holds two identical halves and
 * animates translateX(-50%) with linear timing, so the loop restart frame is
 * pixel-identical to the first (no gap, no jump).
 * Only the first pass is exposed to screen readers; every duplicated item and
 * copy is aria-hidden, and no aria-live is used.
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
            {SEQUENCE.map((item, index) => (
              <li
                key={`${copyIndex}-${index}`}
                className="flex items-center gap-3 px-5 whitespace-nowrap"
                dir="rtl"
                aria-hidden={
                  copyIndex === 1 || index >= PROMO_ITEMS.length ? true : undefined
                }
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
