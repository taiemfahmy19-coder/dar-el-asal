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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0 group">
            <div className="relative h-9 sm:h-12 w-36 xs:w-44 sm:w-56 overflow-hidden">
              <img
                src="/images/dar-logo-full.jpg"
                alt="دار العسل والزيتون | DAR EL ASAL & OLIVE"
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#1d1d1f]">
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
            className="hidden md:flex flex-1 max-w-xs xl:max-w-md relative"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن نوع العسل أو زيت الزيتون..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#fcfaf6] border border-[#d2d2d7]/70 rounded-[980px] focus:outline-none focus:border-[#c59b27] focus:ring-4 focus:ring-amber-500/15 transition-all text-[#1d1d1f] placeholder:text-[#515154]"
            />
            <button
              type="submit"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#c59b27] transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Actions & User */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Wishlist */}
            <Link
              href="/favorites"
              className="relative p-2.5 text-[#1d1d1f] hover:text-[#c59b27] transition-colors rounded-full hover:bg-gray-100/70"
              title="المفضلة"
            >
              <Heart className="w-5 h-5" />
              {favorites.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2.5 bg-[#f5f5f7] text-[#1d1d1f] hover:bg-gray-200/70 transition-colors rounded-full border border-[#d2d2d7]/70 flex items-center gap-2"
              title="سلة المشتريات"
            >
              <ShoppingBag className="w-5 h-5 text-[#1d1d1f]" />
              <span className="hidden sm:inline text-xs font-medium text-[#1d1d1f]">
                السلة
              </span>
              {totalItems > 0 && (
                <span className="bg-[#143823] text-[#f5ebd2] text-[11px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-sm border border-[#c59b27]/60">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Auth Menu */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 py-1.5 px-3 bg-[#f5f5f7] border border-[#d2d2d7]/70 rounded-[980px] hover:bg-gray-200/70 transition-colors text-right"
                >
                  <div className="w-7 h-7 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden sm:flex flex-col text-right">
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
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-[18px] shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-[#d2d2d7]/70 py-2 z-50 text-right animate-in fade-in slide-in-from-top-2 duration-150">
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
                className="btn inline-flex items-center gap-2 px-5 py-2.5 rounded-[980px] bg-[#143823] text-[#f5ebd2] text-xs font-semibold hover:bg-[#1a4a2f] border border-[#c59b27]/60 hover:scale-[1.02] transition-all shadow-sm"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#c59b27]" />
                <span>تسجيل الدخول</span>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#1d1d1f] hover:bg-gray-100 rounded-[10px]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-[#d2d2d7]/60 px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top duration-200">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن المنتجات..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#f5f5f7] border border-[#d2d2d7]/70 rounded-[12px]"
            />
            <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-4 h-4" />
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
    </header>
  );
}
