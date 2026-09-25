import { describe, expect, it } from 'vitest';
import { canModify, generateSlots, remainingSeats, slotIdFor, validateBooking } from '@/domain/scheduling';
import { formatJalali, fromJalali, jalaliWeekday, toJalali } from '@/domain/jalali';
import { COACHES } from '@/data/seed/coaches';
import { SETTINGS } from '@/data/seed/users';
import { buildSeed } from '@/data/seed/build';
import type { Booking, Membership } from '@/domain/types';

describe('jalali', () => {
  it('converts 2026-09-25 to 1405/07/03 (جمعه)', () => {
    const d = new Date(2026, 8, 25, 10, 0);
    expect(toJalali(d)).toEqual({ jy: 1405, jm: 7, jd: 3 });
    expect(jalaliWeekday(d)).toBe(6);
    expect(formatJalali(d, 'long', 'latin')).toBe('جمعه 3 مهر 1405');
  });
  it('round-trips Nowruz 1405', () => {
    const d = fromJalali(1405, 1, 1);
    expect(d.getFullYear()).toBe(2026); expect(d.getMonth()).toBe(2); expect(d.getDate()).toBe(21);
  });
});

describe('scheduling engine', () => {
  const from = new Date(2026, 8, 26, 0, 0); // شنبه ۴ مهر ۱۴۰۵
  const slots = generateSlots(COACHES, SETTINGS, from, 7, slotIdFor);
  it('skips Friday and respects coach hours', () => {
    expect(slots.some((s) => s.weekday === 6)).toBe(false);
    const c1Sat = slots.filter((s) => s.coachId === 'c1' && s.weekday === 0);
    expect(c1Sat.map((s) => new Date(s.startsAt).getHours())).toEqual([9, 10, 11, 12]);
    expect(c1Sat[0].capacity).toBe(3);
  });
  it('enforces capacity and cutoff', () => {
    const slot = slots.find((s) => s.coachId === 'c1' && s.sessionType === 'semi_private')!;
    const m: Membership = { id: 'm', userId: 'u', packageId: 'p_12', startsAt: from.toISOString(), expiresAt: new Date(from.getTime() + 30 * 864e5).toISOString(), quotaTotal: 12, quotaUsed: 0, quotaHeld: 0, status: 'active', transactionId: 't' };
    const mk = (uid: string): Booking => ({ id: 'b' + uid, userId: uid, membershipId: 'm', slotId: slot.id, coachId: 'c1', status: 'confirmed', bookedAt: from.toISOString(), reminders: { sent2hBefore: false } });
    const now = new Date(from.getTime() - 864e5);
    expect(validateBooking({ userId: 'u', membership: m, slot, bookings: [], slots, now }).ok).toBe(true);
    const full = [mk('a'), mk('b'), mk('c')];
    expect(remainingSeats(slot, full)).toBe(0);
    expect(validateBooking({ userId: 'u', membership: m, slot, bookings: full, slots, now })).toMatchObject({ ok: false, reason: 'ظرفیت این جلسه تکمیل است.' });
    expect(validateBooking({ userId: 'u', membership: { ...m, quotaUsed: 12 }, slot, bookings: [], slots, now }).ok).toBe(false);
    const start = new Date(slot.startsAt);
    expect(canModify(slot, SETTINGS, new Date(start.getTime() - 5 * 36e5))).toBe(true);
    expect(canModify(slot, SETTINGS, new Date(start.getTime() - 3 * 36e5))).toBe(false);
  });
  it('rejects overlapping bookings for the same student', () => {
    const a = slots.find((s) => s.coachId === 'c1' && s.weekday === 0)!;
    const b = slots.find((s) => s.coachId !== 'c1' && s.startsAt === a.startsAt);
    if (!b) return;
    const m: Membership = { id: 'm', userId: 'u', packageId: 'p_12', startsAt: from.toISOString(), expiresAt: new Date(from.getTime() + 30 * 864e5).toISOString(), quotaTotal: 12, quotaUsed: 1, quotaHeld: 0, status: 'active', transactionId: 't' };
    const existing: Booking = { id: 'x', userId: 'u', membershipId: 'm', slotId: a.id, coachId: 'c1', status: 'confirmed', bookedAt: from.toISOString(), reminders: { sent2hBefore: false } };
    expect(validateBooking({ userId: 'u', membership: m, slot: b, bookings: [existing], slots, now: new Date(from.getTime() - 864e5) }).ok).toBe(false);
  });
});

describe('seed', () => {
  it('builds a consistent demo world', () => {
    const s = buildSeed(new Date(2026, 8, 25, 14, 0));
    expect(s.coaches).toHaveLength(4);
    expect(s.packages).toHaveLength(4);
    const demoMem = s.memberships.find((m) => m.userId === 'u_student')!;
    const used = s.bookings.filter((b) => b.membershipId === demoMem.id && ['confirmed', 'attended', 'no_show'].includes(b.status)).length;
    expect(demoMem.quotaUsed).toBe(used);
    for (const slot of s.slots) expect(remainingSeats(slot, s.bookings)).toBeGreaterThanOrEqual(0);
    expect(s.transactions.filter((t) => t.status === 'pending_verification')).toHaveLength(2);
  });
});
