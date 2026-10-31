'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';

interface Props {
  categories: Category[];
}

export default function CategoriesRow({ categories }: Props) {
  return (
    <section className="py-14 bg-[#f5f5f7] border-b border-[#d2d2d7]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-8 text-right gap-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] tracking-tight">
              أقسام المنتجات الطبيعية
            </h2>
            <p className="text-xs sm:text-sm text-[#515154] mt-1">
              اختر القسم الذي تبحث عنه وتعرف على خياراتنا الموثوقة
            </p>
          </div>
          <Link
            href="/categories"
            className="text-xs sm:text-sm font-semibold text-[#c59b27] hover:text-[#a37f1e] hover:underline transition-colors flex items-center gap-1"
          >
            <span>عرض كافة الأقسام</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className={`grid gap-6 ${categories.length <= 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'}`}>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?categoryId=${cat.id}`}
              className="card group bg-white border border-[#d2d2d7]/50 p-6 flex flex-col items-center text-center !mb-0 transition-all hover:border-[#c59b27]/60 hover:shadow-md"
            >
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-4 bg-[#f5f5f7] shadow-sm border border-[#d2d2d7]/50 group-hover:scale-105 transition-transform duration-300 ease-apple-ease">
                <Image
                  src={cat.imageUrl}
                  alt={cat.name}
                  fill
                  sizes="150px"
                  className="object-cover"
                />
              </div>

              <h3 className="font-semibold text-base sm:text-lg text-[#1d1d1f] group-hover:text-[#143823] transition-colors mb-1 tracking-tight">
                {cat.name}
              </h3>

              <p className="text-xs text-[#515154] line-clamp-2 max-w-xs mt-1">
                {cat.description}
              </p>

              {cat.productCount !== undefined && (
                <span className="text-xs text-[#143823] font-semibold mt-3 bg-[#f5ebd2] border border-[#c59b27]/30 px-3 py-1 rounded-full">
                  {cat.productCount} منتج متاح
                </span>
              )}
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
