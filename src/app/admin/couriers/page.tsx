'use client';

import React, { useState, useEffect } from 'react';
import { Truck, Check, X, Phone, ShieldCheck, UserCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { CourierProfile, DeliveryApplication } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function AdminCouriersPage() {
  const [applications, setApplications] = useState<DeliveryApplication[]>([]);
  const [couriers, setCouriers] = useState<CourierProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCouriersData = () => {
    fetch('/api/admin/couriers')
      .then((res) => res.json())
      .then((data) => {
        if (data.applications) setApplications(data.applications);
        if (data.couriers) setCouriers(data.couriers);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCouriersData();
  }, []);

  const handleApprove = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من قبول وتفعيل حساب المندوب: ${name}؟`)) return;

    try {
      const res = await fetch('/api/admin/couriers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'APPROVE_APPLICATION', applicationId: id }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchCouriersData();
      } else {
        alert(data.error || 'فشلت الموافقة');
      }
    } catch {
      alert('حدث خطأ');
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('هل أنت متأكد من رفض هذا الطلب؟')) return;

    try {
      const res = await fetch('/api/admin/couriers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REJECT_APPLICATION', applicationId: id }),
      });
      const data = await res.json();
      if (data.success) {
        fetchCouriersData();
      }
    } catch {
      alert('حدث خطأ');
    }
  };

  const handleToggleCourierStatus = async (courierId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'SUSPENDED' ? 'AVAILABLE' : 'SUSPENDED';

    try {
      const res = await fetch('/api/admin/couriers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_COURIER_STATUS',
          courierId,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchCouriersData();
      }
    } catch {
      alert('حدث خطأ');
    }
  };

  const pendingApps = applications.filter((a) => a.status === 'PENDING');

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-ivory-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-forest-950 font-cairo">
            إدارة المندوبين وطلبات الانضمام
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            مراجعة طلبات الانضمام الجديدة، واعتماد الصلاحيات، ومتابعة أداء المناديب
          </p>
        </div>

        <button
          onClick={fetchCouriersData}
          className="p-2.5 rounded-xl bg-white border border-ivory-300 text-gray-700 hover:bg-ivory-100 shadow-sm"
          title="تحديث البيانات"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* 1. Pending Applications Section */}
      <div className="bg-white rounded-3xl p-6 border border-ivory-200 shadow-subtle space-y-4">
        <h2 className="text-base font-bold text-forest-950 flex items-center gap-2 border-b border-ivory-100 pb-3">
          <Truck className="w-5 h-5 text-purple-800" />
          <span>طلبات الانضمام المعلقة ({pendingApps.length})</span>
        </h2>

        {pendingApps.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center">لا توجد طلبات انضمام جديدة معلقة حالياً.</p>
        ) : (
          <div className="space-y-4">
            {pendingApps.map((app) => (
              <div
                key={app.id}
                className="p-5 rounded-2xl bg-purple-50/50 border border-purple-200 text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-forest-950">{app.fullName}</span>
                    <span className="bg-purple-100 text-purple-900 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                      {app.governorate}
                    </span>
                  </div>

                  <p className="text-gray-600">
                    <span className="font-bold">المناطق المغطاة:</span> {app.coveredAreas} |{' '}
                    <span className="font-bold">وسيلة التوصيل:</span> {app.vehicleType}
                  </p>
                  <p className="text-gray-500 text-[11px]">
                    الهاتف: <span dir="ltr">{app.phone}</span> | البريد: {app.email} | الرقم القومي: {app.nationalId}
                  </p>
                  {app.notes && (
                    <p className="text-gray-600 italic bg-white/70 p-2 rounded-lg border border-purple-100">
                      "{app.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleApprove(app.id, app.fullName)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>قبول واعتماد الحساب</span>
                  </button>

                  <button
                    onClick={() => handleReject(app.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs hover:bg-rose-100 border border-rose-200"
                  >
                    <X className="w-4 h-4" />
                    <span>رفض</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Active Approved Couriers */}
      <div className="bg-white rounded-3xl p-6 border border-ivory-200 shadow-subtle space-y-4">
        <h2 className="text-base font-bold text-forest-950 flex items-center gap-2 border-b border-ivory-100 pb-3">
          <UserCheck className="w-5 h-5 text-forest-800" />
          <span>مناديب التوصيل المعتمدين ({couriers.length})</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-ivory-50/70 border-b border-ivory-200 text-gray-500 font-bold">
                <th className="py-3 px-3">اسم المندوب</th>
                <th className="py-3 px-3">الهاتف والمحافظة</th>
                <th className="py-3 px-3">مناطق التغطية</th>
                <th className="py-3 px-3">وسيلة النقل</th>
                <th className="py-3 px-3">المهام النشطة</th>
                <th className="py-3 px-3">إجمالي التسليمات</th>
                <th className="py-3 px-3">الحالة</th>
                <th className="py-3 px-3 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-100">
              {couriers.map((c) => (
                <tr key={c.id} className="hover:bg-ivory-50/50">
                  <td className="py-3 px-3 font-bold text-forest-950">{c.fullName}</td>
                  <td className="py-3 px-3">
                    <p className="font-mono text-gray-800">{c.phone}</p>
                    <p className="text-[10px] text-gray-400">{c.governorate}</p>
                  </td>
                  <td className="py-3 px-3 text-gray-600 max-w-xs truncate">{c.coveredAreas}</td>
                  <td className="py-3 px-3 text-gray-600">{c.vehicleType}</td>
                  <td className="py-3 px-3 font-black text-purple-900">{c.activeOrdersCount} مهام</td>
                  <td className="py-3 px-3 font-bold text-emerald-800">{c.totalDeliveredCount} شحنة</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'AVAILABLE'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : c.status === 'BUSY'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {c.status === 'AVAILABLE' ? 'متاح' : c.status === 'BUSY' ? 'مشغول' : 'موقوف'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => handleToggleCourierStatus(c.id, c.status)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                        c.status === 'SUSPENDED'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                    >
                      {c.status === 'SUSPENDED' ? 'إعادة التفعيل' : 'إيقاف مؤقت'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
