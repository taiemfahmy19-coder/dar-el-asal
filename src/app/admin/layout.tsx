'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { useAuth } from '@/components/context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login');
      } else if (user.role !== 'admin') {
        alert('غير مصرح لك بالدخول، لوحة الإدارة مخصصة لمدير النظام فقط.');
        router.push('/');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-forest-950 text-white">
        <div className="w-8 h-8 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-forest-950 text-white text-center">
        <div className="space-y-4 max-w-md">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold font-cairo">منطقة محمية — الصلاحية للمدير فقط</h2>
          <p className="text-xs text-gray-400">
            ليس لديك الصلاحيات الكافية للوصول إلى لوحة التحكم الإدارية.
          </p>
          <a
            href="/auth/login"
            className="inline-block px-5 py-2.5 rounded-xl bg-forest-800 text-white text-xs font-bold"
          >
            تسجيل الدخول بحساب المدير
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-ivory-50 text-right">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto min-h-screen">
        {children}
      </div>
    </div>
  );
}
