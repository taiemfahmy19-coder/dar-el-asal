'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Sparkles, ShoppingBag, Check, ShieldCheck, Tag, AlertCircle } from 'lucide-react';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/components/context/CartContext';

const BUDGET_OPTIONS = [500, 800, 1200, 1800, 2500];

const THEME_OPTIONS = [
  { id: 'immunity', label: 'مناعة ونشاط طبيعي', icon: '🌿' },
  { id: 'healthy_breakfast', label: 'فطور صباحي صحي', icon: '🍯' },
  { id: 'luxury_gift', label: 'صندوق هدية فاخرة', icon: '🎁' },
  { id: 'home_pantry', label: 'تموين البيت الطبيعي', icon: '🌾' },
];

export default function SmartPackageWizard() {
  const { addItem } = useCart();
  const [budget, setBudget] = useState(1200);
  const [theme, setTheme] = useState('immunity');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [packageData, setPackageData] = useState<{
    title: string;
    description: string;
    totalPrice: number;
    originalTotalPrice: number;
    savings: number;
    products: Product[];
  } | null>(null);
  const [allAdded, setAllAdded] = useState(false);

  const fetchPackage = async (selectedBudget: number, selectedTheme: string) => {
    setLoading(true);
    setError(null);
    setAllAdded(false);
    try {
      const res = await fetch('/api/smart-package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budget: selectedBudget, theme: selectedTheme }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setPackageData(null);
        setError(data.error || 'تعذر تجهيز الباقة الآن. يرجى المحاولة مرة أخرى.');
        return;
      }

      setPackageData(data.package);
    } catch (err) {
      console.error('Error fetching smart package', err);
      setPackageData(null);
      setError('تعذر الاتصال بالخادم لتجهيز الباقة. تحقق من اتصالك ثم حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackage(budget, theme);
  }, [budget, theme]);

  /**
   * Native hash navigation is unreliable around hydration in the App Router,
   * and browsers can cancel a single smooth scroll when images shift layout.
   * Keep re-anchoring the section (up to 8s, for slow connections) until it settles just under the sticky
   * header, for both fresh loads (/#smart-package) and in-page anchor clicks.
   */
  useEffect(() => {
    const SETTLE_MIN = 60; // top of section when fully settled under header
    const SETTLE_MAX = 150;
    const STEP_MS = 120;
    const MAX_MS = 8000;
    let timer: number | undefined;
    let elapsed = 0;

    const stop = () => {
      if (timer !== undefined) {
        window.clearInterval(timer);
        timer = undefined;
      }
    };

    const step = () => {
      if (window.location.hash !== '#smart-package') {
        stop();
        return;
      }

      const target = document.getElementById('smart-package');
      if (!target) return; // section not mounted yet; retry

      const top = Math.round(target.getBoundingClientRect().top);
      if (top >= SETTLE_MIN && top <= SETTLE_MAX) {
        stop(); // settled under the sticky header
        return;
      }

      target.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' });
    };

    const start = () => {
      if (timer !== undefined) return; // already re-anchoring for this hash
      elapsed = 0;
      timer = window.setInterval(() => {
        elapsed += STEP_MS;
        if (elapsed > MAX_MS) {
          stop();
          return;
        }
        step();
      }, STEP_MS);
    };

    const onHashChange = () => start();
    const onAnchorClick = (event: MouseEvent) => {
      if ((event.target as HTMLElement | null)?.closest?.('a[href$="#smart-package"]')) {
        start();
      }
    };

    if (window.location.hash === '#smart-package') start();

    window.addEventListener('hashchange', onHashChange);
    // Next.js soft navigation may not fire hashchange, so watch clicks too.
    document.addEventListener('click', onAnchorClick);

    return () => {
      stop();
      window.removeEventListener('hashchange', onHashChange);
      document.removeEventListener('click', onAnchorClick);
    };
  }, []);

  const handleAddAllToCart = () => {
    if (!packageData || packageData.products.length === 0) return;

    for (const prod of packageData.products) {
      addItem(prod, 1);
    }
    setAllAdded(true);
    setTimeout(() => setAllAdded(false), 2000);
  };

  return (
    <section
      id="smart-package"
      aria-labelledby="smart-package-title"
      className="scroll-mt-24 py-16 bg-[#f5f5f7] border-b border-[#d2d2d7]/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#d2d2d7]/80 text-[#0071e3] text-xs font-medium shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#0071e3]" />
            <span>دار العسل والزيتون | باقة مصممة لك</span>
          </div>
          <h2 id="smart-package-title" className="text-2xl sm:text-4xl font-semibold text-[#1d1d1f] tracking-tight">
            اختار لك: باقتك الطبيعية المصممة لميزانيتك
          </h2>
          <p className="text-sm sm:text-base text-[#515154] leading-relaxed">
            حدد ميزانيتك والغرض من الشراء، ويقوم نظام دار العسل والزيتون بتنسيق باقة متكاملة من المنتجات الطبيعية المتوفرة حالياً مع ضمان التوافق وأفضل قيمة لسعرك.
          </p>
        </div>

        {/* Wizard Controls */}
        <div className="card max-w-4xl mx-auto mb-8 text-right border border-[#d2d2d7]/50">
          
          {/* Step 1: Budget */}
          <div className="mb-6 sm:mb-8">
            <label className="block text-xs sm:text-sm font-semibold text-[#1d1d1f] mb-3">
              1. حدد ميزانيتك التقريبية:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-2.5">
              {BUDGET_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setBudget(opt)}
                  className={`py-2.5 sm:py-3 px-3 sm:px-4 rounded-[980px] text-xs sm:text-sm font-medium transition-all ${
                    budget === opt
                      ? 'bg-[#143823] text-[#f5ebd2] border border-[#c59b27]/60 shadow-sm scale-[1.02]'
                      : 'bg-[#f5f5f7] text-[#1d1d1f] border border-[#d2d2d7]/60 hover:bg-gray-200/60'
                  }`}
                >
                  {formatPrice(opt)}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Theme / Need */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-[#1d1d1f] mb-3">
              2. ما الغرض الأساسي من الباقة؟
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
              {THEME_OPTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTheme(item.id)}
                  className={`p-3 sm:p-4 rounded-[14px] text-right transition-all border flex items-center gap-2.5 ${
                    theme === item.id
                      ? 'bg-[#f5ebd2] border-[#c59b27] text-[#143823] font-semibold shadow-sm ring-1 ring-[#c59b27]'
                      : 'bg-[#f5f5f7] border-[#d2d2d7]/60 text-[#1d1d1f] hover:bg-gray-200/60'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs sm:text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Package Result Showcase */}
        {error && (
          <div
            role="alert"
            className="max-w-4xl mx-auto mb-6 p-4 rounded-[14px] bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 text-right"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="max-w-4xl mx-auto p-12 text-center text-[#515154]" aria-live="polite">
            <div className="inline-block w-8 h-8 border-4 border-[#c59b27] border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-medium">جارٍ تنسيق أفضل تشكيلة متوافقة من قاعدة البيانات...</p>
          </div>
        ) : packageData && packageData.products.length > 0 ? (
          <div className="card max-w-4xl mx-auto border border-[#d2d2d7]/50 fade-in">
            
            {/* Header Result */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#d2d2d7]/40 text-right gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-[#1d1d1f] tracking-tight">
                    {packageData.title}
                  </h3>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-medium">
                    جاهزة للطلب
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#515154] mt-1 max-w-xl">
                  {packageData.description}
                </p>
              </div>

              {/* Price summary */}
              <div className="flex flex-col sm:items-end">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#1d1d1f]">
                    {formatPrice(packageData.totalPrice)}
                  </span>
                  {packageData.savings > 0 && (
                    <span className="text-xs text-[#515154] line-through">
                      {formatPrice(packageData.originalTotalPrice)}
                    </span>
                  )}
                </div>
                {packageData.savings > 0 && (
                  <span className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    وفرت {formatPrice(packageData.savings)} في هذه الباقة
                  </span>
                )}
              </div>
            </div>

            {/* Included Products List */}
            <div className="py-6 space-y-3">
              <p className="text-xs font-semibold text-[#515154] uppercase tracking-wider text-right mb-2">
                المنتجات المشمولة في باقتك المقترحة:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {packageData.products.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-[#f5f5f7] p-3.5 rounded-[14px] border border-[#d2d2d7]/50 flex items-center gap-3 text-right"
                  >
                    <div className="w-14 h-14 rounded-[10px] overflow-hidden bg-white shrink-0 relative border border-[#d2d2d7]/50">
                      <Image
                        src={prod.images[0] || '/images/honey/prod-honey-plain.jpg'}
                        alt={prod.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-[#1d1d1f] truncate">
                        {prod.name}
                      </h4>
                      <p className="text-[11px] text-[#515154] truncate">{prod.weightVolume}</p>
                      <p className="text-xs font-bold text-[#1d1d1f] mt-0.5">
                        {formatPrice(prod.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA add bundle */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-[#515154] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                جميع المنتجات مفحوصة وتُؤكد جاهزيتها لدى المورد فور طلبك
              </span>

              <button
                type="button"
                onClick={handleAddAllToCart}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-[980px] text-sm font-semibold transition-all shadow-sm active:scale-95 ${
                  allAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#143823] text-[#f5ebd2] hover:bg-[#1a4a2f] border border-[#c59b27]/60 hover:scale-[1.02]'
                }`}
              >
                {allAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>تمت إضافة الباقة كاملة للسلة بنجاح!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-white/90" />
                    <span>إضافة الباقة كاملة إلى السلة</span>
                  </>
                )}
              </button>
            </div>

          </div>
        ) : !error ? (
          <div className="max-w-4xl mx-auto card p-8 text-center border border-[#d2d2d7]/50 text-sm text-[#515154]">
            لا توجد باقة مناسبة لهذه الميزانية حاليًا. جرّب اختيار ميزانية أعلى أو غرضًا مختلفًا.
          </div>
        ) : null}

      </div>
    </section>
  );
}
