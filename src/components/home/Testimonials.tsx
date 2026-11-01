import React from 'react';
import { Star, CheckCircle, Quote } from 'lucide-react';
import { Review } from '@/lib/types';
import { SEED_REVIEWS } from '@/data/seed';

export default function Testimonials() {
  const reviews: Review[] = SEED_REVIEWS;

  return (
    <section className="py-16 bg-[#f5f5f7] border-b border-[#d2d2d7]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] tracking-tight">
            تجارب موثقة لعملاء دار العسل والزيتون
          </h2>
          <p className="text-xs sm:text-sm text-[#515154]">
            تقييمات موثقة من عملاء استلموا المنتجات وقاموا بتجربتها فعلياً
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="card border border-[#d2d2d7]/50 flex flex-col justify-between text-right relative !mb-0"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: rev.rating }).map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-5 h-5 text-gray-300" />
                </div>

                <p className="text-xs text-[#1d1d1f] leading-relaxed italic mb-4">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-[#d2d2d7]/40 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-[#1d1d1f]">{rev.userName}</h4>
                  {rev.isVerifiedPurchase && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium mt-0.5">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      مشتري موثق
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
