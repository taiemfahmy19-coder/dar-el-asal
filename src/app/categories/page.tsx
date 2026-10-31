import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCategories } from '@/lib/db';
import { ArrowLeft } from 'lucide-react';

export default function CategoriesPage() {
  const categories = getCategories();

  return (
    <div className="bg-[#f5f5f7] min-h-screen py-12 text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div>
          <h1 className="text-2xl sm:text-4xl font-semibold text-[#1d1d1f] tracking-tight">
            أقسام وتصنيفات المنتجات
          </h1>
          <p className="text-xs sm:text-sm text-[#515154] mt-1">
            اختر القسم المفضل للتعرف على تشكيلة المنتجات الطبيعية والتموين الصحي
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?categoryId=${cat.id}`}
              className="card group border border-[#d2d2d7]/50 flex flex-col justify-between !rounded-[18px]"
            >
              <div className="space-y-4">
                <div className="relative aspect-[16/10] w-full rounded-[14px] overflow-hidden bg-[#f5f5f7] border border-[#d2d2d7]/50">
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-apple-ease"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#1d1d1f] group-hover:text-[#0066cc] transition-colors tracking-tight">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#515154] mt-1 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#d2d2d7]/40 flex items-center justify-between text-xs">
                <span className="font-medium text-[#1d1d1f]">
                  {cat.productCount} منتجات متوفرة
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-[#0066cc] group-hover:translate-x-1 transition-transform">
                  <span>تصفح القسم</span>
                  <ArrowLeft className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
