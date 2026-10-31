import React from 'react';
import { Check, Clock, AlertCircle, Truck, Package, CheckCircle2, UserCheck, XCircle } from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';
import { ORDER_STATUS_MAP, formatDate } from '@/lib/utils';

interface Props {
  order: Order;
}

const PRIMARY_STEPS: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY_FOR_DELIVERY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

export default function OrderTimeline({ order }: Props) {
  const currentStatus = order.orderStatus;
  const isCancelled = currentStatus === 'CANCELLED';
  const isFailed = currentStatus === 'DELIVERY_FAILED';

  // Find step index
  const currentStepNum = ORDER_STATUS_MAP[currentStatus]?.step || 1;

  return (
    <div className="space-y-8 text-right">
      
      {/* Visual Stepper Bar */}
      {!isCancelled && !isFailed ? (
        <div className="relative">
          <div className="overflow-x-auto pb-4">
            <div className="flex items-center justify-between min-w-[500px] relative">
              
              {/* Background Connecting Line */}
              <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1 bg-ivory-200 z-0"></div>

              {PRIMARY_STEPS.map((statusKey, index) => {
                const conf = ORDER_STATUS_MAP[statusKey];
                const stepNum = conf.step;
                const isPassed = currentStepNum >= stepNum;
                const isCurrent = currentStepNum === stepNum;

                return (
                  <div key={statusKey} className="relative z-10 flex flex-col items-center text-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                        isCurrent
                          ? 'bg-forest-900 text-gold-400 ring-4 ring-forest-100 shadow-md scale-110'
                          : isPassed
                          ? 'bg-forest-800 text-white shadow-sm'
                          : 'bg-white border-2 border-ivory-300 text-gray-400'
                      }`}
                    >
                      {isPassed && !isCurrent ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-bold mt-2 max-w-[80px] leading-tight ${
                        isCurrent ? 'text-forest-950 font-extrabold' : isPassed ? 'text-forest-800' : 'text-gray-400'
                      }`}
                    >
                      {conf.label}
                    </span>
                  </div>
                );
              })}

            </div>
          </div>
        </div>
      ) : (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-3 ${
            isCancelled
              ? 'bg-zinc-100 border-zinc-300 text-zinc-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {isCancelled ? <XCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <div>
            <p className="font-extrabold text-sm">
              {isCancelled ? 'تم إلغاء هذا الطلب' : 'تعذر تسليم هذا الطلب'}
            </p>
            <p className="text-[11px] font-normal mt-0.5">
              {order.cancelReason || order.failureReason || 'يرجى مراجعة إدارة المتجر للمزيد من التفاصيل.'}
            </p>
          </div>
        </div>
      )}

      {/* Detailed Chronological History Log */}
      <div className="space-y-4 pt-4 border-t border-ivory-200">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          السجل الزمني لمراحل الطلب:
        </h4>

        <div className="space-y-3">
          {order.statusHistory.map((item, idx) => {
            const conf = ORDER_STATUS_MAP[item.newStatus] || ORDER_STATUS_MAP.PENDING;
            return (
              <div
                key={item.id || idx}
                className="bg-ivory-50 p-3.5 rounded-2xl border border-ivory-200 flex items-start gap-3"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${conf.bg} ${conf.color}`}>
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-bold text-xs text-forest-950">{conf.label}</span>
                    <span className="text-[10px] text-gray-400">{formatDate(item.createdAt)}</span>
                  </div>
                  {item.notes && (
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.notes}</p>
                  )}
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    بواسطة: {item.changedByName}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
