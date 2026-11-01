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
    <div className="card !p-2.5 sm:!p-4 md:!p-5 !mb-0 group overflow-hidden border border-[#d2d2d7]/50 flex flex-col justify-between text-right relative h-full">
      
      {/* Top Media - 100% Clean Image Viewport */}
      <div className="relative aspect-[16/11] w-full bg-[#fbf9f4] rounded-[12px] sm:rounded-[14px] overflow-hidden mb-2 sm:mb-3 p-1">
        <Link href={`/products/${product.id}`} className="block w-full h-full relative">
          <Image
            src={product.images[0] || '/images/honey/prod-honey-plain.jpg'}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out rounded-[10px] sm:rounded-[12px]"
          />
        </Link>

        {/* Minimal Unobtrusive Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          aria-label="إضافة للمفضلة"
          className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/85 backdrop-blur-md shadow-sm border border-[#d2d2d7]/50 flex items-center justify-center text-gray-500 hover:text-rose-500 hover:scale-105 active:scale-95 transition-all z-10"
        >
          <Heart
            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform ${
              favorited ? 'fill-rose-500 text-rose-500' : ''
            }`}
          />
        </button>
      </div>

      {/* Product Details */}
      <div className="flex flex-col flex-1 justify-between gap-2">
        
        <div className="space-y-1 sm:space-y-1.5">
          {/* Brand & Supplier Badge & Featured */}
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#143823] tracking-tight">
                دار العسل والزيتون
              </span>
              {product.isFeatured && (
                <span className="bg-[#143823]/5 text-[#143823] border border-[#c59b27]/40 text-[8px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-[#c59b27]" />
                  مميّز
                </span>
              )}
            </div>
            <SupplierStatusBadge status={product.status} size="sm" />
          </div>

          {/* Title */}
          <Link href={`/products/${product.id}`} className="block">
            <h3 className="font-bold text-xs sm:text-sm md:text-base text-[#1d1d1f] line-clamp-1 group-hover:text-[#c59b27] transition-colors tracking-tight">
              {product.name}
            </h3>
          </Link>

          {/* Origin & Weight Tag */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#515154] pt-0.5 gap-1">
            <span className="truncate">المصدر: {product.origin}</span>
            <span className="font-semibold text-[#143823] bg-amber-50/80 border border-amber-200/60 px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] shrink-0">
              {product.weightVolume}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 pt-0.5">
            <div className="flex items-center text-amber-500">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-[#1d1d1f]">{product.rating}</span>
            <span className="text-[9px] sm:text-[10px] text-[#515154]">({product.reviewCount})</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-2 sm:pt-2.5 border-t border-[#d2d2d7]/40 flex flex-wrap sm:flex-nowrap items-center justify-between gap-1 sm:gap-1.5 mt-auto">
          
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              <span className="text-xs sm:text-sm md:text-base font-extrabold text-[#143823] whitespace-nowrap">
                {formatPrice(product.price)}
              </span>
              {discountPercent && (
                <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[9px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.2 rounded-full whitespace-nowrap">
                  %{discountPercent}-
                </span>
              )}
            </div>
            {product.originalPrice && (
              <span className="text-[9px] sm:text-[11px] text-[#8e8e93] line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <Link
              href={`/products/${product.id}`}
              className="inline-flex items-center justify-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-[980px] text-[10px] sm:text-xs font-semibold bg-[#c59b27] text-white hover:bg-[#b0881e] active:scale-95 transition-all shadow-sm whitespace-nowrap"
            >
              التفاصيل
            </Link>
            <button
              onClick={handleAddToCart}
              disabled={product.status === 'UNAVAILABLE'}
              aria-label="إضافة للسلة"
              className={`p-1 sm:p-1.5 md:p-2 rounded-full border transition-all shrink-0 ${
                product.status === 'UNAVAILABLE'
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                  : addedAnimation
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-[#143823] border-[#d2d2d7] hover:border-[#c59b27] hover:text-[#c59b27]'
              }`}
            >
              {addedAnimation ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
