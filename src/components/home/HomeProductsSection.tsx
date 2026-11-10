'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import ProductCard from '@/components/products/ProductCard';
import { Sparkles, ArrowLeft } from 'lucide-react';

interface Props {
  products: Product[];
}

const PAGE_SIZE = 8;

export default function HomeProductsSection({ products }: Props) {
  const [activeTab, setActiveTab] = useState<'all' | 'cat-honey' | 'cat-olive-oil'>('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredProducts = products.filter((p) => {
    if (activeTab === 'all') return true;
    return p.categoryId === activeTab;
  });

  const honeyCount = products.filter((p) => p.categoryId === 'cat-honey').length;
  const oilCount = products.filter((p) => p.categoryId === 'cat-olive-oil').length;

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const remainingCount = Math.max(0, filteredProducts.length - visibleCount);
  const allProductsHref = activeTab === 'all' ? '/products' : `/products?categoryId=${activeTab}`;

  const changeTab = (tab: 'all' | 'cat-honey' | 'cat-olive-oil') => {
    setActiveTab(tab);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <section
      aria-labelledby="home-products-title"
      className="py-10 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-right"
    >
      
      {/* Section Header & Minimal Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 mb-8 border-b border-[#d2d2d7]/40 gap-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#143823] bg-[#f5ebd2] border border-[#c59b27]/40 px-3.5 py-1.5 rounded-full mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#c59b27]" aria-hidden="true" />
            <span>تشكيلة دار العسل والزيتون الطبيعية</span>
          </div>
          <h2 id="home-products-title" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1d1d1f] tracking-tight">
            منتجاتنا الطبيعية
          </h2>
          <p className="text-xs sm:text-sm text-[#515154] mt-1.5">
            منتجات طبيعية مفحوصة ومضمونة بنموذج البيع الطازج مباشرة من المعاصر والمناحل
          </p>
        </div>

        {/* Clean Filter Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 bg-white/90 backdrop-blur-md p-1 sm:p-1.5 rounded-full border border-[#d2d2d7]/70 shadow-sm self-stretch md:self-auto overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => changeTab('all')}
            aria-pressed={activeTab === 'all'}
            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-[#143823] text-[#f5ebd2] shadow-sm'
                : 'text-[#515154] hover:text-[#1d1d1f]'
            }`}
          >
            جميع المنتجات ({products.length})
          </button>
          <button
            type="button"
            onClick={() => changeTab('cat-honey')}
            aria-pressed={activeTab === 'cat-honey'}
            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'cat-honey'
                ? 'bg-[#143823] text-[#f5ebd2] shadow-sm'
                : 'text-[#515154] hover:text-[#1d1d1f]'
            }`}
          >
            عسل نحل طبيعي ({honeyCount})
          </button>
          <button
            type="button"
            onClick={() => changeTab('cat-olive-oil')}
            aria-pressed={activeTab === 'cat-olive-oil'}
            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'cat-olive-oil'
                ? 'bg-[#143823] text-[#f5ebd2] shadow-sm'
                : 'text-[#515154] hover:text-[#1d1d1f]'
            }`}
          >
            زيت زيتون بكر ممتاز ({oilCount})
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Progressive loading keeps the first paint light while leaving every
          product reachable without a full page reload. */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        {remainingCount > 0 && (
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-[980px] bg-white text-[#143823] border border-[#c59b27]/50 text-xs font-bold hover:bg-[#f5ebd2] transition-colors shadow-sm"
          >
            عرض المزيد ({remainingCount} منتج متبقي)
          </button>
        )}

        <Link
          href={allProductsHref}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-[980px] bg-[#143823] text-[#f5ebd2] border border-[#c59b27]/60 text-xs font-bold hover:bg-[#1a4a2f] transition-colors shadow-sm"
        >
          <span>عرض كل المنتجات</span>
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>

    </section>
  );
}
