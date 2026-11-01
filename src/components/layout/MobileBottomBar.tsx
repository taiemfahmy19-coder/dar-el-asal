'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '@/components/context/CartContext';
import { useWishlist } from '@/components/context/WishlistContext';
import { useAuth } from '@/components/context/AuthContext';

export default function MobileBottomBar() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { favorites } = useWishlist();
  const { user } = useAuth();

  // Don't show inside admin dashboard to avoid collision with admin controls
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { href: '/', label: 'الرئيسية', icon: Home },
    { href: '/products', label: 'المنتجات', icon: Grid },
    { href: '/favorites', label: 'المفضلة', icon: Heart, badge: favorites.length },
    { href: '/cart', label: 'السلة', icon: ShoppingBag, badge: totalItems },
    {
      href: user ? (user.role === 'admin' ? '/admin' : user.role === 'delivery' ? '/delivery/dashboard' : '/profile') : '/auth/login',
      label: user ? (user.role === 'admin' ? 'الإدارة' : 'حسابي') : 'دخول',
      icon: User,
    },
  ];

  return (
    <nav
      aria-label="التنقل السريع للهاتف"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#d2d2d7]/70 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] pb-safe"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-1 items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 relative transition-colors ${
                isActive ? 'text-[#143823] font-bold' : 'text-[#8e8e93] hover:text-[#1d1d1f]'
              }`}
            >
              <div className="relative">
                <item.icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-[#143823]' : ''}`} />
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2 bg-gradient-to-r from-amber-500 to-gold-500 text-forest-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight ${isActive ? 'text-[#143823] font-extrabold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
