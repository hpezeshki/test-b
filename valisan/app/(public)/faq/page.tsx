import type { Metadata } from 'next';
import { FAQ } from '@/data/seed/content';

export const metadata: Metadata = { title: 'پرسش‌های متداول' };

export default function FaqPage() {
  return (
    <section className="container-x py-16">
      <div className="text-center"><div className="eyebrow">FAQ</div><h1 className="mt-3 text-[36px] font-light md:text-[44px]">پرسش‌های متداول</h1></div>
      <div className="card mx-auto mt-10 max-w-3xl divide-y divide-border">
        {FAQ.map((q) => (
          <details key={q.q} className="group p-5 open:bg-brand-50/40">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium"><span>{q.q}</span><span className="text-muted transition-transform group-open:rotate-45">+</span></summary>
            <p className="mt-3 text-[14.5px] leading-7 text-ink-2">{q.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
