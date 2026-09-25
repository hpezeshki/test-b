import { formatJalali, formatTime } from './jalali';
import type { Coach, NotificationKind, SessionSlot } from './types';

const BRAND = 'والیسان';

export interface TemplateInput { slot?: SessionSlot; coach?: Coach; cutoffHours?: number; reason?: string; packageTitle?: string }

/** Persian SMS/in-app copy per notification kind. Rendered with Persian numerals (SMS providers send exactly this text). */
export function renderNotification(kind: NotificationKind, input: TemplateInput): { title: string; body: string } {
  const when = input.slot ? `${formatJalali(new Date(input.slot.startsAt), 'weekday')} ساعت ${formatTime(new Date(input.slot.startsAt))}` : '';
  const coach = input.coach?.displayName ?? 'مربی شما';
  switch (kind) {
    case 'booking_confirmed':
      return { title: 'رزرو شما تأیید شد', body: `${BRAND}: رزرو شما برای ${when} با ${coach} تأیید شد. لغو/جابه‌جایی تا ${input.cutoffHours ?? 4} ساعت قبل از شروع امکان‌پذیر است.` };
    case 'class_reminder_2h':
      return { title: 'یادآوری جلسه امروز', body: `${BRAND}: یادآوری؛ جلسه شما امروز ساعت ${input.slot ? formatTime(new Date(input.slot.startsAt)) : ''} با ${coach} برگزار می‌شود. منتظرتان هستیم.` };
    case 'reschedule_confirmed':
      return { title: 'جابه‌جایی انجام شد', body: `${BRAND}: جلسه شما به ${when} با ${coach} منتقل شد.` };
    case 'cancellation_confirmed':
      return { title: 'جلسه لغو شد', body: `${BRAND}: جلسه ${when} لغو شد و یک جلسه به سهمیه شما بازگشت.` };
    case 'payment_pending':
      return { title: 'رسید شما دریافت شد', body: `${BRAND}: رسید کارت‌به‌کارت شما برای «${input.packageTitle ?? ''}» دریافت شد و در صف بررسی است. نتیجه از طریق پیامک اعلام می‌شود.` };
    case 'payment_approved':
      return { title: 'پرداخت تأیید شد', body: `${BRAND}: پرداخت کارت‌به‌کارت شما تأیید شد. عضویت «${input.packageTitle ?? ''}» شما فعال است.` };
    case 'payment_rejected':
      return { title: 'پرداخت تأیید نشد', body: `${BRAND}: پرداخت شما تأیید نشد. دلیل: ${input.reason ?? '—'}. لطفاً با استودیو تماس بگیرید.` };
    case 'membership_expiring':
      return { title: 'عضویت رو به پایان', body: `${BRAND}: اعتبار عضویت شما به‌زودی به پایان می‌رسد. برای تمدید به پنل خود مراجعه کنید.` };
  }
}
