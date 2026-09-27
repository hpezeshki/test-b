import type { Metadata } from 'next';
import Link from 'next/link';
import { PricingTable } from '@/components/marketing/Sections';
import { FAQ } from '@/data/seed/content';

export const metadata: Metadata = { title: 'عضویت و قیمت‌ها' };

export default function PricingPage() {
  return (
    <>
      <section className="container-x pt-16 text-center">
        <div className="eyebrow">Memberships</div>
        <h1 className="mt-3 text-[36px] font-light md:text-[44px]">عضویت و قیمت‌ها</h1>
        <p className="mx-auto mt-3 max-w-xl leading-8 text-ink-2">پس از انتخاب بسته، فرم کوتاه ارزیابی سلامت را تکمیل می‌کنید، مربی و زمان اولین جلسه را برمی‌گزینید و پرداخت را آنلاین یا کارت‌به‌کارت انجام می‌دهید.</p>
      </section>
      <PricingTable />
      <section className="container-x py-12">
        <div className="card mx-auto max-w-3xl divide-y divide-border">
          {FAQ.slice(1, 4).map((q) => (
            <details key={q.q} className="group p-5">
              <summary className="cursor-pointer list-none font-medium">{q.q}</summary>
              <p className="mt-2 text-[14px] leading-7 text-ink-2">{q.a}</p>
            </details>
          ))}
          <div className="p-5 text-center text-[13px]"><Link prefetch={false} href="/faq" className="text-brand-700 hover:underline">همه پرسش‌های متداول</Link></div>
        </div>
      </section>
    </>
  );
}
