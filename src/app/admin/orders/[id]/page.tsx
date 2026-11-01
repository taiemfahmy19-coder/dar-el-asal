'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Package,
  Truck,
  User,
  Phone,
  MapPin,
  Clock,
  Printer,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  Zap,
  FileText,
  FileCheck2,
} from 'lucide-react';
import { Order, CourierProfile, OrderStatus } from '@/lib/types';
import { formatPrice, formatDate, ORDER_STATUS_MAP } from '@/lib/utils';
import OrderTimeline from '@/components/orders/OrderTimeline';
import OrderPrintDocument from '@/components/orders/OrderPrintDocument';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [couriers, setCouriers] = useState<CourierProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourierId, setSelectedCourierId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [quotationModalOpen, setQuotationModalOpen] = useState(false);
  const [quotationFee, setQuotationFee] = useState<number>(45);
  const [quotationNotes, setQuotationNotes] = useState('');
  const [issuingQuotation, setIssuingQuotation] = useState(false);

  const fetchOrderData = () => {
    if (!id) return;

    fetch(`/api/orders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) setOrder(data.order);
      })
      .finally(() => setLoading(false));

    fetch('/api/admin/couriers')
      .then((res) => res.json())
      .then((data) => {
        if (data.couriers) {
          setCouriers(data.couriers.filter((c: CourierProfile) => c.status !== 'SUSPENDED'));
        }
      });
  };

  useEffect(() => {
    fetchOrderData();
  }, [id]);

  const handleManualAssign = async () => {
    if (!selectedCourierId || !order) return;
    setAssigning(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ASSIGN_COURIER',
          courierId: selectedCourierId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchOrderData();
      } else {
        alert(data.error || 'فشل إسناد الطلب');
      }
    } catch {
      alert('حدث خطأ في الاتصال');
    } finally {
      setAssigning(false);
    }
  };

  const handleTransition = async (newStatus: OrderStatus, notes?: string) => {
    if (!order) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newStatus,
          notes: notes || `تحديث إداري للحالة إلى ${newStatus}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchOrderData();
      } else {
        alert(data.error || 'فشل تحديث الحالة');
      }
    } catch {
      alert('حدث خطأ في الاتصال');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAutoAssign = async () => {
    if (!order) return;
    try {
      const res = await fetch('/api/orders/auto-assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchOrderData();
      } else {
        alert(data.error || 'فشل التوزيع التلقائي');
      }
    } catch {
      alert('حدث خطأ');
    }
  };

  const handleIssueQuotation = async () => {
    if (!order) return;
    setIssuingQuotation(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'PREPARE_QUOTATION',
          deliveryFee: Number(quotationFee),
          notes: quotationNotes || 'تم تدقيق التوفر واحتساب تعرفة التوصيل بمدينة الإسكندرية',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQuotationModalOpen(false);
        fetchOrderData();
      } else {
        alert(data.error || 'فشل إصدار عرض السعر');
      }
    } catch {
      alert('حدث خطأ في الاتصال');
    } finally {
      setIssuingQuotation(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500">
        <div className="w-8 h-8 border-4 border-forest-800 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs">جارٍ جلب تفاصيل الطلب...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-12 text-center text-gray-600 space-y-4 max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="text-lg font-bold text-forest-950">الطلب غير موجود</h3>
        <p className="text-xs text-gray-500">لم يتم العثور على هذا الطلب، أو قد يكون تم إلغاؤه وتصفيره.</p>
        <div className="pt-2">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-900 text-gold-300 text-xs font-bold hover:bg-forest-800 transition-all shadow-sm"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لكافة الطلبات</span>
          </Link>
        </div>
      </div>
    );
  }

  const statusConf = ORDER_STATUS_MAP[order.orderStatus] || ORDER_STATUS_MAP.PENDING;

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-6xl mx-auto">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-ivory-200">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xl font-black text-forest-950">
              {order.orderNumber}
            </span>
            <span
              className={`px-3 py-0.5 rounded-full text-xs font-bold border ${statusConf.bg} ${statusConf.color} ${statusConf.border}`}
            >
              {statusConf.label}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">تاريخ الإنشاء: {formatDate(order.createdAt)}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setPrintModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest-900 text-gold-300 hover:bg-forest-800 text-xs font-bold border border-forest-700 shadow-sm"
          >
            <Printer className="w-4 h-4 text-gold-400" />
            <span>طباعة المستند الرسمي (QR التحقق)</span>
          </button>

          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-xs font-bold text-forest-800 hover:underline"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لقائمة الطلبات</span>
          </Link>
        </div>
      </div>

      {/* Admin Operations Box: Order-Based Commerce Controls */}
      <div className="bg-forest-900 text-white rounded-3xl p-6 sm:p-8 border border-forest-800 shadow-premium space-y-6">
        <h2 className="text-base font-extrabold text-gold-300 flex items-center gap-2">
          <Package className="w-5 h-5 text-gold-400" />
          <span>إجراءات التشغيل والتوزيع (سير العمل)</span>
        </h2>

        {/* Quotation Management Box */}
        <div className="bg-forest-950/80 p-5 rounded-2xl border border-gold-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-gold-400" />
              <span className="font-bold text-gold-300 text-sm">حالة عرض السعر (Quotation):</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gold-400/20 text-gold-300 border border-gold-400/40">
                {order.quotationStatus === 'SENT'
                  ? 'تم إرسال عرض السعر (بانتظار موافقة العميل)'
                  : order.quotationStatus === 'ACCEPTED'
                  ? 'اعتمد العميل عرض السعر بنجاح ✓'
                  : order.quotationStatus === 'REJECTED'
                  ? 'رفض العميل عرض السعر ✗'
                  : 'طلب رغبة شراء (بانتظار مراجعة الإدارة واحتساب الشحن)'}
              </span>
            </div>
            <p className="text-[11px] text-ivory-300">
              {order.quotationNumber ? `رقم العرض: ${order.quotationNumber} — ` : ''}
              رسوم التوصيل المحددة: {formatPrice(order.deliveryFee)} | إجمالي الطلب: {formatPrice(order.totalAmount)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setQuotationFee(order.deliveryFee || 45);
                setQuotationNotes(order.notes || '');
                setQuotationModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-forest-950 font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>إصدار / تحديث عرض السعر</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          
          {/* Transition Shortcuts */}
          <div className="space-y-3 bg-forest-950/60 p-4 rounded-2xl border border-forest-800">
            <h4 className="font-bold text-gold-300">الانتقال للحالة التالية المسموح بها:</h4>
            
            <div className="flex flex-wrap gap-2">
              {order.orderStatus === 'PENDING' && (
                <>
                  <button
                    onClick={() => handleTransition('CONFIRMED', 'تم تأكيد التوفر لدى المورد')}
                    disabled={updatingStatus}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-white shadow-sm"
                  >
                    تأكيد التوفر والطلب ✓
                  </button>
                  <button
                    onClick={() => handleTransition('AWAITING_SUPPLIER', 'بانتظار فحص المورد')}
                    disabled={updatingStatus}
                    className="px-3 py-2 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold text-white shadow-sm"
                  >
                    إرسال للمورد للتأكيد
                  </button>
                </>
              )}

              {order.orderStatus === 'AWAITING_SUPPLIER' && (
                <button
                  onClick={() => handleTransition('CONFIRMED', 'تم فحص الدفعة وتأكيد المورد بنجاح')}
                  disabled={updatingStatus}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-white shadow-sm"
                >
                  اعتماد توفر المورد ونقل الطلب للتأكيد ✓
                </button>
              )}

              {order.orderStatus === 'CONFIRMED' && (
                <button
                  onClick={() => handleTransition('PREPARING', 'بدء تجهيز وتغليف المنتجات')}
                  disabled={updatingStatus}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-white shadow-sm"
                >
                  بدء تجهيز وتغليف الطلب
                </button>
              )}

              {order.orderStatus === 'PREPARING' && (
                <button
                  onClick={() => handleTransition('READY_FOR_DELIVERY', 'تم تجهيز الطرد وفحصه')}
                  disabled={updatingStatus}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold text-white shadow-sm"
                >
                  تعيين كـ (جاهز للتوصيل)
                </button>
              )}

              {order.orderStatus === 'READY_FOR_DELIVERY' && !order.assignedAgentId && (
                <button
                  onClick={handleAutoAssign}
                  className="px-4 py-2 bg-gold-600 hover:bg-gold-500 rounded-xl font-bold text-forest-950 flex items-center gap-1.5 shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>توزيع تلقائي للمندوب الأقل حملاً</span>
                </button>
              )}

              {order.orderStatus !== 'CANCELLED' && order.orderStatus !== 'DELIVERED' && (
                <button
                  onClick={() => {
                    const r = prompt('يرجى كتابة سبب الإلغاء:');
                    if (r) handleTransition('CANCELLED', r);
                  }}
                  className="px-3 py-2 bg-rose-900/80 hover:bg-rose-800 text-rose-200 rounded-xl font-bold border border-rose-700"
                >
                  إلغاء الطلب
                </button>
              )}
            </div>
          </div>

          {/* Courier Assignment Box */}
          <div className="space-y-3 bg-forest-950/60 p-4 rounded-2xl border border-forest-800">
            <h4 className="font-bold text-gold-300">إسناد الطلب لمندوب توصيل:</h4>
            
            <div className="flex items-center gap-2">
              <select
                value={selectedCourierId || order.assignedAgentId || ''}
                onChange={(e) => setSelectedCourierId(e.target.value)}
                className="flex-1 bg-forest-900 border border-forest-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="">-- اختر مندوباً معتمداً --</option>
                {couriers.map((c) => (
                  <option key={c.userId} value={c.userId}>
                    {c.fullName} ({c.governorate} - مهام نشطة: {c.activeOrdersCount})
                  </option>
                ))}
              </select>

              <button
                onClick={handleManualAssign}
                disabled={assigning || !selectedCourierId}
                className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-forest-950 font-bold rounded-xl disabled:opacity-50"
              >
                {assigning ? 'جارٍ الإسناد...' : 'إسناد يدوي'}
              </button>
            </div>

            {order.assignedAgentName && (
              <p className="text-[11px] text-ivory-300">
                المندوب المسند حالياً: <span className="font-bold text-white">{order.assignedAgentName}</span> ({order.assignedAgentPhone})
              </p>
            )}
          </div>

        </div>
      </div>

      {/* Financials & Cost Breakdown Box (Admin Confidential) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-200 shadow-subtle space-y-4">
        <h3 className="font-bold text-sm text-forest-950 border-b border-ivory-100 pb-3 flex items-center justify-between">
          <span>البيانات المالية وتكلفة الموردين (سرية للإدارة فقط)</span>
          <span className="text-[11px] font-normal text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            صافي هامش الربح المحقق: +{formatPrice(order.estimatedProfit)}
          </span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-ivory-200 text-gray-500 font-bold">
                <th className="py-2.5 px-3">المنتج</th>
                <th className="py-2.5 px-3">الكمية</th>
                <th className="py-2.5 px-3">سعر الشراء من المورد (Cost)</th>
                <th className="py-2.5 px-3">سعر البيع للعميل (Retail)</th>
                <th className="py-2.5 px-3">إجمالي البيع</th>
                <th className="py-2.5 px-3">صافي الربح التقديري</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-100">
              {order.items.map((it) => {
                const itemProfit = (it.unitPrice - it.costPrice) * it.quantity;

                return (
                  <tr key={it.id}>
                    <td className="py-3 px-3 font-bold text-forest-950">{it.productName}</td>
                    <td className="py-3 px-3">{it.quantity}</td>
                    <td className="py-3 px-3 font-bold text-amber-800">{formatPrice(it.costPrice)}</td>
                    <td className="py-3 px-3">{formatPrice(it.unitPrice)}</td>
                    <td className="py-3 px-3 font-black text-forest-950">{formatPrice(it.totalPrice)}</td>
                    <td className="py-3 px-3 font-black text-emerald-700">+{formatPrice(itemProfit)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="pt-3 border-t border-ivory-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-gray-500">إجمالي تكلفة المنتجات (COGS): </span>
            <span className="font-bold text-amber-900">{formatPrice(order.totalCost)}</span>
          </div>
          <div>
            <span className="text-gray-500">رسوم التوصيل: </span>
            <span className="font-bold text-forest-950">{formatPrice(order.deliveryFee)}</span>
          </div>
          <div>
            <span className="text-gray-500">المبلغ الإجمالي المحصل: </span>
            <span className="font-black text-forest-950 text-sm">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Customer & Delivery Address Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-ivory-200 shadow-subtle text-xs space-y-2">
          <h4 className="font-bold text-sm text-forest-950 border-b border-ivory-100 pb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-forest-800" />
            <span>بيانات العميل</span>
          </h4>
          <p><span className="font-bold">الاسم:</span> {order.customerName}</p>
          <p><span className="font-bold">الهاتف:</span> {order.customerPhone}</p>
          <p><span className="font-bold">البريد:</span> {order.customerEmail}</p>
          <p><span className="font-bold">طريقة الدفع:</span> {order.paymentMethod === 'COD' ? 'دفع عند الاستلام' : 'دفع إلكتروني'}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-ivory-200 shadow-subtle text-xs space-y-2">
          <h4 className="font-bold text-sm text-forest-950 border-b border-ivory-100 pb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-forest-800" />
            <span>عنوان الشحن</span>
          </h4>
          <p><span className="font-bold">المحافظة والمدينة:</span> {order.governorate} - {order.city}</p>
          <p><span className="font-bold">العنوان:</span> {order.streetAddress}</p>
          {order.buildingDetails && <p><span className="font-bold">العقار:</span> {order.buildingDetails}</p>}
          {order.notes && <p><span className="font-bold">ملاحظات العميل:</span> {order.notes}</p>}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-200 shadow-subtle">
        <h3 className="font-bold text-sm text-forest-950 mb-6">السجل الزمني للتحديثات</h3>
        <OrderTimeline order={order} />
      </div>

      {/* Quotation Modal */}
      {quotationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-ivory-200 shadow-floating space-y-4 text-right">
            <div className="flex items-center justify-between border-b border-ivory-200 pb-3">
              <h3 className="font-bold text-base text-forest-950">إصدار عرض سعر نهائي معتمد</h3>
              <span className="font-mono text-xs font-bold text-forest-800">{order.orderNumber}</span>
            </div>
            
            <p className="text-xs text-gray-600 leading-relaxed">
              تحديد رسوم التوصيل وفقاً لتعرفة شركة الشحن بمنطقة العميل في الإسكندرية ({order.governorate} - {order.city}).
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-forest-950 mb-1">
                  المجموع الفرعي للمنتجات:
                </label>
                <div className="p-2.5 rounded-xl bg-ivory-100 font-bold text-forest-900">
                  {formatPrice(order.subtotal)}
                </div>
              </div>

              <div>
                <label className="block font-bold text-forest-950 mb-1">
                  رسوم التوصيل المعتمدة (ج.م):
                </label>
                <input
                  type="number"
                  value={quotationFee}
                  onChange={(e) => setQuotationFee(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-ivory-50 border border-ivory-300 font-bold text-forest-950 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-gold-50 border border-gold-200">
                <span className="text-[11px] text-forest-900 font-bold block mb-0.5">
                  الإجمالي النهائي بعد التوصيل:
                </span>
                <span className="text-base font-black text-forest-950">
                  {formatPrice(order.subtotal + Number(quotationFee || 0))}
                </span>
              </div>

              <div>
                <label className="block font-bold text-forest-950 mb-1">
                  ملاحظات أو شروط خاصة بالعرض:
                </label>
                <textarea
                  rows={2}
                  value={quotationNotes}
                  onChange={(e) => setQuotationNotes(e.target.value)}
                  placeholder="مثال: التوصيل متاح يوم الأحد بين 12 و 3 عصراً مع فحص المنتج قبل الاستلام..."
                  className="w-full p-2.5 rounded-xl bg-ivory-50 border border-ivory-300 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleIssueQuotation}
                disabled={issuingQuotation}
                className="flex-1 py-2.5 px-4 rounded-xl bg-forest-900 hover:bg-forest-800 text-gold-300 font-bold text-xs disabled:opacity-50 shadow-md"
              >
                {issuingQuotation ? 'جارٍ إصدار العرض...' : 'اعتماد وإرسال للعميل ✓'}
              </button>
              <button
                onClick={() => setQuotationModalOpen(false)}
                className="py-2.5 px-4 rounded-xl bg-ivory-100 hover:bg-ivory-200 text-gray-700 font-bold text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Document & QR Modal */}
      {printModalOpen && (
        <OrderPrintDocument
          order={order}
          type={order.quotationStatus === 'SENT' ? 'quotation' : 'confirmation'}
          onClose={() => setPrintModalOpen(false)}
        />
      )}

    </div>
  );
}
