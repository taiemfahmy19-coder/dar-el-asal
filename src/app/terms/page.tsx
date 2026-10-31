import React from 'react';

export default function TermsPage() {
  return (
    <div className="bg-ivory-50/50 min-h-screen py-14 text-right">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-forest-950 font-cairo">
            الشروط والأحكام
          </h1>
          <p className="text-xs text-gray-500 mt-1">آخر تحديث: أكتوبر 2026</p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-ivory-200 shadow-subtle space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-bold text-base text-forest-950">1. طبيعة الخدمة ونموذج البيع</h2>
            <p>
              يعمل متجر "بازار" بنموذج توفير المنتجات الغذائية حسب الطلب (Order-Based Commerce). جميع المنتجات المعروضة تخضع لتأكيد توفرها وجودتها لدى الموردين قبل الاعتماد النهائي للشحن.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-bold text-base text-forest-950">2. الأسعار والمدفوعات</h2>
            <p>
              تُعرض جميع الأسعار بالجنيه المصري (ج.م) شاملة كافة الضرائب المعمول بها. يحق للمستهلك الدفع نقداً عند الاستلام (COD) بعد المعاينة، أو عبر وسائل الدفع الرقمية المعتمدة.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-bold text-base text-forest-950">3. إلغاء الطلبات</h2>
            <p>
              يحق للعميل إلغاء طلبه مباشرة من حسابه طالما كان الطلب في مرحلة "بانتظار التأكيد". في حال بدء التجهيز أو خروج المندوب، يرجى التواصل فوراً مع خدمة العملاء.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-bold text-base text-forest-950">4. التزامات الجودة</h2>
            <p>
              يلتزم بازار بأن جميع المنتجات الطبيعية مطابقة للأوصاف المذكورة في صفحة المنتج، وغير مغشوشة أو مخلوطة بأي مواد غير مصرح بها.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
