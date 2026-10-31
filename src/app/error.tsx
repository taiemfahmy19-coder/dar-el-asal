'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full text-center">
        {/* Warning Icon Badge with Warm Amber/Gold Styling */}
        <div className="relative inline-block mb-6">
          <div className="absolute -inset-4 bg-amber-500/10 rounded-full blur-xl" />
          <div className="relative mx-auto w-20 h-20 flex items-center justify-center rounded-2xl bg-amber-50 border border-amber-200/80 shadow-sm text-amber-700">
            <AlertTriangle className="w-10 h-10 stroke-[1.75]" />
          </div>
        </div>

        {/* Headings */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#143823] mb-3">
          حدث خطأ غير متوقع
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto leading-relaxed mb-8">
          نعتذر منك بشدة، واجه الموقع عطلًا تقنيًا مؤقتًا أثناء معالجة الطلب. يمكنك تجربة إعادة المحاولة الآن أو الرجوع للصفحة الرئيسية.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#143823] text-[#fcfaf6] font-bold text-sm shadow-md shadow-[#143823]/20 hover:bg-[#1a472c] hover:shadow-lg transition-all transform active:scale-95"
          >
            <RefreshCw className="w-4 h-4 text-[#c59b27]" />
            <span>إعادة المحاولة</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-white text-[#143823] border border-[#143823]/20 font-bold text-sm hover:border-[#c59b27] hover:bg-[#fcfaf6] transition-all shadow-sm active:scale-95"
          >
            <Home className="w-4 h-4 text-[#c59b27]" />
            <span>العودة للصفحة الرئيسية</span>
          </Link>
        </div>

        {/* Technical Error Reference Note */}
        {error?.digest && (
          <p className="mt-8 text-xs text-gray-400 font-mono">
            رمز الخطأ المرجعي: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
