import React from 'react';
import { Truck, ShieldCheck, RefreshCw, MapPin, CheckCircle2, CircleDashed } from 'lucide-react';
import { ACTIVE_GOVERNORATES, PLANNED_GOVERNORATES, formatPrice } from '@/lib/utils';

export default function ShippingPolicyPage() {
  return (
    <div className="bg-ivory-50/50 min-h-screen py-14 text-right">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-forest-950 font-cairo">
            سياسة الشحن ومناطق التوصيل والمعاينة
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            دار العسل والزيتون — التوصيل المبرّد والآمن بنطاق الإسكندرية حاليًا
          </p>
        </div>

        {/* Delivery Terms */}
        <div className="bg-white rounded-3xl p-8 border border-ivory-200 shadow-subtle space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-forest-50 border border-forest-200 text-forest-950 space-y-1">
              <span className="font-bold text-sm block flex items-center gap-2">
                <MapPin className="w-4 h-4 text-forest-800" aria-hidden="true" />
                النطاق الجغرافي المتاح الآن:
              </span>
              <p className="text-xs text-gray-600">
                التوصيل متاح حاليًا داخل <strong>محافظة الإسكندرية</strong> فقط عبر شركة توصيل مخصصة وسيارات مجهزة. باقي المحافظات قيد التخطيط ولم تُفعّل بعد.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-gold-50 border border-gold-200 text-gold-950 space-y-1">
              <span className="font-bold text-sm block">احتساب تكلفة الشحن:</span>
              <p className="text-xs text-gray-600">
                رسوم التوصيل داخل الإسكندرية <strong>{formatPrice(ACTIVE_GOVERNORATES[0]?.fee || 0)}</strong>، ويتم تأكيد التسعيرة النهائية وفق عنوان الاستلام قبل تنفيذ الطلب.
              </p>
            </div>
          </div>

          <section className="space-y-2">
            <h3 className="font-bold text-base text-forest-950">سياسة المعاينة والاستلام</h3>
            <p>
              يحق لعملاء دار العسل والزيتون معاينة الطرد مع كابتن التوصيل والتأكد من سلامة العبوات قبل السداد نقداً، حفاظاً على الثقة المتبادلة وضمان وصول المنتج بحالته الطبيعية الأصلية.
            </p>
          </section>

          {/* Active governorates */}
          <section className="space-y-3 pt-4 border-t border-ivory-200" aria-labelledby="active-governorates-title">
            <h3 id="active-governorates-title" className="font-bold text-base text-forest-950 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              المحافظات المتاحة للطلب الآن
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {ACTIVE_GOVERNORATES.map((g) => (
                <div key={g.name} className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between gap-3">
                  <span className="font-bold text-forest-950 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                    {g.name}
                  </span>
                  <span className="font-semibold text-emerald-900">{formatPrice(g.fee)}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Planned governorates */}
          <section className="space-y-3 pt-4 border-t border-ivory-200" aria-labelledby="planned-governorates-title">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <h3 id="planned-governorates-title" className="font-bold text-base text-forest-950 flex items-center gap-2">
                <CircleDashed className="w-5 h-5 text-gray-500" aria-hidden="true" />
                محافظات قيد التخطيط للتوسع
              </h3>
              <span className="text-[11px] text-gray-500 bg-gray-100 border border-gray-200 rounded-full px-3 py-1">
                غير متاح للطلب حاليًا
              </span>
            </div>
            <p className="text-xs text-gray-600">
              نعمل على تفعيل التوصيل تدريجيًا. اختيار أي من هذه المحافظات غير متاح في صفحة الدفع في الوقت الحالي، ولا يتم إنشاء طلب لها.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {PLANNED_GOVERNORATES.map((g) => (
                <div key={g.name} className="p-2.5 bg-ivory-50 rounded-xl border border-ivory-200 flex items-center justify-between gap-2 text-gray-600">
                  <span className="font-medium text-gray-700">{g.name}</span>
                  <span className="text-[10px] text-gray-500">قريبًا</span>
                </div>
              ))}
            </div>
          </section>

          {/* Service commitments */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-ivory-200 text-[11px]">
            <div className="flex items-start gap-2">
              <Truck className="w-4 h-4 text-forest-800 shrink-0" aria-hidden="true" />
              <span>توصيل مبرد وآمن داخل الإسكندرية.</span>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-forest-800 shrink-0" aria-hidden="true" />
              <span>معاينة المنتجات قبل الدفع عند الاستلام.</span>
            </div>
            <div className="flex items-start gap-2">
              <RefreshCw className="w-4 h-4 text-forest-800 shrink-0" aria-hidden="true" />
              <span>استرجاع فوري عند عدم المطابقة.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
