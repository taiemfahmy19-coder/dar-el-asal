'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Heart,
  User as UserIcon,
  Search,
  Menu,
  X,
  Shield,
  Truck,
  Package,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/components/context/AuthContext';
import { useCart } from '@/components/context/CartContext';
import { useWishlist } from '@/components/context/WishlistContext';
import { USER_ROLE_MAP } from '@/lib/utils';
import CartNotificationToast from '@/components/cart/CartNotificationToast';

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { favorites } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-[#d2d2d7]/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-3 shrink-0 group">
            <div className="relative h-8 sm:h-11 md:h-12 w-28 sm:w-44 md:w-56 overflow-hidden">
              <img
                src="/images/dar-logo-full.jpg"
                alt="دار العسل والزيتون | DAR EL ASAL & OLIVE"
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav aria-label="التنقل الرئيسي" className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#1d1d1f]">
            <Link href="/" className="hover:text-[#c59b27] transition-colors">
              الرئيسية
            </Link>
            <Link href="/products?categoryId=cat-honey" className="hover:text-[#c59b27] transition-colors">
              العسل الطبيعي
            </Link>
            <Link href="/products?categoryId=cat-olive-oil" className="hover:text-[#c59b27] transition-colors">
              زيت الزيتون
            </Link>
            <Link
              href="/#smart-package"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-[#b5892e] rounded-full border border-amber-200/80 hover:bg-amber-100 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-[#c59b27] animate-pulse"></span>
              اختار لك
            </Link>
            <Link href="/about" className="hover:text-[#c59b27] transition-colors">
              قصتنا ومصادرنا
            </Link>
          </nav>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            role="search"
            aria-label="البحث في المتجر"
            className="hidden md:flex flex-1 max-w-xs xl:max-w-md relative"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن نوع العسل أو زيت الزيتون..."
              aria-label="البحث عن المنتجات"
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#fcfaf6] border border-[#d2d2d7]/70 rounded-[980px] focus:outline-none focus:border-[#c59b27] focus:ring-4 focus:ring-amber-500/15 transition-all text-[#1d1d1f] placeholder:text-[#515154]"
            />
            <button
              type="submit"
              aria-label="بحث"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#c59b27] transition-colors"
            >
              <Search className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>

          {/* Actions & User */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            
            {/* Wishlist */}
            <Link
              href="/favorites"
              aria-label="المفضلة"
              className="relative p-1.5 sm:p-2.5 text-[#1d1d1f] hover:text-[#c59b27] transition-colors rounded-full hover:bg-gray-100/70"
              title="المفضلة"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              {favorites.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] sm:text-[10px] w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center font-bold">
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* Cart with "السلة" label on Desktop AND Mobile */}
            <Link
              href="/cart"
              aria-label="سلة المشتريات"
              className="relative py-1 px-2 sm:py-2 sm:px-3 bg-[#f5f5f7] hover:bg-gold-50/70 text-[#143823] transition-all rounded-full border border-[#d2d2d7]/80 flex items-center gap-1 sm:gap-1.5 shadow-sm shrink-0"
              title="سلة المشتريات"
            >
              <div className="relative">
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-[#143823]" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-gold-500 text-forest-950 text-[9px] sm:text-[10px] w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center font-black shadow-sm border border-white">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-[#143823]">
                السلة
              </span>
              {totalItems > 0 && (
                <span className="text-[10px] sm:text-[11px] font-bold text-[#c59b27]">
                  ({totalItems})
                </span>
              )}
            </Link>

            {/* Prominent Purchase Button ("إتمام عملية الشراء") */}
            <Link
              href="/cart"
              aria-label="إتمام عملية الشراء والانتقال إلى السلة"
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-[#143823] to-[#1f5636] hover:from-[#1a4a2f] hover:to-[#286f45] text-[#f5ebd2] font-bold text-[10px] sm:text-xs border border-[#c59b27]/80 shadow-sm hover:shadow-md transition-all active:scale-95 shrink-0"
              title="إتمام عملية الشراء والانتقال إلى السلة"
            >
              <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#c59b27] shrink-0" />
              <span>إتمام عملية الشراء</span>
              {totalItems > 0 && (
                <span className="hidden sm:inline-block bg-[#c59b27] text-[#143823] text-[9px] font-black px-1.5 py-0.2 rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Auth Menu */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                  aria-label="قائمة الحساب"
                  className="flex items-center gap-1 sm:gap-2 p-1 sm:py-1.5 sm:px-3 bg-[#f5f5f7] border border-[#d2d2d7]/70 rounded-[980px] hover:bg-gray-200/70 transition-colors text-right"
                >
                  <div className="w-7 h-7 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden md:flex flex-col text-right">
                    <span className="text-xs font-semibold text-[#1d1d1f] truncate max-w-[100px]">
                      {user.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-[#515154] font-normal">
                      {USER_ROLE_MAP[user.role]?.label || user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#515154]" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div
                    aria-label="خيارات الحساب"
                    className="absolute left-0 mt-2 w-56 bg-white rounded-[18px] shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-[#d2d2d7]/70 py-2 z-50 text-right animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-bold text-[#1d1d1f]">{user.name}</p>
                      <p className="text-[11px] text-[#515154] truncate">{user.email}</p>
                      <span className="mt-1 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#f5ebd2] text-[#143823] border border-[#c59b27]/30">
                        {USER_ROLE_MAP[user.role]?.label}
                      </span>
                    </div>

                    {/* Role-Specific Shortcuts */}
                    {user.role === 'admin' && (
                      <div className="py-1 border-b border-gray-100 bg-gray-50/50">
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#1d1d1f] hover:bg-gray-100"
                        >
                          <Shield className="w-4 h-4 text-[#c59b27]" />
                          لوحة تحكم الإدارة
                        </Link>
                        <Link
                          href="/admin/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-1.5 text-xs text-[#515154] hover:bg-gray-100"
                        >
                          <Package className="w-3.5 h-3.5" />
                          إدارة كافة الطلبات
                        </Link>
                      </div>
                    )}

                    {user.role === 'delivery' && (
                      <div className="py-1 border-b border-gray-100 bg-purple-50/50">
                        <Link
                          href="/delivery/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-purple-900 hover:bg-purple-100"
                        >
                          <Truck className="w-4 h-4 text-purple-800" />
                          لوحة مهام التوصيل
                        </Link>
                      </div>
                    )}

                    {/* General user links */}
                    <div className="py-1">
                      <Link
                        href="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-[#1d1d1f] hover:bg-gray-50"
                      >
                        <Package className="w-3.5 h-3.5 text-gray-500" />
                        طلباتي السابقة
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-[#1d1d1f] hover:bg-gray-50"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-gray-500" />
                        بيانات الحساب والعناوين
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-right font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        تسجيل الخروج
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="btn inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-[980px] bg-[#143823] text-[#f5ebd2] text-xs font-semibold hover:bg-[#1a4a2f] border border-[#c59b27]/60 hover:scale-[1.02] transition-all shadow-sm"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#c59b27]" />
                <span className="hidden sm:inline">تسجيل الدخول</span>
                <span className="sm:hidden text-[11px]">دخول</span>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              className="lg:hidden p-1.5 sm:p-2 text-[#1d1d1f] hover:bg-gray-100 rounded-[10px]"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="lg:hidden bg-white border-t border-[#d2d2d7]/60 px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top duration-200">
          <form onSubmit={handleSearchSubmit} role="search" aria-label="البحث في المتجر" className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن المنتجات..."
              aria-label="البحث عن المنتجات"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#f5f5f7] border border-[#d2d2d7]/70 rounded-[12px]"
            />
            <button type="submit" aria-label="بحث" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>

          <nav className="flex flex-col gap-2 font-medium text-sm text-[#1d1d1f]">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-[10px] hover:bg-gray-100"
            >
              الرئيسية
            </Link>
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-[10px] hover:bg-gray-100"
            >
              جميع المنتجات
            </Link>
            <Link
              href="/products?categoryId=cat-honey"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-[10px] hover:bg-gray-100"
            >
              عسل نحل طبيعي
            </Link>
            <Link
              href="/products?categoryId=cat-olive-oil"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-[10px] hover:bg-gray-100"
            >
              زيت زيتون بكر ممتاز
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-[10px] hover:bg-gray-100"
            >
              عن دار العسل والزيتون ومصادرنا
            </Link>
          </nav>
        </div>
      )}

      {/* Cart Realtime Add Notification Toast */}
      <CartNotificationToast />
    </header>
  );
}
