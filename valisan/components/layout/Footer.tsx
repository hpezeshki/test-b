'use client';
import Link from 'next/link';
import { AtSign, MapPin, Phone, RotateCcw } from 'lucide-react';
import { useHydrated, useStore } from '@/data/store';
import { useFmt } from '@/lib/hooks';

export function Footer() {
  const reset = useStore((s) => s.resetDemo);
  const hydrated = useHydrated();
  const f = useFmt();
  return (
    <footer className="mt-24 border-t border-brand-300/30 bg-lilac-100/40">
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div className="space-y-3 md:col-span-2">
          <div className="inline-flex flex-col items-center gap-1">
            <img src="/brand/logo-lockup.png" alt="VALISAN" className="h-24 w-auto object-contain mix-blend-multiply md:h-28" />
            <div className="eyebrow">Pilates · Yoga · Wellness</div>
          </div>
          <p className="max-w-md text-[14px] leading-7 text-ink-2">استودیوی تخصصی بانوان؛ جایی برای بازگشت به بدن، نفس و آرامش. تمرین‌های شخصی‌سازی‌شده با مربیان حرفه‌ای در فضایی آرام و خصوصی.</p>
        </div>
        <div className="space-y-2 text-[14px]">
          <div className="mb-3 font-medium">دسترسی سریع</div>
          {[['/about', 'درباره استودیو'], ['/classes', 'کلاس‌ها'], ['/coaches', 'مربیان'], ['/pricing', 'عضویت و قیمت‌ها'], ['/faq', 'پرسش‌های متداول'], ['/blog', 'مجله سلامت']].map(([h, l]) => (
            <Link prefetch={false} key={h} href={h} className="block text-ink-2 hover:text-brand-700">{l}</Link>
          ))}
        </div>
        <div className="space-y-3 text-[14px] text-ink-2">
          <div className="mb-3 font-medium text-ink">تماس با ما</div>
          <div className="flex items-start gap-2"><MapPin size={16} className="mt-1 shrink-0 text-brand-500" /><span>تهران، الهیه، خیابان فرشته، پلاک {f.s(12)}، طبقه دوم</span></div>
          <div className="flex items-center gap-2"><Phone size={16} className="shrink-0 text-brand-500" /><span className="tabular">{f.s('021-2600-4455')}</span></div>
          <div className="flex items-center gap-2"><AtSign size={16} className="shrink-0 text-brand-500" /><span className="latin">@valisan.studio</span></div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-5 text-[12px] text-muted md:flex-row">
          <span>© {f.s(1405)} والیسان. تمامی حقوق محفوظ است.</span>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-border px-2.5 py-0.5">حالت نمایشی — داده‌ها روی همین دستگاه ذخیره می‌شوند</span>
            {hydrated && <button onClick={() => { if (confirm('همه داده‌های نمایشی بازنشانی شود؟')) reset(); }} className="flex items-center gap-1 hover:text-ink"><RotateCcw size={13} /> بازنشانی داده‌های نمایشی</button>}
          </div>
        </div>
      </div>
    </footer>
  );
}
