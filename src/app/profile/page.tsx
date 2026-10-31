'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Phone, Mail, MapPin, Shield, CheckCircle, Package } from 'lucide-react';
import { useAuth } from '@/components/context/AuthContext';
import { USER_ROLE_MAP } from '@/lib/utils';

export default function ProfilePage() {
  const { user } = useAuth();

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

  return (
    <div className="bg-ivory-50/50 min-h-screen py-10 text-right">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-forest-950 font-cairo">
            بيانات الحساب الشخصي
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            إدارة بياناتك المسجلة وعناوين التوصيل
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-200 shadow-subtle space-y-6">
          <div className="flex items-center gap-4 border-b border-ivory-100 pb-6">
            <div className="w-16 h-16 rounded-2xl bg-forest-900 text-white flex items-center justify-center font-bold text-2xl shadow-subtle">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-forest-950">{user.name}</h2>
              <span className="inline-block mt-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-forest-50 text-forest-800 border border-forest-200">
                {USER_ROLE_MAP[user.role]?.label || user.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-ivory-50 rounded-2xl border border-ivory-200 space-y-1">
              <span className="text-gray-400 block">البريد الإلكتروني</span>
              <p className="font-mono font-bold text-forest-950 text-sm" dir="ltr">{user.email}</p>
            </div>

            <div className="p-4 bg-ivory-50 rounded-2xl border border-ivory-200 space-y-1">
              <span className="text-gray-400 block">رقم الهاتف المحمول</span>
              <p className="font-mono font-bold text-forest-950 text-sm" dir="ltr">{user.phone}</p>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-900 text-white font-bold text-xs hover:bg-forest-800"
            >
              <Package className="w-4 h-4 text-gold-400" />
              <span>مشاهدة سجل طلباتي</span>
            </Link>

            {user.role === 'admin' && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-800 text-gold-300 font-bold text-xs"
              >
                <span>الذهاب للوحة الإدارة</span>
              </Link>
            )}

            {user.role === 'delivery' && (
              <Link
                href="/delivery/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-900 text-white font-bold text-xs"
              >
                <span>لوحة مهام التوصيل</span>
              </Link>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
