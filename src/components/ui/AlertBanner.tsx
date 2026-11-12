'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Unified alert banner (error / info / success) — RTL-first, brand-styled.
 */
export function AlertBanner({
  message,
  tone = 'error',
  label,
  className = '',
}: {
  message: string | null;
  tone?: 'error' | 'success' | 'info';
  label?: string;
  className?: string;
}) {
  if (!message) return null;
  const toneClasses =
    tone === 'success'
      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
      : tone === 'info'
        ? 'bg-sky-50 border-sky-200 text-sky-800'
        : 'bg-rose-50 border-rose-200 text-rose-800';
  const iconColor =
    tone === 'success' ? 'text-emerald-600' : tone === 'info' ? 'text-sky-600' : 'text-rose-600';
  return (
    <div
      role="alert"
      aria-live="polite"
      aria-label={label || undefined}
      className={`mb-6 p-4 rounded-[12px] border text-xs flex items-center gap-2 ${toneClasses} ${className}`}
    >
      <AlertCircle className={`w-4 h-4 shrink-0 ${iconColor}`} aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
