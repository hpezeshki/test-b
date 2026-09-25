import * as jalaali from 'jalaali-js';
import type { NumeralSystem, Weekday } from './types';

export const WEEKDAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'] as const;
export const WEEKDAYS_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'] as const;
export const MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'] as const;

export interface JDate { jy: number; jm: number; jd: number }

/** JS getDay(): 0 = Sunday … 6 = Saturday  →  Jalali weekday: 0 = شنبه … 6 = جمعه */
export const jalaliWeekday = (d: Date): Weekday => (((d.getDay() + 1) % 7) as Weekday);

export const toJalali = (d: Date): JDate => jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());

export const fromJalali = (jy: number, jm: number, jd: number, h = 0, m = 0): Date => {
  const g = jalaali.toGregorian(jy, jm, jd);
  return new Date(g.gy, g.gm - 1, g.gd, h, m, 0, 0);
};

export const jalaliMonthLength = (jy: number, jm: number) => jalaali.jalaaliMonthLength(jy, jm);
export const isJalaliLeap = (jy: number) => jalaali.isLeapJalaaliYear(jy);

export const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const addMinutes = (d: Date, n: number) => new Date(d.getTime() + n * 60_000);

/** Start of the Jalali week (شنبه) containing d. */
export const startOfWeek = (d: Date) => startOfDay(addDays(d, -jalaliWeekday(d)));

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
export const faDigits = (s: string | number) => String(s).replace(/\d/g, (c) => FA_DIGITS[Number(c)]);
export const digits = (s: string | number, numerals: NumeralSystem) => (numerals === 'persian' ? faDigits(s) : String(s));

export const pad2 = (n: number) => String(n).padStart(2, '0');

export const formatTime = (d: Date, numerals: NumeralSystem = 'persian') => digits(`${pad2(d.getHours())}:${pad2(d.getMinutes())}`, numerals);

export type DateStyle = 'numeric' | 'long' | 'weekday' | 'dayMonth' | 'monthYear';
export const formatJalali = (d: Date, style: DateStyle = 'long', numerals: NumeralSystem = 'persian') => {
  const { jy, jm, jd } = toJalali(d);
  const wd = WEEKDAYS[jalaliWeekday(d)];
  const s = (() => {
    switch (style) {
      case 'numeric': return `${jy}/${pad2(jm)}/${pad2(jd)}`;
      case 'dayMonth': return `${jd} ${MONTHS[jm - 1]}`;
      case 'monthYear': return `${MONTHS[jm - 1]} ${jy}`;
      case 'weekday': return `${wd} ${jd} ${MONTHS[jm - 1]}`;
      default: return `${wd} ${jd} ${MONTHS[jm - 1]} ${jy}`;
    }
  })();
  return digits(s, numerals);
};

export const formatDateTime = (d: Date, numerals: NumeralSystem = 'persian') => `${formatJalali(d, 'weekday', numerals)} · ساعت ${formatTime(d, numerals)}`;

export const formatNumber = (n: number, numerals: NumeralSystem = 'persian') => {
  const grouped = Math.round(n).toLocaleString('en-US');
  return numerals === 'persian' ? faDigits(grouped).replace(/,/g, '٬') : grouped;
};
export const formatToman = (n: number, numerals: NumeralSystem = 'persian') => `${formatNumber(n, numerals)} تومان`;

/** Relative phrasing used in timelines and countdowns. */
export const relativeLabel = (target: Date, now: Date, numerals: NumeralSystem = 'persian') => {
  const diffMin = Math.round((target.getTime() - now.getTime()) / 60_000);
  const abs = Math.abs(diffMin);
  const unit = abs < 60 ? `${abs} دقیقه` : abs < 60 * 48 ? `${Math.round(abs / 60)} ساعت` : `${Math.round(abs / 1440)} روز`;
  const s = diffMin >= 0 ? `${unit} دیگر` : `${unit} پیش`;
  return digits(s, numerals);
};
