'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, Package, ArrowLeft, RefreshCw, Zap } from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';
import { formatPrice, formatDate, ORDER_STATUS_MAP } from '@/lib/utils';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchOrders = () => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter && o.orderStatus !== statusFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchName = o.customerName.toLowerCase().includes(q);
      const matchPhone = o.customerPhone.includes(q);
      if (!matchNum && !matchName && !matchPhone) return false;
    }
    return true;
  });

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-ivory-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-forest-950 font-cairo">
            إدارة كافة الطلبات ({orders.length})
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            متابعة مراحل التحقق من المورد وتوزيع الشحنات على المناديب
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2.5 rounded-xl bg-white border border-ivory-300 text-gray-700 hover:bg-ivory-100 shadow-sm"
          title="تحديث القائمة"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-ivory-200 shadow-subtle flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث برقم الطلب، اسم العميل، أو الهاتف..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-ivory-50 border border-ivory-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-700/20"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500 font-bold shrink-0">الحالة:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-ivory-50 border border-ivory-300 rounded-xl px-3 py-2 text-xs font-semibold text-forest-950 focus:outline-none"
          >
            <option value="">جميع الحالات</option>
            <option value="PENDING">بانتظار التأكيد</option>
            <option value="AWAITING_SUPPLIER">بانتظار المورد</option>
            <option value="CONFIRMED">تم تأكيد التوفر</option>
            <option value="PREPARING">جارٍ التجهيز</option>
            <option value="READY_FOR_DELIVERY">جاهز للتوصيل</option>
            <option value="ASSIGNED">تم الإسناد للمندوب</option>
            <option value="OUT_FOR_DELIVERY">خرج للتوصيل</option>
            <option value="DELIVERED">تم التسليم</option>
            <option value="DELIVERY_FAILED">تعذر التسليم</option>
            <option value="CANCELLED">ملغي</option>
          </select>
        </div>

      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-ivory-200 shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <div className="w-8 h-8 border-4 border-forest-800 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs">جارٍ جلب الطلبات...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-400 space-y-2">
            <Package className="w-10 h-10 mx-auto text-gray-300" />
            <p className="text-sm font-bold text-gray-600">لا توجد طلبات تطابق معايير البحث</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-ivory-50/70 border-b border-ivory-200 text-gray-500 font-bold">
                  <th className="py-3.5 px-4">رقم الطلب</th>
                  <th className="py-3.5 px-4">العميل والتواصل</th>
                  <th className="py-3.5 px-4">المنطقة</th>
                  <th className="py-3.5 px-4">الإجمالي</th>
                  <th className="py-3.5 px-4">تكلفة المورد (COGS)</th>
                  <th className="py-3.5 px-4">الربح التقديري</th>
                  <th className="py-3.5 px-4">الحالة</th>
                  <th className="py-3.5 px-4">المندوب المسند</th>
                  <th className="py-3.5 px-4">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-100">
                {filteredOrders.map((ord) => {
                  const conf = ORDER_STATUS_MAP[ord.orderStatus] || ORDER_STATUS_MAP.PENDING;

                  return (
                    <tr key={ord.id} className="hover:bg-ivory-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-forest-950">
                        {ord.orderNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-forest-950">{ord.customerName}</p>
                        <p className="text-[11px] text-gray-400">{ord.customerPhone}</p>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        {ord.governorate} - {ord.city}
                      </td>
                      <td className="py-3.5 px-4 font-black text-forest-950">
                        {formatPrice(ord.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-amber-900">
                        {formatPrice(ord.totalCost)}
                      </td>
                      <td className="py-3.5 px-4 font-black text-emerald-800">
                        +{formatPrice(ord.estimatedProfit)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${conf.bg} ${conf.color} ${conf.border}`}
                        >
                          {conf.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-700">
                        {ord.assignedAgentName || (
                          <span className="text-gray-400 text-[11px]">بانتظار الإسناد</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/admin/orders/${ord.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-forest-900 text-white rounded-lg font-bold text-[11px] hover:bg-forest-800 shadow-sm"
                        >
                          <span>التفاصيل</span>
                          <ArrowLeft className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
