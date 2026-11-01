import React from 'react';
import Link from 'next/link';
import { ArrowLeft, SearchCheck, Layers, Bike } from 'lucide-react';

export default function SourcingTransparency() {
  return (
    <section className="py-16 bg-[#f5f5f7] border-b border-[#d2d2d7]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-right">
          
          <div className="space-y-6">
            <span className="text-xs font-semibold text-[#143823] bg-[#f5ebd2] px-3.5 py-1.5 rounded-full border border-[#c59b27]/40 shadow-sm inline-block">
              نموذج العمل الشفاف (Order-Based Commerce)
            </span>
            
            <h2 className="text-2xl sm:text-4xl font-semibold text-[#1d1d1f] leading-snug tracking-tight">
              كيف نضمن وصول منتجات طازجة وغير مكدسة في المخازن؟
            </h2>

            <p className="text-sm sm:text-base text-[#515154] leading-relaxed">
              في دار العسل والزيتون، لا نتبع النموذج التقليدي بشراء كميات هائلة وتخزينها لأشهر تحت درجات حرارة غير ملائمة تفقد العسل والزيوت خصائصها الحيوية. بدلاً من ذلك، نربطك مباشرة بالمناحل والمعاصر المعتمدة:
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-white p-4 rounded-[14px] border border-[#d2d2d7]/50 shadow-sm">
                <div className="w-9 h-9 rounded-full bg-[#143823]/10 text-[#143823] flex items-center justify-center shrink-0 mt-0.5 border border-[#c59b27]/30">
                  <SearchCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#1d1d1f]">1. تأكيد الجودة والسعر لدى المورد فور طلبك</h4>
                  <p className="text-xs text-[#515154] mt-0.5">يتواصل فريقنا مع المورد المعتمد للتحقق من تاريخ الدفعة وجاهزية الشحن.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white p-4 rounded-[14px] border border-[#d2d2d7]/50 shadow-sm">
                <div className="w-9 h-9 rounded-full bg-[#143823]/10 text-[#143823] flex items-center justify-center shrink-0 mt-0.5 border border-[#c59b27]/30">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#1d1d1f]">2. فحص وتغليف قياسي مقاوم للصدمات</h4>
                  <p className="text-xs text-[#515154] mt-0.5">تغليف عازل للحرارة والضوء ومقاوم للكسر لحماية البرطمانات والصفائح.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white p-4 rounded-[14px] border border-[#d2d2d7]/50 shadow-sm">
                <div className="w-9 h-9 rounded-full bg-[#143823]/10 text-[#143823] flex items-center justify-center shrink-0 mt-0.5 border border-[#c59b27]/30">
                  <Bike className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#1d1d1f]">3. إسناد فوري لمندوب معتمد وتتبع لحظي</h4>
                  <p className="text-xs text-[#515154] mt-0.5">توزيع الطلب على كابتن التوصيل في منطقتك ومتابعة خط السير حتى باب منزلك.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#c59b27] hover:text-[#a37f1e] hover:underline transition-colors"
              >
                <span>تعرف بالتفصيل على موردينا وشهادات النقاء</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>

          </div>

          <div className="relative">
            <div className="card aspect-[4/3] rounded-[18px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-[#d2d2d7]/60 bg-white p-3 !mb-0">
              <div className="w-full h-full rounded-[14px] overflow-hidden">
                <img
                  src="/images/olive-oil/olive-oil-01a-siwa.jpg"
                  alt="معاصر الزيتون بسيوة"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="mt-3 sm:mt-0 sm:absolute sm:-bottom-4 sm:right-6 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-[14px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#d2d2d7]/50 text-right max-w-full sm:max-w-xs">
              <p className="text-xs font-bold text-[#1d1d1f] mb-1">حموضة مثبتة مخبرياً 0.38%</p>
              <p className="text-[11px] text-[#515154] leading-relaxed">
                زيت زيتون واحة سيوة البكر الممتاز، معصور هيدروليكياً على البارد في نفس يوم الجني.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
