import React from 'react';
import { Truck, ShieldCheck, RefreshCw, Clock } from 'lucide-react';
import { EGYPTIAN_GOVERNORATES, formatPrice } from '@/lib/utils';

export default function ShippingPolicyPage() {
  return (
    <div className="bg-ivory-50/50 min-h-screen py-14 text-right">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-forest-950 font-cairo">
            سياسة الشحن ومناطق التوصيل والمعاينة
          </h1>
          <p className="text-xs text-gray-500 mt-1">دار العسل والزيتون — التوصيل المبرّد والآمن بنطاق الإسكندرية</p>
        </div>

        {/* Delivery Terms */}
        <div className="bg-white rounded-3xl p-8 border border-ivory-200 shadow-subtle space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-forest-50 border border-forest-200 text-forest-950 space-y-1">
              <span className="font-bold text-sm block">النطاق الجغرافي الأساسي للتدشين:</span>
              <p className="text-xs text-gray-600">
                مدينة الإسكندرية ومناطقها الرئيسية عبر شركة توصيل مخصصة وسيارات مجهزة، مع جدولة التوسع للقاهرة والمحافظات الأخرى في مراحل لاحقة.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-gold-50 border border-gold-200 text-gold-950 space-y-1">
              <span className="font-bold text-sm block">احتساب تكلفة الشحن:</span>
              <p className="text-xs text-gray-600">
                يتم تحديد قيمة الشحن بدقة وفق تسعيرة شركة التوصيل المعتمدة حسب عنوان الاستلام، وتُدرج ضمن عرض السعر النهائي المعتمد قبل التأكيد.
              </p>
            </div>
          </div>

          <section className="space-y-2">
            <h3 className="font-bold text-base text-forest-950">سياسة المعاينة والاستلام</h3>
            <p>
              يحق لعملاء دار العسل والزيتون معاينة الطرد مع كابتن التوصيل والتأكد من سلامة العبوات قبل السداد نقداً، حفاظاً على الثقة المتبادلة وضمان وصول المنتج بحالته الطبيعية الأصلية.
            </p>
          </section>

          {/* Rates Table */}
          <section className="space-y-3 pt-4 border-t border-ivory-200">
            <h3 className="font-bold text-base text-forest-950">جدول رسوم التوصيل بحسب المحافظة</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {EGYPTIAN_GOVERNORATES.map((g) => (
                <div key={g.name} className="p-2.5 bg-ivory-50 rounded-xl border border-ivory-200 flex justify-between">
                  <span className="font-bold text-forest-950">{g.name}</span>
                  <span className="text-gray-500">{formatPrice(g.fee)}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
