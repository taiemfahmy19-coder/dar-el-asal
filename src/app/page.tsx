import React from 'react';
import { getProducts } from '@/lib/db';
import HeroSection from '@/components/home/HeroSection';
import HomeProductsSection from '@/components/home/HomeProductsSection';
import SmartPackageWizard from '@/components/home/SmartPackageWizard';
import { ShieldCheck, Truck, CheckCircle2 } from 'lucide-react';

// Cache the storefront shell briefly to reduce origin work while keeping
// product updates reasonably fresh.
export const revalidate = 60;

export default function HomePage() {
  const allProducts = getProducts();

  return (
    <div className="bg-[#fcfaf6] min-h-screen">
      {/* 1. Hero Section (Compact & Sized) */}
      <HeroSection />

      {/* 2. Single Unified Products Section (Simple & Clean) */}
      <HomeProductsSection products={allProducts} />

      {/* 3. Smart budget-based package builder (the /#smart-package target) */}
      <SmartPackageWizard />

      {/* 4. Simple Luxury Guarantee Bar */}
      <div className="border-t border-[#d2d2d7]/40 bg-white/60 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-right">
            <div className="flex items-center gap-3 p-3 bg-white rounded-[14px] border border-[#d2d2d7]/50 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-[#143823]/10 text-[#143823] flex items-center justify-center shrink-0 border border-[#c59b27]/30">
                <CheckCircle2 className="w-5 h-5 text-[#c59b27]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1d1d1f]">طبيعي ومفحوص 100%</h4>
                <p className="text-[11px] text-[#515154] mt-0.5">خالٍ تماماً من التغذية الصناعية والسكريات</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-[14px] border border-[#d2d2d7]/50 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-[#143823]/10 text-[#143823] flex items-center justify-center shrink-0 border border-[#c59b27]/30">
                <ShieldCheck className="w-5 h-5 text-[#c59b27]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1d1d1f]">عصر بارد أول وحموضة &lt; 0.3%</h4>
                <p className="text-[11px] text-[#515154] mt-0.5">من معاصر سيوة وجبال كاترين المعمرة</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-[14px] border border-[#d2d2d7]/50 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-[#143823]/10 text-[#143823] flex items-center justify-center shrink-0 border border-[#c59b27]/30">
                <Truck className="w-5 h-5 text-[#c59b27]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1d1d1f]">معاينة الطلب عند الاستلام</h4>
                <p className="text-[11px] text-[#515154] mt-0.5">عاين وتأكد من الجودة بنفسك قبل الدفع</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
