import React from 'react';
import { SupplierProductStatus } from '@/lib/types';
import { SUPPLIER_STATUS_MAP } from '@/lib/utils';

interface Props {
  status: SupplierProductStatus;
  size?: 'sm' | 'md';
}

export default function SupplierStatusBadge({ status, size = 'sm' }: Props) {
  const conf = SUPPLIER_STATUS_MAP[status] || SUPPLIER_STATUS_MAP.AVAILABLE;
  const sizeClasses = size === 'sm' ? 'text-[11px] py-0.5 px-2.5' : 'text-xs py-1 px-3';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${conf.bg} ${conf.color} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${conf.dot} animate-pulse-subtle`}></span>
      <span>{conf.label}</span>
    </span>
  );
}
