import type { StudioSettings, User } from '@/domain/types';

const base = (u: Partial<User> & Pick<User, 'id' | 'role' | 'phone' | 'firstName' | 'lastName'>): User => ({
  password: 'demo1234',
  preferences: { smsReminders: true, reminderLeadMinutes: 120 },
  assignedCoachIds: [],
  status: 'active',
  createdAt: '2026-06-01T08:00:00.000Z',
  ...u,
});

export const DEMO_ACCOUNTS = {
  student: { phone: '09120000001', password: 'demo1234' },
  coach: { phone: '09120000002', password: 'demo1234' },
  admin: { phone: '09120000009', password: 'admin1234' },
} as const;

export const USERS: User[] = [
  base({ id: 'u_student', role: 'student', phone: '09120000001', firstName: 'نازنین', lastName: 'احمدی', assignedCoachIds: ['c1'], levelLabel: 'متوسط', createdAt: '2026-08-20T08:00:00.000Z' }),
  base({ id: 'u_coach1', role: 'coach', phone: '09120000002', firstName: 'سارا', lastName: 'محمدی' }),
  base({ id: 'u_coach2', role: 'coach', phone: '09120000003', firstName: 'نیلوفر', lastName: 'رحیمی' }),
  base({ id: 'u_coach3', role: 'coach', phone: '09120000004', firstName: 'مهسا', lastName: 'کریمی' }),
  base({ id: 'u_coach4', role: 'coach', phone: '09120000005', firstName: 'الهام', lastName: 'صادقی' }),
  base({ id: 'u_admin', role: 'super_admin', phone: '09120000009', password: 'admin1234', firstName: 'مدیریت', lastName: 'والیسان' }),
  base({ id: 'u_s2', role: 'student', phone: '09121111002', firstName: 'مریم', lastName: 'رضایی', assignedCoachIds: ['c1'], levelLabel: 'مبتدی' }),
  base({ id: 'u_s3', role: 'student', phone: '09121111003', firstName: 'غزل', lastName: 'نوری', assignedCoachIds: ['c1', 'c3'], levelLabel: 'پیشرفته' }),
  base({ id: 'u_s4', role: 'student', phone: '09121111004', firstName: 'پریسا', lastName: 'موسوی', assignedCoachIds: ['c2'], levelLabel: 'متوسط' }),
  base({ id: 'u_s5', role: 'student', phone: '09121111005', firstName: 'شیدا', lastName: 'حسینی', assignedCoachIds: ['c2', 'c3'], levelLabel: 'مبتدی' }),
  base({ id: 'u_s6', role: 'student', phone: '09121111006', firstName: 'آیدا', lastName: 'کاظمی', assignedCoachIds: ['c4'], levelLabel: 'مبتدی' }),
  base({ id: 'u_s7', role: 'student', phone: '09121111007', firstName: 'لیلا', lastName: 'شریفی', assignedCoachIds: ['c1'], levelLabel: 'متوسط' }),
  base({ id: 'u_s8', role: 'student', phone: '09121111008', firstName: 'هستی', lastName: 'جعفری', assignedCoachIds: ['c3'], levelLabel: 'پیشرفته' }),
  base({ id: 'u_s9', role: 'student', phone: '09121111009', firstName: 'رها', lastName: 'قاسمی', assignedCoachIds: ['c2'], levelLabel: 'متوسط' }),
];

export const SETTINGS: StudioSettings = {
  modificationCutoffHours: 4,
  reminderLeadMinutes: 120,
  weekend: [6],
  studioCard: { bank: 'بانک ملت', pan: '6104-3378-9012-4455', iban: 'IR12 0120 0000 0000 8899 4455 01', holder: 'استودیو والیسان' },
  smsSenderName: 'VALISAN',
};
