'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ClipboardCheck, CreditCard, Hourglass, Landmark, PencilLine, XCircle } from 'lucide-react';
import { useHydrated, useStore } from '@/data/store';
import { packageBySlug } from '@/data/seed/packages';
import { useFmt, useSessionUser } from '@/lib/hooks';
import { FITNESS_LEVEL_LABEL, MODALITY_LABEL, TX_STATUS_LABEL } from '@/domain/labels';
import { FunnelShell, PackageSummary } from './FunnelShell';
import { IntakeForm } from '@/components/intake/IntakeForm';
import { SlotPicker } from '@/components/calendar/SlotPicker';
import { Badge, Button, Card } from '@/components/ui';

function NotFound() { return <div className="container-x py-24 text-center text-muted">بسته یافت نشد.</div>; }

export function AssessmentStep({ slug }: { slug: string }) {
  const pkg = packageBySlug(slug);
  const router = useRouter();
  const user = useSessionUser();
  const startCheckout = useStore((s) => s.startCheckout);
  const hydrated = useHydrated();
  const existing = useStore((s) => s.healthAssessments).find((h) => h.userId === user?.id);
  const [edit, setEdit] = useState(false);
  const f = useFmt();
  useEffect(() => { if (hydrated && pkg) startCheckout(pkg.slug); }, [hydrated, pkg, startCheckout]);
  if (!pkg) return <NotFound />;
  const go = () => router.push(`/join/${pkg.slug}/schedule`);
  return (
    <FunnelShell pkg={pkg} step={1} aside={<PackageSummary pkg={pkg} />}>
      <div className="mb-6"><div className="eyebrow">Health Intake</div><h1 className="mt-1 text-[28px] font-light">فرم ارزیابی سلامت و سبک زندگی</h1></div>
      {existing && !edit ? (
        <Card className="p-8 fade-up">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-success/12 text-success"><ClipboardCheck size={24} /></span>
            <div className="flex-1">
              <h2 className="text-[18px] font-medium">ارزیابی شما قبلاً ثبت شده است</h2>
              <p className="mt-1 text-[14px] text-ink-2">ثبت‌شده در {f.d(existing.submittedAt, 'long')} · سطح: {FITNESS_LEVEL_LABEL[existing.fitnessLevel]}{existing.reviewedBy ? ` · بررسی‌شده توسط کادر تخصصی (سطح پیشنهادی: ${FITNESS_LEVEL_LABEL[existing.reviewedBy.recommendedLevel]})` : ''}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button onClick={go}>ادامه با همین ارزیابی <ArrowLeft size={16} /></Button>
                <Button variant="ghost" onClick={() => setEdit(true)}><PencilLine size={16} /> به‌روزرسانی پاسخ‌ها</Button>
              </div>
            </div>
          </div>
        </Card>
      ) : <IntakeForm onDone={go} />}
    </FunnelShell>
  );
}

export function ScheduleStep({ slug }: { slug: string }) {
  const pkg = packageBySlug(slug);
  const router = useRouter();
  const user = useSessionUser();
  const checkout = useStore((s) => s.checkout);
  const setSlot = useStore((s) => s.setCheckoutSlot);
  const startCheckout = useStore((s) => s.startCheckout);
  const hydrated = useHydrated();
  const slots = useStore((s) => s.slots);
  const coaches = useStore((s) => s.coaches);
  const f = useFmt();
  useEffect(() => { if (hydrated && pkg) startCheckout(pkg.slug); }, [hydrated, pkg, startCheckout]);
  const selected = useMemo(() => slots.find((s) => s.id === checkout?.slotId), [slots, checkout?.slotId]);
  if (!pkg) return <NotFound />;
  const coach = selected && coaches.find((c) => c.id === selected.coachId);
  return (
    <FunnelShell pkg={pkg} step={2} aside={<PackageSummary pkg={pkg} slotLine={selected ? <><div className="font-medium">{f.dt(selected.startsAt)}</div><div className="text-muted">{coach?.displayName} · {MODALITY_LABEL[selected.modality]}</div></> : <span className="text-muted">هنوز زمانی انتخاب نشده</span>} />}>
      <div className="mb-6"><div className="eyebrow">Schedule</div><h1 className="mt-1 text-[28px] font-light">{pkg.kind === 'drop_in' ? 'زمان جلسه را انتخاب کنید' : 'زمان اولین جلسه را انتخاب کنید'}</h1><p className="mt-1 text-[13px] text-muted">{pkg.kind === 'drop_in' ? 'یک جلسه‌ی ۶۰ دقیقه‌ای.' : 'جلسات بعدی را پس از فعال‌شدن عضویت از پنل خود رزرو می‌کنید.'}</p></div>
      <SlotPicker selectedId={checkout?.slotId} onSelect={(s) => setSlot(s.id)} userId={user?.id} initialCoachId={user?.assignedCoachIds[0]} />
      <div className="mt-8 flex justify-between">
        <Button variant="ghost" href={`/join/${pkg.slug}/assessment`}>مرحله قبل</Button>
        <Button disabled={!selected} onClick={() => router.push(`/join/${pkg.slug}/checkout`)}>ادامه به پرداخت <ArrowLeft size={16} /></Button>
      </div>
    </FunnelShell>
  );
}

