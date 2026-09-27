'use client';
import { useMemo, useState } from 'react';
import { Lock, Users } from 'lucide-react';
import { useStore } from '@/data/store';
import { useFmt, useNow } from '@/lib/hooks';
import { remainingSeats, SEAT_HOLDING_STATUSES } from '@/domain/scheduling';
import { addDays, sameDay, startOfDay } from '@/domain/jalali';
import { MODALITY_LABEL, SESSION_TYPE_LABEL } from '@/domain/labels';
import type { ID, SessionSlot } from '@/domain/types';
import { cn } from '@/lib/cn';
import { Avatar, Chip } from '@/components/ui';
import { coachPhotos } from '@/data/seed/images';
import { JalaliMonthPicker } from './JalaliMonthPicker';

export interface SlotPickerProps {
  selectedId?: ID;
  onSelect: (slot: SessionSlot) => void;
  /** Only allow slots after this instant (defaults to now). */
  minStart?: Date;
  maxDate?: Date;
  initialCoachId?: ID;
  userId?: ID | null;
  title?: string;
}

/** Jalali month picker → per-day slot chips grouped by coach, with live seat availability. */
export function SlotPicker({ selectedId, onSelect, minStart, maxDate, initialCoachId, userId, title }: SlotPickerProps) {
  const slots = useStore((s) => s.slots);
  const bookings = useStore((s) => s.bookings);
  const coaches = useStore((s) => s.coaches);
  const weekend = useStore((s) => s.settings.weekend);
  const now = useNow();
  const f = useFmt();
  const [coachId, setCoachId] = useState<ID | 'all'>(initialCoachId ?? 'all');
  const [day, setDay] = useState<Date | null>(null);
  const min = minStart ?? now;
  const max = maxDate ?? addDays(now, 45);

  const seatMap = useMemo(() => new Map(slots.map((s) => [s.id, remainingSeats(s, bookings)])), [slots, bookings]);
  const mineSlotIds = useMemo(() => new Set(bookings.filter((b) => b.userId === userId && SEAT_HOLDING_STATUSES.has(b.status)).map((b) => b.slotId)), [bookings, userId]);

  const visible = useMemo(() => slots.filter((s) => s.status === 'open' && (coachId === 'all' || s.coachId === coachId) && new Date(s.startsAt) > min && new Date(s.startsAt) <= max), [slots, coachId, min, max]);
  const firstAvailableDay = useMemo(() => { const s = visible.find((x) => (seatMap.get(x.id) ?? 0) > 0); return s ? startOfDay(new Date(s.startsAt)) : startOfDay(now); }, [visible, seatMap, now]);
  const selectedDay = day ?? firstAvailableDay;
  const daySlots = useMemo(() => visible.filter((s) => sameDay(new Date(s.startsAt), selectedDay)), [visible, selectedDay]);
  const byCoach = useMemo(() => coaches.filter((c) => coachId === 'all' || c.id === coachId).map((c) => ({ coach: c, slots: daySlots.filter((s) => s.coachId === c.id) })).filter((g) => g.slots.length), [coaches, daySlots, coachId]);

  const meta = (d: Date) => ({
    available: visible.filter((s) => sameDay(new Date(s.startsAt), d) && (seatMap.get(s.id) ?? 0) > 0).length,
    hasBooking: slots.some((s) => mineSlotIds.has(s.id) && sameDay(new Date(s.startsAt), d)),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="card p-4 lg:p-5 h-fit">
        {title && <div className="mb-3 font-medium">{title}</div>}
        <div className="mb-4 flex flex-wrap gap-2">
          <Chip selected={coachId === 'all'} onClick={() => setCoachId('all')} className="!py-1.5 !px-3 text-[13px]">همه مربیان</Chip>
          {coaches.map((c) => <Chip key={c.id} selected={coachId === c.id} onClick={() => setCoachId(c.id)} className="!py-1.5 !px-3 text-[13px]">{c.displayName}</Chip>)}
        </div>
        <JalaliMonthPicker value={selectedDay} onChange={setDay} now={now} minDate={min} maxDate={max} weekend={weekend} meta={meta} compact />
      </div>

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="font-medium">{f.d(selectedDay, 'long')}</div>
          <div className="text-[12px] text-muted">{f.s(daySlots.length)} زمان</div>
        </div>
        {byCoach.length === 0 && <div className="card border-dashed p-10 text-center text-[14px] text-muted">در این روز زمانی برای انتخاب شما وجود ندارد. روز دیگری را انتخاب کنید.</div>}
        {byCoach.map(({ coach, slots: cs }) => (
          <div key={coach.id} className="card p-4 md:p-5 fade-up">
            <div className="mb-3 flex items-center gap-3">
              <Avatar name={coach.displayName} hue={coach.accent} size={38} srcs={coachPhotos(coach.id)} />
              <div><div className="text-[14px] font-medium">{coach.displayName}</div><div className="text-[12px] text-muted">{coach.title}</div></div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {cs.map((s) => {
                const left = seatMap.get(s.id) ?? 0;
                const mine = mineSlotIds.has(s.id);
                const full = left === 0;
                const sel = s.id === selectedId;
                const disabled = full || mine;
                return (
                  <button key={s.id} type="button" disabled={disabled} onClick={() => onSelect(s)} aria-pressed={sel}
                    className={cn('press group relative min-h-[76px] rounded-[var(--radius-md)] border p-3.5 text-start transition-all duration-200',
                      sel ? 'border-brand-300 bg-gradient-to-br from-brand-100 to-brand-50 shadow-glow' : 'border-border bg-white/70 hover:border-brand-300 hover:bg-brand-50/60',
                      full && 'bg-surface-2 text-muted cursor-not-allowed hover:border-border hover:bg-surface-2',
                      mine && 'border-success/40 bg-success/5 cursor-default',
                      !full && !mine && left === 1 && !sel && 'border-warning/60')}>
                    <div className="flex items-center justify-between">
                      <span className={cn('text-[16px] font-medium tabular', full && 'line-through')}>{f.t(s.startsAt)}</span>
                      {mine ? <span className="text-[11px] text-success">رزرو شما</span> : full ? <span className="flex items-center gap-1 text-[11px]"><Lock size={12} /> تکمیل</span> : (
                        <span className={cn('flex items-center gap-1 text-[11px]', left === 1 ? 'text-[#9A6F1E]' : 'text-muted')}><Users size={12} /> {f.s(left)} از {f.s(s.capacity)} صندلی</span>
                      )}
                    </div>
                    <div className="mt-1 text-[12px] text-ink-2">{MODALITY_LABEL[s.modality]} · {SESSION_TYPE_LABEL[s.sessionType]}</div>
                    <div className="text-[11px] text-muted">{s.room}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
