import type { Metadata } from 'next';
import { BRAND } from '@/lib/config';

export const metadata: Metadata = {
  title: `سياسة الخصوصية | ${BRAND.name}`,
  description: 'كيف نجمع بياناتك ونحميها عند التسوق من دار العسل والزيتون.',
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-7">
    <h2 className="text-base font-bold text-[#143823] mb-2">{title}</h2>
    <div className="text-sm leading-relaxed text-[#515154] space-y-2">{children}</div>
  </section>
);

export default function PrivacyPolicyPage() {
  return (
    <main dir="rtl" className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-black text-[#143823] mb-1">سياسة الخصوصية</h1>
      <p className="text-xs text-[#515154] mb-8">آخر تحديث: نوفمبر 2026</p>

      <Section title="البيانات التي نجمعها">
        <p>نجمع فقط ما نحتاجه لإتمام طلبك: الاسم، رقم الهاتف، البريد الإلكتروني، عنوان التوصيل، وتاريخ التسليم المطلوب.</p>
        <p>كلمات المرور تُخزَّن مشفّرة (hash) على الخادم ولا يمكن لأي طرف — بما في ذلك فريقنا — قراءتها.</p>
      </Section>

      <Section title="ما لا نخزّنه على جهازك">
        <p>لا نحفظ في متصفحك (localStorage) أي كلمات مرور أو بيانات طلبات حساسة. ما يُحفظ محليًا يقتصر على محتويات السلة والمفضلة (أرقام المنتجات فقط).</p>
        <p>جلسة تسجيل الدخول محفوظة في كوكي آمن (httpOnly) لا يمكن للسكربتات قراءته، وتنتهي فقط عند تسجيل الخروج اليدوي.</p>
      </Section>

      <Section title="استخدام البيانات">
        <p>تُستخدم بياناتك للاتصال بك لتأكيد الطلب وتسليمه فقط. لا نبيع بياناتك ولا نشاركها مع أي طرف تسويقي.</p>
      </Section>

      <Section title="حقوقك">
        <p>يمكنك طلب تعديل أو حذف حسابك وبياناتك في أي وقت بالتواصل معنا عبر واتساب المتجر.</p>
      </Section>
    </main>
  );
}