export function CheckoutStep({ slug }: { slug: string }) {
  const pkg = packageBySlug(slug);
  const router = useRouter();
  const checkout = useStore((s) => s.checkout);
  const slots = useStore((s) => s.slots);
  const coaches = useStore((s) => s.coaches);
  const beginIpg = useStore((s) => s.beginIpg);
  const f = useFmt();
  const [track, setTrack] = useState<'ipg' | 'card_to_card'>('ipg');
  const [busy, setBusy] = useState(false);
  const selected = slots.find((s) => s.id === checkout?.slotId);
  const coach = selected && coaches.find((c) => c.id === selected.coachId);
  if (!pkg) return <NotFound />;
  const pay = () => {
    setBusy(true);
    if (track === 'ipg') {
      const tx = beginIpg();
      setTimeout(() => router.push(tx ? `/pay/ipg?tx=${tx.id}&pkg=${pkg.slug}` : `/join/${pkg.slug}/checkout`), 500);
    } else setTimeout(() => router.push(`/pay/card?pkg=${pkg.slug}`), 300);
  };
  return (
    <FunnelShell pkg={pkg} step={3} aside={<PackageSummary pkg={pkg} slotLine={selected ? <><div className="font-medium">{f.dt(selected.startsAt)}</div><div className="text-muted">{coach?.displayName}</div></> : undefined} />}>
      <div className="mb-6"><div className="eyebrow">Checkout</div><h1 className="mt-1 text-[28px] font-light">روش پرداخت</h1></div>
      {!selected && <div className="mb-4 rounded-[var(--radius-md)] border border-warning/50 bg-warning/10 p-4 text-[13.5px]">هنوز زمانی انتخاب نکرده‌اید. <Button href={`/join/${pkg.slug}/schedule`} size="sm" variant="ghost">انتخاب زمان</Button></div>}
      <div className="grid gap-4 md:grid-cols-2">
        <TrackCard active={track === 'ipg'} onClick={() => setTrack('ipg')} icon={<CreditCard size={22} />} title="پرداخت آنلاین" desc="درگاه بانکی (زرین‌پال) · فعال‌سازی آنی عضویت" badge={<Badge tone="success" dot>آنی</Badge>} />
        <TrackCard active={track === 'card_to_card'} onClick={() => setTrack('card_to_card')} icon={<Landmark size={22} />} title="کارت به کارت" desc="انتقال به کارت استودیو و ثبت رسید · فعال‌سازی پس از تأیید" badge={<Badge tone="warning" dot>پس از تأیید</Badge>} />
      </div>
      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between text-[14px]"><span className="text-ink-2">{pkg.title}</span><span className="tabular">{f.toman(pkg.priceToman)}</span></div>
        {pkg.compareAtToman && <div className="mt-1 flex items-center justify-between text-[13px] text-success"><span>تخفیف عضویت</span><span className="tabular">− {f.toman(pkg.compareAtToman - pkg.priceToman)}</span></div>}
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-[16px] font-medium"><span>مبلغ نهایی</span><span className="tabular">{f.toman(pkg.priceToman)}</span></div>
        <p className="mt-4 text-[12px] leading-6 text-muted">با ادامه، <a className="text-brand-700 underline" href="/faq">قوانین لغو و جابه‌جایی</a> والیسان را می‌پذیرید: تغییر جلسه تا ۴ ساعت پیش از شروع امکان‌پذیر است.</p>
        <Button className="mt-5" full size="lg" loading={busy} disabled={!selected} onClick={pay}>{track === 'ipg' ? 'انتقال به درگاه پرداخت' : 'ادامه با کارت به کارت'} <ArrowLeft size={18} /></Button>
      </Card>
    </FunnelShell>
  );
}

