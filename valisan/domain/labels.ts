import type { BlogCategory, BookingStatus, FitnessLevel, Goal, InjuryArea, MembershipStatus, Modality, NotificationKind, Role, SessionType, TransactionStatus } from './types';

export const ROLE_LABEL: Record<Role, string> = { student: 'هنرجو', coach: 'مربی', super_admin: 'مدیر ارشد' };
export const SESSION_TYPE_LABEL: Record<SessionType, string> = { private: 'خصوصی', semi_private: 'نیمه‌خصوصی', group: 'گروهی' };
export const MODALITY_LABEL: Record<Modality, string> = {
  pilates_reformer: 'پیلاتس ریفرمر', pilates_mat: 'پیلاتس مت', yoga_hatha: 'هاتا یوگا', yoga_vinyasa: 'وینیاسا یوگا',
  corrective: 'حرکات اصلاحی', postpartum: 'بازتوانی پس از زایمان', mobility: 'موبیلیتی و انعطاف', strength: 'قدرتی بانوان',
};
export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pending_verification: 'در انتظار تأیید پرداخت', confirmed: 'تأیید شده', attended: 'حضور', no_show: 'غیبت',
  cancelled_by_student: 'لغو شده', cancelled_by_studio: 'لغو توسط استودیو', rescheduled: 'منتقل شده',
};
export const MEMBERSHIP_STATUS_LABEL: Record<MembershipStatus, string> = { pending_payment: 'در انتظار پرداخت', active: 'فعال', expired: 'منقضی', exhausted: 'تکمیل شده', cancelled: 'لغو شده' };
export const TX_STATUS_LABEL: Record<TransactionStatus, string> = {
  initiated: 'آغاز شده', succeeded: 'موفق', failed: 'ناموفق', pending_verification: 'در انتظار تأیید', approved: 'تأیید شده', rejected: 'رد شده', refunded: 'بازگشت داده شده',
};
export const FITNESS_LEVEL_LABEL: Record<FitnessLevel, string> = { beginner: 'مبتدی', intermediate: 'متوسط', advanced: 'پیشرفته', athlete: 'ورزشکار حرفه‌ای' };
export const GOAL_LABEL: Record<Goal, string> = {
  hypertrophy: 'افزایش حجم و قدرت عضلانی', mobility: 'انعطاف و دامنه حرکتی', posture: 'اصلاح وضعیت بدنی',
  postpartum_recovery: 'بازتوانی پس از زایمان', fat_loss: 'کاهش چربی', stress_relief: 'کاهش استرس و آرامش',
};
export const INJURY_LABEL: Record<InjuryArea, string> = { neck: 'گردن', shoulder: 'شانه', lower_back: 'کمر', hip: 'لگن', knee: 'زانو', ankle: 'مچ پا', wrist: 'مچ دست', other: 'سایر' };
export const BLOG_CATEGORY_LABEL: Record<BlogCategory, string> = { nutrition: 'تغذیه', corrective: 'حرکات اصلاحی', mindfulness: 'ذهن‌آگاهی', recovery: 'ریکاوری' };
export const NOTIFICATION_KIND_LABEL: Record<NotificationKind, string> = {
  booking_confirmed: 'تأیید رزرو', class_reminder_2h: 'یادآوری کلاس', reschedule_confirmed: 'تأیید جابه‌جایی', cancellation_confirmed: 'تأیید لغو',
  payment_pending: 'پرداخت در انتظار تأیید', payment_approved: 'تأیید پرداخت', payment_rejected: 'رد پرداخت', membership_expiring: 'پایان عضویت',
};

export const REASSURANCE = 'اطلاعات وضعیت سلامت شما صرفاً جهت شخصی‌سازی تمرینات و انتخاب بهترین مربی و سطح کلاس توسط کادر تخصصی بررسی می‌شود و کاملاً محرمانه خواهد بود.';
