'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, AlertCircle, Shield, Truck, UserCheck } from 'lucide-react';
import { useAuth } from '@/components/context/AuthContext';
import { UserRole } from '@/lib/types';

function roleDestination(role: UserRole): string {
  if (role === 'admin') return '/admin';
  if (role === 'delivery') return '/delivery/dashboard';
  return '/orders';
}

function safeRedirectForRole(rawRedirect: string | null, role: UserRole): string {
  const fallback = roleDestination(role);

  if (!rawRedirect || !rawRedirect.startsWith('/') || rawRedirect.startsWith('//')) {
    return fallback;
  }

  // Never send a user to a page their role cannot access, otherwise the
  // middleware would bounce them back to /auth/login in a loop.
  if (rawRedirect.startsWith('/auth/login')) return fallback;
  if (role === 'customer' && (rawRedirect.startsWith('/admin') || rawRedirect.startsWith('/delivery/dashboard'))) {
    return fallback;
  }
  if (role === 'delivery' && rawRedirect.startsWith('/admin')) {
    return fallback;
  }

  return rawRedirect;
}

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A logged-in visitor should never see the login form again. Redirect
  // them to the page they came from (or their role dashboard).
  useEffect(() => {
    if (authLoading || !user) return;

    const params = new URLSearchParams(window.location.search);
    const destination = safeRedirectForRole(params.get('redirect'), user.role);
    router.replace(destination);
  }, [authLoading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور أولاً.');
      return;
    }

    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'فشل تسجيل الدخول');
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const destination = safeRedirectForRole(
      params.get('redirect'),
      result.role || 'customer'
    );
    router.replace(destination);
  };

  if (authLoading || user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 bg-[#f5f5f7] text-right">
        <div className="text-center space-y-3" aria-live="polite">
          <div className="w-8 h-8 border-4 border-[#c59b27] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-[#515154]">جارٍ التحقق من حالة الحساب وتحويلك...</p>
        </div>
      </div>
    );
  }

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
          <div
            role="alert"
            aria-live="polite"
            className="p-3.5 rounded-[12px] bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label htmlFor="login-email" className="block font-semibold text-[#1d1d1f] mb-1.5">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                dir="ltr"
                className="w-full pl-3.5 pr-10 py-3 rounded-[12px] bg-[#f5f5f7] border border-[#d2d2d7]/80 focus:outline-none focus:border-[#c59b27] focus:ring-4 focus:ring-amber-500/15 text-right text-[#1d1d1f]"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="font-semibold text-[#1d1d1f]">كلمة المرور</label>
              <Link
                href="/auth/forgot-password"
                className="text-[11px] text-[#c59b27] hover:underline font-semibold"
              >
                نسيت كلمة المرور؟
              </Link>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="w-full pl-3.5 pr-10 py-3 rounded-[12px] bg-[#f5f5f7] border border-[#d2d2d7]/80 focus:outline-none focus:border-[#c59b27] focus:ring-4 focus:ring-amber-500/15 text-right text-[#1d1d1f]"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
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
          <div className="flex items-center justify-center gap-3 text-[10px] text-gray-400 pt-1">
            <span className="inline-flex items-center gap-1">
              <UserCheck className="w-3 h-3" aria-hidden="true" />
              عميل
            </span>
            <span className="inline-flex items-center gap-1">
              <Truck className="w-3 h-3" aria-hidden="true" />
              مندوب
            </span>
            <span className="inline-flex items-center gap-1">
              <Shield className="w-3 h-3" aria-hidden="true" />
              إدارة
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
