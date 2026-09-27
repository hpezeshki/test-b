'use client';
import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, UserCheck, UserX, Users } from 'lucide-react';
import { useStore } from '@/data/store';
import { useFmt, useNow, useSessionUser } from '@/lib/hooks';
import { RoleGuard } from '@/lib/rbac';
import { WEEKDAYS, addDays, sameDay, startOfWeek } from '@/domain/jalali';
import { MODALITY_LABEL, SESSION_TYPE_LABEL } from '@/domain/labels';
import { SEAT_HOLDING_STATUSES } from '@/domain/scheduling';
import type { SessionSlot } from '@/domain/types';
import { Avatar, Badge, Button, Card, Empty, Stat } from '@/components/ui';
import { cn } from '@/lib/cn';

export function CoachDashboard() { return <RoleGuard allow={['coach', 'super_admin']} next="/coach"><Inner /></RoleGuard>; }

function Inner() {
  const user = useSessionUser()!;
  const f = useFmt();
  const now = useNow();
  const coaches = useStore((s) => s.coaches);
  const slots = useStore((s) => s.slots);
  const bookings = useStore((s) => s.bookings);
  const users = useStore((s) => s.users);
  const settings = useStore((s) => s.settings);
  const mark = useStore((s) => s.markAttendance);
  const coach = coaches.find((c) => c.userId === user.id) ?? coaches[0];
  const [weekOffset, setWeekOffset] = useState(0);
  const [sel, setSel] = useState<SessionSlot | null>(null);
  const weekStart = addDays(startOfWeek(now), weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const mySlots = useMemo(() => slots.filter((s) => s.coachId === coach.id), [slots, coach.id]);
  const seatOf = (slotId: string) => bookings.filter((b) => b.slotId === slotId && SEAT_HOLDING_STATUSES.has(b.status));
  const todaySlots = mySlots.filter((s) => sameDay(new Date(s.startsAt), now));
  const weekBooked = mySlots.filter((s) => new Date(s.startsAt) >= weekStart && new Date(s.startsAt) < addDays(weekStart, 7)).reduce((n, s) => n + seatOf(s.id).length, 0);
  const clients = useMemo(() => users.filter((u) => u.role === 'student' && u.assignedCoachIds.includes(coach.id)), [users, coach.id]);
  const selected = sel ?? todaySlots.find((s) => new Date(s.endsAt) > now) ?? todaySlots[0] ?? null;
  const manifest = selected ? bookings.filter((b) => b.slotId === selected.id && (SEAT_HOLDING_STATUSES.has(b.status) || b.status === 'attended' || b.status === 'no_show')).map((b) => ({ b, u: users.find((x) => x.id === b.userId)! })) : [];

  return (
    <section className="container-x py-10 md:py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div><div className="eyebrow">Coach Portal</div><h1 className="mt-1 text-[28px] font-light md:text-[34px]">برنامه {coach.displayName}</h1><p className="text-[13.5px] text-muted">{f.d(now, 'long')} · ساعت {f.t(now)}</p></div>
        <div className="flex gap-2"><Badge tone="brand">{SESSION_TYPE_LABEL[coach.studioHours[0].sessionType]} تا {f.s(coach.capacity[coach.studioHours[0].sessionType])} نفر</Badge></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="جلسات امروز" value={f.s(todaySlots.length)} sub={`${f.s(todaySlots.reduce((n, s) => n + seatOf(s.id).length, 0))} هنرجو`} tone="brand" />
        <Stat label="رزروهای این هفته" value={f.s(weekBooked)} sub="صندلی پرشده" />
        <Stat label="هنرجویان فعال" value={f.s(clients.length)} sub="اختصاص داده‌شده به شما" />
      </div>

      <Card className="mt-8 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <button onClick={() => setWeekOffset((w) => w - 1)} className="grid size-9 place-items-center rounded-full hover:bg-brand-50" aria-label="هفته قبل"><ChevronRight size={18} /></button>
          <div className="text-[14px] font-medium">هفته {f.d(weekStart, 'dayMonth')} تا {f.d(addDays(weekStart, 6), 'dayMonth')}{weekOffset === 0 && <span className="ms-2 text-[12px] text-muted">(هفته جاری)</span>}</div>
          <button onClick={() => setWeekOffset((w) => w + 1)} className="grid size-9 place-items-center rounded-full hover:bg-brand-50" aria-label="هفته بعد"><ChevronLeft size={18} /></button>
        </div>
        <div className="grid grid-cols-7 divide-x divide-x-reverse divide-border overflow-x-auto">
          {days.map((d, i) => {
            const ds = mySlots.filter((s) => sameDay(new Date(s.startsAt), d));
            const isToday = sameDay(d, now);
            const off = settings.weekend.includes(i as 0);
            return (
              <div key={i} className={cn('min-w-[110px] p-2', isToday && 'bg-brand-50/50', off && 'hatch')}>
                <div className={cn('mb-2 text-center text-[12px]', isToday ? 'font-medium text-brand-700' : 'text-muted')}>{WEEKDAYS[i]}<div className="tabular text-[14px] text-ink">{f.d(d, 'dayMonth').split(' ')[0]}</div></div>
                <div className="space-y-1.5">
                  {ds.map((s) => {
                    const n = seatOf(s.id).length; const past = new Date(s.endsAt) < now; const full = n >= s.capacity;
                    return (
                      <button key={s.id} onClick={() => setSel(s)} className={cn('w-full rounded-[var(--radius-xs)] border px-1.5 py-1 text-start text-[11px] transition-colors', selected?.id === s.id ? 'border-brand-300 bg-brand-100' : 'border-border bg-surface hover:bg-brand-50', past && 'opacity-50')}>
                        <div className="flex items-center justify-between"><span className="tabular font-medium">{f.t(s.startsAt)}</span><span className={cn('tabular', full ? 'text-danger' : n === 0 ? 'text-muted' : 'text-success')}>{f.s(n)}/{f.s(s.capacity)}</span></div>
                        <div className="truncate text-muted">{MODALITY_LABEL[s.modality]}</div>
                      </button>
                    );
                  })}
                  {ds.length === 0 && !off && <div className="py-3 text-center text-[11px] text-muted/60">—</div>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="p-6">
          {selected ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div><div className="text-[12px] text-muted">لیست حاضرین</div><div className="text-[17px] font-medium">{f.dt(selected.startsAt)}</div><div className="text-[13px] text-ink-2">{MODALITY_LABEL[selected.modality]} · {SESSION_TYPE_LABEL[selected.sessionType]} · {selected.room}</div></div>
                <Badge tone={manifest.length >= selected.capacity ? 'danger' : 'success'} dot><Users size={12} /> {f.s(manifest.length)} از {f.s(selected.capacity)} صندلی</Badge>
              </div>
              <ul className="mt-5 divide-y divide-border">
                {manifest.length === 0 && <li className="py-8 text-center text-[13px] text-muted">هنوز کسی این جلسه را رزرو نکرده است.</li>}
                {manifest.map(({ b, u }) => (
                  <li key={b.id} className="flex flex-wrap items-center gap-3 py-3">
                    <Avatar name={`${u.firstName} ${u.lastName}`} hue="354" size={38} />
                    <div className="min-w-0 flex-1"><div className="text-[14px] font-medium">{u.firstName} {u.lastName}</div><div className="text-[12px] text-muted">سطح: {u.levelLabel ?? '—'} · {f.s(u.phone)}</div></div>
                    {b.status === 'attended' ? <Badge tone="success" dot>حضور</Badge> : b.status === 'no_show' ? <Badge tone="danger" dot>غیبت</Badge> : b.status === 'pending_verification' ? <Badge tone="warning" dot>در انتظار پرداخت</Badge> : (
                      new Date(selected.startsAt) <= new Date(now.getTime() + 15 * 60_000) ? (
                        <div className="flex gap-1.5"><Button size="sm" variant="secondary" onClick={() => mark(b.id, 'attended')}><UserCheck size={14} /> حضور</Button><Button size="sm" variant="danger" onClick={() => mark(b.id, 'no_show')}><UserX size={14} /> غیبت</Button></div>
                      ) : <Badge tone="success" dot>تأیید شده</Badge>
                    )}
                  </li>
                ))}
              </ul>
            </>
          ) : <Empty title="جلسه‌ای انتخاب نشده" desc="از جدول هفتگی یک جلسه را انتخاب کنید." />}
        </Card>
        <Card className="p-6">
          <div className="mb-3 text-[15px] font-medium">هنرجویان شما</div>
          <ul className="divide-y divide-border">
            {clients.map((u) => {
              const nxt = bookings.filter((b) => b.userId === u.id && b.coachId === coach.id && b.status === 'confirmed').map((b) => slots.find((s) => s.id === b.slotId)!).filter((s) => s && new Date(s.startsAt) > now).sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];
              return (
                <li key={u.id} className="flex items-center gap-3 py-2.5">
                  <Avatar name={`${u.firstName} ${u.lastName}`} hue="10" size={34} />
                  <div className="min-w-0 flex-1"><div className="text-[13.5px] font-medium">{u.firstName} {u.lastName}</div><div className="text-[11.5px] text-muted">{nxt ? `جلسه بعدی: ${f.d(nxt.startsAt, 'weekday')} ${f.t(nxt.startsAt)}` : 'بدون جلسه آینده'}</div></div>
                  <Badge tone="neutral">{u.levelLabel ?? '—'}</Badge>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </section>
  );
}
