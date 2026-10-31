'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Clock, Truck, ArrowLeft, PackageCheck } from 'lucide-react';
import { Order } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) setOrder(data.order);
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  return (
    <div className="bg-ivory-50/50 min-h-[75vh] flex items-center justify-center py-16 px-4 text-right">
      <div className="max-w-xl w-full bg-white rounded-3xl p-8 sm:p-10 border border-ivory-200 shadow-floating text-center space-y-6">
        
        {/* Celebration Badge */}
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-subtle animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-gold-700 bg-gold-100 px-3 py-1 rounded-full">
            تم تسجيل طلبك بنجاح
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-forest-950 font-cairo">
            شكراً لثقتك في بازار!
          </h1>
          {order && (
            <p className="text-sm font-bold text-forest-800">
              رقم الطلب: <span className="font-mono text-base">{order.orderNumber}</span>
            </p>
          )}
        </div>

        {/* Workflow Explanation Banner */}
        <div className="bg-ivory-50 rounded-2xl p-4 border border-ivory-200 text-xs text-gray-700 text-right space-y-2.5">
          <div className="flex items-center gap-2 text-forest-900 font-bold">
            <Clock className="w-4 h-4 text-gold-600" />
            <span>ما هي الخطوة التالية في نظام البيع حسب الطلب؟</span>
          </div>
          <p className="leading-relaxed">
            يقوم مدير المتجر الآن بالتواصل مع المورد المعتمد لتأكيد فحص الدفعة الطازجة، ثم يُسند الطلب لأحد مناديب التوصيل المعتمدين في منطقتك لتسليمه لك.
          </p>
        </div>

        {order && (
          <div className="border-t border-ivory-200 pt-4 space-y-2 text-xs text-right text-gray-600">
            <div className="flex justify-between">
              <span>اسم العميل:</span>
              <span className="font-bold text-forest-950">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span>عنوان التوصيل:</span>
              <span className="font-bold text-forest-950">
                {order.governorate} - {order.city}، {order.streetAddress}
              </span>
            </div>
            <div className="flex justify-between">
              <span>المبلغ الإجمالي المستحق:</span>
              <span className="font-black text-forest-950 text-sm">
                {formatPrice(order.totalAmount)} ({order.paymentMethod === 'COD' ? 'دفع عند الاستلام' : 'مدفوع'})
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {order && (
            <Link
              href={`/orders/${order.id}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-forest-900 text-white font-bold text-xs hover:bg-forest-800 shadow-premium transition-all"
            >
              <PackageCheck className="w-4 h-4 text-gold-400" />
              <span>متابعة وتتبع حالة الطلب لحظياً</span>
            </Link>
          )}
          <Link
            href="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-ivory-100 text-forest-900 font-bold text-xs hover:bg-ivory-200 transition-all border border-ivory-200"
          >
            <span>العودة للمتجر</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-gray-400">جارٍ تأكيد الطلب...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
