'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Users, Search, Mail, Phone, Calendar, ShoppingBag, RefreshCw } from 'lucide-react';
import { User, Order } from '@/lib/types';
import { formatDate, formatPrice } from '@/lib/utils';

interface CustomerWithStats extends Omit<User, 'passwordHash'> {
  orderCount?: number;
  totalSpent?: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, ordersRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/orders'),
      ]);
      const usersData = await usersRes.json();
      const ordersData = await ordersRes.json();

      const allOrders: Order[] = ordersData.orders || [];
      setOrders(allOrders);

      const enriched: CustomerWithStats[] = (usersData.users || []).map((u: CustomerWithStats) => {
        const userOrders = allOrders.filter(
          (o) => o.userId === u.id || o.customerEmail === u.email
        );
        const totalSpent = userOrders.reduce((sum, o) => sum + (o.totalAmount || o.subtotal || 0), 0);
        return { ...u, orderCount: userOrders.length, totalSpent };
      });
      setCustomers(enriched);
    } catch {
      setError('تعذّر تحميل بيانات العملاء. يرجى المحاولة مجدداً.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = customers.filter((u) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone || '').includes(q)
    );
  });

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-ivory-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-forest-950 font-cairo flex items-center gap-2">
            <Users className="w-7 h-7 text-forest-700" />
            إدارة حسابات العملاء
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            عرض بيانات العملاء المسجلين ومتابعة سجل طلباتهم
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 text-xs font-bold text-forest-700 border border-forest-300 bg-white rounded-xl px-4 py-2 hover:bg-forest-50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          تحديث
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-ivory-200 shadow-subtle p-4">
          <p className="text-xs text-gray-500">إجمالي العملاء</p>
          <p className="text-2xl font-black text-forest-950 mt-1">{customers.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-ivory-200 shadow-subtle p-4">
          <p className="text-xs text-gray-500">عملاء لديهم طلبات</p>
          <p className="text-2xl font-black text-forest-950 mt-1">
            {customers.filter((c) => (c.orderCount || 0) > 0).length}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-ivory-200 shadow-subtle p-4 col-span-2 sm:col-span-1">
          <p className="text-xs text-gray-500">إجمالي الطلبات</p>
          <p className="text-2xl font-black text-forest-950 mt-1">{orders.length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-ivory-200 shadow-subtle flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث باسم العميل، البريد الإلكتروني، أو رقم الهاتف..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-ivory-50 border border-ivory-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-300 transition"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
        <span className="text-xs text-gray-500 font-bold whitespace-nowrap">
          {filtered.length} عميل
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm text-center">
          {error}
        </div>
      )}

      {/* Skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-ivory-200 p-4 animate-pulse">
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 bg-ivory-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-ivory-200 rounded w-48" />
                  <div className="h-3 bg-ivory-100 rounded w-64" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customers Table */}
      {!loading && (
        <div className="bg-white rounded-3xl border border-ivory-200 shadow-subtle overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-16 text-center text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-bold">لا توجد نتائج مطابقة لبحثك</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-ivory-50/70 border-b border-ivory-200 text-gray-500 font-bold">
                    <th className="py-3 px-5">العميل</th>
                    <th className="py-3 px-5 hidden sm:table-cell">البريد الإلكتروني</th>
                    <th className="py-3 px-5 hidden md:table-cell">الهاتف</th>
                    <th className="py-3 px-5 hidden lg:table-cell">تاريخ التسجيل</th>
                    <th className="py-3 px-5 text-center">الطلبات</th>
                    <th className="py-3 px-5 text-center hidden sm:table-cell">إجمالي الإنفاق</th>
                    <th className="py-3 px-5 text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ivory-100">
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-ivory-50/50 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-black text-sm shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <span className="font-bold text-forest-950">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-gray-600 hidden sm:table-cell">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                          <span dir="ltr" className="font-mono text-[11px]">{u.email}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 hidden md:table-cell">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                          <span dir="ltr" className="font-mono text-gray-800">{u.phone || '—'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-gray-500 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                          {formatDate(u.createdAt)}
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <ShoppingBag className="w-3 h-3 text-forest-600" />
                          <span className="font-bold text-forest-900">{u.orderCount || 0}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-center hidden sm:table-cell">
                        <span className="font-bold text-forest-900">
                          {u.totalSpent ? formatPrice(u.totalSpent) : '—'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold border text-[10px] ${
                            u.status === 'active'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : u.status === 'suspended'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-gray-50 text-gray-600 border-gray-200'
                          }`}
                        >
                          {u.status === 'active' ? 'نشط' : u.status === 'suspended' ? 'موقوف' : u.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
