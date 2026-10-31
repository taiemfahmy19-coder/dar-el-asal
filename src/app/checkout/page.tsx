'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Truck, CreditCard, Banknote, AlertCircle, Lock } from 'lucide-react';
import { useCart } from '@/components/context/CartContext';
import { useAuth } from '@/components/context/AuthContext';
import { formatPrice, EGYPTIAN_GOVERNORATES, getDeliveryFee } from '@/lib/utils';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [governorate, setGovernorate] = useState('القاهرة');
  const [city, setCity] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [buildingDetails, setBuildingDetails] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'CARD' | 'INSTAPAY'>('COD');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-16 px-4 text-right bg-[#f5f5f7]">
        <div className="card p-8 max-w-md w-full border border-[#d2d2d7]/50 text-center space-y-4 !rounded-[18px]">
          <p className="text-base font-semibold text-[#1d1d1f]">سلة المشتريات فارغة</p>
          <Link
            href="/products"
            className="btn inline-block px-6 py-2.5 rounded-[980px] bg-[#0071e3] text-white font-medium text-xs hover:bg-[#0077ed]"
          >
            تصفح المنتجات
          </Link>
        </div>
      </div>
    );
  }

  const freeShippingThreshold = 1200;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const deliveryFee = isFreeShipping ? 0 : getDeliveryFee(governorate);
  const totalAmount = subtotal + deliveryFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !phone.trim() || !streetAddress.trim() || !city.trim()) {
      setError('يرجى استكمال جميع بيانات التوصيل الإلزامية (الاسم، الهاتف، المحافظة، المدينة، العنوان بالتفصيل).');
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        customerName: fullName.trim(),
        customerEmail: email.trim() || 'customer@bazaar.local',
        customerPhone: phone.trim(),
        governorate,
        city: city.trim(),
        streetAddress: streetAddress.trim(),
        buildingDetails: buildingDetails.trim(),
        notes: notes.trim(),
        paymentMethod,
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'فشل إتمام الطلب، يرجى المحاولة مرة أخرى');
        setLoading(false);
        return;
      }

      clearCart();
      router.push(`/orders/confirmation?orderId=${data.order.id}`);
    } catch {
      setError('حدث خطأ في الاتصال بالخادم أثناء تأكيد الطلب');
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f5f5f7] min-h-screen py-10 text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] tracking-tight">
            إتمام الطلب وبيانات التوصيل
          </h1>
          <p className="text-xs text-[#515154] mt-1">
            املأ بيانات الشحن وسيتم التواصل معك لتأكيد الجودة والتوفر قبل إرسال المندوب
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-[12px] bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Address & Payment Details Form */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Delivery Address Bento */}
            <div className="card p-6 sm:p-8 border border-[#d2d2d7]/50 space-y-5 !rounded-[18px]">
              <h2 className="text-base font-semibold text-[#1d1d1f] flex items-center gap-2 border-b border-[#d2d2d7]/40 pb-3 tracking-tight">
                <Truck className="w-5 h-5 text-[#c59b27]" />
                <span>1. عنوان التوصيل وبيانات المستلم</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#1d1d1f] mb-1.5">
                    الاسم الكامل للمستلم *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مثال: أحمد عبد الله"
                    className="w-full px-3.5 py-3 rounded-[12px] bg-[#f5f5f7] border border-[#d2d2d7]/80 focus:outline-none focus:border-[#0071e3] focus:ring-4 focus:ring-blue-500/15 text-[#1d1d1f]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1d1d1f] mb-1.5">
                    رقم الهاتف المحمول (للتواصل مع الكابتن) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01012345678"
                    dir="ltr"
                    className="w-full px-3.5 py-3 rounded-[12px] bg-[#f5f5f7] border border-[#d2d2d7]/80 focus:outline-none focus:border-[#0071e3] focus:ring-4 focus:ring-blue-500/15 text-right text-[#1d1d1f]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1d1d1f] mb-1.5">
                    البريد الإلكتروني (لتلقي تحديثات الطلب)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@domain.com"
                    dir="ltr"
                    className="w-full px-3.5 py-3 rounded-[12px] bg-[#f5f5f7] border border-[#d2d2d7]/80 focus:outline-none focus:border-[#0071e3] focus:ring-4 focus:ring-blue-500/15 text-right text-[#1d1d1f]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1d1d1f] mb-1.5">
                    المحافظة *
                  </label>
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-[12px] bg-[#f5f5f7] border border-[#d2d2d7]/80 focus:outline-none focus:border-[#0071e3] font-medium text-[#1d1d1f]"
                  >
                    {EGYPTIAN_GOVERNORATES.map((gov) => (
                      <option key={gov.name} value={gov.name}>
                        {gov.name} ({formatPrice(gov.fee)} توصيل)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#1d1d1f] mb-1.5">
                    المدينة / الحي أو المنطقة *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="مثال: المعادي الجديدة، أو التجمع الخامس، أو سموحة"
                    className="w-full px-3.5 py-3 rounded-[12px] bg-[#f5f5f7] border border-[#d2d2d7]/80 focus:outline-none focus:border-[#0071e3] focus:ring-4 focus:ring-blue-500/15 text-[#1d1d1f]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#1d1d1f] mb-1.5">
                    اسم الشارع والعنوان بالتفصيل *
                  </label>
                  <input
                    type="text"
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="اسم الشارع ورقم العقار أو علامة مميزة قريبة"
                    className="w-full px-3.5 py-3 rounded-[12px] bg-[#f5f5f7] border border-[#d2d2d7]/80 focus:outline-none focus:border-[#0071e3] focus:ring-4 focus:ring-blue-500/15 text-[#1d1d1f]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#1d1d1f] mb-1.5">
                    تفاصيل العقار (الدور، رقم الشقة، مدخل خاص)
                  </label>
                  <input
                    type="text"
                    value={buildingDetails}
                    onChange={(e) => setBuildingDetails(e.target.value)}
                    placeholder="مثال: عمارة 12، الدور الثاني، شقة 5"
                    className="w-full px-3.5 py-3 rounded-[12px] bg-[#f5f5f7] border border-[#d2d2d7]/80 focus:outline-none focus:border-[#0071e3] focus:ring-4 focus:ring-blue-500/15 text-[#1d1d1f]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#1d1d1f] mb-1.5">
                    ملاحظات إضافية للتوصيل
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="ملاحظات حول وقت الاستلام المفضل أو تعليمات خاصة للمندوب..."
                    className="w-full px-3.5 py-3 rounded-[12px] bg-[#f5f5f7] border border-[#d2d2d7]/80 focus:outline-none focus:border-[#0071e3] focus:ring-4 focus:ring-blue-500/15 text-[#1d1d1f]"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selection Bento */}
            <div className="card p-6 sm:p-8 border border-[#d2d2d7]/50 space-y-4 !rounded-[18px]">
              <h2 className="text-base font-semibold text-[#1d1d1f] flex items-center gap-2 border-b border-[#d2d2d7]/40 pb-3 tracking-tight">
                <CreditCard className="w-5 h-5 text-[#0071e3]" />
                <span>2. طريقة الدفع</span>
              </h2>

              <div className="space-y-3">
                
                {/* COD Option */}
                <label
                  className={`flex items-start gap-3 p-4 rounded-[14px] border cursor-pointer transition-all ${
                    paymentMethod === 'COD'
                      ? 'bg-blue-50/60 border-[#0071e3] ring-1 ring-[#0071e3]'
                      : 'bg-[#f5f5f7] border-[#d2d2d7]/60 hover:bg-gray-200/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="mt-1 accent-[#0071e3]"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center gap-2 font-semibold text-[#1d1d1f] text-sm">
                      <Banknote className="w-4 h-4 text-emerald-600" />
                      <span>الدفع نقداً عند الاستلام (COD)</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                        الأكثر اختياراً
                      </span>
                    </div>
                    <p className="text-[#515154] mt-1 leading-relaxed">
                      ادفع للكابتن بعد استلام الطرد ومعاينة المنتجات والتأكد من سلامتها.
                    </p>
                  </div>
                </label>

                {/* InstaPay Option */}
                <label
                  className={`flex items-start gap-3 p-4 rounded-[14px] border cursor-pointer transition-all ${
                    paymentMethod === 'INSTAPAY'
                      ? 'bg-blue-50/60 border-[#0071e3] ring-1 ring-[#0071e3]'
                      : 'bg-[#f5f5f7] border-[#d2d2d7]/60 hover:bg-gray-200/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="INSTAPAY"
                    checked={paymentMethod === 'INSTAPAY'}
                    onChange={() => setPaymentMethod('INSTAPAY')}
                    className="mt-1 accent-[#c59b27]"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center gap-2 font-semibold text-[#1d1d1f] text-sm">
                      <span>التحويل اللحظي عبر InstaPay</span>
                    </div>
                    <p className="text-[#515154] mt-1 leading-relaxed">
                      يمكنك تحويل المبلغ عبر عنوان الدفع اللحظي (IPA) الخاص بالمتجر بعد تأكيد الطلب.
                    </p>
                  </div>
                </label>

                {/* Card Option */}
                <label
                  className={`flex items-start gap-3 p-4 rounded-[14px] border cursor-pointer transition-all ${
                    paymentMethod === 'CARD'
                      ? 'bg-[#f5ebd2] border-[#c59b27] ring-1 ring-[#c59b27]'
                      : 'bg-[#f5f5f7] border-[#d2d2d7]/60 hover:bg-gray-200/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="CARD"
                    checked={paymentMethod === 'CARD'}
                    onChange={() => setPaymentMethod('CARD')}
                    className="mt-1 accent-[#c59b27]"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center gap-2 font-semibold text-[#1d1d1f] text-sm">
                      <CreditCard className="w-4 h-4 text-[#c59b27]" />
                      <span>بطاقة بنكية معتمدة (فيزا / ماستركارد / ميزة)</span>
                    </div>
                    <p className="text-[#515154] mt-1 leading-relaxed">
                      بوابة دفع آمنة ومشفرة ومحمية ببروتوكول 3D Secure.
                    </p>
                  </div>
                </label>

              </div>
            </div>

          </div>

          {/* Order Summary & Submit Column */}
          <div className="lg:col-span-4">
            <div className="card p-6 border border-[#d2d2d7]/50 sticky top-24 space-y-5 !rounded-[18px]">
              <h3 className="font-semibold text-base text-[#1d1d1f] border-b border-[#d2d2d7]/40 pb-3 tracking-tight">
                ملخص الطلب ({items.length} منتجات)
              </h3>

              {/* Items recap */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center gap-3 text-xs">
                    <div className="w-12 h-12 rounded-[10px] bg-[#f5f5f7] overflow-hidden relative shrink-0 border border-[#d2d2d7]/50">
                      <Image
                        src={product.images[0] || '/images/honey/prod-honey-plain.jpg'}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#1d1d1f] truncate">{product.name}</p>
                      <p className="text-[11px] text-[#515154]">
                        {quantity} × {formatPrice(product.price)}
                      </p>
                    </div>
                    <span className="font-bold text-[#1d1d1f] shrink-0">
                      {formatPrice(product.price * quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="pt-3 border-t border-[#d2d2d7]/40 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-[#515154]">
                  <span>المجموع الفرعي:</span>
                  <span className="font-bold text-[#1d1d1f]">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between text-[#515154]">
                  <span>رسوم التوصيل ({governorate}):</span>
                  <span className="font-bold text-[#1d1d1f]">
                    {isFreeShipping ? (
                      <span className="text-emerald-700 font-semibold">شحن مجاني (توفير {formatPrice(getDeliveryFee(governorate))})</span>
                    ) : (
                      formatPrice(deliveryFee)
                    )}
                  </span>
                </div>

                <div className="pt-3 border-t border-[#d2d2d7]/40 flex items-center justify-between text-[#1d1d1f]">
                  <span className="font-semibold text-sm">المبلغ الإجمالي المطلوب:</span>
                  <span className="font-bold text-2xl text-[#1d1d1f]">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="btn w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-[980px] bg-[#143823] text-[#f5ebd2] font-semibold text-sm hover:bg-[#1a4a2f] border border-[#c59b27]/60 hover:scale-[1.02] active:scale-95 transition-all shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-white/90" />
                    <span>تأكيد وإتمام الطلب ({formatPrice(totalAmount)})</span>
                  </>
                )}
              </button>

              <div className="text-[11px] text-[#515154] text-center leading-relaxed space-y-1">
                <p className="flex items-center justify-center gap-1.5 text-emerald-700 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>تأكيد التوفر المباشر من المورد</span>
                </p>
                <p>لن يتم خصم أو تحصيل أي مبالغ قبل تأكيد توفر الدفعة الطازجة.</p>
              </div>

            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
