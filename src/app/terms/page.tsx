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
              يعمل متجر "دار العسل والزيتون" (بإشراف المالك: شادي محمد توفيق) بنموذج توفير المنتجات الطبيعية عالية النقاء حسب الطلب. جميع طلبات الشراء الواردة تمثل طلبات رغبة شراء تخضع لمراجعة الإدارة وتأكيد الأسعار وتكلفة الشحن مع شركة التوصيل المعتمدة قبل تأكيد البيع النهائي.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-bold text-base text-forest-950">2. الأسعار وطريقة الدفع</h2>
            <p>
              تُعرض جميع أسعار المنتجات بالجنيه المصري (ج.م). طريقة الدفع المعتمدة حالياً للتدشين هي الدفع نقداً عند الاستلام (Cash on Delivery)، حيث يقوم العميل بالدفع لمندوب شركة التوصيل بعد استلام الطرد.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-bold text-base text-forest-950">3. سياسة الإلغاء الصارمة (مهلة الـ 6 ساعات)</h2>
            <p>
              يحق للعميل إلغاء طلبه ذاتياً من حسابه طالما تم طلب الإلغاء قبل موعد التوصيل المجدول بمدة لا تقل عن ست (6) ساعات كاملة. في حال تبقي أقل من 6 ساعات على موعد التوصيل، يتم تعطيل الإلغاء الذاتي لحماية تكاليف التجهيز ومسار المندوب، وتتطلب أي حالة استثنائية مراجعة الإدارة يدوياً.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-bold text-base text-forest-950">4. التزامات الجودة والمعاينة</h2>
            <p>
              تلتزم دار العسل والزيتون بأن كافة منتجات العسل وزيت الزيتون طبيعية ونقية 100% وخالية من أي إضافات صناعية أو تغذية سكرية غير طبيعية، ويحق للمشتري معاينة الطلب والتأكد من سلامة التغليف عند الاستلام.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
