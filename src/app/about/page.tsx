import React from 'react';
import { ShieldCheck, Award, HeartHandshake, Eye, Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-ivory-50/50 min-h-screen py-14 text-right">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Hero */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-gold-700 bg-gold-100 px-3 py-1 rounded-full border border-gold-300">
            دار العسل والزيتون | DAR EL ASAL & OLIVE
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-forest-950 font-cairo">
            الأصالة من منبعها الحقيقي.. بدون وسطاء
          </h1>
          <p className="text-xs sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            انطلق مشروع "دار العسل والزيتون" بإدارة وإشراف الأستاذ شادي محمد توفيق انطلاقاً من مدينة الإسكندرية، بهدف توفير أجود أنواع عسل النحل النقي وزيت الزيتون البكر الممتاز مباشرة من المناحل والمعاصر المعتمدة بأعلى معايير النقاء.
          </p>
        </div>

        {/* Narrative & Philosophy */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-ivory-200 shadow-premium space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <h2 className="text-xl font-bold text-forest-950 font-cairo border-r-4 border-gold-500 pr-3">
            فلسفة البيع حسب الطلب (Order-Based Commerce)
          </h2>
          <p>
            تعتمد معظم المتاجر التقليدية على شراء كميات ضخمة وتخزينها لشهور طويلة في مستودعات ذات رطوبة وحرارة متقلبة، مما يؤدي إلى تبلور العسل وفقدان زيت الزيتون لنكهته الفاكهية الطازجة ومضادات الأكسدة الطبيعية.
          </p>
          <p>
            في دار العسل والزيتون، أحدثنا فارقاً نوعياً: نحن نبني علاقات موثوقة مع أصحاب المناحل المتخصصة ومعاصر الزيتون في سيوة ومزارع سيناء والواحات. عند استلام طلبك ومراجعته، يتم التأكد من جودة الدفعة وتاريخها، ثم يتم إعداد عرض السعر والتنسيق المباشر لتسليمها مبردة لباب منزلك.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-ivory-200 shadow-subtle text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-forest-50 text-forest-800 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-forest-950 text-sm">فحص معملي صارم</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              تحليل نسبة السكروز والهيدروكسي ميثيل في العسل لضمان عدم الغش، وفحص حموضة الزيوت.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-ivory-200 shadow-subtle text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-forest-50 text-forest-800 flex items-center justify-center mx-auto">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-forest-950 text-sm">شفافية المصدر</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              نوضح لكل منتج اسمه الحقيقي، وزنه الدقيق، والمزرعة أو المعصرة التي تم استخراجه منها.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-ivory-200 shadow-subtle text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-forest-50 text-forest-800 flex items-center justify-center mx-auto">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-forest-950 text-sm">دعم المزارع المحلي</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              ندعم الحرفيين والمزارعين وأصحاب المعاصر التقليدية بأسعار شراء عادلة ومباشرة.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
