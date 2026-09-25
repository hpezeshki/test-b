// ─── Shared primitives ────────────────────────────────────────────────────────
export type ID = string;
export type ISODateTime = string;
export type Toman = number;

export type Role = 'student' | 'coach' | 'super_admin';
export type NumeralSystem = 'persian' | 'latin';
export type SessionType = 'private' | 'semi_private' | 'group';
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = شنبه … 6 = جمعه

export type Modality =
  | 'pilates_reformer' | 'pilates_mat' | 'yoga_hatha' | 'yoga_vinyasa'
  | 'corrective' | 'postpartum' | 'mobility' | 'strength';

// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  id: ID;
  role: Role;
  phone: string;
  password: string; // mock only — Phase 3 → Supabase Auth
  firstName: string;
  lastName: string;
  preferences: { smsReminders: boolean; reminderLeadMinutes: number };
  assignedCoachIds: ID[];
  status: 'active' | 'suspended';
  createdAt: ISODateTime;
  levelLabel?: string; // e.g. 'مبتدی' – shown to coaches (non-sensitive)
}

// ─── Coach ────────────────────────────────────────────────────────────────────
export interface Certification { title: string; issuer: string; year: number }
export interface WeeklyAvailability { weekday: Weekday; windows: Array<{ start: string; end: string }>; sessionType: SessionType; modality: Modality; room: string }

export interface Coach {
  id: ID;
  userId: ID;
  slug: string;
  displayName: string;
  title: string;
  bio: string;
  quote: string;
  modalities: Modality[];
  certifications: Certification[];
  studioHours: WeeklyAvailability[];
  capacity: Record<SessionType, number>;
  rating: number;
  yearsExperience: number;
  isAcceptingNewClients: boolean;
  accent: string; // avatar gradient hue
}

// ─── Package / Membership ─────────────────────────────────────────────────────
export type PackageKind = 'monthly_membership' | 'drop_in';
export interface Package {
  id: ID;
  slug: 'drop-in' | 'monthly-8' | 'monthly-12' | 'monthly-16';
  kind: PackageKind;
  title: string;
  subtitle?: string;
  sessionQuota: number;
  validityDays: number;
  priceToman: Toman;
  compareAtToman?: Toman;
  perks: string[];
  isFeatured: boolean;
}

export type MembershipStatus = 'pending_payment' | 'active' | 'expired' | 'exhausted' | 'cancelled';
export interface Membership {
  id: ID;
  userId: ID;
  packageId: ID;
  startsAt: ISODateTime;
  expiresAt: ISODateTime;
  quotaTotal: number;
  quotaUsed: number;
  quotaHeld: number;
  status: MembershipStatus;
  transactionId: ID;
}

// ─── SessionSlot / Booking ────────────────────────────────────────────────────
export interface SessionSlot {
  id: ID;
  coachId: ID;
  startsAt: ISODateTime;
  endsAt: ISODateTime;
  weekday: Weekday;
  sessionType: SessionType;
  modality: Modality;
  capacity: number;
  room: string;
  status: 'open' | 'cancelled';
}

export type BookingStatus =
  | 'pending_verification' | 'confirmed' | 'attended' | 'no_show'
  | 'cancelled_by_student' | 'cancelled_by_studio' | 'rescheduled';

export interface Booking {
  id: ID;
  userId: ID;
  membershipId: ID;
  slotId: ID;
  coachId: ID;
  status: BookingStatus;
  bookedAt: ISODateTime;
  rescheduledFromBookingId?: ID;
  rescheduledToBookingId?: ID;
  cancellationReason?: string;
  reminders: { sent2hBefore: boolean };
}

// ─── HealthAssessment (isolated) ──────────────────────────────────────────────
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced' | 'athlete';
export type Goal = 'hypertrophy' | 'mobility' | 'posture' | 'postpartum_recovery' | 'fat_loss' | 'stress_relief';
export type InjuryArea = 'neck' | 'shoulder' | 'lower_back' | 'hip' | 'knee' | 'ankle' | 'wrist' | 'other';

export interface HealthAssessment {
  id: ID;
  userId: ID;
  submittedAt: ISODateTime;
  fitnessLevel: FitnessLevel;
  goals: Goal[];
  cardioMetabolic: { hypertension: boolean; diabetes: boolean; heartCondition: boolean; thyroid: boolean; notes: string };
  injuries: InjuryArea[];
  injuryNotes: string;
  jointLimitations: string;
  pregnancy: { isPregnant: boolean; isPostpartum: boolean };
  lifestyle: { sleepHours: number; activityDaysPerWeek: number; deskHoursPerDay: number; stressLevel: 1 | 2 | 3 | 4 | 5; smoking: boolean };
  consent: { confidentialityAccepted: true; acceptedAt: ISODateTime };
  reviewedBy?: { adminId: ID; at: ISODateTime; recommendedLevel: FitnessLevel; note: string };
}

// ─── Transaction ──────────────────────────────────────────────────────────────
export type PaymentTrack = 'ipg' | 'card_to_card';
export type TransactionStatus = 'initiated' | 'succeeded' | 'failed' | 'pending_verification' | 'approved' | 'rejected' | 'refunded';
export type IpgFailure = 'user_cancelled' | 'insufficient_funds' | 'gateway_timeout';

export interface Transaction {
  id: ID;
  userId: ID;
  membershipId: ID;
  packageId: ID;
  amountToman: Toman;
  track: PaymentTrack;
  status: TransactionStatus;
  createdAt: ISODateTime;
  settledAt?: ISODateTime;
  ipg?: { provider: 'zarinpal'; authority: string; refId?: string; cardPanMasked?: string; failureCode?: IpgFailure };
  cardToCard?: {
    trackingNumber: string;
    receipt?: { name: string; dataUrl: string; sizeKb: number };
    submittedAt: ISODateTime;
    review?: { adminId: ID; at: ISODateTime; decision: 'approved' | 'rejected'; reason?: string };
  };
  audit: Array<{ at: ISODateTime; by: ID | 'system'; from: TransactionStatus; to: TransactionStatus }>;
}

// ─── Notification ─────────────────────────────────────────────────────────────
export type NotificationKind =
  | 'booking_confirmed' | 'class_reminder_2h' | 'reschedule_confirmed' | 'cancellation_confirmed'
  | 'payment_pending' | 'payment_approved' | 'payment_rejected' | 'membership_expiring';

export interface Notification {
  id: ID;
  userId: ID;
  kind: NotificationKind;
  channel: 'in_app' | 'sms';
  title: string;
  body: string;
  createdAt: ISODateTime;
  readAt?: ISODateTime;
  deepLink?: string;
}

export interface AuditEntry { id: ID; at: ISODateTime; actorId: ID | 'system'; action: string; detail: string }

export interface StudioSettings {
  modificationCutoffHours: number;
  reminderLeadMinutes: number;
  weekend: Weekday[];
  studioCard: { bank: string; pan: string; iban: string; holder: string };
  smsSenderName: string;
}

// ─── Content ──────────────────────────────────────────────────────────────────
export type BlogCategory = 'nutrition' | 'corrective' | 'mindfulness' | 'recovery';
export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  readMinutes: number;
  publishedJalali: string; // '۱۴۰۵/۰۶/۱۲' rendered with numerals util
  author: string;
  paragraphs: string[];
  accent: string;
}
