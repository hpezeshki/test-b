import { addDays, addMinutes, fromJalali, jalaliWeekday, startOfDay, toJalali } from './jalali';
import type { Booking, Coach, ID, Membership, SessionSlot, StudioSettings, Weekday } from './types';

export const ACTIVE_BOOKING_STATUSES = new Set<Booking['status']>(['confirmed', 'pending_verification', 'attended']);
export const SEAT_HOLDING_STATUSES = new Set<Booking['status']>(['confirmed', 'pending_verification']);

const parseHM = (hm: string) => hm.split(':').map(Number) as [number, number];

/** Expand every coach's weekly studio hours into concrete 60-minute slots for [from, from+days). */
export function generateSlots(coaches: Coach[], settings: StudioSettings, from: Date, days: number, idFor: (coachId: ID, start: Date) => ID): SessionSlot[] {
  const out: SessionSlot[] = [];
  const day0 = startOfDay(from);
  for (let i = 0; i < days; i++) {
    const day = addDays(day0, i);
    const weekday = jalaliWeekday(day);
    if (settings.weekend.includes(weekday)) continue;
    const { jy, jm, jd } = toJalali(day);
    for (const coach of coaches) {
      for (const avail of coach.studioHours.filter((a) => a.weekday === weekday)) {
        for (const w of avail.windows) {
          const [sh, sm] = parseHM(w.start);
          const [eh, em] = parseHM(w.end);
          let cursor = fromJalali(jy, jm, jd, sh, sm);
          const end = fromJalali(jy, jm, jd, eh, em);
          while (addMinutes(cursor, 60) <= end) {
            out.push({
              id: idFor(coach.id, cursor),
              coachId: coach.id,
              startsAt: cursor.toISOString(),
              endsAt: addMinutes(cursor, 60).toISOString(),
              weekday: weekday as Weekday,
              sessionType: avail.sessionType,
              modality: avail.modality,
              capacity: coach.capacity[avail.sessionType],
              room: avail.room,
              status: 'open',
            });
            cursor = addMinutes(cursor, 60);
          }
        }
      }
    }
  }
  return out.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export const bookedCount = (slotId: ID, bookings: Booking[]) => bookings.filter((b) => b.slotId === slotId && SEAT_HOLDING_STATUSES.has(b.status)).length;
export const remainingSeats = (slot: SessionSlot, bookings: Booking[]) => Math.max(0, slot.capacity - bookedCount(slot.id, bookings));
export const isFull = (slot: SessionSlot, bookings: Booking[]) => remainingSeats(slot, bookings) === 0;

export const cutoffAt = (slot: SessionSlot, settings: StudioSettings) => new Date(new Date(slot.startsAt).getTime() - settings.modificationCutoffHours * 3_600_000);
export const canModify = (slot: SessionSlot, settings: StudioSettings, now: Date) => now < cutoffAt(slot, settings);

export const quotaAvailable = (m: Membership) => m.quotaTotal - m.quotaUsed - m.quotaHeld;

export type BookingCheck = { ok: true } | { ok: false; reason: string };

export function validateBooking(args: { userId: ID; membership: Membership | undefined; slot: SessionSlot | undefined; bookings: Booking[]; slots: SessionSlot[]; now: Date; ignoreBookingId?: ID }): BookingCheck {
  const { userId, membership, slot, bookings, slots, now, ignoreBookingId } = args;
  if (!slot || slot.status !== 'open') return { ok: false, reason: 'این زمان در دسترس نیست.' };
  if (new Date(slot.startsAt) <= now) return { ok: false, reason: 'این زمان گذشته است.' };
  if (!membership) return { ok: false, reason: 'عضویت فعالی یافت نشد.' };
  if (membership.status !== 'active' && membership.status !== 'pending_payment') return { ok: false, reason: 'عضویت شما فعال نیست.' };
  if (new Date(slot.startsAt) > new Date(membership.expiresAt)) return { ok: false, reason: 'این زمان خارج از اعتبار عضویت شماست.' };
  if (ignoreBookingId === undefined && quotaAvailable(membership) <= 0) return { ok: false, reason: 'سهمیه جلسات شما تکمیل شده است.' };
  if (isFull(slot, bookings)) return { ok: false, reason: 'ظرفیت این جلسه تکمیل است.' };
  const slotById = new Map(slots.map((s) => [s.id, s]));
  const overlap = bookings.some((b) => {
    if (b.userId !== userId || b.id === ignoreBookingId || !SEAT_HOLDING_STATUSES.has(b.status) || b.slotId === slot.id) return false;
    const other = slotById.get(b.slotId);
    return !!other && other.startsAt < slot.endsAt && slot.startsAt < other.endsAt;
  });
  if (overlap) return { ok: false, reason: 'شما در همین زمان جلسه دیگری دارید.' };
  return { ok: true };
}

export const slotIdFor = (coachId: ID, start: Date) => `slot_${coachId}@${start.toISOString()}`;
