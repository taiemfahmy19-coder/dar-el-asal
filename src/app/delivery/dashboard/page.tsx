'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Truck,
  Phone,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Banknote,
  Package,
  Check,
  XCircle,
  RefreshCw,
  LogOut,
  User,
} from 'lucide-react';
import { useAuth } from '@/components/context/AuthContext';
import { Order, OrderStatus } from '@/lib/types';
import { formatPrice, formatDate, ORDER_STATUS_MAP } from '@/lib/utils';

export default function DeliveryDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Failure modal state
  const [failedModalOrder, setFailedModalOrder] = useState<Order | null>(null);
  const [failureReason, setFailureReason] = useState('العميل لم يرد على الهاتف بعد عدة محاولات');
  const [customFailureNote, setCustomFailureNote] = useState('');

  // Courier active status
  const [courierStatus, setCourierStatus] = useState<'AVAILABLE' | 'BUSY'>('AVAILABLE');

  const fetchAssignedOrders = () => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login');
      } else if (user.role !== 'delivery' && user.role !== 'admin') {
        alert('غير مصرح لك بالدخول إلى لوحة مهام التوصيل، الحساب مخصص لمناديب التوصيل المعتمدين.');
        router.push('/');
      } else {
        fetchAssignedOrders();
      }
    }
  }, [user, authLoading]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus, reason?: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newStatus,
          notes: reason || `تم تحديث الحالة بواسطة الكابتن ${user?.name}`,
          failureReason: newStatus === 'DELIVERY_FAILED' ? reason : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'فشل تحديث حالة الطلب');
      } else {
        setFailedModalOrder(null);
        fetchAssignedOrders();
      }
    } catch {
      alert('حدث خطأ في الاتصال بالخادم');
    } finally {
      setUpdatingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-ivory-50/50">
        <div className="w-8 h-8 border-4 border-purple-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Metrics
  const assignedOrders = orders.filter((o) => o.orderStatus === 'ASSIGNED');
  const outForDeliveryOrders = orders.filter((o) => o.orderStatus === 'OUT_FOR_DELIVERY');
  const deliveredOrders = orders.filter((o) => o.orderStatus === 'DELIVERED');
  const failedOrders = orders.filter((o) => o.orderStatus === 'DELIVERY_FAILED');

  const activeTasks = [...assignedOrders, ...outForDeliveryOrders];

  return (
    <div className="bg-ivory-50/50 min-h-screen py-6 px-3 sm:px-6 text-right max-w-4xl mx-auto space-y-6">
      
      {/* Top Courier Profile Bar */}
      <div className="bg-white rounded-3xl p-5 border border-ivory-200 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            {user?.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-base font-extrabold text-forest-950 font-cairo">
              الكابتن: {user?.name}
            </h1>
            <p className="text-xs text-gray-500">لوحة مهام التوصيل الميدانية</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => setCourierStatus(courierStatus === 'AVAILABLE' ? 'BUSY' : 'AVAILABLE')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 ${
              courierStatus === 'AVAILABLE'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                courierStatus === 'AVAILABLE' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            ></span>
            <span>{courierStatus === 'AVAILABLE' ? 'جاهز لاستلام المهام' : 'مشغول حالياً'}</span>
          </button>

          <button
            onClick={fetchAssignedOrders}
            className="p-2 rounded-xl bg-ivory-100 hover:bg-ivory-200 text-gray-700"
            title="تحديث القائمة"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-ivory-200 shadow-subtle">
          <span className="text-[11px] font-bold text-purple-700">بانتظار الاستلام</span>
          <p className="text-2xl font-black text-forest-950 mt-1">{assignedOrders.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-ivory-200 shadow-subtle">
          <span className="text-[11px] font-bold text-blue-700">خرجت للتوصيل</span>
          <p className="text-2xl font-black text-forest-950 mt-1">{outForDeliveryOrders.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-ivory-200 shadow-subtle">
          <span className="text-[11px] font-bold text-emerald-700">تم تسليمها</span>
          <p className="text-2xl font-black text-forest-950 mt-1">{deliveredOrders.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-ivory-200 shadow-subtle">
          <span className="text-[11px] font-bold text-rose-700">تعذر تسليمها</span>
          <p className="text-2xl font-black text-forest-950 mt-1">{failedOrders.length}</p>
        </div>
      </div>

      {/* Active Tasks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-forest-950 flex items-center gap-2">
            <Truck className="w-5 h-5 text-purple-800" />
            <span>المهام النشطة المطلوب تنفيذها ({activeTasks.length})</span>
          </h2>
        </div>

        {activeTasks.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-ivory-200 shadow-subtle space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-forest-950">لا توجد مهام نشطة حالياً</h3>
            <p className="text-xs text-gray-500">
              أحسنت! جميع الطلبات المسندة إليك تم تسليمها بنجاح. سنخطرك فور إسناد شحنات جديدة.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTasks.map((ord) => {
              const isAssigned = ord.orderStatus === 'ASSIGNED';
              const isOut = ord.orderStatus === 'OUT_FOR_DELIVERY';

              return (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-purple-100 shadow-premium space-y-4"
                >
                  {/* Order Card Header */}
                  <div className="flex items-center justify-between border-b border-ivory-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-forest-950">
                        {ord.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isAssigned
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {isAssigned ? 'جاهز للاستلام والتحرك' : 'في خط السير للتوصيل'}
                      </span>
                    </div>

                    <span className="text-[11px] text-gray-400">
                      {formatDate(ord.createdAt)}
                    </span>
                  </div>

                  {/* Customer Contact & Call Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-ivory-50 p-4 rounded-2xl border border-ivory-200">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-forest-950">{ord.customerName}</p>
                      <p className="text-xs text-gray-600 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-forest-800 shrink-0" />
                        <span>
                          {ord.governorate} - {ord.city}، {ord.streetAddress}
                          {ord.buildingDetails ? ` (${ord.buildingDetails})` : ''}
                        </span>
                      </p>
                    </div>

                    <a
                      href={`tel:${ord.customerPhone}`}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-forest-900 text-white font-bold text-xs hover:bg-forest-800 shrink-0 shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5 text-gold-400" />
                      <span>اتصال ({ord.customerPhone})</span>
                    </a>
                  </div>

                  {/* Items summary */}
                  <div className="space-y-1.5 text-xs text-gray-600">
                    <p className="font-bold text-forest-950">محتويات الطرد:</p>
                    <div className="flex flex-wrap gap-2">
                      {ord.items.map((it) => (
                        <span
                          key={it.id}
                          className="bg-white border border-ivory-200 px-2.5 py-1 rounded-lg font-medium"
                        >
                          {it.productName} (×{it.quantity})
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Cash Collection Info */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-amber-700" />
                      <span className="font-bold">المبلغ المطلوب تحصيله:</span>
                    </div>
                    <span className="font-black text-base text-amber-950">
                      {ord.paymentMethod === 'COD' ? formatPrice(ord.totalAmount) : 'مدفوع مسبقاً (0 ج.م)'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    {isAssigned && (
                      <button
                        onClick={() => handleUpdateStatus(ord.id, 'OUT_FOR_DELIVERY')}
                        disabled={updatingId === ord.id}
                        className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-forest-900 text-white font-bold text-xs hover:bg-forest-800 transition-all shadow-subtle flex items-center justify-center gap-2"
                      >
                        <Truck className="w-4 h-4 text-gold-400" />
                        <span>استلام الطرد وبدء خط السير (خرج للتوصيل)</span>
                      </button>
                    )}

                    {isOut && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(ord.id, 'DELIVERED')}
                          disabled={updatingId === ord.id}
                          className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-all shadow-subtle flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          <span>تم التسليم بنجاح وتحصيل المبلغ</span>
                        </button>

                        <button
                          onClick={() => setFailedModalOrder(ord)}
                          disabled={updatingId === ord.id}
                          className="w-full sm:w-auto py-3 px-4 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs border border-rose-200 transition-all flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>تعذر التسليم</span>
                        </button>
                      </>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delivered / Completed Orders Accordion / History */}
      {deliveredOrders.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-ivory-200">
          <h3 className="text-sm font-bold text-gray-500">
            الطلبات التي تم تسليمها بنجاح ({deliveredOrders.length})
          </h3>
          <div className="space-y-2">
            {deliveredOrders.slice(0, 5).map((ord) => (
              <div
                key={ord.id}
                className="bg-white p-3.5 rounded-2xl border border-ivory-200 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-forest-950">{ord.orderNumber}</span>
                  <span className="text-gray-400 mr-2">— {ord.customerName}</span>
                </div>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  تم التسليم ({formatPrice(ord.totalAmount)})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delivery Failed Modal (Mandatory Reason Selection) */}
      {failedModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-ivory-200 shadow-floating space-y-4 text-right">
            <h3 className="text-base font-bold text-forest-950">
              تسجيل تعذر تسليم الطلب {failedModalOrder.orderNumber}
            </h3>
            <p className="text-xs text-gray-600">
              يجب تحديد سبب دقيق وموثق لتعذر إتمام التسليم لإرجاع المهمة لإدارة المتجر:
            </p>

            <div className="space-y-2 text-xs">
              {[
                'العميل لم يرد على الهاتف بعد عدة محاولات',
                'العنوان غير دقيق ولم نتمكن من الوصول للموقع',
                'طلب العميل تأجيل الاستلام ليوم آخر',
                'العميل رفض استلام الشحنة',
              ].map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer ${
                    failureReason === r
                      ? 'bg-rose-50 border-rose-300 font-bold text-rose-900'
                      : 'bg-ivory-50 border-ivory-200 text-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    checked={failureReason === r}
                    onChange={() => setFailureReason(r)}
                    className="accent-rose-600"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>

            <textarea
              rows={2}
              value={customFailureNote}
              onChange={(e) => setCustomFailureNote(e.target.value)}
              placeholder="ملاحظات تفصيلية إضافية تفيد الإدارة..."
              className="w-full p-3 rounded-xl bg-ivory-50 border border-ivory-300 text-xs focus:outline-none"
            />

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() =>
                  handleUpdateStatus(
                    failedModalOrder.id,
                    'DELIVERY_FAILED',
                    `${failureReason}${customFailureNote ? ` (${customFailureNote})` : ''}`
                  )
                }
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700"
              >
                تأكيد وإرجاع للإدارة
              </button>
              <button
                onClick={() => setFailedModalOrder(null)}
                className="py-3 px-4 rounded-xl bg-ivory-100 text-gray-700 font-bold text-xs hover:bg-ivory-200"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
