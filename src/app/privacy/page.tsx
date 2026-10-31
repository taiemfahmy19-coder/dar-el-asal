import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="bg-ivory-50/50 min-h-screen py-14 text-right">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-forest-950 font-cairo">
            سياسة الخصوصية وحماية البيانات
          </h1>
          <p className="text-xs text-gray-500 mt-1">آخر تحديث: أكتوبر 2026</p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-ivory-200 shadow-subtle space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-bold text-base text-forest-950">1. البيانات التي نجمعها</h2>
            <p>
              نجمع فقط البيانات الضرورية لإتمام عمليات الشحن والتواصل: الاسم، رقم الهاتف، عنوان التوصيل، والبريد الإلكتروني. لا نطلب ولا نخزن أرقام البطاقات الائتمانية الحساسة في خوادمنا.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-bold text-base text-forest-950">2. مشاركة البيانات مع مناديب التوصيل</h2>
            <p>
              نشارك مع مندوب التوصيل المعتمد فقط الاسم ورقم الهاتف والعنوان الضروريين لتوصيل شحنتك المحددة. لا يستطيع المندوب الاطلاع على تاريخ طلباتك الأخرى أو معلوماتك الشخصية.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-bold text-base text-forest-950">3. أمان الحساب وكلمات المرور</h2>
            <p>
              تُحفظ كلمات المرور مشفرة بخوارزميات تجزئة قوية (bcrypt). لا يمكن لأي من موظفينا أو مدرائنا رؤية كلمة المرور كنص صريح.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
