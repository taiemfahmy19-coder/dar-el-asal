import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/db';
import { Product } from '@/lib/types';

interface PackageRequest {
  budget: number;
  theme: 'immunity' | 'healthy_breakfast' | 'luxury_gift' | 'home_pantry';
  preferences?: string[];
}

export async function POST(req: NextRequest) {
  try {
    const { budget, theme }: PackageRequest = await req.json();

    const targetBudget = Number(budget) || 800;

    // Get active products available for order
    const availableProducts = getProducts().filter(
      (p) => p.status !== 'UNAVAILABLE'
    );

    let selectedProducts: Product[] = [];
    let title = '';
    let description = '';

    if (theme === 'immunity') {
      title = 'باقة المناعة الفائقة والطاقة الحيوية';
      description = 'تشكيلة مختارة من أفخر أنواع عسل السدر وحبة البركة مع زيت الزيتون البكر القطفة المبكرة لدعم المناعة والنشاط.';
      const sidr = availableProducts.find((p) => p.id === 'prod-honey-sidr') || availableProducts[0];
      const blackseed = availableProducts.find((p) => p.id === 'prod-honey-blackseed');
      const earlyOil = availableProducts.find((p) => p.id === 'prod-oil-early-harvest') || availableProducts.find((p) => p.categoryId === 'cat-olive-oil');

      if (sidr) selectedProducts.push(sidr);
      if (blackseed) selectedProducts.push(blackseed);
      if (earlyOil) selectedProducts.push(earlyOil);
    } else if (theme === 'healthy_breakfast') {
      title = 'باقة الفطور الصباحي الذهبي';
      description = 'كل ما تحتاجه لمائدة إفطار صحية راقية: عسل نحل سادة، عسل كريمي بالمكسرات، وزيت زيتون بكر سيوي معصور على البارد.';
      const honeyPlain = availableProducts.find((p) => p.id === 'prod-honey-plain') || availableProducts.find((p) => p.categoryId === 'cat-honey');
      const creamedNuts = availableProducts.find((p) => p.id === 'prod-honey-creamed-nuts') || availableProducts.find((p) => p.id === 'prod-honey-mixed-nuts');
      const siwaOil = availableProducts.find((p) => p.id === 'prod-oil-siwa-cold') || availableProducts.find((p) => p.categoryId === 'cat-olive-oil');

      if (honeyPlain) selectedProducts.push(honeyPlain);
      if (creamedNuts) selectedProducts.push(creamedNuts);
      if (siwaOil) selectedProducts.push(siwaOil);
    } else if (theme === 'luxury_gift') {
      title = 'صندوق الهدايا الملكية الفاخرة';
      description = 'إهداء فاخر يعبر عن الذوق والتقدير: عسل سدر جبلي أصيل، عسل بالشمع الكامل، عسل بالفستق وزيت زيتون سينائي معمر.';
      const sidr = availableProducts.find((p) => p.id === 'prod-honey-sidr');
      const honeycomb = availableProducts.find((p) => p.id === 'prod-honey-honeycomb');
      const pistachio = availableProducts.find((p) => p.id === 'prod-honey-pistachio') || availableProducts.find((p) => p.id === 'prod-honey-mixed-nuts');
      const wildOil = availableProducts.find((p) => p.id === 'prod-oil-sinai-wild') || availableProducts.find((p) => p.categoryId === 'cat-olive-oil');

      if (sidr) selectedProducts.push(sidr);
      if (honeycomb) selectedProducts.push(honeycomb);
      if (pistachio) selectedProducts.push(pistachio);
      if (wildOil) selectedProducts.push(wildOil);
    } else {
      // home_pantry
      title = 'باقة تموين البيت من العسل والزيت';
      description = 'المونة الأساسية للبيت الصحي: صفيحة زيت زيتون بكر ممتاز 5 لتر مع عسل نحل طبيعي سادة وعسل زهور موالح.';
      const familyOil = availableProducts.find((p) => p.id === 'prod-oil-family-can') || availableProducts.find((p) => p.categoryId === 'cat-olive-oil');
      const honeyPlain = availableProducts.find((p) => p.id === 'prod-honey-plain');
      const citrusHoney = availableProducts.find((p) => p.id === 'prod-honey-citrus');

      if (familyOil) selectedProducts.push(familyOil);
      if (honeyPlain) selectedProducts.push(honeyPlain);
      if (citrusHoney) selectedProducts.push(citrusHoney);
    }

    // Budget knapsack optimization: adjust products to fit budget
    let total = selectedProducts.reduce((sum, p) => sum + p.price, 0);

    // If over budget, remove the most expensive item until within budget or 1 item remains
    while (total > targetBudget && selectedProducts.length > 1) {
      selectedProducts.sort((a, b) => b.price - a.price);
      selectedProducts.shift();
      total = selectedProducts.reduce((sum, p) => sum + p.price, 0);
    }

    // If under budget, try to add complementary items that fit the remaining budget
    const remaining = targetBudget - total;
    if (remaining >= 150) {
      const candidates = availableProducts.filter(
        (p) => !selectedProducts.some((sp) => sp.id === p.id) && p.price <= remaining
      );
      if (candidates.length > 0) {
        // Pick best fitting candidate
        candidates.sort((a, b) => b.price - a.price);
        selectedProducts.push(candidates[0]);
        total += candidates[0].price;
      }
    }

    const originalTotal = selectedProducts.reduce(
      (sum, p) => sum + (p.originalPrice || p.price),
      0
    );
    const savings = Math.max(0, originalTotal - total);

    return NextResponse.json({
      success: true,
      package: {
        title,
        description,
        totalPrice: total,
        originalTotalPrice: originalTotal,
        savings,
        products: selectedProducts,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'فشل تكوين الباقة' }, { status: 500 });
  }
}
