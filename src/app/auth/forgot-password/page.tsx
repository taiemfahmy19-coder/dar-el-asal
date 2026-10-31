'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSent(true);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 bg-ivory-50/50 text-right">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-ivory-200 shadow-premium space-y-6">
        
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black text-forest-950 font-cairo">
            استعادة كلمة المرور
          </h1>
          <p className="text-xs text-gray-500">
            أدخل بريدك الإلكتروني المسجل وسنرسل لك رابطاً آمناً لإعادة تعيين كلمة المرور
          </p>
        </div>

        {sent ? (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <p className="text-xs font-bold text-emerald-900 leading-relaxed">
              تم إرسال رابط استعادة كلمة المرور إلى ({email}) بنجاح. يرجى التحقق من صندوق الوارد.
            </p>
            <Link
              href="/auth/login"
              className="inline-block text-xs font-bold text-forest-900 underline pt-2"
            >
              العودة لتسجيل الدخول
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-forest-950 mb-1.5">
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
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-ivory-50 border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-forest-700/20 text-right"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl bg-forest-900 text-white font-bold text-xs hover:bg-forest-800 transition-all shadow-subtle"
            >
              إرسال رابط الاستعادة
            </button>
          </form>
        )}

        <div className="border-t border-ivory-200 pt-4 text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-xs text-forest-800 font-bold hover:underline"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لصفحة تسجيل الدخول</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
