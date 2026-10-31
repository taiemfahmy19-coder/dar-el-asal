'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, Phone, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/components/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام');
      return;
    }

    setLoading(true);
    const result = await register(name, email, password, phone);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'فشل إنشاء الحساب');
      return;
    }

    router.push('/products');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 bg-ivory-50/50 text-right">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-ivory-200 shadow-premium space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-forest-900 text-gold-400 flex items-center justify-center mx-auto text-xl font-bold shadow-subtle border border-forest-800">
            بـ
          </div>
          <h1 className="text-2xl font-black text-forest-950 font-cairo">
            إنشاء حساب عميل جديد
          </h1>
          <p className="text-xs text-gray-500">
            انضم إلى مجتمع بازار وتمتع بتتبع طلباتك وحفظ عناوينك المفضلة
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-forest-950 mb-1.5">
              الاسم الكامل *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: سارة عبد الله"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-ivory-50 border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-forest-700/20"
              />
              <User className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-forest-950 mb-1.5">
              البريد الإلكتروني *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                dir="ltr"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-ivory-50 border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-forest-700/20 text-right"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-forest-950 mb-1.5">
              رقم الهاتف المحمول *
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01012345678"
                dir="ltr"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-ivory-50 border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-forest-700/20 text-right"
              />
              <Phone className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-forest-950 mb-1.5">
              كلمة المرور (6 أحرف أو أكثر) *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-ivory-50 border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-forest-700/20 text-right"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-forest-900 text-white font-bold text-xs hover:bg-forest-800 transition-all shadow-subtle active:scale-95 disabled:bg-gray-400"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>إنشاء الحساب</span>
            )}
          </button>
        </form>

        <div className="border-t border-ivory-200 pt-4 text-center text-xs text-gray-600">
          لديك حساب بالفعل؟{' '}
          <Link href="/auth/login" className="font-bold text-forest-900 hover:underline">
            تسجيل الدخول
          </Link>
        </div>

      </div>
    </div>
  );
}
