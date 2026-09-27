import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { del, get, set } from 'idb-keyval';
import { addDays, addMinutes } from '@/domain/jalali';
import { renderNotification, type TemplateInput } from '@/domain/notifications';
import { ipgAuthority, ipgRefId, maskedPan, rid } from '@/domain/ids';
import { canModify, validateBooking } from '@/domain/scheduling';
import type { Booking, FitnessLevel, HealthAssessment, ID, IpgFailure, Membership, Notification, NotificationKind, NumeralSystem, Role, StudioSettings, Transaction, User } from '@/domain/types';
import { buildSeed, SEED_VERSION, type SeedState } from './seed/build';

export interface Toast { id: ID; kind: 'sms' | 'system'; title: string; body: string; to?: string }
export interface CheckoutDraft { packageSlug: string; slotId?: ID }
export type IntakeDraft = Omit<HealthAssessment, 'id' | 'userId' | 'submittedAt' | 'consent' | 'reviewedBy'> & { consentAccepted: boolean };
export interface CheckoutResult { membershipId: ID; transactionId: ID; bookingId?: ID; track: 'ipg' | 'card_to_card'; status: Transaction['status'] }

const emptySeed: SeedState = { seedVersion: 0, seededAt: '', users: [], coaches: [], packages: [], settings: { modificationCutoffHours: 4, reminderLeadMinutes: 120, weekend: [6], studioCard: { bank: '', pan: '', iban: '', holder: '' }, smsSenderName: 'VALISAN' }, slots: [], memberships: [], bookings: [], transactions: [], healthAssessments: [], notifications: [], audit: [] };

export const DEFAULT_INTAKE: IntakeDraft = {
  fitnessLevel: 'beginner', goals: [], cardioMetabolic: { hypertension: false, diabetes: false, heartCondition: false, thyroid: false, notes: '' },
  injuries: [], injuryNotes: '', jointLimitations: '', pregnancy: { isPregnant: false, isPostpartum: false },
  lifestyle: { sleepHours: 7, activityDaysPerWeek: 2, deskHoursPerDay: 6, stressLevel: 3, smoking: false }, consentAccepted: false,
};

export interface AppState extends SeedState {
  hydrated: boolean;
  clockOffsetMs: number;
  numerals: NumeralSystem;
  sessionUserId: ID | null;
  checkout: CheckoutDraft | null;
  intakeDraft: IntakeDraft;
  lastCheckout: CheckoutResult | null;
  toasts: Toast[];

  now: () => Date;
  setHydrated: (v: boolean) => void;
  resetDemo: () => void;
  fastForward: (minutes: number) => void;
  tickReminders: () => void;
  setNumerals: (n: NumeralSystem) => void;

  login: (phone: string, password: string) => { ok: boolean; reason?: string; role?: Role };
  loginAs: (role: Role) => void;
  /** Atomic sign-out: clears session + drafts in memory, writes the purged state to IndexedDB, then hard-reloads to /login so no client cache survives. */
  logout: () => Promise<void>;

  startCheckout: (packageSlug: string) => void;
  setCheckoutSlot: (slotId?: ID) => void;
  saveIntake: (patch: Partial<IntakeDraft>) => void;
  submitAssessment: () => void;

  beginIpg: () => Transaction | null;
  completeIpg: (transactionId: ID, outcome: 'success' | IpgFailure) => void;
  submitCardToCard: (input: { trackingNumber: string; receipt?: { name: string; dataUrl: string; sizeKb: number } }) => void;

  bookSlot: (slotId: ID) => { ok: boolean; reason?: string };
  cancelBooking: (bookingId: ID) => { ok: boolean; reason?: string };
  rescheduleBooking: (bookingId: ID, newSlotId: ID) => { ok: boolean; reason?: string };
  markAttendance: (bookingId: ID, status: 'attended' | 'no_show') => void;

  approveTransaction: (transactionId: ID) => void;
  rejectTransaction: (transactionId: ID, reason: string) => void;
  reviewAssessment: (assessmentId: ID, level: FitnessLevel, note: string) => void;
  updateSettings: (patch: Partial<StudioSettings>) => void;

