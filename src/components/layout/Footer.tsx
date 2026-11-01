'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, ShieldCheck, Truck, RefreshCw, CreditCard } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#102d1c] text-gray-300 pt-16 pb-8 border-t border-[#c59b27]/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Features Row Bento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-white/10 text-right">
          <div className="flex items-start gap-4 p-5 rounded-[18px] bg-white/[0.04] border border-[#c59b27]/20">
            <div className="w-12 h-12 rounded-2xl bg-[#c59b27]/15 text-[#c59b27] flex items-center justify-center shrink-0 border border-[#c59b27]/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-1 tracking-tight">منتجات طبيعية مفحوصة 100%</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                لا نبيع إلا من مناحل ومعاصر معتمدة مع فحص وتحليل مخبري مؤكد لكل دفعة.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-[18px] bg-white/[0.04] border border-[#c59b27]/20">
            <div className="w-12 h-12 rounded-2xl bg-[#c59b27]/15 text-[#c59b27] flex items-center justify-center shrink-0 border border-[#c59b27]/30">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-1 tracking-tight">البيع حسب الطلب (طازج دائماً)</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                يتم جلب المنتج وتأكيد توفره فور طلبك مباشرة لضمان أطول فترة صلاحية ونقاء.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-[18px] bg-white/[0.04] border border-[#c59b27]/20">
            <div className="w-12 h-12 rounded-2xl bg-[#c59b27]/15 text-[#c59b27] flex items-center justify-center shrink-0 border border-[#c59b27]/30">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-1 tracking-tight">ضمان الاسترجاع والمطابقة</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                حقك الكامل في المعاينة عند الاستلام، مع إمكانية الاسترجاع الفوري في حال عدم الرضا.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 py-12 text-right">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-44 bg-white/10 rounded-lg p-1 overflow-hidden border border-white/20">
                <img
                  src="/images/dar-logo-full.jpg"
                  alt="دار العسل والزيتون"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              دار العسل والزيتون — وجهتك الأولى لأجود منتجات النحل الطبيعي، عسل السدر الجبلي، وزيت الزيتون البكر الممتاز المعصور على البارد من الواحات وسفوح الجبال.
            </p>
            <div className="pt-2 text-xs text-gray-400 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#c59b27]" />
              <span>الدفع نقداً عند الاستلام (Cash on Delivery)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 border-r-2 border-[#c59b27] pr-3 tracking-tight">
              أقسام المتجر
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <Link href="/products?categoryId=cat-honey" className="hover:text-white transition-colors">
                  عسل نحل طبيعي وسدر جبلي
                </Link>
              </li>
              <li>
                <Link href="/products?categoryId=cat-olive-oil" className="hover:text-white transition-colors">
                  زيت زيتون بكر معصور على البارد
                </Link>
              </li>
              <li>
                <Link href="/#smart-package" className="hover:text-white transition-colors">
                  باقة اختار لك المصممة
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  كافة المنتجات المتاحة
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service & Policies */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 border-r-2 border-[#c59b27] pr-3 tracking-tight">
              خدمة العملاء والسياسات
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <Link href="/orders" className="hover:text-white transition-colors">
                  متابعة وتتبع طلباتي
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white transition-colors">
                  سياسة الشحن ومناطق التوصيل
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  الشروط والأحكام وسياسة الإلغاء (6 ساعات)
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link href="/delivery/apply" className="text-[#c59b27] hover:underline font-medium transition-colors">
                  انضم لفريق التوصيل المعتمد
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Business Info */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 border-r-2 border-[#c59b27] pr-3 tracking-tight">
              بيانات المتجر والتشغيل
            </h4>
            <ul className="space-y-3 text-xs text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#c59b27] shrink-0 mt-0.5" />
                <span>الإسكندرية، جمهورية مصر العربية (نطاق التوزيع الأساسي)</span>
              </li>
              <li className="text-[11px] text-gray-400 leading-relaxed border-t border-white/10 pt-2">
                إدارة وإشراف: <span className="text-gray-200 font-semibold">شادي محمد توفيق</span>
              </li>
              <li className="text-[11px] text-gray-400 leading-relaxed">
                خدمة العملاء ومتابعة عروض الأسعار متاحة يومياً عبر حسابك بالمتجر.
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© 2026 دار العسل والزيتون (DAR EL ASAL & OLIVE) — جميع الحقوق محفوظة.</p>
          <p className="text-[11px] text-gray-500">
            المالك: شادي محمد توفيق | الإسكندرية، مصر
          </p>
        </div>

      </div>
    </footer>
  );
}
