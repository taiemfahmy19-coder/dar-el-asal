'use client';

import React from 'react';
import { Order } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Printer, X, ShieldCheck } from 'lucide-react';

interface Props {
  order: Order;
  type?: 'quotation' | 'confirmation';
  onClose?: () => void;
}

export default function OrderPrintDocument({ order, type = 'confirmation', onClose }: Props) {
  const isQuotation = type === 'quotation' || order.orderStatus === 'PENDING';
  const docTitle = isQuotation ? 'عرض سعر نهائي (Quotation)' : 'مستند تأكيد طلب شراء (Order Confirmation)';
  const docNumber = isQuotation ? (order.quotationNumber || `Q-${order.orderNumber}`) : order.orderNumber;
  
  // Verification URL for QR
  const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://dar-el-asal.vercel.app'}/verify/order/${order.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(verifyUrl)}`;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 sm:p-8 text-right space-y-6 print:shadow-none print:p-4 print:max-w-full">
        
        {/* Actions Bar (Hidden on print) */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#143823] text-[#f5ebd2] rounded-full text-xs font-semibold hover:bg-[#1a4a2f] transition-all shadow-sm"
            >
              <Printer className="w-4 h-4 text-[#c59b27]" />
              <span>طباعة المستند</span>
            </button>
            <span className="text-[11px] text-gray-500">جاهز للطباعة بحجم A4</span>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Printable Document Header */}
        <div className="flex items-start justify-between border-b-2 border-[#143823] pb-5">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-[#143823] font-cairo">
              دار العسل والزيتون
            </h1>
            <p className="text-xs font-bold text-[#c59b27]">
              DAR EL ASAL & OLIVE — الإسكندرية، مصر
            </p>
            <p className="text-[11px] text-gray-500">
              إدارة وإشراف: شادي محمد توفيق | عسل نحل طبيعي وزيت زيتون بكر ممتاز
            </p>
          </div>

          <div className="text-left space-y-1">
            <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-md bg-amber-50 text-[#143823] border border-amber-300">
              {docTitle}
            </span>
            <p className="font-mono font-bold text-sm text-[#143823]">{docNumber}</p>
            <p className="text-[10px] text-gray-500">
              تاريخ الإصدار: {new Date(order.createdAt).toLocaleDateString('ar-EG')}
            </p>
          </div>
        </div>

        {/* Customer & Delivery Schedule Info */}
        <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div className="space-y-1">
            <p className="text-[11px] text-gray-500 font-semibold">بيانات العميل:</p>
            <p className="font-bold text-[#1d1d1f]">{order.customerName}</p>
            <p className="text-gray-600 font-mono text-[11px]">{order.customerPhone}</p>
            <p className="text-gray-600">{order.governorate} - {order.city}</p>
          </div>

          <div className="space-y-1 text-left">
            <p className="text-[11px] text-gray-500 font-semibold">موعد وطريقة الاستلام:</p>
            <p className="font-bold text-[#1d1d1f]">
              {order.deliveryDate || 'خلال 24-48 ساعة'}
            </p>
            <p className="text-gray-600 text-[11px]">
              الفترة: {order.deliveryTimeWindow || '12:00 م - 03:00 م'}
            </p>
            <p className="text-[#143823] font-semibold text-[11px]">
              طريقة السداد: دفع نقداً عند الاستلام (COD)
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#143823] text-white">
              <tr>
                <th className="p-2.5 font-bold">م</th>
                <th className="p-2.5 font-bold">المنتج والمواصفات</th>
                <th className="p-2.5 font-bold text-center">الكمية</th>
                <th className="p-2.5 font-bold text-left">سعر الوحدة</th>
                <th className="p-2.5 font-bold text-left">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="p-2.5 text-gray-500 text-center font-mono">{idx + 1}</td>
                  <td className="p-2.5 font-semibold text-[#1d1d1f]">{item.productName}</td>
                  <td className="p-2.5 text-center font-bold">{item.quantity}</td>
                  <td className="p-2.5 text-left font-mono">{formatPrice(item.unitPrice)}</td>
                  <td className="p-2.5 text-left font-mono font-bold">{formatPrice(item.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Summary & QR Code Section */}
        <div className="flex items-center justify-between pt-2 gap-4">
          
          {/* QR Verification Box */}
          <div className="flex items-center gap-3 border border-gray-200 rounded-xl p-3 bg-white">
            <img
              src={qrCodeUrl}
              alt="رمز التحقق المشفر QR"
              className="w-20 h-20 object-contain rounded-md border border-gray-200"
            />
            <div className="text-[10px] text-gray-500 space-y-0.5">
              <span className="font-bold text-[#143823] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#c59b27]" />
                فحص أصالة المستند
              </span>
              <p>امسح الكود للتحقق من السجلات</p>
              <p className="font-mono text-[9px] text-gray-400">dar-el-asal.vercel.app</p>
            </div>
          </div>

          {/* Totals */}
          <div className="w-56 space-y-1.5 text-xs text-left">
            <div className="flex justify-between text-gray-600">
              <span>المجموع الفرعي:</span>
              <span className="font-mono font-bold text-gray-900">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>رسوم التوصيل المعتمدة:</span>
              <span className="font-mono font-bold text-gray-900">{formatPrice(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between border-t-2 border-[#143823] pt-2 text-[#143823]">
              <span className="font-bold text-sm">المجموع الإجمالي:</span>
              <span className="font-mono font-black text-lg">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>

        </div>

        {/* Policy Notice Footer */}
        <div className="border-t border-gray-200 pt-3 text-[10px] text-gray-500 leading-relaxed text-center space-y-1">
          <p>
            📌 <strong>ملاحظة هامة:</strong> هذا المستند يمثل {isQuotation ? 'عرض سعر رسمي' : 'إشعار تأكيد طلب شراء'} صادر من متجر دار العسل والزيتون ولا يعد فاتورة إلكترونية ضريبية رسمية.
          </p>
          <p>
            يحق للعميل إلغاء الطلب ذاتياً حتى 6 ساعات قبل موعد التوصيل المجدول. المعاينة متاحة مع المندوب عند الاستلام.
          </p>
        </div>

      </div>
    </div>
  );
}
