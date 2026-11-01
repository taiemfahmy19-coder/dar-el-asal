'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  TrendingUp,
  DollarSign,
  Truck,
  Clock,
  AlertTriangle,
  UserPlus,
  Zap,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  Store,
  Layers,
} from 'lucide-react';
import { formatPrice, formatDate, ORDER_STATUS_MAP } from '@/lib/utils';
import { Order, Product } from '@/lib/types';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoAssigning, setAutoAssigning] = useState(false);
  const [autoAssignMessage, setAutoAssignMessage] = useState<string | null>(null);

  const fetchStats = () => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) setStats(data.stats);
        if (data.lowStockProducts) setLowStock(data.lowStockProducts);
        if (data.recentOrders) setRecentOrders(data.recentOrders);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleTriggerAutoAssign = async () => {
    setAutoAssigning(true);
    setAutoAssignMessage(null);
    try {
      const res = await fetch('/api/orders/auto-assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setAutoAssignMessage(data.message);
        fetchStats();
      } else {
        setAutoAssignMessage(data.error || 'فشل التوزيع التلقائي');
      }
    } catch {
      setAutoAssignMessage('حدث خطأ في الاتصال');
    } finally {
      setAutoAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        <div className="w-8 h-8 border-4 border-forest-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm">جارٍ تحميل الإحصائيات الشاملة...</p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto">
      
      {/* Top Welcome & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-ivory-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-forest-950 font-cairo">
            لوحة الإدارة الشاملة — دار العسل والزيتون
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            متابعة حية للمبيعات، الأرباح التقديرية، دورة حياة الطلبات، وإسناد المندوبين
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Auto Assign Action Button */}
          <button
            onClick={handleTriggerAutoAssign}
            disabled={autoAssigning}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-900 text-gold-300 hover:text-white hover:bg-forest-800 text-xs font-bold transition-all shadow-subtle disabled:opacity-50"
            title="توزيع الطلبات الجاهزة تلقائياً على المندوبين المتاحين"
          >
            <Zap className="w-4 h-4 text-gold-400" />
            <span>{autoAssigning ? 'جارٍ التوزيع الذكي...' : 'توزيع الطلبات تلقائياً'}</span>
          </button>

          <button
            onClick={fetchStats}
            className="p-2.5 rounded-xl bg-white border border-ivory-300 text-gray-700 hover:bg-ivory-100 shadow-sm"
            title="تحديث البيانات"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {autoAssignMessage && (
        <div className="p-4 rounded-2xl bg-forest-50 border border-forest-200 text-forest-950 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-forest-800" />
            <span>{autoAssignMessage}</span>
          </span>
          <button
            onClick={() => setAutoAssignMessage(null)}
            className="text-[11px] text-gray-500 hover:text-black"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Financial Metrics Cards (Strict distinction between Revenue & Net Profit!) */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          المؤشرات المالية (نموذج البيع حسب الطلب):
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Revenue */}
          <div className="bg-white p-6 rounded-3xl border border-ivory-200 shadow-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">إجمالي المبيعات (Gross Revenue)</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-forest-950">
              {formatPrice(stats?.totalRevenue || 0)}
            </p>
            <p className="text-[11px] text-gray-400">قيمة مبيعات المنتجات الفعلية للعملاء</p>
          </div>

          {/* Cost of Goods Sold */}
          <div className="bg-white p-6 rounded-3xl border border-ivory-200 shadow-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">تكلفة المنتجات من الموردين (COGS)</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-amber-900">
              {formatPrice(stats?.totalCostOfGoods || 0)}
            </p>
            <p className="text-[11px] text-gray-400">أسعار الشراء المعتمدة لدى الموردين</p>
          </div>

          {/* Estimated Net Profit */}
          <div className="bg-gradient-to-br from-forest-900 to-forest-950 text-white p-6 rounded-3xl border border-forest-800 shadow-premium space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gold-300">صافي الربح التقديري (Net Profit)</span>
              <div className="w-8 h-8 rounded-lg bg-forest-800 text-gold-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">
              {formatPrice(stats?.estimatedNetProfit || 0)}
            </p>
            <p className="text-[11px] text-ivory-300">
              هامش الربح بعد خصم سعر الشراء الفعلي لكل منتج
            </p>
          </div>
        </div>

        <p className="text-[11px] text-gray-500 italic pr-1">
          * تنبيه محاسبي: يتم احتساب الأرباح بدقة بناءً على تكلفة الشراء الحقيقية المسجلة لكل مورد، واستثناء الطلبات الملغاة.
        </p>
      </div>

      {/* Orders Lifecycle Breakdown Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          حالات الطلبات الحالية (دورة حياة الشحنات):
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
          <Link
            href="/admin/orders?status=PENDING"
            className="bg-white p-4 rounded-2xl border border-amber-200 hover:border-amber-400 transition-colors shadow-subtle"
          >
            <span className="font-bold text-amber-800">بانتظار التأكيد</span>
            <p className="text-2xl font-black text-amber-950 mt-1">{stats?.pendingOrdersCount || 0}</p>
          </Link>

          <Link
            href="/admin/orders?status=AWAITING_SUPPLIER"
            className="bg-white p-4 rounded-2xl border border-orange-200 hover:border-orange-400 transition-colors shadow-subtle"
          >
            <span className="font-bold text-orange-800">بانتظار المورد</span>
            <p className="text-2xl font-black text-orange-950 mt-1">{stats?.awaitingSupplierCount || 0}</p>
          </Link>

          <Link
            href="/admin/orders?status=PREPARING"
            className="bg-white p-4 rounded-2xl border border-indigo-200 hover:border-indigo-400 transition-colors shadow-subtle"
          >
            <span className="font-bold text-indigo-800">قيد التجهيز</span>
            <p className="text-2xl font-black text-indigo-950 mt-1">{stats?.preparingCount || 0}</p>
          </Link>

          <Link
            href="/admin/orders?status=READY_FOR_DELIVERY"
            className="bg-white p-4 rounded-2xl border border-cyan-200 hover:border-cyan-400 transition-colors shadow-subtle"
          >
            <span className="font-bold text-cyan-800">جاهزة للتوزيع</span>
            <p className="text-2xl font-black text-cyan-950 mt-1">{stats?.readyForDeliveryCount || 0}</p>
          </Link>

          <Link
            href="/admin/orders?status=OUT_FOR_DELIVERY"
            className="bg-white p-4 rounded-2xl border border-emerald-200 hover:border-emerald-400 transition-colors shadow-subtle"
          >
            <span className="font-bold text-emerald-800">خرجت للتوصيل</span>
            <p className="text-2xl font-black text-emerald-950 mt-1">{stats?.outForDeliveryCount || 0}</p>
          </Link>

          <Link
            href="/admin/orders?status=DELIVERED"
            className="bg-white p-4 rounded-2xl border border-green-200 hover:border-green-400 transition-colors shadow-subtle"
          >
            <span className="font-bold text-green-900">تم التسليم</span>
            <p className="text-2xl font-black text-green-950 mt-1">{stats?.deliveredCount || 0}</p>
          </Link>
        </div>
      </div>

      {/* Operational Alerts Row: Low Stock & Courier Applications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Pending Courier Applications Card */}
        <div className="bg-white p-6 rounded-3xl border border-ivory-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-ivory-100 pb-3">
            <h3 className="font-bold text-sm text-forest-950 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-forest-800" />
              <span>طلبات انضمام المندوبين الجديدة ({stats?.pendingApplicationsCount || 0})</span>
            </h3>
            <Link
              href="/admin/couriers"
              className="text-xs font-bold text-forest-800 hover:underline"
            >
              عرض الكل ←
            </Link>
          </div>

          {stats?.pendingApplicationsCount > 0 ? (
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-xs text-purple-900 flex items-center justify-between">
              <div>
                <p className="font-bold">يوجد طلبات انضمام مندوبين بانتظار موافقتك</p>
                <p className="text-[11px] text-purple-700 mt-0.5">
                  راجع رخص القيادة ومناطق التغطية لتفعيل حساباتهم.
                </p>
              </div>
              <Link
                href="/admin/couriers"
                className="px-3.5 py-1.5 bg-purple-800 text-white rounded-xl text-xs font-bold hover:bg-purple-900 shadow-sm"
              >
                مراجعة الطلبات
              </Link>
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-3">لا توجد طلبات انضمام جديدة بانتظار المراجعة.</p>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-3xl border border-ivory-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-ivory-100 pb-3">
            <h3 className="font-bold text-sm text-forest-950 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>تنبيهات انخفاض التوفر لدى الموردين ({lowStock.length})</span>
            </h3>
            <Link
              href="/admin/products"
              className="text-xs font-bold text-forest-800 hover:underline"
            >
              إدارة المخزون ←
            </Link>
          </div>

          {lowStock.length > 0 ? (
            <div className="space-y-2 text-xs">
              {lowStock.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-amber-950">{p.name}</p>
                    <p className="text-[10px] text-gray-500">المورد: {p.origin}</p>
                  </div>
                  <span className="font-bold text-amber-800">
                    متبقي {p.stockQuantity} عبوة
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-3">جميع المنتجات متوفرة بكميات كافية.</p>
          )}
        </div>

      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-ivory-200 shadow-subtle p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-ivory-100 pb-3">
          <h3 className="font-bold text-sm text-forest-950 flex items-center gap-2">
            <Package className="w-4 h-4 text-forest-800" />
            <span>أحدث الطلبات الواردة</span>
          </h3>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-forest-800 hover:underline"
          >
            مشاهدة جميع الطلبات ←
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-ivory-200 text-gray-500 font-bold">
                <th className="py-3 px-2">رقم الطلب</th>
                <th className="py-3 px-2">العميل</th>
                <th className="py-3 px-2">المحافظة</th>
                <th className="py-3 px-2">المبلغ</th>
                <th className="py-3 px-2">الحالة</th>
                <th className="py-3 px-2">المندوب</th>
                <th className="py-3 px-2">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-100">
              {recentOrders.map((ord) => {
                const conf = ORDER_STATUS_MAP[ord.orderStatus] || ORDER_STATUS_MAP.PENDING;

                return (
                  <tr key={ord.id} className="hover:bg-ivory-50/50">
                    <td className="py-3 px-2 font-mono font-bold text-forest-950">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3 px-2 font-bold text-gray-800">{ord.customerName}</td>
                    <td className="py-3 px-2 text-gray-600">{ord.governorate}</td>
                    <td className="py-3 px-2 font-black text-forest-900">
                      {formatPrice(ord.totalAmount)}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${conf.bg} ${conf.color} ${conf.border}`}
                      >
                        {conf.label}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-600">
                      {ord.assignedAgentName || <span className="text-gray-400">غير مسند</span>}
                    </td>
                    <td className="py-3 px-2">
                      <Link
                        href={`/admin/orders/${ord.id}`}
                        className="px-3 py-1 bg-forest-900 text-white rounded-lg font-bold text-[11px] hover:bg-forest-800 shadow-sm"
                      >
                        إدارة الطلب
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
