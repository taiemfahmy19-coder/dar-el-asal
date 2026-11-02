'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Truck } from 'lucide-react';

export default function AnnouncementBar() {
  return (
    <div
      role="region"
      aria-label="شريط إعلانات المتجر"
      className="bg-[#102d1c] text-white text-xs py-2 px-4 border-b border-[#c59b27]/30"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-right">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-[#c59b27] text-[#102d1c] px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-sm">
            <Sparkles className="w-3 h-3 text-[#102d1c]" />
            دار العسل والزيتون
          </span>
          <span className="text-gray-200">نقاء طبيعي 100% موثق ومفحوص — خدمة التوصيل السريع والمبرّد في نطاق الإسكندرية</span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-[11px] text-gray-300">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#c59b27]" />
            فحص مخبري مباشر من المورد
          </span>
          <span className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-[#c59b27]" />
            توصيل سريع وآمن لباب بيتك
          </span>
          <Link
            href="/delivery/apply"
            className="text-[#f5d77f] hover:text-[#c59b27] transition-colors underline font-medium"
          >
            انضم لفريق التوصيل
          </Link>
        </div>
      </div>
    </div>
  );
}
