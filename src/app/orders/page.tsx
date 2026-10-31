'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Clock, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { Order } from '@/lib/types';
import { formatPrice, formatDate, ORDER_STATUS_MAP } from '@/lib/utils';
import { useAuth } from '@/components/context/AuthContext';

export default function OrdersHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-gray-500">
        <div className="w-8 h-8 border-4 border-forest-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm">جارٍ التحقق من الحساب...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-16 px-4 text-right">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-ivory-200 shadow-premium text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-ivory-100 text-forest-800 mx-auto flex items-center justify-center">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-forest-950 font-cairo">تسجيل الدخول مطلوب</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            يرجى تسجيل الدخول بحسابك لعرض سجل طلباتك ومتابعة خط سير الشحنات لحظياً.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest-900 text-white font-bold text-xs hover:bg-forest-800 transition-all shadow-subtle"
          >
            <span>تسجيل الدخول الآن</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ivory-50/40 min-h-screen py-10 text-right">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-forest-950 font-cairo">
            سجل طلباتي ({orders.length})
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            تابع حالة كل طلب وتاريخ تأكيد المورد والاستلام
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 h-36 animate-pulse border border-ivory-200"></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-ivory-200 shadow-subtle space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-ivory-100 text-gray-400 mx-auto flex items-center justify-center">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-forest-950">لا توجد طلبات سابقة حتى الآن</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              ابدأ الآن بتجربة منتجات بازار الطبيعية المفحوصة مخبرياً واطلب دفعتك الطازجة.
            </p>
            <Link
              href="/products"
              className="inline-block px-6 py-2.5 rounded-xl bg-forest-900 text-white font-bold text-xs hover:bg-forest-800"
            >
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => {
              const statusConf = ORDER_STATUS_MAP[ord.orderStatus] || ORDER_STATUS_MAP.PENDING;

              return (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-ivory-200 shadow-subtle hover:shadow-premium transition-all space-y-4"
                >
                  {/* Top line info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-ivory-100 gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-extrabold text-forest-950">
                        {ord.orderNumber}
                      </span>
                      <span className="text-xs text-gray-400">|</span>
                      <span className="text-xs text-gray-500">{formatDate(ord.createdAt)}</span>
                    </div>

                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${statusConf.bg} ${statusConf.color} ${statusConf.border}`}
                    >
                      {statusConf.label}
                    </span>
                  </div>

                  {/* Items mini row */}
                  <div className="flex flex-wrap items-center gap-2">
                    {ord.items.slice(0, 3).map((it) => (
                      <div
                        key={it.id}
                        className="flex items-center gap-2 bg-ivory-50 px-3 py-1.5 rounded-xl border border-ivory-200 text-xs"
                      >
                        <span className="font-bold text-forest-950">{it.productName}</span>
                        <span className="text-gray-500">×{it.quantity}</span>
                      </div>
                    ))}
                    {ord.items.length > 3 && (
                      <span className="text-xs text-gray-400 font-bold">
                        +{ord.items.length - 3} منتجات إضافية
                      </span>
                    )}
                  </div>

                  {/* Financials & Action */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-gray-500">المبلغ الإجمالي: </span>
                      <span className="font-black text-forest-950 text-sm">
                        {formatPrice(ord.totalAmount)}
                      </span>
                      <span className="text-gray-400 text-[11px] mr-2">
                        ({ord.paymentMethod === 'COD' ? 'دفع عند الاستلام' : 'دفع إلكتروني'})
                      </span>
                    </div>

                    <Link
                      href={`/orders/${ord.id}`}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-forest-900 text-white font-bold text-xs hover:bg-forest-800 transition-colors shadow-subtle"
                    >
                      <span>تتبع حالة الطلب</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
