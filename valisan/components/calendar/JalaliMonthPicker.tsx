'use client';
import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { WEEKDAYS_SHORT, MONTHS, fromJalali, jalaliMonthLength, jalaliWeekday, sameDay, startOfDay, toJalali } from '@/domain/jalali';
import { useFmt } from '@/lib/hooks';
import { cn } from '@/lib/cn';
import type { Weekday } from '@/domain/types';

export interface DayMeta { available?: number; hasBooking?: boolean; holiday?: string }

export interface JalaliMonthPickerProps {
  value: Date | null;
  onChange: (d: Date) => void;
  now: Date;
  minDate?: Date;
  maxDate?: Date;
  weekend?: Weekday[];
  meta?: (d: Date) => DayMeta;
  compact?: boolean;
}

/** Pure Jalali month grid — columns ش ی د س چ پ ج, months فروردین → اسفند. */
export function JalaliMonthPicker({ value, onChange, now, minDate, maxDate, weekend = [6], meta, compact }: JalaliMonthPickerProps) {
  const f = useFmt();
  const initial = toJalali(value ?? now);
  const [view, setView] = useState({ jy: initial.jy, jm: initial.jm });
  const today = startOfDay(now);
  const min = minDate ? startOfDay(minDate) : today;

  const cells = useMemo(() => {
    const len = jalaliMonthLength(view.jy, view.jm);
    const first = fromJalali(view.jy, view.jm, 1);
    const lead = jalaliWeekday(first);
    const out: Array<Date | null> = Array.from({ length: lead }, () => null);
    for (let d = 1; d <= len; d++) out.push(fromJalali(view.jy, view.jm, d));
    while (out.length % 7) out.push(null);
    return out;
  }, [view]);

  const shift = (n: number) => setView((v) => { let jm = v.jm + n, jy = v.jy; if (jm > 12) { jm = 1; jy++; } if (jm < 1) { jm = 12; jy--; } return { jy, jm }; });
  const canPrev = fromJalali(view.jy, view.jm, 1) > min;
  const canNext = !maxDate || fromJalali(view.jy, view.jm, jalaliMonthLength(view.jy, view.jm)) < maxDate;

  return (
    <div className={cn('select-none', compact ? 'text-[13px]' : 'text-[14px]')}>
      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={() => shift(-1)} disabled={!canPrev} className="press grid size-11 place-items-center rounded-full hover:bg-brand-50 disabled:opacity-30 md:size-9" aria-label="ماه قبل"><ChevronRight size={18} /></button>
        <div className="font-medium">{MONTHS[view.jm - 1]} <span className="tabular text-muted">{f.s(view.jy)}</span></div>
        <button type="button" onClick={() => shift(1)} disabled={!canNext} className="press grid size-11 place-items-center rounded-full hover:bg-brand-50 disabled:opacity-30 md:size-9" aria-label="ماه بعد"><ChevronLeft size={18} /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[12px] text-muted">
        {WEEKDAYS_SHORT.map((w, i) => <div key={w} className={cn('py-1', weekend.includes(i as Weekday) && 'text-brand-500')}>{w}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1" role="grid">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const isPast = d < min || (!!maxDate && d > maxDate);
          const isWeekend = weekend.includes(jalaliWeekday(d));
          const isToday = sameDay(d, today);
          const isSel = !!value && sameDay(d, value);
          const m = meta?.(d) ?? {};
          const disabled = isPast || isWeekend;
          return (
            <button key={i} type="button" role="gridcell" aria-selected={isSel} disabled={disabled} onClick={() => onChange(d)} title={m.holiday}
              className={cn('press relative aspect-square rounded-[var(--radius-sm)] transition-all duration-200 tabular',
                disabled ? 'text-muted/50' : 'hover:bg-brand-50 hover:shadow-[0_0_0_1px_rgba(255,197,254,0.7)]',
                isWeekend && !isPast && 'hatch text-brand-500/70',
                isToday && !isSel && 'ring-1 ring-gold-400 bg-bg',
                isSel && 'bg-gradient-to-br from-brand-300 to-brand-100 text-ink shadow-glow font-medium ring-1 ring-white/80',
                m.holiday && !isSel && 'text-brand-700')}>
              {f.s(toJalali(d).jd)}
              {isToday && <span className="absolute bottom-1 start-1/2 -translate-x-1/2 size-1 rounded-full bg-gold-400" />}
              {!disabled && !isToday && (m.hasBooking ? <span className="absolute bottom-1 start-1/2 -translate-x-1/2 size-1 rounded-full bg-success" /> : m.available ? <span className={cn('absolute bottom-1 start-1/2 -translate-x-1/2 size-1 rounded-full', isSel ? 'bg-ink/50' : 'bg-brand-300')} /> : null)}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
        <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-gold-400" /> امروز</span>
        <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-brand-300" /> زمان خالی</span>
        <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-success" /> رزرو شما</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-4 rounded-sm hatch border border-border" /> تعطیل</span>
      </div>
    </div>
  );
}
