'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Package,
  Truck,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  CreditCard,
  Ban,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Order } from '@/lib/types';
import { formatPrice, formatDate, ORDER_STATUS_MAP } from '@/lib/utils';
import OrderTimeline from '@/components/orders/OrderTimeline';
import { useAuth } from '@/components/context/AuthContext';

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const fetchOrder = () => {
    if (!id) return;
    fetch(`/api/orders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) setOrder(data.order);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!order) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newStatus: 'CANCELLED',
          cancelReason: cancelReason || 'طلب العميل إلغاء الطلب قبل التأكيد',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCancelModalOpen(false);
        fetchOrder();
      } else {
        alert(data.error || 'تعذر إلغاء الطلب');
      }
    } catch {
      alert('حدث خطأ في الاتصال');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500">
        <div className="w-8 h-8 border-4 border-forest-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm">جارٍ تحميل بيانات الطلب ومتابعة التوصيل...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-forest-950">الطلب غير موجود</h2>
        <Link
          href="/orders"
          className="inline-block px-5 py-2.5 rounded-xl bg-forest-900 text-white font-bold text-xs"
        >
          العودة لقائمة الطلبات
        </Link>
      </div>
    );
  }

  const statusConfig = ORDER_STATUS_MAP[order.orderStatus] || ORDER_STATUS_MAP.PENDING;
  const canCancel = order.orderStatus === 'PENDING' || order.orderStatus === 'AWAITING_SUPPLIER';

  return (
    <div className="bg-ivory-50/40 min-h-screen py-10 text-right">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-ivory-200 shadow-subtle">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-gray-400">رقم الطلب:</span>
              <span className="font-mono text-base font-extrabold text-forest-950">
                {order.orderNumber}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              تاريخ الإنشاء: {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}
            >
              {statusConfig.label}
            </span>

            {canCancel && (
              <button
                onClick={() => setCancelModalOpen(true)}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors border border-rose-200"
              >
                إلغاء الطلب
              </button>
            )}
          </div>
        </div>

        {/* Order Lifecycle Timeline Tracker */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-200 shadow-premium">
          <h2 className="text-base font-bold text-forest-950 mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-forest-800" />
            <span>متابعة حالة الطلب لحظياً (دورة حياة الشحنة)</span>
          </h2>
          <OrderTimeline order={order} />
        </div>

        {/* Assigned Courier & Delivery Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Delivery & Recipient Info */}
          <div className="bg-white p-6 rounded-3xl border border-ivory-200 shadow-subtle space-y-3">
            <h3 className="font-bold text-sm text-forest-950 flex items-center gap-2 border-b border-ivory-100 pb-3">
              <MapPin className="w-4 h-4 text-forest-800" />
              <span>بيانات التوصيل والعنوان</span>
            </h3>
            <div className="text-xs text-gray-600 space-y-1.5">
              <p>
                <span className="font-bold text-forest-950">المستلم:</span> {order.customerName}
              </p>
              <p>
                <span className="font-bold text-forest-950">الهاتف:</span> {order.customerPhone}
              </p>
              <p>
                <span className="font-bold text-forest-950">العنوان:</span> {order.governorate} - {order.city}، {order.streetAddress}
              </p>
              {order.buildingDetails && (
                <p>
                  <span className="font-bold text-forest-950">تفاصيل المبنى:</span> {order.buildingDetails}
                </p>
              )}
              {order.notes && (
                <p>
                  <span className="font-bold text-forest-950">ملاحظات العميل:</span> {order.notes}
                </p>
              )}
            </div>
          </div>

          {/* Courier Info (Visible if assigned) */}
          <div className="bg-white p-6 rounded-3xl border border-ivory-200 shadow-subtle space-y-3">
            <h3 className="font-bold text-sm text-forest-950 flex items-center gap-2 border-b border-ivory-100 pb-3">
              <Truck className="w-4 h-4 text-forest-800" />
              <span>مندوب التوصيل المسؤول</span>
            </h3>
            {order.assignedAgentName ? (
              <div className="text-xs text-gray-600 space-y-2">
                <div className="flex items-center gap-3 bg-purple-50 p-3 rounded-2xl border border-purple-200">
                  <div className="w-10 h-10 rounded-full bg-purple-800 text-white flex items-center justify-center font-bold text-sm">
                    {order.assignedAgentName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-purple-950 text-sm">
                      {order.assignedAgentName}
                    </p>
                    <p className="text-[11px] text-purple-700">كابتن توصيل معتمد</p>
                  </div>
                </div>

                {order.assignedAgentPhone && (
                  <a
                    href={`tel:${order.assignedAgentPhone}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest-900 text-white text-xs font-bold hover:bg-forest-800 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-gold-400" />
                    <span>الاتصال بالمندوب ({order.assignedAgentPhone})</span>
                  </a>
                )}
              </div>
            ) : (
              <div className="p-4 bg-ivory-50 rounded-2xl border border-ivory-200 text-xs text-gray-500">
                <p className="font-semibold text-forest-900 mb-1">بانتظار إسناد المندوب</p>
                <p>يتم إسناد الطلب للكابتن تلقائياً فور تجهيز وتغليف المنتجات من المورد.</p>
              </div>
            )}
          </div>

        </div>

        {/* Order Items Breakdown */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-ivory-200 shadow-subtle space-y-4">
          <h3 className="font-bold text-sm text-forest-950 border-b border-ivory-100 pb-3">
            المنتجات المطلوبة ({order.items.length})
          </h3>

          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-ivory-50/70 border border-ivory-200 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white overflow-hidden relative shrink-0 border border-ivory-200">
                    <Image
                      src={item.productImage || '/images/honey/prod-honey-plain.jpg'}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-forest-950">{item.productName}</h4>
                    <p className="text-[11px] text-gray-500">
                      الكمية: {item.quantity} × {formatPrice(item.unitPrice)}
                    </p>
                  </div>
                </div>

                <span className="font-black text-forest-900 text-sm">
                  {formatPrice(item.totalPrice)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="pt-4 border-t border-ivory-200 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>المجموع الفرعي:</span>
              <span className="font-bold text-forest-950">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>رسوم التوصيل:</span>
              <span className="font-bold text-forest-950">{formatPrice(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-forest-950 font-black text-base pt-2 border-t border-ivory-200">
              <span>المبلغ الإجمالي:</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="pt-2 text-center">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-xs font-bold text-forest-800 hover:underline"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لكافة طلباتي السابقة</span>
          </Link>
        </div>

      </div>

      {/* Cancel Order Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-ivory-200 shadow-floating space-y-4 text-right">
            <h3 className="text-base font-bold text-forest-950">إلغاء الطلب {order.orderNumber}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟ يرجى إخبارنا بالسبب لمساعدتنا في تحسين خدماتنا:
            </p>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="سبب الإلغاء (اختياري)..."
              className="w-full p-3 rounded-xl bg-ivory-50 border border-ivory-300 text-xs focus:outline-none"
            />
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 disabled:opacity-50"
              >
                {cancelling ? 'جارٍ الإلغاء...' : 'تأكيد الإلغاء'}
              </button>
              <button
                onClick={() => setCancelModalOpen(false)}
                className="py-2.5 px-4 rounded-xl bg-ivory-100 text-gray-700 font-bold text-xs hover:bg-ivory-200"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
