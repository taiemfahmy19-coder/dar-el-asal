'use client';

import React from 'react';

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
        </div>
      </div>
    </section>
  );
}
