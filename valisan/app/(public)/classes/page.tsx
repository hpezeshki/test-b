import type { Metadata } from 'next';
import { CtaBand, Modalities } from '@/components/marketing/Sections';

export const metadata: Metadata = { title: 'کلاس‌ها' };

export default function ClassesPage() {
  return (
    <>
      <section className="container-x pt-16 text-center">
        <div className="eyebrow">Classes</div>
        <h1 className="mt-3 text-[36px] font-light md:text-[44px]">کلاس‌ها و روش‌های تمرینی</h1>
        <p className="mx-auto mt-3 max-w-xl text-ink-2 leading-8">از ریفرمر تا یوگا، از حرکات اصلاحی تا بازتوانی پس از زایمان؛ مسیر شما با ارزیابی سلامت آغاز می‌شود.</p>
      </section>
      <Modalities />
      <CtaBand />
    </>
  );
}
