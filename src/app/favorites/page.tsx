'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, PackageX, ArrowLeft } from 'lucide-react';
import { useWishlist } from '@/components/context/WishlistContext';
import { Product } from '@/lib/types';
import ProductCard from '@/components/products/ProductCard';

export default function WishlistPage() {
  const { favorites } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.products) {
          setProducts(data.products.filter((p: Product) => favorites.includes(p.id)));
        }
      })
      .finally(() => setLoading(false));
  }, [favorites]);

  return (
    <div className="bg-ivory-50/50 min-h-screen py-10 text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-forest-950 font-cairo flex items-center gap-3">
            <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
            <span>قائمة المنتجات المفضلة ({favorites.length})</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            المنتجات التي قمت بحفظها لشرائها لاحقاً
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">جارٍ جلب المفضلة...</div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-ivory-200 shadow-subtle space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-ivory-100 text-gray-400 mx-auto flex items-center justify-center">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-forest-950">قائمة المفضلة فارغة حالياً</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              انقر على أيقونة القلب على أي منتج أثناء تصفحك لحفظه والرجوع إليه في أي وقت.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest-900 text-white text-xs font-bold hover:bg-forest-800"
            >
              <span>استكشف المنتجات</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
