import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getOrderById } from '@/lib/db';
import { formatPrice } from '@/lib/utils';
import { ShieldCheck, CheckCircle2, Clock, PackageCheck, AlertCircle } from 'lucide-react';

interface Props {
  params: {
    id: string;
  };
}

export default function OrderVerificationPage({ params }: Props) {
  const order = getOrderById(params.id);

  if (!order) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-16 px-4 text-right bg-[#f5f5f7]">
        <div className="card p-8 max-w-md w-full border border-rose-200 text-center space-y-4 !rounded-[18px]">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-[#1d1d1f]">مستند غير مسجل أو غير صالح</h1>
          <p className="text-xs text-[#515154] leading-relaxed">
            لم نتمكن من التحقق من صحة هذا المستند في سجلات دار العسل والزيتون. قد يكون الرابط خاطئاً أو تم تعديله.
          </p>
          <Link
            href="/"
            className="btn px-6 py-2.5 rounded-[980px] bg-[#143823] text-[#f5ebd2] text-xs font-semibold"
          >
            الانتقال لمتجر دار العسل والزيتون
          </Link>
        </div>
      </div>
    );
  }

  // Pure verification view - No private customer address or phone leaked (Directive Sec 12.C)
  const isConfirmed = order.orderStatus === 'CONFIRMED' || order.orderStatus === 'DELIVERED' || order.orderStatus === 'OUT_FOR_DELIVERY';

  return (
    <div className="min-h-screen bg-[#fcfaf6] py-12 px-4 text-right">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Verification Card */}
        <div className="card p-6 sm:p-8 border border-[#c59b27]/40 shadow-premium !rounded-[20px] bg-white text-center space-y-5">
          
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
          </div>

          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#f5ebd2] text-[#143823] border border-[#c59b27]/40">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#c59b27]" />
              مستند أصلي معتمد وموثق
            </span>
            <h1 className="text-2xl font-black text-[#143823] font-cairo">
              دار العسل والزيتون
            </h1>
            <p className="text-xs text-[#515154]">
              DAR EL ASAL & OLIVE — الإسكندرية، مصر
            </p>
          </div>

          {/* Verification Meta Table */}
          <div className="border border-[#d2d2d7]/50 rounded-[14px] p-4 text-xs space-y-3 bg-[#fbf9f4] text-right">
            <div className="flex justify-between items-center py-1 border-b border-[#d2d2d7]/40">
              <span className="text-[#515154]">رقم الطلب المرجعي:</span>
              <span className="font-mono font-bold text-[#143823] text-sm">{order.orderNumber}</span>
            </div>

            {order.quotationNumber && (
              <div className="flex justify-between items-center py-1 border-b border-[#d2d2d7]/40">
                <span className="text-[#515154]">رقم عرض السعر:</span>
                <span className="font-mono font-bold text-[#c59b27]">{order.quotationNumber}</span>
              </div>
            )}

            <div className="flex justify-between items-center py-1 border-b border-[#d2d2d7]/40">
              <span className="text-[#515154]">تاريخ التسجيل:</span>
              <span className="font-medium text-[#1d1d1f]">
                {new Date(order.createdAt).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-[#d2d2d7]/40">
              <span className="text-[#515154]">حالة المستند:</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {isConfirmed ? 'طلب مؤكد ومعتمد' : 'طلب رغبة شراء قيد المراجعة'}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-[#d2d2d7]/40">
              <span className="text-[#515154]">عدد الأصناف المعتمدة:</span>
              <span className="font-bold text-[#1d1d1f]">{order.items.length} أصناف طبيعية</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-[#515154]">المبلغ الإجمالي الموثق:</span>
              <span className="font-extrabold text-base text-[#143823]">
                {formatPrice(order.totalAmount)}
              </span>
            </div>
          </div>

          <div className="p-3 bg-white rounded-[12px] border border-[#d2d2d7]/60 text-[11px] text-[#515154] leading-relaxed text-right space-y-1">
            <p className="font-semibold text-[#143823]">🛡️ سياسة الخصوصية وأمان التحقق:</p>
            <p>
              يتم حجب بيانات العميل الشخصية (الهاتف، العنوان الدقيق) لحماية الخصوصية. هذا الرمز الرقمي يثبت أصالة المستند في سجلات دار العسل والزيتون فقط.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-[980px] bg-[#143823] text-[#f5ebd2] text-xs font-semibold hover:bg-[#1a4a2f] border border-[#c59b27]/60"
            >
              زيارة موقع دار العسل والزيتون
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