  markNotificationsRead: () => void;
  dismissToast: (id: ID) => void;
}

/** IndexedDB adapter. Writes are ignored until hydration has completed so an early action can never clobber persisted state. */
let persistenceUnlocked = false;
const idbStorage: StateStorage = {
  getItem: async (name) => (await get<string>(name)) ?? null,
  setItem: async (name, value) => { if (persistenceUnlocked) await set(name, value); },
  removeItem: async (name) => { await del(name); },
};

export const STORAGE_KEY = `valisan-demo@v${SEED_VERSION}`;

/** Fields that survive a reload (everything except transient UI state). */
const partialize = (s: AppState) => ({
  seedVersion: s.seedVersion, seededAt: s.seededAt, users: s.users, coaches: s.coaches, packages: s.packages, settings: s.settings, slots: s.slots, memberships: s.memberships,
  bookings: s.bookings, transactions: s.transactions, healthAssessments: s.healthAssessments, notifications: s.notifications, audit: s.audit,
  clockOffsetMs: s.clockOffsetMs, numerals: s.numerals, sessionUserId: s.sessionUserId, checkout: s.checkout, intakeDraft: s.intakeDraft, lastCheckout: s.lastCheckout,
});

export const useStore = create<AppState>()(
  persist(
    (setState, getState) => {
      const iso = (d: Date) => d.toISOString();
      const pushToast = (t: Omit<Toast, 'id'>) => setState((s) => ({ toasts: [...s.toasts.slice(-3), { id: rid('toast'), ...t }] }));
      const log = (actorId: ID | 'system', action: string, detail: string) => setState((s) => ({ audit: [{ id: rid('au'), at: iso(s.now()), actorId, action, detail }, ...s.audit] }));

      const emit = (userId: ID, kind: NotificationKind, input: TemplateInput, deepLink?: string) => {
        const s = getState();
        const at = iso(s.now());
        const { title, body } = renderNotification(kind, input);
        const inApp: Notification = { id: rid('ntf'), userId, kind, channel: 'in_app', title, body, createdAt: at, deepLink };
        const sms: Notification = { id: rid('ntf'), userId, kind, channel: 'sms', title, body, createdAt: at };
        setState((st) => ({ notifications: [inApp, sms, ...st.notifications] }));
        const target = s.users.find((u) => u.id === userId);
        if (userId === s.sessionUserId) pushToast({ kind: 'sms', title, body, to: target?.phone });
        else pushToast({ kind: 'system', title: 'پیامک ارسال شد', body: `به ${target?.firstName ?? ''} ${target?.lastName ?? ''} (${target?.phone ?? ''}): ${title}`, to: target?.phone });
      };

      const activeMembershipOf = (s: AppState, userId: ID) => {
        const now = s.now();
        return s.memberships.find((m) => m.userId === userId && (m.status === 'active' || m.status === 'pending_payment') && new Date(m.expiresAt) > now && m.quotaUsed + m.quotaHeld < m.quotaTotal)
          ?? s.memberships.find((m) => m.userId === userId && (m.status === 'active' || m.status === 'pending_payment') && new Date(m.expiresAt) > now);
      };

      /** Create a pending membership (+ initiated transaction) for the current checkout. */
      const createPending = (track: 'ipg' | 'card_to_card'): { membership: Membership; tx: Transaction } | null => {
        const s = getState();
        const user = s.users.find((u) => u.id === s.sessionUserId);
        const p = s.packages.find((x) => x.slug === s.checkout?.packageSlug);
        if (!user || !p) return null;
        const now = s.now();
        const tx: Transaction = { id: rid('tx'), userId: user.id, membershipId: '', packageId: p.id, amountToman: p.priceToman, track, status: 'initiated', createdAt: iso(now), audit: [{ at: iso(now), by: user.id, from: 'initiated', to: 'initiated' }] };
        const membership: Membership = { id: rid('mem'), userId: user.id, packageId: p.id, startsAt: iso(now), expiresAt: iso(addDays(now, p.validityDays)), quotaTotal: p.sessionQuota, quotaUsed: 0, quotaHeld: 0, status: 'pending_payment', transactionId: tx.id };
        tx.membershipId = membership.id;
        // Drop stale pending memberships from abandoned attempts
        setState((st) => ({
          memberships: [...st.memberships.filter((m) => !(m.userId === user.id && m.status === 'pending_payment' && st.transactions.find((t) => t.id === m.transactionId)?.status !== 'pending_verification')), membership],
          transactions: [tx, ...st.transactions],
        }));
        return { membership, tx };
      };

      return {
        ...emptySeed,
        hydrated: false,
        clockOffsetMs: 0,
        numerals: 'persian',
        sessionUserId: null,
        checkout: null,
        intakeDraft: DEFAULT_INTAKE,
        lastCheckout: null,
        toasts: [],

        now: () => new Date(Date.now() + getState().clockOffsetMs),
        setHydrated: (v) => setState({ hydrated: v }),
        resetDemo: () => { setState({ ...buildSeed(new Date()), clockOffsetMs: 0, sessionUserId: null, checkout: null, intakeDraft: DEFAULT_INTAKE, lastCheckout: null, toasts: [] }); },
        fastForward: (minutes) => { setState((s) => ({ clockOffsetMs: s.clockOffsetMs + minutes * 60_000 })); getState().tickReminders(); pushToast({ kind: 'system', title: 'ساعت نمایشی جلو رفت', body: `${minutes} دقیقه به زمان شبیه‌سازی‌شده اضافه شد.` }); },
        tickReminders: () => {
          const s = getState();
          const now = s.now();
          const lead = s.settings.reminderLeadMinutes;
          const due = s.bookings.filter((b) => b.status === 'confirmed' && !b.reminders.sent2hBefore).map((b) => ({ b, slot: s.slots.find((x) => x.id === b.slotId)! })).filter(({ slot }) => slot && new Date(slot.startsAt).getTime() - now.getTime() <= lead * 60_000);
          if (!due.length) return;
          setState((st) => ({ bookings: st.bookings.map((b) => (due.some((d) => d.b.id === b.id) ? { ...b, reminders: { sent2hBefore: true } } : b)) }));
          for (const { b, slot } of due) {
            if (new Date(slot.startsAt) < now) continue; // already started — no retroactive reminder
            emit(b.userId, 'class_reminder_2h', { slot, coach: s.coaches.find((c) => c.id === slot.coachId) }, '/portal');
          }
        },
        setNumerals: (numerals) => setState({ numerals }),

        login: (phone, password) => {
          const u = getState().users.find((x) => x.phone === phone.trim());
          if (!u || u.password !== password) return { ok: false, reason: 'شماره موبایل یا رمز عبور نادرست است.' };
          if (u.status !== 'active') return { ok: false, reason: 'حساب شما غیرفعال است.' };
          setState({ sessionUserId: u.id });
          log(u.id, 'auth.login', `${u.firstName} ${u.lastName} وارد شد.`);
          return { ok: true, role: u.role };
        },
        loginAs: (role) => {
          const u = getState().users.find((x) => x.role === role && (role !== 'coach' || x.id === 'u_coach1'));
          if (u) { setState({ sessionUserId: u.id }); log(u.id, 'auth.login', `${u.firstName} ${u.lastName} (حساب نمایشی) وارد شد.`); }
        },
        logout: async () => {
          setState({ sessionUserId: null, checkout: null, intakeDraft: DEFAULT_INTAKE, lastCheckout: null, toasts: [] });
          try { await set(STORAGE_KEY, JSON.stringify({ state: partialize(getState()), version: SEED_VERSION })); } catch { /* storage blocked → in-memory only */ }
          if (typeof window !== 'undefined') window.location.href = '/login';
        },

        startCheckout: (packageSlug) => setState((s) => ({ checkout: s.checkout?.packageSlug === packageSlug ? s.checkout : { packageSlug } })),
        setCheckoutSlot: (slotId) => setState((s) => ({ checkout: s.checkout ? { ...s.checkout, slotId } : null })),
        saveIntake: (patch) => setState((s) => ({ intakeDraft: { ...s.intakeDraft, ...patch } })),
        submitAssessment: () => {
          const s = getState();
          if (!s.sessionUserId) return;
          const { consentAccepted: _c, ...d } = s.intakeDraft;
          const at = iso(s.now());
          const ha: HealthAssessment = { id: rid('ha'), userId: s.sessionUserId, submittedAt: at, ...d, consent: { confidentialityAccepted: true, acceptedAt: at } };
          setState((st) => ({ healthAssessments: [ha, ...st.healthAssessments.filter((x) => x.userId !== s.sessionUserId)], intakeDraft: DEFAULT_INTAKE }));
          log(s.sessionUserId, 'health.submitted', 'فرم ارزیابی سلامت ثبت شد.');
        },

        beginIpg: () => {
          const created = createPending('ipg');
          if (!created) return null;
          const authority = ipgAuthority();
          setState((st) => ({ transactions: st.transactions.map((t) => (t.id === created.tx.id ? { ...t, ipg: { provider: 'zarinpal', authority } } : t)) }));
          return { ...created.tx, ipg: { provider: 'zarinpal', authority } };
        },
        completeIpg: (transactionId, outcome) => {
          const s = getState();
          const tx = s.transactions.find((t) => t.id === transactionId);
          if (!tx || tx.status !== 'initiated') return;
          const now = s.now();
          const at = iso(now);
          if (outcome !== 'success') {
            setState((st) => ({
              transactions: st.transactions.map((t) => (t.id === tx.id ? { ...t, status: 'failed', settledAt: at, ipg: { ...t.ipg!, failureCode: outcome }, audit: [...t.audit, { at, by: 'system', from: 'initiated', to: 'failed' }] } : t)),
              lastCheckout: { membershipId: tx.membershipId, transactionId: tx.id, track: 'ipg', status: 'failed' },
            }));
            log('system', 'ipg.failed', `تراکنش ${tx.id} ناموفق (${outcome}).`);
            return;
          }
          const slot = s.slots.find((x) => x.id === s.checkout?.slotId);
          const membership = s.memberships.find((m) => m.id === tx.membershipId)!;
          const check = slot ? validateBooking({ userId: tx.userId, membership: { ...membership, status: 'active' }, slot, bookings: s.bookings, slots: s.slots, now }) : { ok: false as const, reason: 'بدون جلسه' };
          const booking: Booking | null = slot && check.ok ? { id: rid('bk'), userId: tx.userId, membershipId: membership.id, slotId: slot.id, coachId: slot.coachId, status: 'confirmed', bookedAt: at, reminders: { sent2hBefore: false } } : null;
          setState((st) => ({
            transactions: st.transactions.map((t) => (t.id === tx.id ? { ...t, status: 'succeeded', settledAt: at, ipg: { ...t.ipg!, refId: ipgRefId(), cardPanMasked: maskedPan() }, audit: [...t.audit, { at, by: 'system', from: 'initiated', to: 'succeeded' }] } : t)),
            memberships: st.memberships.map((m) => (m.id === membership.id ? { ...m, status: 'active', startsAt: at, expiresAt: iso(addDays(now, st.packages.find((p) => p.id === m.packageId)?.validityDays ?? 30)), quotaUsed: booking ? 1 : 0 } : m)),
            bookings: booking ? [...st.bookings, booking] : st.bookings,
            users: st.users.map((u) => (u.id === tx.userId && slot && !u.assignedCoachIds.includes(slot.coachId) ? { ...u, assignedCoachIds: [...u.assignedCoachIds, slot.coachId] } : u)),
            lastCheckout: { membershipId: membership.id, transactionId: tx.id, bookingId: booking?.id, track: 'ipg', status: 'succeeded' },
            checkout: null,
          }));
          log('system', 'ipg.succeeded', `تراکنش ${tx.id} با موفقیت تسویه شد.`);
          const pkgTitle = s.packages.find((p) => p.id === tx.packageId)?.title;
          emit(tx.userId, 'payment_approved', { packageTitle: pkgTitle });
          if (booking && slot) emit(tx.userId, 'booking_confirmed', { slot, coach: s.coaches.find((c) => c.id === slot.coachId), cutoffHours: s.settings.modificationCutoffHours }, '/portal');
        },
        submitCardToCard: ({ trackingNumber, receipt }) => {
          const created = createPending('card_to_card');
          if (!created) return;
          const s = getState();
          const now = s.now();
          const at = iso(now);
          const slot = s.slots.find((x) => x.id === s.checkout?.slotId);
          const held: Booking | null = slot ? { id: rid('bk'), userId: created.tx.userId, membershipId: created.membership.id, slotId: slot.id, coachId: slot.coachId, status: 'pending_verification', bookedAt: at, reminders: { sent2hBefore: false } } : null;
          setState((st) => ({
            transactions: st.transactions.map((t) => (t.id === created.tx.id ? { ...t, status: 'pending_verification', cardToCard: { trackingNumber, receipt, submittedAt: at }, audit: [...t.audit, { at, by: created.tx.userId, from: 'initiated', to: 'pending_verification' }] } : t)),
            memberships: st.memberships.map((m) => (m.id === created.membership.id ? { ...m, quotaHeld: held ? 1 : 0 } : m)),
            bookings: held ? [...st.bookings, held] : st.bookings,
            lastCheckout: { membershipId: created.membership.id, transactionId: created.tx.id, bookingId: held?.id, track: 'card_to_card', status: 'pending_verification' },
            checkout: null,
          }));
          log(created.tx.userId, 'card_to_card.submitted', `رسید با شماره پیگیری ${trackingNumber} ثبت شد.`);
          emit(created.tx.userId, 'payment_pending', { packageTitle: s.packages.find((p) => p.id === created.tx.packageId)?.title });
        },

        bookSlot: (slotId) => {
          const s = getState();
          if (!s.sessionUserId) return { ok: false, reason: 'ابتدا وارد شوید.' };
          const membership = activeMembershipOf(s, s.sessionUserId);
          const slot = s.slots.find((x) => x.id === slotId);
          const now = s.now();
          const check = validateBooking({ userId: s.sessionUserId, membership, slot, bookings: s.bookings, slots: s.slots, now });
          if (!check.ok || !membership || !slot) return check;
          const pending = membership.status === 'pending_payment';
          const b: Booking = { id: rid('bk'), userId: s.sessionUserId, membershipId: membership.id, slotId, coachId: slot.coachId, status: pending ? 'pending_verification' : 'confirmed', bookedAt: iso(now), reminders: { sent2hBefore: false } };
          setState((st) => ({
            bookings: [...st.bookings, b],
            memberships: st.memberships.map((m) => (m.id === membership.id ? { ...m, quotaUsed: m.quotaUsed + (pending ? 0 : 1), quotaHeld: m.quotaHeld + (pending ? 1 : 0) } : m)),
            users: st.users.map((u) => (u.id === s.sessionUserId && !u.assignedCoachIds.includes(slot.coachId) ? { ...u, assignedCoachIds: [...u.assignedCoachIds, slot.coachId] } : u)),
          }));
          if (!pending) emit(s.sessionUserId, 'booking_confirmed', { slot, coach: s.coaches.find((c) => c.id === slot.coachId), cutoffHours: s.settings.modificationCutoffHours }, '/portal');
          return { ok: true };
        },
        cancelBooking: (bookingId) => {
          const s = getState();
          const b = s.bookings.find((x) => x.id === bookingId);
          const slot = b && s.slots.find((x) => x.id === b.slotId);
          if (!b || !slot) return { ok: false, reason: 'رزرو یافت نشد.' };
          if (b.status !== 'confirmed' && b.status !== 'pending_verification') return { ok: false, reason: 'این رزرو قابل لغو نیست.' };
          const now = s.now();
          if (!canModify(slot, s.settings, now)) return { ok: false, reason: `مهلت لغو این جلسه (${s.settings.modificationCutoffHours} ساعت قبل از شروع) به پایان رسیده است.` };
          const wasHeld = b.status === 'pending_verification';
          setState((st) => ({
            bookings: st.bookings.map((x) => (x.id === b.id ? { ...x, status: 'cancelled_by_student', cancellationReason: 'لغو توسط هنرجو' } : x)),
            memberships: st.memberships.map((m) => (m.id === b.membershipId ? { ...m, quotaUsed: m.quotaUsed - (wasHeld ? 0 : 1), quotaHeld: m.quotaHeld - (wasHeld ? 1 : 0) } : m)),
          }));
          emit(b.userId, 'cancellation_confirmed', { slot, coach: s.coaches.find((c) => c.id === slot.coachId) }, '/portal');
          return { ok: true };
        },
        rescheduleBooking: (bookingId, newSlotId) => {
          const s = getState();
          const b = s.bookings.find((x) => x.id === bookingId);
          const oldSlot = b && s.slots.find((x) => x.id === b.slotId);
          const newSlot = s.slots.find((x) => x.id === newSlotId);
          const membership = b && s.memberships.find((m) => m.id === b.membershipId);
          if (!b || !oldSlot || !newSlot || !membership) return { ok: false, reason: 'رزرو یافت نشد.' };
          if (b.status !== 'confirmed') return { ok: false, reason: 'فقط رزروهای تأیید‌شده قابل جابه‌جایی هستند.' };
          const now = s.now();
          if (!canModify(oldSlot, s.settings, now)) return { ok: false, reason: `مهلت جابه‌جایی این جلسه (${s.settings.modificationCutoffHours} ساعت قبل از شروع) به پایان رسیده است.` };
          const check = validateBooking({ userId: b.userId, membership, slot: newSlot, bookings: s.bookings, slots: s.slots, now, ignoreBookingId: b.id });
          if (!check.ok) return check;
          const nb: Booking = { id: rid('bk'), userId: b.userId, membershipId: b.membershipId, slotId: newSlot.id, coachId: newSlot.coachId, status: 'confirmed', bookedAt: iso(now), rescheduledFromBookingId: b.id, reminders: { sent2hBefore: false } };
          setState((st) => ({
            bookings: [...st.bookings.map((x) => (x.id === b.id ? { ...x, status: 'rescheduled' as const, rescheduledToBookingId: nb.id } : x)), nb],
            users: st.users.map((u) => (u.id === b.userId && !u.assignedCoachIds.includes(newSlot.coachId) ? { ...u, assignedCoachIds: [...u.assignedCoachIds, newSlot.coachId] } : u)),
          }));
          emit(b.userId, 'reschedule_confirmed', { slot: newSlot, coach: s.coaches.find((c) => c.id === newSlot.coachId) }, '/portal');
          return { ok: true };
        },
        markAttendance: (bookingId, status) => {
          const s = getState();
          setState((st) => ({ bookings: st.bookings.map((b) => (b.id === bookingId ? { ...b, status } : b)) }));
          log(s.sessionUserId ?? 'system', 'attendance.marked', `${status === 'attended' ? 'حضور' : 'غیبت'} برای رزرو ${bookingId} ثبت شد.`);
        },

        approveTransaction: (transactionId) => {
          const s = getState();
          const tx = s.transactions.find((t) => t.id === transactionId);
          if (!tx || tx.status !== 'pending_verification') return;
          const now = s.now();
          const at = iso(now);
          const admin = s.sessionUserId ?? 'u_admin';
          const heldIds = s.bookings.filter((b) => b.membershipId === tx.membershipId && b.status === 'pending_verification').map((b) => b.id);
          setState((st) => ({
            transactions: st.transactions.map((t) => (t.id === tx.id ? { ...t, status: 'approved', settledAt: at, cardToCard: { ...t.cardToCard!, review: { adminId: admin, at, decision: 'approved' } }, audit: [...t.audit, { at, by: admin, from: 'pending_verification', to: 'approved' }] } : t)),
            memberships: st.memberships.map((m) => (m.id === tx.membershipId ? { ...m, status: 'active', startsAt: at, expiresAt: iso(addDays(now, st.packages.find((p) => p.id === m.packageId)?.validityDays ?? 30)), quotaUsed: m.quotaUsed + m.quotaHeld, quotaHeld: 0 } : m)),
            bookings: st.bookings.map((b) => (heldIds.includes(b.id) ? { ...b, status: 'confirmed' } : b)),
          }));
          log(admin, 'card_to_card.approved', `رسید تراکنش ${tx.id} تأیید شد.`);
          emit(tx.userId, 'payment_approved', { packageTitle: s.packages.find((p) => p.id === tx.packageId)?.title }, '/portal');
          for (const id of heldIds) {
            const b = s.bookings.find((x) => x.id === id)!;
            const slot = s.slots.find((x) => x.id === b.slotId)!;
            emit(tx.userId, 'booking_confirmed', { slot, coach: s.coaches.find((c) => c.id === slot.coachId), cutoffHours: s.settings.modificationCutoffHours }, '/portal');
          }
        },
        rejectTransaction: (transactionId, reason) => {
          const s = getState();
          const tx = s.transactions.find((t) => t.id === transactionId);
          if (!tx || tx.status !== 'pending_verification') return;
          const at = iso(s.now());
          const admin = s.sessionUserId ?? 'u_admin';
          setState((st) => ({
            transactions: st.transactions.map((t) => (t.id === tx.id ? { ...t, status: 'rejected', settledAt: at, cardToCard: { ...t.cardToCard!, review: { adminId: admin, at, decision: 'rejected', reason } }, audit: [...t.audit, { at, by: admin, from: 'pending_verification', to: 'rejected' }] } : t)),
            memberships: st.memberships.map((m) => (m.id === tx.membershipId ? { ...m, status: 'cancelled', quotaHeld: 0 } : m)),
            bookings: st.bookings.map((b) => (b.membershipId === tx.membershipId && b.status === 'pending_verification' ? { ...b, status: 'cancelled_by_studio', cancellationReason: reason } : b)),
          }));
          log(admin, 'card_to_card.rejected', `رسید تراکنش ${tx.id} رد شد: ${reason}`);
          emit(tx.userId, 'payment_rejected', { reason }, '/portal');
        },
        reviewAssessment: (assessmentId, level, note) => {
          const s = getState();
          const admin = s.sessionUserId ?? 'u_admin';
          const at = iso(s.now());
          const ha = s.healthAssessments.find((h) => h.id === assessmentId);
          setState((st) => ({
            healthAssessments: st.healthAssessments.map((h) => (h.id === assessmentId ? { ...h, reviewedBy: { adminId: admin, at, recommendedLevel: level, note } } : h)),
            users: st.users.map((u) => (ha && u.id === ha.userId ? { ...u, levelLabel: ({ beginner: 'مبتدی', intermediate: 'متوسط', advanced: 'پیشرفته', athlete: 'ورزشکار' } as const)[level] } : u)),
          }));
          log(admin, 'health.reviewed', `پرونده ${assessmentId} بررسی شد.`);
        },
        updateSettings: (patch) => { setState((s) => ({ settings: { ...s.settings, ...patch } })); log(getState().sessionUserId ?? 'system', 'settings.updated', Object.keys(patch).join(', ')); },

        markNotificationsRead: () => setState((s) => ({ notifications: s.notifications.map((n) => (n.userId === s.sessionUserId && n.channel === 'in_app' && !n.readAt ? { ...n, readAt: iso(s.now()) } : n)) })),
        dismissToast: (id) => setState((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      };
    },
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => idbStorage),
      skipHydration: true,
      version: SEED_VERSION,
      partialize: (s) => partialize(s) as unknown as AppState,
    },
  ),
);

/** Called once on the client: rehydrate from IndexedDB, (re)seed when empty or stale, then start the reminder ticker. */
export async function bootstrapStore() {
  try { await useStore.persist.rehydrate(); } catch { /* private mode / blocked storage → in-memory only */ }
  const s = useStore.getState();
  const stale = s.seedVersion !== SEED_VERSION || s.slots.length === 0 || (s.seededAt && Date.now() - new Date(s.seededAt).getTime() > 21 * 86_400_000);
  persistenceUnlocked = true;
  if (stale) s.resetDemo();
  useStore.getState().setHydrated(true);
  useStore.getState().tickReminders();
}

export const useHydrated = () => useStore((s) => s.hydrated);
