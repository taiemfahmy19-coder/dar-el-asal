'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, AlertCircle, Shield, Truck, UserCheck } from 'lucide-react';
import { useAuth } from '@/components/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'فشل تسجيل الدخول');
      return;
    }

    if (result.role === 'admin') {
      router.push('/admin');
    } else if (result.role === 'delivery') {
      router.push('/delivery/dashboard');
    } else {
      router.push('/orders');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-[#f5f5f7] text-right">
      <div className="card max-w-md w-full border border-[#d2d2d7]/50 p-8 sm:p-10 space-y-6 !rounded-[18px]">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-[14px] bg-[#143823] text-[#c59b27] flex items-center justify-center mx-auto text-xl font-bold shadow-sm border border-[#c59b27]/40">
            🍯
          </div>
          <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">
            تسجيل الدخول
          </h1>
          <p className="text-xs text-[#515154]">
            دار العسل والزيتون | DAR EL ASAL & OLIVE
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-[12px] bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#1d1d1f] mb-1.5">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                dir="ltr"
                className="w-full pl-3.5 pr-10 py-3 rounded-[12px] bg-[#f5f5f7] border border-[#d2d2d7]/80 focus:outline-none focus:border-[#c59b27] focus:ring-4 focus:ring-amber-500/15 text-right text-[#1d1d1f]"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-[#1d1d1f]">كلمة المرور</label>
              <Link
                href="/auth/forgot-password"
                className="text-[11px] text-[#c59b27] hover:underline font-semibold"
              >
                نسيت كلمة المرور؟
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="w-full pl-3.5 pr-10 py-3 rounded-[12px] bg-[#f5f5f7] border border-[#d2d2d7]/80 focus:outline-none focus:border-[#c59b27] focus:ring-4 focus:ring-amber-500/15 text-right text-[#1d1d1f]"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-[980px] bg-[#143823] text-[#f5ebd2] font-semibold text-sm hover:bg-[#1a4a2f] border border-[#c59b27]/60 hover:scale-[1.02] active:scale-95 transition-all shadow-sm disabled:bg-gray-400 mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-[#c59b27] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>دخول الحساب</span>
            )}
          </button>
        </form>

        {/* Public Links - Customers & Delivery only */}
        <div className="border-t border-[#d2d2d7]/40 pt-4 flex flex-col items-center gap-2.5 text-xs text-[#515154] text-center">
          <p>
            ليس لديك حساب بعد؟{' '}
            <Link href="/auth/register" className="font-semibold text-[#0066cc] hover:underline">
              إنشاء حساب عميل جديد
            </Link>
          </p>
          <div className="text-[11px] text-gray-500 pt-1 border-t border-gray-100 w-full">
            مندوب توصيل وترغب بالانضمام؟{' '}
            <Link href="/delivery/apply" className="font-semibold text-[#c59b27] hover:underline">
              تقديم طلب انضمام كابتن توصيل
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
