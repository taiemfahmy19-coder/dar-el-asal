'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Truck, CheckCircle2, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { EGYPTIAN_GOVERNORATES } from '@/lib/utils';

export default function DeliveryApplyPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [governorate, setGovernorate] = useState('القاهرة');
  const [coveredAreas, setCoveredAreas] = useState('');
  const [vehicleType, setVehicleType] = useState('دراجة نارية مجهزة بصندوق عازل');
  const [nationalId, setNationalId] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/delivery/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          governorate,
          coveredAreas,
          vehicleType,
          nationalId,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'فشل إرسال الطلب');
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-ivory-50/50 min-h-screen py-12 px-4 text-right">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-ivory-200 shadow-premium space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2 border-b border-ivory-100 pb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-subtle border border-emerald-200">
            <Truck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-forest-950 font-cairo">
            انضم إلى فريق توصيل بازار (كابتن)
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            فرص عمل مرنة ومجزية لتوصيل المنتجات الغذائية الطبيعية لعملائنا في منطقتك
          </p>
        </div>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-forest-950 font-cairo">
              تم إرسال طلب الانضمام بنجاح!
            </h2>
            <div className="bg-ivory-50 p-4 rounded-2xl border border-ivory-200 text-xs text-gray-600 max-w-md mx-auto leading-relaxed text-right">
              <p className="font-bold text-forest-900 mb-1">حسابك قيد المراجعة حالياً من إدارة بازار.</p>
              <p>
                سيتم التواصل معك عبر الهاتف ({phone}) لمراجعة رخصة القيادة والاتفاق على مناطق التغطية وتفعيل حسابك لتسجيل الدخول والبدء في استلام المهام فوراً.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-forest-900 text-white font-bold text-xs hover:bg-forest-800"
            >
              العودة للصفحة الرئيسية
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-forest-950 mb-1.5">الاسم الثلاثي *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: ياسر كمال حسن"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-50 border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-forest-700/20"
                />
              </div>

              <div>
                <label className="block font-bold text-forest-950 mb-1.5">رقم الهاتف المحمول (واتساب) *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01012345678"
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-50 border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-forest-700/20 text-right"
                />
              </div>

              <div>
                <label className="block font-bold text-forest-950 mb-1.5">البريد الإلكتروني *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="captain@example.com"
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-50 border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-forest-700/20 text-right"
                />
              </div>

              <div>
                <label className="block font-bold text-forest-950 mb-1.5">المحافظة الأساسية *</label>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-50 border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-forest-700/20 font-semibold"
                >
                  {EGYPTIAN_GOVERNORATES.map((g) => (
                    <option key={g.name} value={g.name}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-forest-950 mb-1.5">المناطق والأحياء التي تفضل العمل بها *</label>
                <input
                  type="text"
                  required
                  value={coveredAreas}
                  onChange={(e) => setCoveredAreas(e.target.value)}
                  placeholder="مثال: المعادي، المقطم، حلوان، التجمع"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-50 border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-forest-700/20"
                />
              </div>

              <div>
                <label className="block font-bold text-forest-950 mb-1.5">وسيلة التوصيل المتاحة لديك *</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-50 border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-forest-700/20 font-semibold"
                >
                  <option value="دراجة نارية مجهزة بصندوق عازل">دراجة نارية مجهزة بصندوق عازل</option>
                  <option value="سكوتر كهربائي مجهز">سكوتر كهربائي مجهز</option>
                  <option value="سيارة نقل بضائع خفيفة">سيارة نقل بضائع خفيفة</option>
                  <option value="سيارة ملاكي مجهزة بعوازل">سيارة ملاكي مجهزة بعوازل</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-forest-950 mb-1.5">الرقم القومي (14 رقم) *</label>
                <input
                  type="text"
                  required
                  maxLength={14}
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="2900101..."
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-50 border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-forest-700/20 text-right"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-forest-950 mb-1.5">خبرات سابقة أو ملاحظات إضافية</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="اذكر أي خبرات سابقة في توصيل الأغذية الطازجة..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-50 border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-forest-700/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-2xl bg-forest-900 text-white font-bold text-sm hover:bg-forest-800 transition-all shadow-premium active:scale-95 disabled:bg-gray-400 mt-4"
            >
              {loading ? 'جارٍ إرسال الطلب...' : 'إرسال طلب الانضمام للمراجعة'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
