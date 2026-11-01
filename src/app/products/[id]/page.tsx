'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Heart,
  ShoppingBag,
  Star,
  ShieldCheck,
  Truck,
  Check,
  Clock,
} from 'lucide-react';
import { Product, Review } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/components/context/CartContext';
import { useWishlist } from '@/components/context/WishlistContext';
import SupplierStatusBadge from '@/components/products/SupplierStatusBadge';
import ProductCard from '@/components/products/ProductCard';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addedAnimation, setAddedAnimation] = useState(false);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.product) {
          setProduct(data.product);

          fetch(`/api/products?categoryId=${data.product.categoryId}`)
            .then((res) => res.json())
            .then((sim) => {
              if (sim.products) {
                setSimilarProducts(sim.products.filter((p: Product) => p.id !== data.product.id).slice(0, 3));
              }
            });
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-[#515154]">
        <div className="w-8 h-8 border-4 border-[#c59b27] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm">جارٍ تحميل تفاصيل المنتج...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#1d1d1f]">عذراً، المنتج غير متوفر</h2>
        <p className="text-sm text-[#515154]">قد يكون الرابط خاطئاً أو تم نقل المنتج</p>
        <Link
          href="/products"
          className="btn px-6 py-3 rounded-[980px] bg-[#143823] text-[#f5ebd2] font-semibold text-xs border border-[#c59b27]/60"
        >
          العودة للمتجر
        </Link>
      </div>
    );
  }

  const favorited = isFavorite(product.id);
  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const handleAddToCart = () => {
    if (product.status === 'UNAVAILABLE') return;
    addItem(product, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  return (
    <div className="bg-[#f5f5f7] min-h-screen py-10 text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-[#515154]">
          <Link href="/" className="hover:text-[#c59b27]">الرئيسية</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#c59b27]">المنتجات</Link>
          <span>/</span>
          <span className="text-[#1d1d1f] font-semibold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Main Product Showcase Bento */}
        <div className="card p-6 sm:p-10 mb-10 border border-[#d2d2d7]/50 !rounded-[18px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Gallery Column */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative aspect-[16/11] sm:aspect-square w-full rounded-[16px] overflow-hidden bg-[#fbf9f4] border border-[#d2d2d7]/50 shadow-sm p-2 sm:p-4 flex items-center justify-center">
                <Image
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={product.name}
                  fill
                  priority
                  className="object-contain sm:object-cover object-center rounded-[12px]"
                />

                {/* Wishlist Button */}
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className="absolute top-3 left-3 sm:top-4 sm:left-4 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/85 backdrop-blur-md shadow-sm border border-[#d2d2d7]/60 flex items-center justify-center text-gray-500 hover:text-rose-500 hover:scale-105 active:scale-95 transition-all z-10"
                >
                  <Heart
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${favorited ? 'fill-rose-500 text-rose-500' : ''}`}
                  />
                </button>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-3">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-20 h-20 rounded-[12px] overflow-hidden border-2 transition-all ${
                        selectedImageIndex === idx
                          ? 'border-[#c59b27] ring-2 ring-[#c59b27]/30'
                          : 'border-[#d2d2d7]/60 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image src={img} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Meta & Actions Column */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              
              <div className="space-y-4">
                {/* Status & Origin Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <SupplierStatusBadge status={product.status} size="md" />
                  <span className="text-xs font-medium text-[#1d1d1f] bg-[#f5f5f7] px-3.5 py-1.5 rounded-full border border-[#d2d2d7]/60">
                    المصدر: {product.origin}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] leading-snug tracking-tight">
                  {product.name}
                </h1>

                {/* Short Description */}
                <p className="text-sm text-[#515154] leading-relaxed">
                  {product.shortDescription || product.description}
                </p>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-2 py-3 border-y border-[#d2d2d7]/40">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-4 h-4 fill-amber-400" />
                  </div>
                  <span className="text-sm font-bold text-[#1d1d1f]">{product.rating}</span>
                  <span className="text-xs text-[#515154]">
                    ({product.reviewCount} تقييم موثق من المشترين)
                  </span>
                </div>

                {/* Price Display */}
                <div className="pt-2">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="text-3xl font-bold text-[#1d1d1f]">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-base text-[#515154] line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                    {discountPercent && (
                      <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                        خصم {discountPercent}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#515154] mt-1">
                    الوزن / الحجم الصافي: <span className="font-semibold text-[#1d1d1f]">{product.weightVolume}</span>
                  </p>
                </div>

                {/* Order-Based Commerce Note */}
                <div className="bg-[#f5f5f7] p-4 rounded-[14px] border border-[#d2d2d7]/50 text-xs text-[#1d1d1f] flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[#c59b27] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">سياسة توفير المنتج حسب الطلب</p>
                    <p className="text-[11px] text-[#515154] mt-0.5 leading-relaxed">
                      يتم التواصل المباشر مع المورد وتأكيد طزاجة الدفعة فور تأكيدك للطلب. التوصيل خلال 24 - 48 ساعة بسيارات مجهزة وعوازل حرارية.
                    </p>
                  </div>
                </div>

              </div>

              {/* Quantity & CTA */}
              <div className="space-y-4 pt-4 border-t border-[#d2d2d7]/40">
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4">
                  <div className="flex items-center border border-[#d2d2d7]/80 rounded-[980px] bg-[#f5f5f7] p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-9 h-9 rounded-full bg-white flex items-center justify-center font-bold text-[#1d1d1f] shadow-sm hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="w-12 text-center text-sm font-semibold text-[#1d1d1f]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-9 h-9 rounded-full bg-white flex items-center justify-center font-bold text-[#1d1d1f] shadow-sm hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={product.status === 'UNAVAILABLE'}
                    className={`w-full sm:flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-[980px] font-semibold text-sm transition-all shadow-sm active:scale-95 ${
                      product.status === 'UNAVAILABLE'
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : addedAnimation
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#143823] text-[#f5ebd2] hover:bg-[#1a4a2f] border border-[#c59b27]/60 hover:scale-[1.02]'
                    }`}
                  >
                    {addedAnimation ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>تمت الإضافة للسلة ({quantity})</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 text-white/90" />
                        <span>إضافة إلى سلة المشتريات</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-2.5 sm:gap-3 text-[11px] text-[#515154]">
                  <div className="flex items-center gap-2 bg-[#f5f5f7] p-2.5 rounded-[12px] border border-[#d2d2d7]/50">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>فحص المعامل المركزية معتمد</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#f5f5f7] p-2.5 rounded-[12px] border border-[#d2d2d7]/50">
                    <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>توصيل مبرد وسريع لباب البيت</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* Technical Data Tabs Bento */}
        <div className="card p-6 sm:p-8 border border-[#d2d2d7]/50 mb-10 !rounded-[18px]">
          <h3 className="text-lg font-semibold text-[#1d1d1f] mb-4 border-r-4 border-[#0071e3] pr-3 tracking-tight">
            المواصفات والبيانات الغذائية
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs sm:text-sm">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-[#1d1d1f] mb-1">المكونات:</h4>
                <p className="text-[#515154] leading-relaxed bg-[#f5f5f7] p-3.5 rounded-[12px] border border-[#d2d2d7]/50">
                  {product.ingredients || 'مكونات طبيعية نقية 100% دون أي إضافات صناعية أو مواد حافظة.'}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#1d1d1f] mb-1">بيانات المنشأ والتعبئة:</h4>
                <p className="text-[#515154] leading-relaxed bg-[#f5f5f7] p-3.5 rounded-[12px] border border-[#d2d2d7]/50">
                  المنشأ: {product.origin} | يخضع كل برطمان لفرز يدوي محكم ومطابق للمواصفات القياسية المصرية.
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-[#1d1d1f] mb-1">الحقائق الغذائية التقريبية:</h4>
              <div className="bg-[#f5f5f7] p-4 rounded-[12px] border border-[#d2d2d7]/50 text-[#1d1d1f] leading-relaxed font-mono text-xs">
                {product.nutritionalInfo || 'غني بمضادات الأكسدة والمعادن الطبيعية والفيتامينات الأساسية.'}
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-[#1d1d1f] mb-6 border-r-4 border-[#0071e3] pr-3 tracking-tight">
              منتجات مشابهة قد تناسبك
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
              {similarProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
