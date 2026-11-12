import type { Metadata } from 'next';
import { BRAND } from '@/lib/config';

export const metadata: Metadata = {
  title: `سياسة الشحن | ${BRAND.name}`,
  description: 'مناطق التوصيل والمواعيد ومصاريف الشحن في دار العسل والزيتون.',
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-7">
    <h2 className="text-base font-bold text-[#143823] mb-2">{title}</h2>
    <div className="text-sm leading-relaxed text-[#515154] space-y-2">{children}</div>
  </section>
);

export default function ShippingPolicyPage() {
  return (
    <main dir="rtl" className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-black text-[#143823] mb-1">سياسة الشحن</h1>
      <p className="text-xs text-[#515154] mb-8">آخر تحديث: نوفمبر 2026</p>

      <Section title="نطاق التوصيل">
        <p>نوصل حاليًا داخل محافظة الإسكندرية فقط، ونعمل على التوسع تدريجيًا لمدن أخرى.</p>
      </Section>

      <Section title="المواعيد">
        <p>التوصيل خلال 1-2 يوم عمل من تأكيد الطلب، ويمكنك تحديد تاريخ التسليم المفضل عند إتمام الطلب.</p>
      </Section>

      <Section title="المصاريف">
        <p>الشحن تقديري 55 ج.م داخل الإسكندرية، ويُعتمد السعر النهائي في عرض السعر عند تأكيد طلبك هاتفيًا.</p>
      </Section>

      <Section title="التأخير">
        <p>في حال تأخر التوصيل عن الموعد المتفق عليه لأسباب قاهرة، سنتواصل معك هاتفيًا لتحديد موعد جديد يريحك.</p>
      </Section>
    </main>
  );
}
