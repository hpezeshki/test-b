'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarPlus, ClipboardCheck, Quote } from 'lucide-react';
import { useStore } from '@/data/store';
import { useFmt, useNow, useSessionUser } from '@/lib/hooks';
import { RoleGuard } from '@/lib/rbac';
import { FITNESS_LEVEL_LABEL, MEMBERSHIP_STATUS_LABEL, MODALITY_LABEL } from '@/domain/labels';
import type { Booking, SessionSlot } from '@/domain/types';
import { Avatar, Badge, Button, Card, Empty, Modal, Progress } from '@/components/ui';
import { coachPhotos } from '@/data/seed/images';
import { SlotPicker } from '@/components/calendar/SlotPicker';
import { BookingCard } from './BookingCard';

export function StudentDashboard() {
  return <RoleGuard allow={['student']} next="/portal"><Inner /></RoleGuard>;
}

function Inner() {
  const user = useSessionUser()!;
  const f = useFmt();
  const now = useNow();
  const memberships = useStore((s) => s.memberships);
  const packages = useStore((s) => s.packages);
  const bookings = useStore((s) => s.bookings);
  const slots = useStore((s) => s.slots);
  const coaches = useStore((s) => s.coaches);
  const settings = useStore((s) => s.settings);
  const assessments = useStore((s) => s.healthAssessments);
  const bookSlot = useStore((s) => s.bookSlot);
  const cancelBooking = useStore((s) => s.cancelBooking);
  const rescheduleBooking = useStore((s) => s.rescheduleBooking);
  const [bookOpen, setBookOpen] = useState(false);
  const [resched, setResched] = useState<Booking | null>(null);
  const [cancel, setCancel] = useState<Booking | null>(null);
  const [pick, setPick] = useState<SessionSlot | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const membership = useMemo(() => memberships.filter((m) => m.userId === user.id && (m.status === 'active' || m.status === 'pending_payment') && new Date(m.expiresAt) > now).sort((a, b) => b.startsAt.localeCompare(a.startsAt))[0], [memberships, user.id, now]);
  const pkg = packages.find((p) => p.id === membership?.packageId);
  const slotById = useMemo(() => new Map(slots.map((s) => [s.id, s])), [slots]);
  const mine = useMemo(() => bookings.filter((b) => b.userId === user.id).map((b) => ({ b, slot: slotById.get(b.slotId)! })).filter((x) => x.slot), [bookings, user.id, slotById]);
  const upcoming = mine.filter(({ b, slot }) => new Date(slot.startsAt) > now && (b.status === 'confirmed' || b.status === 'pending_verification')).sort((a, b) => a.slot.startsAt.localeCompare(b.slot.startsAt));
  const history = mine.filter((x) => !upcoming.includes(x)).sort((a, b) => b.slot.startsAt.localeCompare(a.slot.startsAt));
  const assessment = assessments.find((h) => h.userId === user.id);
  const coach = coaches.find((c) => c.id === user.assignedCoachIds[0]);
  const remaining = membership ? membership.quotaTotal - membership.quotaUsed - membership.quotaHeld : 0;
  const daysLeft = membership ? Math.max(0, Math.ceil((new Date(membership.expiresAt).getTime() - now.getTime()) / 864e5)) : 0;
  const attended = mine.filter((x) => x.b.status === 'attended').length;

  const flash = (t: string) => { setMsg(t); setTimeout(() => setMsg(null), 3500); };
  const doBook = () => { if (!pick) return; const r = bookSlot(pick.id); if (r.ok) { setBookOpen(false); setPick(null); } else flash(r.reason ?? 'خطا'); };
  const doResched = () => { if (!resched || !pick) return; const r = rescheduleBooking(resched.id, pick.id); if (r.ok) { setResched(null); setPick(null); } else flash(r.reason ?? 'خطا'); };
  const doCancel = () => { if (!cancel) return; const r = cancelBooking(cancel.id); if (!r.ok) flash(r.reason ?? 'خطا'); setCancel(null); };

  return (
    <section className="container-x py-10 md:py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div><div className="eyebrow">Student Portal</div><h1 className="mt-1 text-[28px] font-light md:text-[34px]">سلام {user.firstName}، خوش آمدی</h1><p className="text-[13.5px] text-muted">{f.d(now, 'long')}</p></div>
        <Button onClick={() => { setPick(null); setBookOpen(true); }} disabled={!membership || remaining <= 0}><CalendarPlus size={18} /> رزرو جلسه جدید</Button>
      </div>
      {msg && <div className="mb-4 rounded-[var(--radius-md)] border border-danger/40 bg-danger/8 p-3 text-[13.5px] text-danger fade-up">{msg}</div>}

      <div className="grid gap-5 md:grid-cols-3">
        <Card className="p-6 md:col-span-1">
          <div className="flex items-center justify-between"><div className="text-[12px] text-muted">عضویت فعال</div>{membership && <Badge tone={membership.status === 'active' ? 'success' : 'warning'} dot>{MEMBERSHIP_STATUS_LABEL[membership.status]}</Badge>}</div>
          {membership && pkg ? (
            <>
              <div className="mt-1 text-[18px] font-medium">{pkg.title}</div>
              <div className="mt-5 flex items-end justify-between"><span className="text-[34px] font-light leading-none tabular">{f.s(remaining)}</span><span className="text-[13px] text-muted">از {f.s(membership.quotaTotal)} جلسه باقی‌مانده</span></div>
              <Progress value={(remaining / membership.quotaTotal) * 100} className="mt-3" />
              <div className="mt-3 flex items-center justify-between text-[12px] text-muted"><span>اعتبار تا {f.d(membership.expiresAt, 'weekday')}</span><span className="tabular">{f.s(daysLeft)} روز</span></div>
              {membership.quotaHeld > 0 && <div className="mt-2 text-[12px] text-[#9A6F1E]">{f.s(membership.quotaHeld)} جلسه در انتظار تأیید پرداخت</div>}
            </>
          ) : (
            <Empty title="عضویت فعالی ندارید" action={<Button href="/pricing" size="sm">انتخاب بسته</Button>} />
          )}
        </Card>
        <Card className="p-6">
          <div className="text-[12px] text-muted">مربی شما</div>
          {coach ? (
            <div className="mt-3 flex items-center gap-4">
              <Avatar name={coach.displayName} hue={coach.accent} size={60} srcs={coachPhotos(coach.id)} />
              <div><div className="text-[16px] font-medium">{coach.displayName}</div><div className="text-[12.5px] text-muted">{coach.title}</div><Link prefetch={false} href={`/coaches/${coach.slug}`} className="mt-1 block text-[12px] text-brand-700 hover:underline">مشاهده پروفایل</Link></div>
            </div>
          ) : <div className="mt-3 text-[13px] text-muted">پس از اولین رزرو، مربی شما اینجا نمایش داده می‌شود.</div>}
          <div className="mt-4 grid grid-cols-2 gap-2 text-center text-[12px]">
            <div className="rounded-[var(--radius-sm)] bg-surface-2 p-2"><div className="text-[18px] font-medium tabular">{f.s(attended)}</div><div className="text-muted">جلسه برگزارشده</div></div>
            <div className="rounded-[var(--radius-sm)] bg-surface-2 p-2"><div className="text-[18px] font-medium tabular">{f.s(upcoming.length)}</div><div className="text-muted">جلسه پیش رو</div></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between"><div className="text-[12px] text-muted">پرونده سلامت</div>{assessment && <Badge tone={assessment.reviewedBy ? 'success' : 'warning'} dot>{assessment.reviewedBy ? 'بررسی شده' : 'در انتظار بررسی'}</Badge>}</div>
          {assessment ? (
            <>
              <div className="mt-2 flex items-center gap-2 text-[14px]"><ClipboardCheck size={16} className="text-success" /> ثبت‌شده در {f.d(assessment.submittedAt, 'weekday')}</div>
              <div className="mt-2 text-[13px] text-ink-2">سطح اعلام‌شده: {FITNESS_LEVEL_LABEL[assessment.fitnessLevel]}</div>
              {assessment.reviewedBy && <div className="mt-2 rounded-[var(--radius-sm)] bg-brand-50 p-3 text-[12.5px] leading-6"><Quote size={13} className="inline text-brand-700" /> نظر کادر تخصصی: {assessment.reviewedBy.note}</div>}
              <Link prefetch={false} href={`/join/${pkg?.slug ?? 'monthly-12'}/assessment/`} className="mt-3 block text-[12px] text-brand-700 hover:underline">به‌روزرسانی پاسخ‌ها</Link>
            </>
          ) : <div className="mt-3 text-[13px] text-muted">هنوز فرم ارزیابی سلامت را تکمیل نکرده‌اید.</div>}
        </Card>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-[18px] font-medium">جلسات پیش رو <span className="text-[13px] font-normal text-muted">({f.s(upcoming.length)})</span></h2>
          <div className="space-y-3">
            {upcoming.length === 0 && <Empty title="جلسه‌ای رزرو نشده" desc="از دکمه «رزرو جلسه جدید» زمان مناسب را انتخاب کنید." />}
            {upcoming.map(({ b, slot }) => <BookingCard key={b.id} booking={b} slot={slot} coach={coaches.find((c) => c.id === slot.coachId)} settings={settings} now={now} onReschedule={() => { setPick(null); setResched(b); }} onCancel={() => setCancel(b)} />)}
          </div>
        </div>
        <div>
          <h2 className="mb-4 text-[18px] font-medium">سوابق <span className="text-[13px] font-normal text-muted">({f.s(history.length)})</span></h2>
          <div className="space-y-3">
            {history.length === 0 && <Empty title="هنوز سابقه‌ای ثبت نشده" />}
            {history.slice(0, 8).map(({ b, slot }) => <BookingCard key={b.id} booking={b} slot={slot} coach={coaches.find((c) => c.id === slot.coachId)} settings={settings} now={now} />)}
          </div>
        </div>
      </div>

      <Modal open={bookOpen} onClose={() => setBookOpen(false)} title="رزرو جلسه جدید" width="max-w-5xl">
        <SlotPicker selectedId={pick?.id} onSelect={setPick} userId={user.id} initialCoachId={coach?.id} maxDate={membership ? new Date(membership.expiresAt) : undefined} />
        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <div className="text-[13px] text-muted">{pick ? <>{f.dt(pick.startsAt)} · {MODALITY_LABEL[pick.modality]}</> : 'زمانی را انتخاب کنید'}</div>
          <Button disabled={!pick} onClick={doBook}>تأیید رزرو</Button>
        </div>
      </Modal>
      <Modal open={!!resched} onClose={() => setResched(null)} title="جابه‌جایی جلسه" width="max-w-5xl">
        {resched && <div className="mb-4 rounded-[var(--radius-sm)] bg-surface-2 p-3 text-[13px]">جلسه فعلی: {f.dt(slotById.get(resched.slotId)!.startsAt)}</div>}
        <SlotPicker selectedId={pick?.id} onSelect={setPick} userId={user.id} initialCoachId={resched?.coachId} maxDate={membership ? new Date(membership.expiresAt) : undefined} />
        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <div className="text-[13px] text-muted">{pick ? <>زمان جدید: {f.dt(pick.startsAt)}</> : 'زمان جدید را انتخاب کنید'}</div>
          <Button disabled={!pick} onClick={doResched}>تأیید جابه‌جایی</Button>
        </div>
      </Modal>
      <Modal open={!!cancel} onClose={() => setCancel(null)} title="لغو جلسه">
        {cancel && <p className="text-[14px] leading-7 text-ink-2">جلسه {f.dt(slotById.get(cancel.slotId)!.startsAt)} لغو شود؟ یک جلسه به سهمیه شما بازمی‌گردد.</p>}
        <div className="mt-6 flex justify-end gap-2"><Button variant="ghost" onClick={() => setCancel(null)}>انصراف</Button><Button variant="danger" onClick={doCancel}>بله، لغو شود</Button></div>
      </Modal>
    </section>
  );
}
