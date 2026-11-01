'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Phone, Mail, MapPin, Shield, CheckCircle2, Package, Edit, Save, Plus } from 'lucide-react';
import { useAuth } from '@/components/context/AuthContext';
import { USER_ROLE_MAP } from '@/lib/utils';
import { CustomerAddress } from '@/lib/types';

export default function ProfilePage() {
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New Address Modal state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressLabel, setAddressLabel] = useState('المنزل');
  const [streetAddress, setStreetAddress] = useState('');
  const [buildingDetails, setBuildingDetails] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');

      fetch('/api/profile')
        .then((res) => res.json())
        .then((data) => {
          if (data.addresses) setAddresses(data.addresses);
        });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-ivory-200 text-center space-y-4 max-w-sm">
          <p className="font-bold text-forest-950 text-sm">يجب تسجيل الدخول أولاً</p>
          <Link
            href="/auth/login"
            className="inline-block px-6 py-2.5 rounded-xl bg-forest-900 text-white font-bold text-xs"
          >
            تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setEditing(false);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        alert(data.error || 'فشل حفظ التعديلات');
      }
    } catch {
      alert('حدث خطأ في الاتصال');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streetAddress) {
      alert('يرجى إدخال العنوان بالتفصيل');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newAddress: {
            label: addressLabel,
            governorate: 'الإسكندرية',
            city: 'الإسكندرية',
            streetAddress,
            buildingDetails,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.addresses) setAddresses(data.addresses);
        setShowAddressForm(false);
        setStreetAddress('');
        setBuildingDetails('');
      }
    } catch {
      alert('حدث خطأ أثناء حفظ العنوان');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-ivory-50/50 min-h-screen py-10 text-right">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-forest-950 font-cairo">
              بيانات الحساب الشخصي
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              إدارة بياناتك المسجلة، معلومات التواصل، وعناوين التوصيل المعتمدة
            </p>
          </div>

          <Link
            href="/orders"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-900 text-gold-300 font-bold text-xs hover:bg-forest-800 shadow-sm"
          >
            <Package className="w-4 h-4 text-gold-400" />
            <span>مشاهدة سجل طلباتي</span>
          </Link>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>تم حفظ بياناتك بنجاح في قاعدة البيانات المركزية!</span>
          </div>
        )}

        {/* Profile Details Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-200 shadow-subtle space-y-6">
          <div className="flex items-center justify-between border-b border-ivory-100 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-forest-900 text-white flex items-center justify-center font-bold text-2xl shadow-subtle border border-gold-400/40">
                {name.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-forest-950">{name}</h2>
                <span className="inline-block mt-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-forest-50 text-forest-800 border border-forest-200">
                  {USER_ROLE_MAP[user.role]?.label || user.role}
                </span>
              </div>
            </div>

            <button
              onClick={() => setEditing(!editing)}
              className="px-4 py-2 rounded-xl bg-ivory-100 hover:bg-ivory-200 text-forest-950 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>{editing ? 'إلغاء التعديل' : 'تعديل البيانات'}</span>
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-forest-950 mb-1">الاسم بالكامل</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-ivory-50 border border-ivory-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-forest-950 mb-1">رقم الهاتف المحمول</label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-ivory-50 border border-ivory-300 text-right font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-forest-900 text-white font-bold text-xs hover:bg-forest-800 shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4 text-gold-400" />
                  <span>{saving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-ivory-50 rounded-2xl border border-ivory-200 space-y-1">
                <span className="text-gray-400 block font-semibold">البريد الإلكتروني</span>
                <p className="font-mono font-bold text-forest-950 text-sm" dir="ltr">{user.email}</p>
              </div>

              <div className="p-4 bg-ivory-50 rounded-2xl border border-ivory-200 space-y-1">
                <span className="text-gray-400 block font-semibold">رقم الهاتف المحمول</span>
                <p className="font-mono font-bold text-forest-950 text-sm" dir="ltr">{user.phone || 'لم يتم تسجيل هاتف'}</p>
              </div>
            </div>
          )}

          {/* Quick role shortcuts */}
          <div className="pt-2 flex items-center gap-3">
            {user.role === 'admin' && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-800 text-gold-300 font-bold text-xs hover:bg-forest-700"
              >
                <span>الذهاب للوحة الإدارة الشاملة</span>
              </Link>
            )}

            {user.role === 'delivery' && (
              <Link
                href="/delivery/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-900 text-white font-bold text-xs hover:bg-purple-800"
              >
                <span>لوحة مهام التوصيل</span>
              </Link>
            )}
          </div>
        </div>

        {/* Saved Delivery Addresses Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-200 shadow-subtle space-y-5">
          <div className="flex items-center justify-between border-b border-ivory-100 pb-4">
            <div>
              <h3 className="font-bold text-base text-forest-950 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-forest-800" />
                <span>عناوين التوصيل المسجلة ({addresses.length})</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                عناوينك بمدينة الإسكندرية المستخدمة في تسليم الشحنات
              </p>
            </div>

            <button
              onClick={() => setShowAddressForm(!showAddressForm)}
              className="px-4 py-2 rounded-xl bg-forest-900 text-gold-300 hover:bg-forest-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4 text-gold-400" />
              <span>إضافة عنوان جديد</span>
            </button>
          </div>

          {showAddressForm && (
            <form onSubmit={handleAddAddress} className="p-4 bg-ivory-50 rounded-2xl border border-ivory-300 space-y-3 text-xs">
              <h4 className="font-bold text-forest-950">إضافة عنوان جديد</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-forest-950 mb-1">اسم العنوان (مثل: المنزل، العمل)</label>
                  <input
                    type="text"
                    required
                    value={addressLabel}
                    onChange={(e) => setAddressLabel(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-ivory-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-forest-950 mb-1">المحافظة والمدينة</label>
                  <input
                    type="text"
                    disabled
                    value="الإسكندرية"
                    className="w-full p-2.5 rounded-xl bg-ivory-100 border border-ivory-300 text-gray-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-forest-950 mb-1">العنوان بالتفصيل (الشارع والمنطقة) *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: لوران - شارع الإقبال"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-ivory-300"
                />
              </div>

              <div>
                <label className="block font-bold text-forest-950 mb-1">تفاصيل المبنى (رقم العقار، الطابق، الشقة)</label>
                <input
                  type="text"
                  placeholder="مثال: عمارة 12، الدور الخامس، شقة 10"
                  value={buildingDetails}
                  onChange={(e) => setBuildingDetails(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-ivory-300"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-forest-900 text-white font-bold hover:bg-forest-800"
                >
                  {saving ? 'جارٍ الحفظ...' : 'حفظ العنوان ✓'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddressForm(false)}
                  className="px-4 py-2 rounded-xl bg-ivory-100 text-gray-700 font-bold hover:bg-ivory-200"
                >
                  إلغاء
                </button>
              </div>
            </form>
          )}

          {addresses.length === 0 ? (
            <p className="text-xs text-gray-500 py-3 text-center">
              لم تسجل أي عناوين بعد. يمكنك إضافة عنوانك لتسريع تأكيد الطلبات اللاحقة.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div key={addr.id} className="p-4 rounded-2xl bg-ivory-50 border border-ivory-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-forest-950">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                        العنوان الافتراضي
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{addr.governorate} - {addr.city}</p>
                  <p className="font-semibold text-forest-900">{addr.streetAddress}</p>
                  {addr.buildingDetails && (
                    <p className="text-gray-500 text-[11px]">{addr.buildingDetails}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
