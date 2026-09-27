'use client';
import Link from 'next/link';
import { ArrowLeft, Check, Quote, Star } from 'lucide-react';
import { COACHES } from '@/data/seed/coaches';
import { PACKAGES } from '@/data/seed/packages';
import { MODALITY_INFO, POSTS, TESTIMONIALS } from '@/data/seed/content';
import { BLOG_CATEGORY_LABEL, MODALITY_LABEL } from '@/domain/labels';
import { useFmt } from '@/lib/hooks';
import { Avatar, Badge, Button, Card, Photo, SectionHeading } from '@/components/ui';
import { blogPhotos, coachPhotos, IMAGES } from '@/data/seed/images';
import { cn } from '@/lib/cn';

export function Hero() {
  const f = useFmt();
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -end-32 size-[520px] rounded-full bg-brand-300/45 blur-3xl" />
        <div className="absolute top-1/2 -start-40 size-[460px] rounded-full bg-lilac-300/50 blur-3xl" />
        <div className="absolute bottom-0 end-1/3 size-[320px] rounded-full bg-brand-100/60 blur-3xl" />
      </div>
      <div className="container-x grid items-center gap-10 py-12 md:py-24 lg:grid-cols-2 lg:py-28">
        <div className="space-y-7 fade-up">
          <div className="eyebrow">Pilates · Yoga · Wellness</div>
          <h1 className="text-[40px] leading-[1.15] font-light md:text-[56px] lg:text-[64px]">بازگشت به بدن،<br />در سکوتِ <span className="text-brand-500">والیسان</span></h1>
          <p className="max-w-lg text-[17px] leading-[1.9] text-ink-2">استودیوی خصوصی بانوان در قلب الهیه؛ پیلاتس ریفرمر، یوگا و حرکات اصلاحی با مربیان بین‌المللی، در گروه‌های حداکثر {f.s(3)} تا {f.s(6)} نفره.</p>
          <div className="flex flex-wrap gap-3">
            <Button href="/pricing" size="lg">شروع ثبت‌نام</Button>
            <Button href="/classes" size="lg" variant="ghost">آشنایی با کلاس‌ها <ArrowLeft size={18} /></Button>
          </div>
          <div className="flex items-center gap-6 pt-2 text-[13px] text-muted">
            <span className="flex items-center gap-1.5"><Star size={14} className="text-gold-400" fill="currentColor" /> {f.s('4.9')} از {f.s(320)} نظر</span>
            <span>{f.s(4)} مربی تخصصی</span>
            <span>رزرو آنلاین {f.s(24)} ساعته</span>
          </div>
        </div>
        <div className="relative fade-up" style={{ animationDelay: '120ms' }}>
          <Photo srcs={IMAGES.hero} alt="استودیو پیلاتس ریفرمر والیسان" priority hover={false} overlay="soft" className="aspect-[4/5] rounded-[var(--radius-xl)] shadow-lg ring-1 ring-gold-400/40">
            <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-5 text-on-brand md:p-6">
              <div className="rounded-full bg-ink/25 px-3 py-1 backdrop-blur-sm"><span className="eyebrow !text-on-brand/90 !text-[11px]">Studio · Elahieh</span></div>
              <img src="/brand/logo-lockup.png" alt="" className="hidden h-14 w-auto object-contain drop-shadow-md sm:block" />
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink/45 to-transparent" aria-hidden />
            <div className="absolute inset-x-0 bottom-0 p-5 pb-24 text-on-brand md:p-6 md:pb-24"><div className="text-[15px] font-medium leading-7 drop-shadow-sm">«قدرت واقعی از سکوتِ مرکز بدن آغاز می‌شود.»</div></div>
          </Photo>
          <div className="glass-strong absolute -bottom-6 start-4 z-10 flex items-center gap-3 rounded-[var(--radius-lg)] p-3 pe-5 md:-start-6">
            <Photo srcs={IMAGES.heroThumb} alt="" hover={false} className="size-14 shrink-0 rounded-[var(--radius-sm)]" hue="300" />
            <div className="flex flex-col gap-0.5 leading-5">
              <span className="text-[12px] leading-4 text-muted">جلسه بعدی خالی</span>
              <span className="text-[15px] font-medium leading-6">امروز · ساعت {f.s('18:00')}</span>
              <span className="text-[12px] leading-4 text-brand-700">پیلاتس ریفرمر · {f.s(2)} صندلی باقی‌مانده</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Modalities({ limit }: { limit?: number }) {
  const f = useFmt();
  const list = limit ? MODALITY_INFO.slice(0, limit) : MODALITY_INFO;
  return (
    <section className="container-x py-20">
      <SectionHeading eyebrow="Modalities" title="کلاس‌ها و روش‌های تمرینی" desc="هر کلاس با ظرفیت محدود برگزار می‌شود تا توجه مربی به تک‌تک هنرجویان حفظ شود." />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((m, i) => (
          <Card key={m.key} hover className="group overflow-hidden fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <Photo srcs={IMAGES.modality[m.key]} alt={m.title} hue={m.accent} className="h-44" />
            <div className="space-y-2 p-5">
              <div className="flex items-center justify-between"><h3 className="text-[17px] font-medium">{m.title}</h3><Badge tone="gold">{m.level}</Badge></div>
              <p className="text-[13.5px] leading-6 text-ink-2">{m.desc}</p>
              <div className="text-[12px] text-muted">{f.s(m.duration)}</div>
            </div>
          </Card>
        ))}
      </div>
      {limit && <div className="mt-8 text-center"><Button href="/classes" variant="ghost">همه کلاس‌ها <ArrowLeft size={16} /></Button></div>}
    </section>
  );
}

