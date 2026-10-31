import React from 'react';
import { ShieldCheck, Truck, Scale, Award } from 'lucide-react';

export default function TrustFeatures() {
  const features = [
    {
      icon: ShieldCheck,
      title: 'فحص مخبري مباشر',
      description: 'نخضع العسل والزيوت لفحوصات نقاء دورية بالمعامل المركزية لضمان خلوها من السكر والمبيدات.',
    },
    {
      icon: Truck,
      title: 'البيع حسب الطلب',
      description: 'لا نخزن السلع لفترات طويلة. نطلب دفعتك طازجة من المورد فور تأكيد طلبك لضمان أعلى جودة.',
    },
    {
      icon: Scale,
      title: 'تسعير عادل وشفاف',
      description: 'توصيل مباشر من المعاصر والمناحل بدون سلاسل وسطاء طويلة، مع الشفافية في التكلفة والوزن.',
    },
    {
      icon: Award,
      title: 'ضمان الرضا والمعاينة',
      description: 'عاين طلبك مع الكابتن عند الاستلام، ولا تدفع إلا بعد التأكد التام من سلامة المنتجات ومطابقتها.',
    },
  ];

  return (
    <section className="py-16 bg-[#f5f5f7] border-b border-[#d2d2d7]/50 text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] tracking-tight">
            لماذا يثق العملاء في دار العسل والزيتون؟
          </h2>
          <p className="text-xs sm:text-sm text-[#515154]">
            أربعة مبادئ نبني عليها كل تفاصيل تجربة التسوق في دار العسل والزيتون
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="card border border-[#d2d2d7]/50 flex flex-col items-end text-right !mb-0"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#143823]/10 text-[#143823] flex items-center justify-center mb-4 shadow-sm border border-[#c59b27]/30">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-[#1d1d1f] mb-2 tracking-tight">{f.title}</h3>
              <p className="text-xs text-[#515154] leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
