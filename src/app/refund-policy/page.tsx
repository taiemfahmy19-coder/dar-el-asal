import type { Metadata } from 'next';
import { BRAND } from '@/lib/config';

export const metadata: Metadata = {
  title: `سياسة الاستبدال والاسترجاع | ${BRAND.name}`,
  description: 'شروط استبدال أو استرجاع منتجات دار العسل والزيتون.',
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-7">
    <h2 className="text-base font-bold text-[#143823] mb-2">{title}</h2>
    <div className="text-sm leading-relaxed text-[#515154] space-y-2">{children}</div>
  </section>
);

export default function RefundPolicyPage() {
  return (
    <main dir="rtl" className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-black text-[#143823] mb-1">سياسة الاستبدال والاسترجاع</h1>
      <p className="text-xs text-[#515154] mb-8">آخر تحديث: نوفمبر 2026</p>

      <Section title="حقك في الرفض عند الاستلام">
        <p>لديك الحق في فحص الطلب أمام مندوب التوصيل. إذا وصل المنتج مكسورًا أو تالفًا أو مخالفًا لما طلبته، يمكنك رفض الاستلام فورًا دون أي تكلفة.</p>
      </Section>

      <Section title="بعد الاستلام">
        <p>في حال اكتشاف خلل في المنتج بعد الاستلام، تواصل معنا عبر واتساب المتجر خلال 3 أيام مع صورة للمنتج وتغليفه، وسنستبدله أو نعيد قيمته حسب الحالة.</p>
      </Section>

      <Section title="ما لا يشمله الاسترجاع">
        <p>المنتجات المفتوحة أو المستخدمة جزئيًا بعد ثبوت سلامتها لا تُستبدل، لأن طبيعة المنتجات الغذائية لا تسمح ببيعها مجددًا بعد فتح الغلاف.</p>
      </Section>

      <Section title="آلية رد المبلغ">
        <p>تُرد المبالغ بالطريقة التي تم الدفع بها خلال مدة لا تتجاوز 7 أيام عمل من تأكيد الاسترجاع.</p>
      </Section>
    </main>
  );
}