export function CoachRoster({ limit }: { limit?: number }) {
  const f = useFmt();
  return (
    <section className="bg-lilac-100/50 py-20">
      <div className="container-x">
        <SectionHeading eyebrow="The Team" title="مربیان والیسان" desc="مدرک بین‌المللی، سال‌ها تجربه و نگاهی دقیق به بدن هر هنرجو." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {(limit ? COACHES.slice(0, limit) : COACHES).map((c) => (
            <Link prefetch={false} key={c.id} href={`/coaches/${c.slug}`} className="card lift group block overflow-hidden text-center">
              <Photo srcs={coachPhotos(c.id)} alt={c.displayName} hue={c.accent} className="aspect-[4/5]" overlay="soft" />
              <div className="p-5">
              <h3 className="text-[17px] font-medium">{c.displayName}</h3>
              <div className="text-[13px] text-muted">{c.title}</div>
              <div className="mt-3 flex flex-wrap justify-center gap-1.5">{c.modalities.slice(0, 2).map((m) => <Badge key={m} tone="brand">{MODALITY_LABEL[m]}</Badge>)}</div>
              <div className="mt-3 flex items-center justify-center gap-1 text-[12px] text-muted"><Star size={12} className="text-gold-400" fill="currentColor" /> {f.s(c.rating)} · {f.s(c.yearsExperience)} سال تجربه</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PricingTable({ compact }: { compact?: boolean }) {
  const f = useFmt();
  return (
    <section className={cn('container-x aurora', compact ? 'py-20' : 'py-12')}>
      {compact && <SectionHeading eyebrow="Memberships" title="عضویت و قیمت‌ها" desc="بسته‌ای متناسب با ریتم زندگی خود انتخاب کنید. تمام بسته‌ها شامل مربی اختصاصی و جابه‌جایی رایگان هستند." />}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {PACKAGES.map((p) => (
          <div key={p.id} className={cn('card relative flex flex-col p-6 lift', p.isFeatured && 'shadow-glow ring-1 ring-brand-300/70 bg-gradient-to-b from-white/95 to-brand-50/80')}>
            {p.isFeatured && <span className="absolute -top-3 start-5"><Badge tone="gold" dot>{p.subtitle}</Badge></span>}
            <div className="text-[13px] text-muted">{p.kind === 'drop_in' ? 'بدون تعهد' : 'عضویت ماهانه'}</div>
            <h3 className="mt-1 text-[19px] font-medium">{p.title}</h3>
            {!p.isFeatured && p.subtitle && <div className="text-[13px] text-brand-700">{p.subtitle}</div>}
            <div className="mt-5 flex items-baseline gap-2">
              <span className="text-[28px] font-medium tabular leading-none">{f.n(p.priceToman)}</span><span className="text-[13px] text-muted">تومان</span>
            </div>
            {p.compareAtToman && <div className="mt-1 text-[12px] text-muted line-through tabular">{f.toman(p.compareAtToman)}</div>}
            <ul className="mt-5 flex-1 space-y-2 text-[13.5px] text-ink-2">
              {p.perks.map((x) => <li key={x} className="flex items-start gap-2.5"><span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700 ring-1 ring-brand-100"><Check size={12} strokeWidth={2} /></span><span>{f.s(x)}</span></li>)}
            </ul>
            <Button href={`/join/${p.slug}/assessment`} className="mt-6" variant={p.isFeatured ? 'primary' : 'secondary'} full>{p.kind === 'drop_in' ? 'رزرو جلسه تکی' : 'شروع ثبت‌نام'}</Button>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="container-x py-20">
      <SectionHeading eyebrow="Voices" title="روایت هنرجویان" />
      <div className="grid gap-5 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <Card key={t.name} className="p-7">
            <Quote size={22} className="text-brand-300" />
            <p className="mt-4 text-[15px] leading-[1.9] text-ink-2">{t.text}</p>
            <div className="mt-5 text-[14px] font-medium">{t.name}</div>
            <div className="text-[12px] text-muted">{t.role}</div>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function BlogTeaser() {
  const f = useFmt();
  return (
    <section className="bg-lilac-100/50 py-20">
      <div className="container-x">
        <SectionHeading eyebrow="Journal" title="مجله سلامت والیسان" desc="تغذیه، حرکات اصلاحی، ذهن‌آگاهی و ریکاوری؛ نوشته‌هایی کوتاه از تیم تخصصی ما." />
        <div className="grid gap-5 md:grid-cols-3">
          {POSTS.slice(0, 3).map((p) => <PostCard key={p.slug} post={p} f={f} />)}
        </div>
        <div className="mt-8 text-center"><Button href="/blog" variant="ghost">همه مقالات <ArrowLeft size={16} /></Button></div>
      </div>
    </section>
  );
}

export function PostCard({ post, f }: { post: (typeof POSTS)[number]; f: ReturnType<typeof useFmt> }) {
  return (
    <Link prefetch={false} href={`/blog/${post.slug}`} className="card lift group block overflow-hidden">
      <Photo srcs={blogPhotos(post.slug, post.category)} alt={post.title} hue={post.accent} className="h-44" />
      <div className="space-y-2 p-5">
        <div className="flex items-center gap-2 text-[12px] text-muted"><Badge tone="brand">{BLOG_CATEGORY_LABEL[post.category]}</Badge><span>{f.s(post.readMinutes)} دقیقه مطالعه</span></div>
        <h3 className="text-[16px] font-medium leading-7">{post.title}</h3>
        <p className="line-clamp-2 text-[13.5px] leading-6 text-ink-2">{post.excerpt}</p>
      </div>
    </Link>
  );
}

export function CtaBand() {
  return (
    <section className="container-x py-10">
      <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-ink px-8 py-14 text-center text-on-brand md:px-16">
        <Photo srcs={IMAGES.cta} alt="" hover={false} overlay="strong" className="absolute inset-0 !bg-ink" imgClassName="opacity-90" />
        <div className="pointer-events-none absolute -top-20 -end-20 size-72 rounded-full bg-brand-300/30 blur-3xl" />
        <div className="relative">
        <div className="eyebrow !text-gold-400">Begin</div>
        <h2 className="mt-3 text-[28px] font-light md:text-[36px]">اولین جلسه‌ی خود را امروز رزرو کنید</h2>
        <p className="mx-auto mt-3 max-w-lg text-[15px] leading-8 text-on-brand/85">با یک جلسه‌ی تکی شروع کنید؛ ارزیابی وضعیت بدنی و معرفی مربی مناسب، هدیه‌ی ما به شماست.</p>
        <div className="mt-7 flex justify-center gap-3"><Button href="/join/drop-in/assessment" size="lg" variant="light">رزرو جلسه تکی</Button><Button href="/pricing" size="lg" variant="gold" className="!text-on-brand !border-gold-400/70">مشاهده عضویت‌ها</Button></div>
        </div>
      </div>
    </section>
  );
}

const STUDIO_CAPTIONS = ['استودیو ریفرمر', 'سالن انتظار', 'اتاق ریکاوری', 'استودیو مت'];
export function StudioGallery() {
  return (
    <section className="container-x py-20">
      <SectionHeading eyebrow="The Space" title="فضای استودیو" desc="نور طبیعی، چوب گرم و سکوت؛ سه استودیوی مستقل که برای تمرکز طراحی شده‌اند." />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {IMAGES.studio.map((srcs, i) => (
          <figure key={i} className={cn('group relative', i % 2 === 0 ? 'md:-translate-y-4' : 'md:translate-y-4')}>
            <Photo srcs={srcs} alt={STUDIO_CAPTIONS[i]} hue={['300', '255', '320', '280'][i]} overlay="soft" className={cn('rounded-[var(--radius-lg)] ring-1 ring-border', i % 2 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]')} />
            <figcaption className="pointer-events-none absolute bottom-3 start-3 rounded-full bg-surface/85 px-3 py-1 text-[12px] backdrop-blur">{STUDIO_CAPTIONS[i]}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
