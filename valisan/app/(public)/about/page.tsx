import type { Metadata } from 'next';
import { CtaBand, StudioGallery } from '@/components/marketing/Sections';
import { Photo, SectionHeading } from '@/components/ui';
import { IMAGES } from '@/data/seed/images';

export const metadata: Metadata = { title: 'درباره استودیو' };

const VALUES = [
  { t: 'خصوصی و آرام', d: 'فضایی کاملاً زنانه با نور طبیعی، رایحه‌ی ملایم و سکوت؛ بدون شلوغی باشگاه‌های عمومی.' },
  { t: 'ظرفیت محدود', d: 'حداکثر ۳ نفر در جلسات نیمه‌خصوصی و ۶ نفر در گروهی. توجه مربی، حق شماست.' },
  { t: 'برنامه‌ی شخصی', d: 'هر مسیر تمرینی با ارزیابی سلامت و وضعیت بدنی آغاز می‌شود و ماهانه بازبینی می‌گردد.' },
  { t: 'تجهیزات حرفه‌ای', d: 'ریفرمرهای Balanced Body، لافت یوگای مستقل و اتاق‌های خصوصی حرکات اصلاحی.' },
];

export default function AboutPage() {
  return (
    <>
      <section className="container-x py-16 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-6 fade-up">
            <div className="eyebrow">Our Story</div>
            <h1 className="text-[36px] font-light leading-[1.25] md:text-[44px]">استودیویی که برای <span className="text-brand-500">شنیدن بدن</span> ساخته شد</h1>
            <p className="text-[16px] leading-[1.9] text-ink-2">والیسان در سال ۱۴۰۱ با یک ایده‌ی ساده آغاز شد: بانوان به فضایی نیاز دارند که در آن، تمرین نه رقابت باشد و نه اجبار؛ بلکه گفت‌وگویی آرام با بدن. امروز چهار مربی بین‌المللی، سه استودیوی مجهز و صدها هنرجو، این ایده را زندگی می‌کنند.</p>
            <p className="text-[16px] leading-[1.9] text-ink-2">ما به کیفیت حرکت باور داریم، نه به شمارش تکرارها. به همین دلیل کلاس‌های ما کوچک، برنامه‌ها شخصی و مربیان‌مان با دقت انتخاب شده‌اند.</p>
          </div>
          <Photo srcs={IMAGES.about} alt="فضای استودیو والیسان" priority className="aspect-[4/5] rounded-[var(--radius-xl)] shadow-lg ring-1 ring-gold-400/40" />
        </div>
      </section>
      <section className="bg-surface-2/60 py-20">
        <div className="container-x">
          <SectionHeading eyebrow="Values" title="آنچه والیسان را متفاوت می‌کند" />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => (
              <div key={v.t} className="card p-6">
                <div className="latin text-[28px] text-gold-400">0{i + 1}</div>
                <h3 className="mt-2 text-[17px] font-medium">{v.t}</h3>
                <p className="mt-2 text-[14px] leading-7 text-ink-2">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <StudioGallery />
      <CtaBand />
    </>
  );
}
