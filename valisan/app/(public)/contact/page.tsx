import type { Metadata } from 'next';
import { Clock, AtSign, MapPin, Phone } from 'lucide-react';
import { Button, Card } from '@/components/ui';

export const metadata: Metadata = { title: 'تماس و آدرس' };

export default function ContactPage() {
  return (
    <section className="container-x py-16">
      <div className="text-center"><div className="eyebrow">Contact</div><h1 className="mt-3 text-[36px] font-light md:text-[44px]">تماس و آدرس استودیو</h1></div>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card className="space-y-5 p-8 text-[15px]">
          <div className="flex items-start gap-3"><MapPin className="mt-1 shrink-0 text-brand-500" size={20} /><div><div className="font-medium">آدرس</div><div className="text-ink-2">تهران، الهیه، خیابان فرشته، پلاک ۱۲، طبقه دوم</div></div></div>
          <div className="flex items-start gap-3"><Phone className="mt-1 shrink-0 text-brand-500" size={20} /><div><div className="font-medium">تلفن</div><div className="text-ink-2 tabular">۰۲۱-۲۶۰۰-۴۴۵۵ · ۰۹۱۲-۰۰۰-۰۰۰۰</div></div></div>
          <div className="flex items-start gap-3"><Clock className="mt-1 shrink-0 text-brand-500" size={20} /><div><div className="font-medium">ساعات کاری</div><div className="text-ink-2">شنبه تا پنجشنبه، ۸ صبح تا ۸ شب · جمعه‌ها تعطیل</div></div></div>
          <div className="flex items-start gap-3"><AtSign className="mt-1 shrink-0 text-brand-500" size={20} /><div><div className="font-medium">اینستاگرام</div><div className="latin text-ink-2">@valisan.studio</div></div></div>
          <Button href="/pricing" className="mt-2">رزرو اولین جلسه</Button>
        </Card>
        <div className="relative min-h-72 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface-2">
          <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(#EDE6E0 1px, transparent 1px), linear-gradient(90deg, #EDE6E0 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          <div className="absolute start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-brand-300 text-ink shadow-brand"><MapPin size={22} /></div>
            <div className="glass mt-3 rounded-full px-4 py-1.5 text-[13px]">استودیو والیسان · الهیه</div>
          </div>
        </div>
      </div>
    </section>
  );
}
