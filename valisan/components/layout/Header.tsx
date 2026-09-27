'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { useHydrated, useStore } from '@/data/store';
import { useSessionUser } from '@/lib/hooks';
import { ROLE_LABEL } from '@/domain/labels';
import { cn } from '@/lib/cn';
import { NotificationBell } from './NotificationBell';
import { Button } from '@/components/ui/Button';

const NAV = [
  { href: '/about', label: 'درباره استودیو' },
  { href: '/classes', label: 'کلاس‌ها' },
  { href: '/coaches', label: 'مربیان' },
  { href: '/pricing', label: 'عضویت و قیمت‌ها' },
  { href: '/blog', label: 'مجله سلامت' },
  { href: '/contact', label: 'تماس' },
];

export const portalHome = (role: string) => (role === 'super_admin' ? '/executive' : role === 'coach' ? '/coach' : '/portal');

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const user = useSessionUser();
  const hydrated = useHydrated();
  const numerals = useStore((s) => s.numerals);
  const setNumerals = useStore((s) => s.setNumerals);
  const logout = useStore((s) => s.logout);
  useEffect(() => { const on = () => setScrolled(window.scrollY > 8); on(); window.addEventListener('scroll', on, { passive: true }); return () => window.removeEventListener('scroll', on); }, []);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className={cn('sticky top-0 z-40 border-b backdrop-blur-lg backdrop-saturate-150 transition-all duration-300', scrolled || open ? 'bg-bg/85 border-brand-300/50 shadow-[0_8px_30px_-16px_rgba(212,119,207,0.35)]' : 'bg-bg/70 border-brand-300/25')}>
      <div className="container-x flex h-16 items-center justify-between gap-3 md:h-[72px]">
        <Link prefetch={false} href="/" className="flex shrink-0 items-center gap-3" aria-label="والیسان">
          <img src="/brand/logo-v.png" alt="" className="h-9 w-auto object-contain mix-blend-multiply md:h-10" />
          <span className="flex flex-col leading-none">
            <span className="latin text-[19px] font-semibold tracking-[0.18em] text-ink md:text-[20px]">VALISAN</span>
            <span className="eyebrow whitespace-nowrap text-[9px] tracking-[0.28em]">Pilates · Yoga · Wellness</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="اصلی">
          {NAV.map((n) => (
            <Link prefetch={false} key={n.href} href={n.href} className={cn('whitespace-nowrap rounded-full px-2.5 py-2 text-[13.5px] transition-colors hover:bg-brand-50', pathname?.startsWith(n.href) ? 'text-brand-700 font-medium' : 'text-ink-2')}>{n.label}</Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          <button onClick={() => setNumerals(numerals === 'persian' ? 'latin' : 'persian')} className="hidden h-9 items-center gap-1 rounded-full border border-border px-2.5 text-[12px] text-ink-2 hover:bg-brand-50 sm:flex tabular" title="تغییر نمایش اعداد" aria-label="تغییر نمایش اعداد">
            <span className={cn(numerals === 'persian' ? 'text-ink font-medium' : 'text-muted')}>۱۲۳</span><span className="text-border-strong">|</span><span className={cn('latin', numerals === 'latin' ? 'text-ink font-medium' : 'text-muted')}>123</span>
          </button>
          <NotificationBell />
          {hydrated && user ? (
            <div className="hidden items-center gap-1 md:flex">
              <Link prefetch={false} href={portalHome(user.role)} className="flex h-9 items-center gap-2 whitespace-nowrap rounded-full bg-brand-50 ps-1.5 pe-3 text-[13px] hover:bg-brand-100">
                <span className="grid size-6 place-items-center rounded-full bg-brand-300 text-[11px] text-ink">{user.firstName[0]}</span>
                <span className="font-medium">{user.firstName}</span><span className="hidden text-muted xl:inline">· {ROLE_LABEL[user.role]}</span>
              </Link>
              <button onClick={() => { void logout(); }} className="grid size-9 place-items-center rounded-full text-muted hover:bg-brand-50 hover:text-ink" aria-label="خروج"><LogOut size={17} /></button>
            </div>
          ) : (
            <div className="hidden md:block"><Button href="/login" size="sm" variant="ghost">ورود</Button></div>
          )}
          {!(hydrated && user) && <div className="hidden md:block"><Button href="/pricing" size="sm">شروع ثبت‌نام</Button></div>}
          <button className="press grid size-11 place-items-center rounded-full hover:bg-brand-50 lg:hidden" onClick={() => setOpen((o) => !o)} aria-label="منو" aria-expanded={open}>{open ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>

      {open && (
        <div className="fade-up border-t border-brand-300/30 lg:hidden">
          <nav className="container-x flex flex-col py-3" aria-label="موبایل">
            {NAV.map((n) => <Link prefetch={false} key={n.href} href={n.href} className="press rounded-[var(--radius-sm)] px-3 py-3.5 text-[15px] hover:bg-brand-50">{n.label}</Link>)}
            <div className="my-2 h-px bg-border" />
            {hydrated && user ? (
              <>
                <Link prefetch={false} href={portalHome(user.role)} className="flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-3 text-[15px] hover:bg-brand-50"><LayoutDashboard size={18} /> پنل {ROLE_LABEL[user.role]} · {user.firstName}</Link>
                <button onClick={() => { void logout(); }} className="flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-3 text-start text-[15px] text-muted hover:bg-brand-50"><LogOut size={18} /> خروج</button>
              </>
            ) : <Link prefetch={false} href="/login" className="rounded-[var(--radius-sm)] px-3 py-3 text-[15px] hover:bg-brand-50">ورود</Link>}
            <div className="flex items-center gap-3 px-3 py-3">
              <Button href="/pricing" full>شروع ثبت‌نام</Button>
              <button onClick={() => setNumerals(numerals === 'persian' ? 'latin' : 'persian')} className="h-11 shrink-0 rounded-[var(--radius-sm)] border border-border px-4 text-[13px] tabular">{numerals === 'persian' ? '۱۲۳' : '123'}</button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
