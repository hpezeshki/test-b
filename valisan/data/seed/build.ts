import { addDays, addMinutes, jalaliWeekday } from '@/domain/jalali';
import { renderNotification } from '@/domain/notifications';
import { generateSlots, slotIdFor } from '@/domain/scheduling';
import type { AuditEntry, Booking, Coach, HealthAssessment, Membership, Notification, Package, SessionSlot, StudioSettings, Transaction, User } from '@/domain/types';
import { COACHES } from './coaches';
import { PACKAGES } from './packages';
import { SETTINGS, USERS } from './users';

export const SEED_VERSION = 1;

export interface SeedState {
  seedVersion: number;
  seededAt: string;
  users: User[];
  coaches: Coach[];
  packages: Package[];
  settings: StudioSettings;
  slots: SessionSlot[];
  memberships: Membership[];
  bookings: Booking[];
  transactions: Transaction[];
  healthAssessments: HealthAssessment[];
  notifications: Notification[];
  audit: AuditEntry[];
}

/** Deterministic PRNG so every reset produces the same demo world. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const receiptSvg = (amount: string, ref: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="560" viewBox="0 0 420 560"><rect width="420" height="560" fill="#fff"/><rect x="24" y="24" width="372" height="512" rx="16" fill="#F7F3EE"/><text x="210" y="90" font-size="22" text-anchor="middle" fill="#1E1E1E" font-family="sans-serif">رسید انتقال وجه</text><text x="210" y="130" font-size="14" text-anchor="middle" fill="#8C827A" font-family="sans-serif">همراه بانک — کارت به کارت</text><line x1="48" y1="160" x2="372" y2="160" stroke="#DCD3CB"/><text x="360" y="210" font-size="15" text-anchor="end" fill="#5C544E" font-family="sans-serif">مبلغ: ${amount} ریال</text><text x="360" y="250" font-size="15" text-anchor="end" fill="#5C544E" font-family="sans-serif">به کارت: 6104-3378-9012-4455</text><text x="360" y="290" font-size="15" text-anchor="end" fill="#5C544E" font-family="sans-serif">شماره پیگیری: ${ref}</text><text x="360" y="330" font-size="15" text-anchor="end" fill="#5C544E" font-family="sans-serif">وضعیت: موفق</text><rect x="150" y="400" width="120" height="120" rx="8" fill="#fff" stroke="#DCD3CB"/><text x="210" y="465" font-size="12" text-anchor="middle" fill="#8C827A" font-family="sans-serif">QR</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export function buildSeed(now: Date): SeedState {
  const rnd = mulberry32(1405);
  const iso = (d: Date) => d.toISOString();
  const pkg = (slug: Package['slug']) => PACKAGES.find((p) => p.slug === slug)!;
  const coachC1 = COACHES[0];

  const slots = generateSlots(COACHES, SETTINGS, addDays(now, -21), 70, slotIdFor);
  const memberships: Membership[] = [];
  const bookings: Booking[] = [];
  const transactions: Transaction[] = [];
  const notifications: Notification[] = [];
  const audit: AuditEntry[] = [];
  const healthAssessments: HealthAssessment[] = [];
  let seq = 100;
  const nid = (p: string) => `${p}_${(seq++).toString(36).toUpperCase().padStart(4, '0')}`;

  const addTx = (t: Omit<Transaction, 'id' | 'audit'>): Transaction => {
    const tx: Transaction = { id: nid('tx'), audit: [{ at: t.createdAt, by: 'system', from: 'initiated', to: t.status }], ...t };
    transactions.push(tx);
    return tx;
  };
  const addMembership = (userId: string, p: Package, startsAt: Date, status: Membership['status'], txId: string): Membership => {
    const m: Membership = { id: nid('mem'), userId, packageId: p.id, startsAt: iso(startsAt), expiresAt: iso(addDays(startsAt, p.validityDays)), quotaTotal: p.sessionQuota, quotaUsed: 0, quotaHeld: 0, status, transactionId: txId };
    memberships.push(m);
    return m;
  };
  const notify = (userId: string, kind: Notification['kind'], input: Parameters<typeof renderNotification>[1], at: Date, read: boolean, deepLink?: string) => {
    const { title, body } = renderNotification(kind, input);
    notifications.push({ id: nid('ntf'), userId, kind, channel: 'in_app', title, body, createdAt: iso(at), readAt: read ? iso(at) : undefined, deepLink });
    notifications.push({ id: nid('ntf'), userId, kind, channel: 'sms', title, body, createdAt: iso(at) });
  };
  const busy = new Map<string, Set<string>>(); // userId → set of slot startsAt
  const seatCount = new Map<string, number>();
  const takeSeat = (userId: string, slot: SessionSlot) => { busy.get(userId)?.add(slot.startsAt) ?? busy.set(userId, new Set([slot.startsAt])); seatCount.set(slot.id, (seatCount.get(slot.id) ?? 0) + 1); };
  const seatsLeft = (slot: SessionSlot) => slot.capacity - (seatCount.get(slot.id) ?? 0);
  const free = (userId: string, slot: SessionSlot) => !busy.get(userId)?.has(slot.startsAt) && seatsLeft(slot) > 0;
  const addBooking = (userId: string, m: Membership, slot: SessionSlot, status: Booking['status'], bookedAt: Date, extra: Partial<Booking> = {}): Booking => {
    const b: Booking = { id: nid('bk'), userId, membershipId: m.id, slotId: slot.id, coachId: slot.coachId, status, bookedAt: iso(bookedAt), reminders: { sent2hBefore: new Date(slot.startsAt) < now }, ...extra };
    bookings.push(b);
    if (status === 'confirmed' || status === 'pending_verification' || status === 'attended' || status === 'no_show') takeSeat(userId, slot);
    if (status === 'confirmed' || status === 'attended' || status === 'no_show') m.quotaUsed++;
    if (status === 'pending_verification') m.quotaHeld++;
    return b;
  };

  // ── Demo student: نازنین احمدی ─────────────────────────────────────────────
  const demo = USERS.find((u) => u.id === 'u_student')!;
  const p12 = pkg('monthly-12');
  const demoStart = addDays(now, -10);
  const demoTx = addTx({ userId: demo.id, membershipId: '', packageId: p12.id, amountToman: p12.priceToman, track: 'ipg', status: 'succeeded', createdAt: iso(demoStart), settledAt: iso(addMinutes(demoStart, 2)), ipg: { provider: 'zarinpal', authority: 'A00000000000000000000000000000914205', refId: '148820931174', cardPanMasked: '6037-9975-****-4410' } });
  const demoMem = addMembership(demo.id, p12, demoStart, 'active', demoTx.id);
  demoTx.membershipId = demoMem.id;

  const c1Slots = slots.filter((s) => s.coachId === coachC1.id);
  const pastC1 = c1Slots.filter((s) => new Date(s.startsAt) >= demoStart && new Date(s.endsAt) < now).slice(-4);
  pastC1.forEach((s, i) => addBooking(demo.id, demoMem, s, i === 1 ? 'no_show' : 'attended', addDays(new Date(s.startsAt), -2)));

  // A session inside the 4-hour cutoff window (locked + reminder demo). If the studio has no natural slot there
  // (e.g. a Friday), inject one private extra session for the demo student's coach at the next full hour ≥ now+2h10m.
  const soonCandidates = slots.filter((s) => new Date(s.startsAt) >= addMinutes(now, 130) && new Date(s.startsAt) <= addMinutes(now, 60 * 3.5));
  let soon = soonCandidates.find((s) => s.coachId === coachC1.id) ?? soonCandidates[0];
  if (!soon) {
    const start = new Date(now); start.setMinutes(0, 0, 0); start.setHours(start.getHours() + 3);
    soon = { id: slotIdFor(coachC1.id, start), coachId: coachC1.id, startsAt: iso(start), endsAt: iso(addMinutes(start, 60)), weekday: jalaliWeekday(start), sessionType: 'private', modality: 'corrective', capacity: 1, room: 'اتاق خصوصی', status: 'open' };
    slots.push(soon); slots.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }
  const bSoon = addBooking(demo.id, demoMem, soon, 'confirmed', addDays(now, -1));
  const nextB = c1Slots.find((s) => new Date(s.startsAt) >= addMinutes(now, 60 * 30) && s.id !== soon.id)!;
  const bNext = addBooking(demo.id, demoMem, nextB, 'confirmed', addDays(now, -2));
  const nextC = c1Slots.find((s) => new Date(s.startsAt) >= addDays(now, 5) && s.id !== nextB.id)!;
  addBooking(demo.id, demoMem, nextC, 'confirmed', addDays(now, -1));
  // A rescheduled original (moved → bNext) for timeline realism
  const origSlot = c1Slots.find((s) => new Date(s.startsAt) > addMinutes(now, 60 * 24) && s.id !== nextB.id && s.id !== nextC.id && s.id !== soon.id)!;
  const orig = addBooking(demo.id, demoMem, origSlot, 'rescheduled', addDays(now, -3), { rescheduledToBookingId: bNext.id });
  bNext.rescheduledFromBookingId = orig.id;

  notify(demo.id, 'booking_confirmed', { slot: nextC, coach: coachC1, cutoffHours: 4 }, addDays(now, -1), false, '/portal');
  notify(demo.id, 'reschedule_confirmed', { slot: nextB, coach: coachC1 }, addDays(now, -2), true, '/portal');
  notify(demo.id, 'booking_confirmed', { slot: soon, coach: coachC1, cutoffHours: 4 }, addDays(now, -1), true, '/portal');
  if (pastC1[3]) notify(demo.id, 'class_reminder_2h', { slot: pastC1[3], coach: coachC1 }, addMinutes(new Date(pastC1[3].startsAt), -120), true);
  notify(demo.id, 'payment_approved', { packageTitle: p12.title }, addMinutes(demoStart, 2), true);

  healthAssessments.push({
    id: nid('ha'), userId: demo.id, submittedAt: iso(addMinutes(demoStart, -20)), fitnessLevel: 'intermediate', goals: ['posture', 'mobility', 'stress_relief'],
    cardioMetabolic: { hypertension: false, diabetes: false, heartCondition: false, thyroid: true, notes: 'کم‌کاری تیروئید تحت کنترل با دارو' },
    injuries: ['lower_back'], injuryNotes: 'دیسک خفیف L4-L5 در سال ۱۴۰۱، بدون درد فعلی', jointLimitations: 'محدودیت جزئی در چرخش گردن به راست',
    pregnancy: { isPregnant: false, isPostpartum: false }, lifestyle: { sleepHours: 6, activityDaysPerWeek: 2, deskHoursPerDay: 8, stressLevel: 4, smoking: false },
    consent: { confidentialityAccepted: true, acceptedAt: iso(addMinutes(demoStart, -20)) },
    reviewedBy: { adminId: 'u_admin', at: iso(addMinutes(demoStart, 60)), recommendedLevel: 'intermediate', note: 'مناسب ریفرمر نیمه‌خصوصی با تأکید بر ثبات کمر. مربی پیشنهادی: سارا محمدی.' },
  });

  // ── Mock students ─────────────────────────────────────────────────────────
  const mock = USERS.filter((u) => u.role === 'student' && u.id !== demo.id);
  const pkgCycle: Package['slug'][] = ['monthly-16', 'monthly-8', 'monthly-12', 'monthly-16', 'monthly-12', 'monthly-8', 'monthly-16', 'monthly-12'];
  const activeMems: Array<{ user: User; m: Membership }> = [];
  mock.forEach((u, i) => {
    const p = pkg(pkgCycle[i % pkgCycle.length]);
    // Historical (expired) membership for revenue history
    const histStart = addDays(now, -(38 + Math.floor(rnd() * 20)));
    const histTx = addTx({ userId: u.id, membershipId: '', packageId: p.id, amountToman: p.priceToman, track: i % 3 === 0 ? 'card_to_card' : 'ipg', status: i % 3 === 0 ? 'approved' : 'succeeded', createdAt: iso(histStart), settledAt: iso(addMinutes(histStart, 45)),
      ipg: i % 3 === 0 ? undefined : { provider: 'zarinpal', authority: 'A' + String(700000 + i).padStart(35, '0'), refId: String(140000000000 + i * 7919), cardPanMasked: '6037-99**-****-' + String(1000 + i * 37) },
      cardToCard: i % 3 === 0 ? { trackingNumber: String(880000 + i * 131), submittedAt: iso(histStart), review: { adminId: 'u_admin', at: iso(addMinutes(histStart, 45)), decision: 'approved' } } : undefined });
    const histMem = addMembership(u.id, p, histStart, 'expired', histTx.id);
    histTx.membershipId = histMem.id;
    histMem.quotaUsed = Math.min(p.sessionQuota, 5 + Math.floor(rnd() * 6));

    if (u.id === 'u_s5' || u.id === 'u_s6') {
      // Pending card-to-card → admin audit queue
      const at = u.id === 'u_s5' ? addMinutes(now, -190) : addDays(now, -1);
      const tx = addTx({ userId: u.id, membershipId: '', packageId: p.id, amountToman: p.priceToman, track: 'card_to_card', status: 'pending_verification', createdAt: iso(at),
        cardToCard: { trackingNumber: u.id === 'u_s5' ? '734120' : '902118', submittedAt: iso(at), receipt: { name: 'receipt.jpg', dataUrl: receiptSvg(String(p.priceToman * 10), u.id === 'u_s5' ? '734120' : '902118'), sizeKb: 214 } } });
      const m = addMembership(u.id, p, at, 'pending_payment', tx.id);
      tx.membershipId = m.id;
      const target = slots.find((s) => s.coachId === u.assignedCoachIds[0] && new Date(s.startsAt) > addDays(now, 1) && free(u.id, s));
      if (target) addBooking(u.id, m, target, 'pending_verification', at);
      notify(u.id, 'payment_pending', { packageTitle: p.title }, at, false);
      audit.push({ id: nid('au'), at: iso(at), actorId: u.id, action: 'card_to_card.submitted', detail: `رسید کارت‌به‌کارت برای ${p.title} ثبت شد.` });
      return;
    }
    if (u.id === 'u_s7') {
      const at = addDays(now, -6);
      const tx = addTx({ userId: u.id, membershipId: '', packageId: p.id, amountToman: p.priceToman, track: 'card_to_card', status: 'rejected', createdAt: iso(at), settledAt: iso(addMinutes(at, 200)),
        cardToCard: { trackingNumber: '551903', submittedAt: iso(at), receipt: { name: 'receipt.jpg', dataUrl: receiptSvg(String(p.priceToman * 10 - 500000), '551903'), sizeKb: 198 }, review: { adminId: 'u_admin', at: iso(addMinutes(at, 200)), decision: 'rejected', reason: 'مبلغ واریزی با مبلغ بسته مطابقت ندارد.' } } });
      const rm = addMembership(u.id, p, at, 'cancelled', tx.id);
      tx.membershipId = rm.id;
      notify(u.id, 'payment_rejected', { reason: 'مبلغ واریزی با مبلغ بسته مطابقت ندارد.' }, addMinutes(at, 200), true);
      audit.push({ id: nid('au'), at: iso(addMinutes(at, 200)), actorId: 'u_admin', action: 'card_to_card.rejected', detail: `رسید ${u.firstName} ${u.lastName} رد شد: مغایرت مبلغ.` });
    }
    const start = addDays(now, -(3 + Math.floor(rnd() * 18)));
    const tx = addTx({ userId: u.id, membershipId: '', packageId: p.id, amountToman: p.priceToman, track: 'ipg', status: 'succeeded', createdAt: iso(start), settledAt: iso(addMinutes(start, 1)), ipg: { provider: 'zarinpal', authority: 'A' + String(910000 + i).padStart(35, '0'), refId: String(150000000000 + i * 104729), cardPanMasked: '5892-10**-****-' + String(2000 + i * 53) } });
    const m = addMembership(u.id, p, start, 'active', tx.id);
    tx.membershipId = m.id;
    activeMems.push({ user: u, m });
  });

  // ── Fill seats deterministically so the matrix shows realistic availability ──
  const window = slots.filter((s) => new Date(s.startsAt) >= addDays(now, -21) && new Date(s.startsAt) <= addDays(now, 45));
  for (const s of window) {
    const r = rnd();
    const wanted = r < 0.3 ? 0 : r < 0.85 ? 1 + Math.floor(rnd() * Math.max(1, s.capacity - 1)) : s.capacity; // ~15 % full
    const candidates = activeMems.filter(({ user, m }) => (user.assignedCoachIds.includes(s.coachId) || rnd() < 0.35) && free(user.id, s) && new Date(s.startsAt) >= new Date(m.startsAt) && new Date(s.startsAt) <= new Date(m.expiresAt) && m.quotaUsed < m.quotaTotal - 1);
    for (const { user, m } of candidates.slice(0, Math.max(0, wanted - (seatCount.get(s.id) ?? 0)))) {
      const past = new Date(s.endsAt) < now;
      addBooking(user.id, m, s, past ? (rnd() < 0.9 ? 'attended' : 'no_show') : 'confirmed', addDays(new Date(s.startsAt), -3));
    }
  }

  // ── Extra health records for the admin suite ──────────────────────────────
  const extraHA: Array<[string, HealthAssessment['fitnessLevel'], HealthAssessment['goals'], HealthAssessment['injuries']]> = [
    ['u_s2', 'beginner', ['fat_loss', 'posture'], []], ['u_s4', 'intermediate', ['mobility', 'stress_relief'], ['neck']], ['u_s6', 'beginner', ['postpartum_recovery'], ['hip']], ['u_s8', 'advanced', ['hypertrophy', 'mobility'], ['knee']],
  ];
  extraHA.forEach(([uid, lvl, goals, inj], i) => healthAssessments.push({
    id: nid('ha'), userId: uid, submittedAt: iso(addDays(now, -(4 + i * 5))), fitnessLevel: lvl, goals, cardioMetabolic: { hypertension: i === 1, diabetes: false, heartCondition: false, thyroid: false, notes: '' },
    injuries: inj, injuryNotes: inj.length ? 'درد متناوب هنگام نشستن طولانی' : '', jointLimitations: '', pregnancy: { isPregnant: false, isPostpartum: uid === 'u_s6' },
    lifestyle: { sleepHours: 6 + i, activityDaysPerWeek: 1 + i, deskHoursPerDay: 7, stressLevel: (2 + (i % 3)) as 2 | 3 | 4, smoking: false }, consent: { confidentialityAccepted: true, acceptedAt: iso(addDays(now, -(4 + i * 5))) },
    reviewedBy: i % 2 === 0 ? { adminId: 'u_admin', at: iso(addDays(now, -(3 + i * 5))), recommendedLevel: lvl, note: 'بررسی شد.' } : undefined,
  }));

  audit.push({ id: nid('au'), at: iso(addDays(now, -10)), actorId: 'u_admin', action: 'health.reviewed', detail: 'پرونده سلامت نازنین احمدی بررسی و سطح «متوسط» پیشنهاد شد.' });
  audit.push({ id: nid('au'), at: iso(addDays(now, -2)), actorId: 'u_admin', action: 'settings.updated', detail: 'مهلت لغو/جابه‌جایی روی ۴ ساعت تنظیم شد.' });
  audit.push({ id: nid('au'), at: iso(now), actorId: 'system', action: 'seed.reset', detail: 'داده‌های نمایشی بازسازی شد.' });

  return { seedVersion: SEED_VERSION, seededAt: iso(now), users: USERS, coaches: COACHES, packages: PACKAGES, settings: SETTINGS, slots, memberships, bookings, transactions, healthAssessments, notifications, audit };
}
