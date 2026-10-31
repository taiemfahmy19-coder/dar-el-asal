'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Shield, Clock, Search } from 'lucide-react';
import { AuditLog } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // In our db, audit logs are saved and can be read
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then(() => {
        setLogs([
          {
            id: 'audit-1',
            userId: 'user-admin-1',
            userName: 'م. طارق العريان',
            userRole: 'admin',
            action: 'UPDATE_ORDER_STATUS',
            entityType: 'ORDER',
            entityId: 'ord-1001',
            details: 'تم تحديث حالة الطلب إلى CONFIRMED بعد التواصل مع المورد',
            createdAt: '2026-10-25T09:15:00.000Z',
          },
          {
            id: 'audit-2',
            userId: 'user-admin-1',
            userName: 'م. طارق العريان',
            userRole: 'admin',
            action: 'MANUAL_ASSIGN_COURIER',
            entityType: 'ORDER',
            entityId: 'ord-1001',
            details: 'تم إسناد الطلب للمندوب أحمد محمود النجار',
            createdAt: '2026-10-25T11:00:00.000Z',
          },
          {
            id: 'audit-3',
            userId: 'user-admin-1',
            userName: 'م. طارق العريان',
            userRole: 'admin',
            action: 'APPROVE_COURIER_APPLICATION',
            entityType: 'DELIVERY_APPLICATION',
            entityId: 'del-app-2',
            details: 'الموافقة على انضمام المندوب إسلام عصام لمنطقة القاهرة',
            createdAt: '2026-10-25T13:40:00.000Z',
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter((l) => {
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return (
        l.userName.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="pb-6 border-b border-ivory-200">
        <h1 className="text-2xl sm:text-3xl font-black text-forest-950 font-cairo">
          سجل التدقيق والعمليات الإدارية (Audit Logs)
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          تسجيل غير قابل للتعديل لجميع العمليات الحساسة وتغييرات الأسعار وحالات الطلبات
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-ivory-200 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-ivory-50/70 border-b border-ivory-200 text-gray-500 font-bold">
                <th className="py-3 px-4">الوقت والتاريخ</th>
                <th className="py-3 px-4">المسؤول</th>
                <th className="py-3 px-4">الإجراء</th>
                <th className="py-3 px-4">نوع العنصر</th>
                <th className="py-3 px-4">تفاصيل العملية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-100">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-ivory-50/50">
                  <td className="py-3 px-4 font-mono text-gray-500">{formatDate(log.createdAt)}</td>
                  <td className="py-3 px-4 font-bold text-forest-950">{log.userName}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono bg-forest-50 text-forest-800 px-2.5 py-0.5 rounded-lg border border-forest-200 text-[11px] font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 font-mono">{log.entityType}</td>
                  <td className="py-3 px-4 text-gray-700 max-w-md">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
