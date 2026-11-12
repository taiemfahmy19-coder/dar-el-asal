'use client';

import React from 'react';
import { ShoppingBag } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="w-full bg-[#fcfaf6] sm:py-4 md:py-5">
      <div className="w-full sm:max-w-7xl sm:mx-auto sm:px-6 lg:px-8">
        <div className="relative w-full overflow-hidden shadow-sm sm:border sm:border-[#d2d2d7]/60 rounded-none sm:rounded-[24px] bg-[#152317] aspect-[16/9] sm:aspect-auto">
          <img
            src="/images/dar-hero-banner-hd.jpg"
            srcSet="/images/dar-hero-banner-mobile.jpg 750w, /images/dar-hero-banner-tablet.jpg 1536w, /images/dar-hero-banner-hd.jpg 2752w"
            sizes="(max-width: 767px) 100vw, (max-width: 1279px) 100vw, 1280px"
            width={2752}
            height={1536}
            fetchPriority="high"
            decoding="async"
            alt="دار العسل والزيتون | DAR EL ASAL & OLIVE - Experience Nature's Purest Luxury"
            className="w-full h-full object-cover object-center block select-none sm:h-auto"
          />

          {/* Clear purchase CTA over the empty table area (bottom-left) */}
          <a
            href="/products"
            aria-label="تسوق منتجات دار العسل والزيتون"
            className="hidden sm:inline-flex items-center gap-2 absolute bottom-6 left-6 px-6 py-3 rounded-full bg-[#c59b27] text-[#102d1c] font-extrabold text-sm shadow-lg hover:bg-[#d4ae3e] hover:scale-[1.03] active:scale-95 transition-all border-2 border-[#fcfaf6]/70"
          >
            <ShoppingBag className="w-4 h-4" aria-hidden="true" />
            <span>تسوق المنتجات الآن</span>
          </a>
        </div>
      </div>
    </section>
  );
}
