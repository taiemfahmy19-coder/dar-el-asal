'use client';

import React from 'react';

/**
 * Unified text field with its inline field error (aria-describedby wired).
 */
export function TextField({
  id,
  label,
  error,
  required = false,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5">
        <label htmlFor={id} className="block font-semibold text-[#1d1d1f]">
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
      </div>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-rose-600 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
