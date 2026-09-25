import type { Metadata } from 'next';
import { CoachRoster } from '@/components/marketing/Sections';

export const metadata: Metadata = { title: 'مربیان' };

export default function CoachesPage() {
  return (
    <>
      <section className="container-x pt-16 text-center">
        <div className="eyebrow">Coaches</div>
        <h1 className="mt-3 text-[36px] font-light md:text-[44px]">مربیان و مدارک تخصصی</h1>
      </section>
      <CoachRoster />
    </>
  );
}
