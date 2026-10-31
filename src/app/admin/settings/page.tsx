'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, ShieldCheck, Truck } from 'lucide-react';
import { StoreSettings } from '@/lib/types';
import { formatPrice, EGYPTIAN_GOVERNORATES } from '@/lib/utils';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSavedMessage(true);
        setTimeout(() => setSavedMessage(false), 2500);
      }
    } catch {
      alert('فشل حفظ الإعدادات');
    }
  };

  if (loading || !settings) {
    return <div className="p-8 text-center text-gray-500">جارٍ تحميل الإعدادات...</div>;
  }

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="pb-6 border-b border-ivory-200">
        <h1 className="text-2xl sm:text-3xl font-black text-forest-950 font-cairo">
          إعدادات المتجر والشحن
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          ضبط اسم المتجر، رسوم التوصيل، حد الشحن المجاني، والعملة الافتراضية
        </p>
      </div>

      {savedMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>تم حفظ إعدادات المتجر بنجاح!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-200 shadow-subtle space-y-6 text-xs">
        
        {/* Store Profile */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-forest-950 border-b border-ivory-100 pb-2">
            البيانات الأساسية للمتجر
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-forest-950 mb-1">اسم المتجر الرسمي</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-ivory-50 border border-ivory-300 font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-forest-950 mb-1">العملة الافتراضية</label>
              <input
                type="text"
                disabled
                value="الجنيه المصري (ج.م) — EGP"
                className="w-full p-2.5 rounded-xl bg-ivory-100 border border-ivory-300 text-gray-500 font-bold cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-forest-950 mb-1">الشعار اللفظي (Tagline)</label>
            <input
              type="text"
              value={settings.storeTagline}
              onChange={(e) => setSettings({ ...settings, storeTagline: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-ivory-50 border border-ivory-300"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-forest-950 mb-1">رقم هاتف خدمة العملاء</label>
              <input
                type="tel"
                value={settings.storePhone}
                onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                dir="ltr"
                className="w-full p-2.5 rounded-xl bg-ivory-50 border border-ivory-300 text-right"
              />
            </div>
            <div>
              <label className="block font-bold text-forest-950 mb-1">البريد الإلكتروني للدعم</label>
              <input
                type="email"
                value={settings.storeEmail}
                onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                dir="ltr"
                className="w-full p-2.5 rounded-xl bg-ivory-50 border border-ivory-300 text-right"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Thresholds */}
        <div className="space-y-4 pt-4 border-t border-ivory-100">
          <h3 className="font-bold text-sm text-forest-950 border-b border-ivory-100 pb-2">
            سياسات الشحن والحدود المالية
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-forest-950 mb-1">
                حد الشحن المجاني (ج.م)
              </label>
              <input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })
                }
                className="w-full p-2.5 rounded-xl bg-ivory-50 border border-ivory-300 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-forest-950 mb-1">
                الحد الأدنى لقيمة الطلب (ج.م)
              </label>
              <input
                type="number"
                value={settings.minOrderAmount}
                onChange={(e) =>
                  setSettings({ ...settings, minOrderAmount: Number(e.target.value) })
                }
                className="w-full p-2.5 rounded-xl bg-ivory-50 border border-ivory-300 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Auto Assignment Policy */}
        <div className="space-y-4 pt-4 border-t border-ivory-100">
          <h3 className="font-bold text-sm text-forest-950 border-b border-ivory-100 pb-2">
            إعدادات التوزيع التلقائي للمناديب
          </h3>

          <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-ivory-50 border border-ivory-200 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableAutoAssignment}
              onChange={(e) =>
                setSettings({ ...settings, enableAutoAssignment: e.target.checked })
              }
              className="accent-forest-900 w-4 h-4"
            />
            <div>
              <span className="font-bold text-forest-950 block">
                تفعيل محرك التوزيع التلقائي الذكي للطلبات الجاهزة
              </span>
              <span className="text-[11px] text-gray-500">
                يقوم النظام باختيار المندوب المعتمد والمتاح ذو الحمل الأقل تلقائياً فور تجهيز الطلب.
              </span>
            </div>
          </label>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-forest-900 text-white font-bold text-xs hover:bg-forest-800 shadow-premium"
          >
            <Save className="w-4 h-4 text-gold-400" />
            <span>حفظ جميع الإعدادات</span>
          </button>
        </div>

      </form>

    </div>
  );
}