function TrackCard({ active, onClick, icon, title, desc, badge }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string; badge: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={`card flex items-start gap-4 p-5 text-start transition-all ${active ? 'border-brand-300 bg-brand-50/60 shadow-brand' : 'hover:border-brand-300'}`}>
      <span className={`grid size-11 shrink-0 place-items-center rounded-full ${active ? 'bg-brand-300 text-ink' : 'bg-surface-2 text-ink-2'}`}>{icon}</span>
      <span className="flex-1"><span className="flex items-center justify-between gap-2"><span className="font-medium">{title}</span>{badge}</span><span className="mt-1 block text-[13px] text-muted">{desc}</span></span>
    </button>
  );
}

export function DoneStep({ slug }: { slug: string }) {
  const pkg = packageBySlug(slug);
  const last = useStore((s) => s.lastCheckout);
  const tx = useStore((s) => s.transactions).find((t) => t.id === last?.transactionId);
  const booking = useStore((s) => s.bookings).find((b) => b.id === last?.bookingId);
  const slot = useStore((s) => s.slots).find((s) => s.id === booking?.slotId);
  const coach = useStore((s) => s.coaches).find((c) => c.id === slot?.coachId);
  const f = useFmt();
  if (!pkg) return <NotFound />;
  const status = tx?.status ?? last?.status;
  const ok = status === 'succeeded' || status === 'approved';
  const pending = status === 'pending_verification';
  return (
    <FunnelShell pkg={pkg} step={4}>
      <Card className="mx-auto max-w-xl p-10 text-center fade-up">
        {ok ? <SuccessMark /> : pending ? <span className="mx-auto grid size-16 place-items-center rounded-full bg-warning/15 text-[#9A6F1E]"><Hourglass size={30} strokeWidth={1.5} /></span> : <span className="mx-auto grid size-16 place-items-center rounded-full bg-danger/10 text-danger"><XCircle size={30} /></span>}
        <h1 className="mt-5 text-[26px] font-light">{ok ? 'عضویت شما فعال شد' : pending ? 'رسید شما در صف بررسی است' : 'پرداخت انجام نشد'}</h1>
        <p className="mt-2 text-[14.5px] leading-7 text-ink-2">
          {ok && 'پرداخت با موفقیت انجام شد. تأیید رزرو از طریق پیامک برای شما ارسال شد.'}
          {pending && 'پس از تأیید مدیریت، عضویت شما فعال و جلسه‌ی رزروشده قطعی می‌شود. نتیجه با پیامک اعلام خواهد شد.'}
          {!ok && !pending && 'می‌توانید دوباره تلاش کنید یا از روش کارت به کارت استفاده کنید.'}
        </p>
        {tx && (
          <div className="mt-6 grid gap-2 rounded-[var(--radius-md)] bg-surface-2 p-4 text-start text-[13px]">
            <Row k="وضعیت" v={<Badge tone={ok ? 'success' : pending ? 'warning' : 'danger'}>{TX_STATUS_LABEL[tx.status]}</Badge>} />
            <Row k="شناسه تراکنش" v={<span className="latin tabular">{tx.id}</span>} />
            {tx.ipg?.refId && <Row k="شماره پیگیری بانک" v={<span className="latin tabular">{f.s(tx.ipg.refId)}</span>} />}
            {tx.cardToCard && <Row k="شماره پیگیری" v={<span className="latin tabular">{f.s(tx.cardToCard.trackingNumber)}</span>} />}
            <Row k="مبلغ" v={<span className="tabular">{f.toman(tx.amountToman)}</span>} />
            {slot && <Row k="جلسه" v={`${f.dt(slot.startsAt)} · ${coach?.displayName ?? ''}`} />}
          </div>
        )}
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {ok || pending ? <Button href="/portal">رفتن به پنل هنرجو <ArrowLeft size={16} /></Button> : <><Button href={`/join/${pkg.slug}/checkout`}>تلاش مجدد</Button><Button href="/pay/card" variant="ghost">کارت به کارت</Button></>}
        </div>
      </Card>
    </FunnelShell>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) { return <div className="flex items-center justify-between gap-3"><span className="text-muted">{k}</span><span>{v}</span></div>; }

export function SuccessMark() {
  return (
    <svg viewBox="0 0 64 64" className="mx-auto size-16" aria-hidden>
      <circle cx="32" cy="32" r="30" fill="#F9EBEA" />
      <circle cx="32" cy="32" r="30" fill="none" stroke="#E8A598" strokeWidth="1.5" />
      <path d="M20 33 L28 41 L44 24" fill="none" stroke="#6E9A7A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="check-draw" />
    </svg>
  );
}

export { CheckCircle2 };
