'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Star, Check, Sparkles } from 'lucide-react';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/components/context/CartContext';
import { useWishlist } from '@/components/context/WishlistContext';
import SupplierStatusBadge from './SupplierStatusBadge';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useWishlist();
  const [addedAnimation, setAddedAnimation] = useState(false);

  const favorited = isFavorite(product.id);
  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.status === 'UNAVAILABLE') return;

    addItem(product, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleFavorite(product.id);
  };

  return (
    <div className="card group overflow-hidden border border-[#d2d2d7]/50 flex flex-col justify-between text-right relative">
      
      {/* Top Media & Badges */}
      <div className="relative aspect-square w-full bg-[#f5f5f7] rounded-[14px] overflow-hidden mb-4">
        <Link href={`/products/${product.id}`} className="block w-full h-full relative">
          <Image
            src={product.images[0] || '/images/honey/prod-honey-plain.jpg'}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-apple-ease"
          />
        </Link>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          aria-label="إضافة للمفضلة"
          className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-[#d2d2d7]/60 flex items-center justify-center text-gray-500 hover:text-rose-500 hover:scale-105 active:scale-95 transition-all z-10"
        >
          <Heart
            className={`w-4 h-4 transition-transform ${
              favorited ? 'fill-rose-500 text-rose-500' : ''
            }`}
          />
        </button>

        {/* Discount & Feature Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end z-10">
          {discountPercent && (
            <span className="bg-rose-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
              خصم {discountPercent}%
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-[#1d1d1f]/90 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-white/20">
              <Sparkles className="w-2.5 h-2.5" />
              مميّز
            </span>
          )}
        </div>

        {/* Weight Pill */}
        <div className="absolute bottom-3 right-3 z-10">
          <span className="bg-white/95 backdrop-blur-md text-[#1d1d1f] text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm border border-[#d2d2d7]/60">
            {product.weightVolume}
          </span>
        </div>
      </div>

      {/* Product Details */}
      <div className="flex flex-col flex-1 justify-between gap-3">
        
        <div className="space-y-1.5">
          {/* Brand & Supplier Badge */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] font-bold text-[#143823] tracking-tight">
              دار العسل والزيتون
            </span>
            <SupplierStatusBadge status={product.status} size="sm" />
          </div>

          {/* Title */}
          <Link href={`/products/${product.id}`} className="block">
            <h3 className="font-semibold text-base text-[#1d1d1f] line-clamp-1 group-hover:text-[#c59b27] transition-colors tracking-tight">
              {product.name}
            </h3>
          </Link>

          {/* Origin & Category */}
          <p className="text-xs text-[#515154] line-clamp-1">
            <span>المصدر: {product.origin}</span>
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <span className="text-xs font-bold text-[#1d1d1f]">{product.rating}</span>
            <span className="text-[11px] text-[#515154]">({product.reviewCount})</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-3 border-t border-[#d2d2d7]/40 flex items-center justify-between gap-2 mt-2">
          
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold text-[#1d1d1f]">
                {formatPrice(product.price)}
              </span>
            </div>
            {product.originalPrice && (
              <span className="text-xs text-[#515154] line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <Link
              href={`/products/${product.id}`}
              className="inline-flex items-center justify-center px-2 sm:px-3 py-1.5 rounded-[980px] text-[11px] sm:text-xs font-semibold bg-[#c59b27] text-white hover:bg-[#b0881e] hover:scale-[1.02] active:scale-95 transition-all shadow-sm whitespace-nowrap"
            >
              التفاصيل
            </Link>
            <button
              onClick={handleAddToCart}
              disabled={product.status === 'UNAVAILABLE'}
              aria-label="إضافة للسلة"
              className={`p-1.5 sm:p-2 rounded-full border transition-all shrink-0 ${
                product.status === 'UNAVAILABLE'
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                  : addedAnimation
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-[#143823] border-[#d2d2d7] hover:border-[#c59b27] hover:text-[#c59b27]'
              }`}
            >
              {addedAnimation ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
