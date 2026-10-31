'use client';

import React, { useState, useEffect } from 'react';
import { Store, Plus, Phone, Mail, MapPin, CheckCircle, ShieldCheck, RefreshCw } from 'lucide-react';
import { Supplier } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [productsSupplied, setProductsSupplied] = useState('');
  const [notes, setNotes] = useState('');

  const fetchSuppliers = () => {
    fetch('/api/admin/suppliers')
      .then((res) => res.json())
      .then((data) => {
        if (data.suppliers) setSuppliers(data.suppliers);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contactPerson || !phone) return;

    try {
      const res = await fetch('/api/admin/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          contactPerson,
          phone,
          email,
          address,
          productsSupplied,
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setModalOpen(false);
        setName('');
        setContactPerson('');
        setPhone('');
        setEmail('');
        setAddress('');
        setProductsSupplied('');
        setNotes('');
        fetchSuppliers();
      } else {
        alert(data.error || 'فشل حفظ بيانات المورد');
      }
    } catch {
      alert('حدث خطأ');
    }
  };

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-ivory-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-forest-950 font-cairo">
            إدارة الموردين وأسعار الشراء
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            بيانات سرية داخلية لتوثيق مصادر المنتجات ومتابعة أسعار التكلفة
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-900 text-white text-xs font-bold hover:bg-forest-800 shadow-premium"
          >
            <Plus className="w-4 h-4 text-gold-400" />
            <span>إضافة مورد جديد</span>
          </button>

          <button
            onClick={fetchSuppliers}
            className="p-2.5 rounded-xl bg-white border border-ivory-300 text-gray-700 hover:bg-ivory-100 shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suppliers.map((sup) => (
          <div
            key={sup.id}
            className="bg-white rounded-3xl p-6 border border-ivory-200 shadow-subtle space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-ivory-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center font-bold">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-forest-950">{sup.name}</h3>
                  <p className="text-[11px] text-gray-400">المسؤول: {sup.contactPerson}</p>
                </div>
              </div>

              <span className="bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200 text-[10px]">
                {sup.productsCount || 0} منتجات مرتبطة
              </span>
            </div>

            <div className="space-y-2 text-gray-600">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                <span dir="ltr" className="font-mono">{sup.phone}</span>
                {sup.email && <span className="text-gray-400">({sup.email})</span>}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                <span>{sup.address}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-bold shrink-0 text-forest-900">المنتجات الموردة:</span>
                <span>{sup.productsSupplied}</span>
              </p>
              {sup.notes && (
                <div className="p-2.5 bg-ivory-50 rounded-xl border border-ivory-200 italic">
                  "{sup.notes}"
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-ivory-100 flex items-center justify-between text-[11px] text-gray-400">
              <span>آخر تحقق وتأكيد للأسعار:</span>
              <span className="font-bold text-forest-800">{formatDate(sup.lastVerifiedAt)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Supplier Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-ivory-200 shadow-floating text-right space-y-4">
            <h3 className="text-base font-bold text-forest-950 border-b border-ivory-100 pb-3">
              إضافة مورد جديد
            </h3>

            <form onSubmit={handleSaveSupplier} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-forest-950 mb-1">اسم المورد / المنحل / المعصرة *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: مناحل وادي النطرون"
                  className="w-full p-2.5 rounded-xl bg-ivory-50 border border-ivory-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-forest-950 mb-1">الشخص المسؤول *</label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="الاسم"
                    className="w-full p-2.5 rounded-xl bg-ivory-50 border border-ivory-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-forest-950 mb-1">رقم الهاتف *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010..."
                    dir="ltr"
                    className="w-full p-2.5 rounded-xl bg-ivory-50 border border-ivory-300 text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-forest-950 mb-1">العنوان / الموقع الجغرافي</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="مثال: سيوة، مطروح"
                  className="w-full p-2.5 rounded-xl bg-ivory-50 border border-ivory-300"
                />
              </div>

              <div>
                <label className="block font-bold text-forest-950 mb-1">المنتجات التي يوفرها</label>
                <input
                  type="text"
                  value={productsSupplied}
                  onChange={(e) => setProductsSupplied(e.target.value)}
                  placeholder="عسل سدر، زيت زيتون، شمع نحل..."
                  className="w-full p-2.5 rounded-xl bg-ivory-50 border border-ivory-300"
                />
              </div>

              <div>
                <label className="block font-bold text-forest-950 mb-1">ملاحظات التعامل وفحص الجودة</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="سجل نتائج التحليل المخبري..."
                  className="w-full p-2.5 rounded-xl bg-ivory-50 border border-ivory-300"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-ivory-100">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-forest-900 text-white font-bold hover:bg-forest-800 shadow-sm"
                >
                  حفظ المورد
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="py-3 px-5 rounded-xl bg-ivory-100 text-gray-700 font-bold hover:bg-ivory-200"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
