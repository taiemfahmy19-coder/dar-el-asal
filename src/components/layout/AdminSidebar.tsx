'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Truck,
  Users,
  Store,
  Settings,
  FileText,
  LogOut,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/components/context/AuthContext';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const links = [
    { href: '/admin', label: 'نظرة عامة والإحصائيات', icon: LayoutDashboard },
    { href: '/admin/orders', label: 'إدارة الطلبات', icon: Package },
    { href: '/admin/products', label: 'المنتجات والأسعار', icon: ShoppingBag },
    { href: '/admin/couriers', label: 'المندوبين وطلبات الانضمام', icon: Truck },
    { href: '/admin/suppliers', label: 'الموردين وأسعار الشراء', icon: Store },
    { href: '/admin/customers', label: 'العملاء المسجلين', icon: Users },
    { href: '/admin/settings', label: 'إعدادات المتجر والشحن', icon: Settings },
    { href: '/admin/audit', label: 'سجل التدقيق الإداري', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-forest-950 text-ivory-100 min-h-screen p-5 flex flex-col justify-between border-l border-forest-900 shrink-0 text-right">
      
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center gap-3 pb-6 border-b border-forest-900">
          <div className="w-10 h-10 rounded-xl bg-[#143823] text-[#c59b27] flex items-center justify-center font-bold text-lg border border-[#c59b27]/40">
            🍯
          </div>
          <div>
            <span className="font-extrabold text-base text-white font-cairo">دار العسل والزيتون</span>
            <span className="block text-[9px] text-[#c59b27] font-semibold tracking-wider">لوحة الإدارة والمتابعة</span>
          </div>
        </div>

        {/* User Card */}
        <div className="bg-forest-900/60 p-3 rounded-2xl border border-forest-800/80 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-forest-700 text-white flex items-center justify-center text-xs font-bold">
            {user?.name.charAt(0) || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{user?.name}</p>
            <span className="text-[10px] text-gold-400 font-medium">مدير النظام الرئيسي</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 text-xs font-semibold">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-forest-800 text-gold-300 font-bold shadow-sm'
                    : 'text-ivory-300 hover:bg-forest-900 hover:text-white'
                }`}
              >
                <link.icon className={`w-4 h-4 ${isActive ? 'text-gold-400' : 'text-ivory-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="pt-6 border-t border-forest-900 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-ivory-300 hover:bg-forest-900 hover:text-white transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-gold-400" />
            <span>معاينة واجهة المتجر</span>
          </span>
          <span className="text-[10px] text-gray-400">RTL</span>
        </Link>

        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج</span>
        </button>
      </div>

    </aside>
  );
}
