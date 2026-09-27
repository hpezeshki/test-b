'use client';
import { CalendarClock, Lock, MapPin, RefreshCw, XCircle } from 'lucide-react';
import type { Booking, Coach, SessionSlot, StudioSettings } from '@/domain/types';
import { BOOKING_STATUS_LABEL, MODALITY_LABEL, SESSION_TYPE_LABEL } from '@/domain/labels';
import { canModify, cutoffAt } from '@/domain/scheduling';
import { sameDay } from '@/domain/jalali';
import { useFmt } from '@/lib/hooks';
import { Avatar, Badge, Button, type Tone } from '@/components/ui';
import { coachPhotos } from '@/data/seed/images';
import { cn } from '@/lib/cn';

const TONE: Record<Booking['status'], Tone> = { confirmed: 'success', pending_verification: 'warning', attended: 'success', no_show: 'danger', cancelled_by_student: 'neutral', cancelled_by_studio: 'neutral', rescheduled: 'info' };

export function BookingCard({ booking, slot, coach, settings, now, onReschedule, onCancel }: { booking: Booking; slot: SessionSlot; coach?: Coach; settings: StudioSettings; now: Date; onReschedule?: () => void; onCancel?: () => void }) {
  const f = useFmt();
  const start = new Date(slot.startsAt);
  const upcoming = start > now && (booking.status === 'confirmed' || booking.status === 'pending_verification');
  const modifiable = upcoming && canModify(slot, settings, now);
  const locked = upcoming && !modifiable;
  const today = sameDay(start, now);
  const past = booking.status === 'attended' || booking.status === 'no_show';
  const cancelled = booking.status.startsWith('cancelled') || booking.status === 'rescheduled';
  return (
    <div className={cn('card p-4 md:p-5 transition-all', today && upcoming && 'glass ring-1 ring-brand-300/70 shadow-glow', past && 'bg-surface-2/70 opacity-80', cancelled && 'opacity-60', booking.status === 'pending_verification' && 'border-s-4 border-s-warning')}>
      <div className="flex items-start gap-4">
        <div className="grid w-16 shrink-0 place-items-center rounded-[var(--radius-md)] bg-gradient-to-b from-brand-50 to-lilac-100 py-2 text-center">
          <div className="text-[11px] text-muted">{f.d(start, 'weekday').split(' ')[0]}</div>
          <div className="text-[22px] font-medium leading-none tabular">{f.d(start, 'dayMonth').split(' ')[0]}</div>
          <div className="text-[11px] text-muted">{f.d(start, 'dayMonth').split(' ')[1]}</div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('text-[16px] font-medium tabular', cancelled && 'line-through')}>{f.t(start)} – {f.t(slot.endsAt)}</span>
            {today && upcoming && <Badge tone="gold">امروز</Badge>}
            <Badge tone={locked ? 'neutral' : TONE[booking.status]} dot>{locked ? 'قفل شده' : BOOKING_STATUS_LABEL[booking.status]}</Badge>
          </div>
          <div className="mt-1 text-[13.5px] text-ink-2">{MODALITY_LABEL[slot.modality]} · {SESSION_TYPE_LABEL[slot.sessionType]}</div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted">
            {coach && <span className="flex items-center gap-1.5"><Avatar name={coach.displayName} hue={coach.accent} size={18} srcs={coachPhotos(coach.id)} /> {coach.displayName}</span>}
            <span className="flex items-center gap-1"><MapPin size={12} /> {slot.room}</span>
            {upcoming && <span className="flex items-center gap-1"><CalendarClock size={12} /> {f.rel(start, now)}</span>}
          </div>
          {upcoming && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {modifiable ? (
                <>
                  {booking.status === 'confirmed' && <Button size="sm" variant="secondary" onClick={onReschedule}><RefreshCw size={14} /> جابه‌جایی</Button>}
                  <Button size="sm" variant="danger" onClick={onCancel}><XCircle size={14} /> لغو</Button>
                  <span className="text-[11px] text-muted">مهلت تغییر: تا {f.t(cutoffAt(slot, settings))} {f.d(cutoffAt(slot, settings), 'weekday')}</span>
                </>
              ) : (
                <span className="flex items-center gap-1.5 text-[12px] text-muted"><Lock size={13} /> مهلت تغییر این جلسه ({f.s(settings.modificationCutoffHours)} ساعت قبل از شروع) به پایان رسیده است.</span>
              )}
            </div>
          )}
          {booking.status === 'rescheduled' && <div className="mt-2 text-[12px] text-muted">این جلسه به زمان دیگری منتقل شد.</div>}
          {booking.cancellationReason && booking.status === 'cancelled_by_studio' && <div className="mt-2 text-[12px] text-danger">{booking.cancellationReason}</div>}
        </div>
      </div>
    </div>
  );
}
