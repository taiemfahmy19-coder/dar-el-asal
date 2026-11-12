'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '@/lib/types';
import { loginRequest, logoutRequest, meRequest, registerRequest } from '@/services/auth.service';
import { clearLocalTempData, PWA_STORAGE_KEYS } from '@/lib/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  register: (name: string, email: string, password: string, phone: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Device-level preference kept across users (PWA install banner) */
function keepPwaPreferences() {
  try {
    const dismissed = localStorage.getItem(PWA_STORAGE_KEYS.installDismissed) || '';
    clearLocalTempData();
    if (dismissed) localStorage.setItem(PWA_STORAGE_KEYS.installDismissed, dismissed);
  } catch {
    clearLocalTempData();
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await meRequest();
      if (res.ok) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await loginRequest(email, password);
      if (!res.ok) {
        return { success: false, error: res.error || 'فشل تسجيل الدخول' };
      }

      setUser(res.data.user);
      return { success: true, role: res.data.user.role as UserRole };
    } catch {
      return { success: false, error: 'حدث خطأ في الاتصال بالخادم' };
    }
  };

  const register = async (name: string, email: string, password: string, phone: string) => {
    try {
      const res = await registerRequest({ name, email, password, phone });
      if (!res.ok) {
        return { success: false, error: res.error || 'فشل إنشاء الحساب' };
      }

      setUser(res.data.user);
      return { success: true };
    } catch {
      return { success: false, error: 'حدث خطأ في الاتصال بالخادم' };
    }
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
      // Full temp-data wipe on explicit logout (shared-device safety)
      keepPwaPreferences();
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
