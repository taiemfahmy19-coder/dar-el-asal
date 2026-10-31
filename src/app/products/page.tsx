'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, SlidersHorizontal, PackageX } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

function ProductsContent() {
  const searchParams = useSearchParams();
  
  const initialCategory = searchParams.get('categoryId') || '';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [maxPrice, setMaxPrice] = useState<number>(2500);

  // Mobile filters toggle
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setProducts(data.products);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter((p) => {
    if (selectedCategory && p.categoryId !== selectedCategory) return false;
    if (selectedStatus && p.status !== selectedStatus) return false;
    if (p.price > maxPrice) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchOrigin = p.origin.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchOrigin) return false;
    }
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="bg-[#f5f5f7] min-h-screen py-10 text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumbs & Title */}
        <div className="mb-8 space-y-2">
          <h1 className="text-2xl sm:text-4xl font-semibold text-[#1d1d1f] tracking-tight">
            جميع المنتجات الطبيعية
          </h1>
          <p className="text-xs sm:text-sm text-[#515154]">
            تصفح قائمتنا الكاملة من المنتجات المفحوصة والمضمونة بنموذج البيع حسب الطلب
          </p>
        </div>

        {/* Top Controls Bar Bento */}
        <div className="card p-4 border border-[#d2d2d7]/50 mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 !rounded-[18px]">
          
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو المصدر (مثل: سيوة، سدر، برتقال)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#f5f5f7] border border-[#d2d2d7]/70 rounded-[980px] focus:outline-none focus:border-[#c59b27] focus:ring-4 focus:ring-amber-500/15 text-[#1d1d1f]"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#515154] font-medium shrink-0">الترتيب:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#f5f5f7] border border-[#d2d2d7]/70 rounded-[980px] px-4 py-2 text-xs font-medium text-[#1d1d1f] focus:outline-none focus:border-[#c59b27]"
              >
                <option value="newest">الأحدث وصولاً</option>
                <option value="price-asc">السعر: من الأقل للأعلى</option>
                <option value="price-desc">السعر: من الأعلى للأقل</option>
                <option value="rating">الأعلى تقييماً</option>
              </select>
            </div>

            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="md:hidden flex items-center gap-1.5 px-4 py-2 bg-[#f5f5f7] rounded-[980px] text-xs font-medium text-[#1d1d1f] border border-[#d2d2d7]/70"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>الفلاتر</span>
            </button>
          </div>

        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Sidebar Filters */}
          <aside
            className={`space-y-6 md:block ${
              mobileFilterOpen ? 'block' : 'hidden'
            } card p-6 border border-[#d2d2d7]/50 h-fit !rounded-[18px]`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#d2d2d7]/40">
              <h3 className="font-semibold text-sm text-[#1d1d1f] flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#c59b27]" />
                تصفية المنتجات
              </h3>
              {(selectedCategory || selectedStatus || search || maxPrice < 2500) && (
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedStatus('');
                    setSearch('');
                    setMaxPrice(2500);
                  }}
                  className="text-[11px] text-[#c59b27] font-semibold hover:underline"
                >
                  إعادة ضبط
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] mb-2">
                القسم:
              </label>
              <div className="space-y-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-right py-2 px-3 rounded-[980px] font-medium transition-all ${
                    selectedCategory === ''
                      ? 'bg-[#143823] text-[#f5ebd2] border border-[#c59b27]/60'
                      : 'text-[#515154] hover:bg-gray-100'
                  }`}
                >
                  جميع الأقسام
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('cat-honey')}
                  className={`w-full text-right py-2 px-3 rounded-[980px] font-medium transition-all ${
                    selectedCategory === 'cat-honey'
                      ? 'bg-[#143823] text-[#f5ebd2] border border-[#c59b27]/60'
                      : 'text-[#515154] hover:bg-gray-100'
                  }`}
                >
                  عسل نحل طبيعي فاخر
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('cat-olive-oil')}
                  className={`w-full text-right py-2 px-3 rounded-[980px] font-medium transition-all ${
                    selectedCategory === 'cat-olive-oil'
                      ? 'bg-[#143823] text-[#f5ebd2] border border-[#c59b27]/60'
                      : 'text-[#515154] hover:bg-gray-100'
                  }`}
                >
                  زيت زيتون بكر ممتاز
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[#d2d2d7]/40">
              <label className="block text-xs font-semibold text-[#1d1d1f] mb-2">
                حالة التوفر لدى المورد:
              </label>
              <div className="space-y-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedStatus('')}
                  className={`w-full text-right py-2 px-3 rounded-[980px] font-medium ${
                    selectedStatus === '' ? 'bg-[#143823] text-[#f5ebd2] border border-[#c59b27]/60' : 'text-[#515154] hover:bg-gray-100'
                  }`}
                >
                  الكل
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatus('AVAILABLE')}
                  className={`w-full text-right py-2 px-3 rounded-[980px] font-medium ${
                    selectedStatus === 'AVAILABLE' ? 'bg-[#143823] text-[#f5ebd2] border border-[#c59b27]/60' : 'text-[#515154] hover:bg-gray-100'
                  }`}
                >
                  متاح للطلب المباشر
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatus('NEEDS_CONFIRMATION')}
                  className={`w-full text-right py-2 px-3 rounded-[980px] font-medium ${
                    selectedStatus === 'NEEDS_CONFIRMATION' ? 'bg-[#143823] text-[#f5ebd2] border border-[#c59b27]/60' : 'text-[#515154] hover:bg-gray-100'
                  }`}
                >
                  حسب الطلب (يتطلب تأكيد المورد)
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[#d2d2d7]/40">
              <div className="flex items-center justify-between text-xs mb-2">
                <label className="font-semibold text-[#1d1d1f]">أقصى سعر:</label>
                <span className="font-bold text-[#c59b27]">{formatPrice(maxPrice)}</span>
              </div>
              <input
                type="range"
                min="100"
                max="2500"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#c59b27] cursor-pointer"
              />
            </div>

          </aside>

          {/* Product Grid */}
          <main className="md:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="card h-80 animate-pulse border border-[#d2d2d7]/50 p-4 !rounded-[18px]">
                    <div className="bg-gray-200 h-44 rounded-[14px] mb-4"></div>
                    <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
                    <div className="bg-gray-200 h-3 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="card p-12 text-center border border-[#d2d2d7]/50 space-y-4 !rounded-[18px]">
                <div className="w-16 h-16 rounded-[14px] bg-gray-100 text-gray-400 mx-auto flex items-center justify-center">
                  <PackageX className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-[#1d1d1f]">لا توجد منتجات تطابق اختياراتك</h3>
                <p className="text-xs text-[#515154] max-w-md mx-auto">
                  جرب تقليل الفلاتر أو إزالة كلمات البحث للوصول لخيارات أوسع
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedStatus('');
                    setSearch('');
                    setMaxPrice(2500);
                  }}
                  className="btn px-6 py-2.5 rounded-[980px] bg-[#143823] text-[#f5ebd2] text-xs font-semibold hover:bg-[#1a4a2f] border border-[#c59b27]/60"
                >
                  عرض جميع المنتجات
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>

        </div>

      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-[#515154]">جارٍ تحميل المنتجات...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
