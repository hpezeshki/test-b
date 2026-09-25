import type { Package } from '@/domain/types';

export const PACKAGES: Package[] = [
  { id: 'p_drop', slug: 'drop-in', kind: 'drop_in', title: 'جلسه تکی', subtitle: 'برای آشنایی با استودیو', sessionQuota: 1, validityDays: 30, priceToman: 1_900_000,
    perks: ['یک جلسه ۶۰ دقیقه‌ای', 'انتخاب آزاد مربی و زمان', 'ارزیابی اولیه وضعیت بدنی'], isFeatured: false },
  { id: 'p_8', slug: 'monthly-8', kind: 'monthly_membership', title: 'عضویت ماهانه ۸ جلسه', subtitle: 'دو جلسه در هفته', sessionQuota: 8, validityDays: 30, priceToman: 12_800_000, compareAtToman: 15_200_000,
    perks: ['۸ جلسه در ۳۰ روز', 'مربی اختصاصی', 'برنامه تمرینی شخصی‌سازی‌شده', 'جابه‌جایی رایگان تا ۴ ساعت قبل'], isFeatured: false },
  { id: 'p_12', slug: 'monthly-12', kind: 'monthly_membership', title: 'عضویت ماهانه ۱۲ جلسه', subtitle: 'محبوب‌ترین انتخاب', sessionQuota: 12, validityDays: 30, priceToman: 18_000_000, compareAtToman: 22_800_000,
    perks: ['۱۲ جلسه در ۳۰ روز', 'مربی اختصاصی', 'برنامه تمرینی و تغذیه‌ای', 'یک جلسه ارزیابی حرکتی رایگان', 'دسترسی به مجله سلامت'], isFeatured: true },
  { id: 'p_16', slug: 'monthly-16', kind: 'monthly_membership', title: 'عضویت ماهانه ۱۶ جلسه', subtitle: 'برای نتیجه‌ای سریع‌تر', sessionQuota: 16, validityDays: 30, priceToman: 22_400_000, compareAtToman: 30_400_000,
    perks: ['۱۶ جلسه در ۳۰ روز', 'دو مربی تخصصی', 'پایش ماهانه ترکیب بدنی', 'اولویت رزرو ساعات پرتقاضا', 'دو جلسه ریکاوری مهمان'], isFeatured: false },
];

export const packageBySlug = (slug: string) => PACKAGES.find((p) => p.slug === slug);
