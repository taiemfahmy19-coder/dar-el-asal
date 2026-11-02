import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Home, ShoppingBag, ArrowRight, Compass, PhoneCall } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full text-center">
        {/* Subtle Decorative Golden/Green Halo */}
        <div className="relative inline-block mb-6">
          <div className="absolute -inset-6 bg-[#c59b27]/10 rounded-full blur-2xl" />
          
          <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center rounded-3xl bg-white border border-[#c59b27]/25 shadow-lg shadow-[#143823]/5 p-4">
            <img
              src="/images/dar-emblem.png"
              alt="دار العسل والزيتون"
              className="w-full h-full object-contain filter drop-shadow-sm select-none"
            />
          </div>
        </div>

        {/* 404 Large Luxury Number */}
        <div className="relative">
          <span className="text-8xl sm:text-9xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#143823] via-[#1d5233] to-[#c59b27] select-none block leading-none">
            404
          </span>
          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#c59b27] to-transparent mx-auto mt-2 mb-4" />
        </div>

        {/* Headings */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#143823] mb-3">
          عذراً، لم نتمكن من العثور على الصفحة المطلوبة
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto leading-relaxed mb-8">
          يبدو أن الرابط الذي اتبعته غير صحيح أو تم نقل هذه الصفحة. لا تقلق، يمكنك العودة للصفحة الرئيسية وتصفح أجود أنواع العسل والزيتون الطبيعي.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#143823] text-[#fcfaf6] font-bold text-sm shadow-md shadow-[#143823]/20 hover:bg-[#1a472c] hover:shadow-lg transition-all transform active:scale-95"
          >
            <Home className="w-4 h-4 text-[#c59b27]" />
            <span>العودة للصفحة الرئيسية</span>
          </Link>

          <Link
            href="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-white text-[#143823] border border-[#143823]/20 font-bold text-sm hover:border-[#c59b27] hover:bg-[#fcfaf6] transition-all shadow-sm active:scale-95"
          >
            <ShoppingBag className="w-4 h-4 text-[#c59b27]" />
            <span>تصفح كل المنتجات</span>
          </Link>
        </div>

        {/* Quick Discovery Links */}
        <div className="pt-6 border-t border-gray-200/80">
          <p className="text-xs font-semibold text-gray-500 mb-3 flex items-center justify-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#c59b27]" />
            <span>روابط قد تهمك للوصول السريع:</span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <Link
              href="/products?categoryId=cat-honey"
              className="px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 hover:border-[#c59b27] hover:text-[#143823] transition-colors"
            >
              عسل النحل الطبيعي
            </Link>
            <Link
              href="/products?categoryId=cat-olive-oil"
              className="px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 hover:border-[#c59b27] hover:text-[#143823] transition-colors"
            >
              زيت الزيتون البكر
            </Link>
            <Link
              href="/cart"
              className="px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 hover:border-[#c59b27] hover:text-[#143823] transition-colors"
            >
              سلة المشتريات
            </Link>
            <Link
              href="/contact"
              className="px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 hover:border-[#c59b27] hover:text-[#143823] transition-colors"
            >
              تواصل معنا
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
