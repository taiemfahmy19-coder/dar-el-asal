'use client';

import React from 'react';

export default function HeroSection() {
  return (
    <section className="w-full bg-[#fcfaf6] sm:py-4 md:py-5">
      <div className="w-full sm:max-w-7xl sm:mx-auto sm:px-6 lg:px-8">
        <div className="relative w-full overflow-hidden shadow-sm sm:border sm:border-[#d2d2d7]/60 rounded-none sm:rounded-[24px] bg-[#152317]">
          <img
            src="/images/dar-hero-banner-hd.jpg"
            alt="دار العسل والزيتون | DAR EL ASAL & OLIVE - Experience Nature's Purest Luxury"
            className="w-full h-auto block select-none"
          />
        </div>
      </div>
    </section>
  );
}
