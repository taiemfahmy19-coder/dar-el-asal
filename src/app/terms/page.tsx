import type { Metadata } from 'next';
import { BRAND } from '@/lib/config';

export const metadata: Metadata = {
  title: `الشروط والأحكام | ${BRAND.name}`,
  description: 'شروط استخدام متجر دار العسل والزيتون وإنهاء الطلبات.',
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-7">
    <h2 className="text-base font-bold text-[#143823] mb-2">{title}</h2>
    <div className="text-sm leading-relaxed text-[#515154] space-y-2">{children}</div>
  </section>
);

export default function TermsPage() {
  return (
    <main dir="rtl" className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-black text-[#143823] mb-1">الشروط والأحكام</h1>
      <p className="text-xs text-[#515154] mb-8">آخر تحديث: نوفمبر 2026</p>

      <Section title="الطلبات">
        <p>إرسال الطلب عبر الموقع يمثل طلب شراء أولي. يُتَم الطلب بعد تأكيدنا له هاتفيًا واعتماد السعر النهائي في عرض السعر.</p>
        <p>الأسعار المعروضة بالجنيه المصري، وتُحسب مصاريف الشحن نهائيًا عند تأكيد الطلب حسب المحافظة.</p>
      </Section>

      <Section title="دقة البيانات">
        <p>يجب إدخال رقم هاتف مصري صحيح (11 رقمًا) وعنوان توصيل واضح داخل الإسكندرية. الطلبات ببيانات غير صحيحة قد تُرفض.</p>
      </Section>

      <Section title="المنتجات">
        <p>العسل وزيت الزيتون منتجات طبيعية؛ قد تختلف درجة اللون والقوام بين الدفعات طبيعيًا دون تأثير على الجودة.</p>
        <p>تُفحص دفعات العسل مخبريًا قبل التعبئة، وتقارير الفحص متاحة عند الطلب عبر واتساب المتجر.</p>
      </Section>

      <Section title="المحتوى">
        <p>جميع النصوص والصور في الموقع ملك لدار العسل والزيتون ولا يجوز إعادة استخدامها تجاريًا دون إذن.</p>
      </Section>
    </main>
  );
}
