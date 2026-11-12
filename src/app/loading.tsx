import { BRAND } from '@/lib/config';

/** Root route-segment loading skeleton — brand-styled, RTL, lightweight. */
export default function RootLoading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-right" dir="rtl">
      <div
        className="w-8 h-8 border-2 border-[#143823] border-t-transparent rounded-full animate-spin"
        role="status"
        aria-label="جارٍ التحميل"
      />
      <p className="text-xs text-[#515154] font-medium">{BRAND.name} — جارٍ التحميل…</p>
    </div>
  );
}
