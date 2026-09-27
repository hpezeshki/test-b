'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, FastForward, FileHeart, LayoutDashboard, ReceiptText, RotateCcw, ScrollText, Settings2, Users } from 'lucide-react';
import { useStore } from '@/data/store';
import { RoleGuard } from '@/lib/rbac';
import { useFmt, useNow } from '@/lib/hooks';
import { cn } from '@/lib/cn';

const NAV = [
  { href: '/executive', label: 'نمای کلی', icon: LayoutDashboard },
  { href: '/executive/queue', label: 'صف بررسی رسیدها', icon: ReceiptText, badge: true },
  { href: '/executive/ledger', label: 'دفتر مالی', icon: Activity },
  { href: '/executive/users', label: 'کاربران', icon: Users },
  { href: '/executive/health', label: 'پرونده‌های سلامت', icon: FileHeart },
  { href: '/executive/settings', label: 'تنظیمات', icon: Settings2 },
  { href: '/executive/audit', label: 'گزارش و پیامک‌ها', icon: ScrollText },
];

export function ExecutiveShell({ title, children, actions }: { title: string; children: React.ReactNode; actions?: React.ReactNode }) {
  const pathname = usePathname();
  const pending = useStore((s) => s.transactions).filter((t) => t.status === 'pending_verification').length;
  const ff = useStore((s) => s.fastForward);
  const reset = useStore((s) => s.resetDemo);
  const f = useFmt();
  const now = useNow(1000);
  return (
    <RoleGuard allow={['super_admin']} next={pathname ?? '/executive'}>
      <section className="container-x py-8 md:py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div><div className="eyebrow">Executive Suite · Restricted</div><h1 className="mt-1 text-[26px] font-light md:text-[30px]">{title}</h1></div>
          <div className="flex flex-wrap items-center gap-2 text-[12px]">
            <span className="rounded-full border border-border bg-surface px-3 py-1.5 tabular text-muted">ساعت نمایشی: {f.d(now, 'weekday')} {f.t(now)}</span>
            <button onClick={() => ff(30)} className="flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1.5 hover:bg-brand-50" title="۳۰ دقیقه جلو"><FastForward size={13} /> {f.s(30)} دقیقه</button>
            <button onClick={() => ff(24 * 60)} className="flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1.5 hover:bg-brand-50" title="یک روز جلو"><FastForward size={13} /> {f.s(1)} روز</button>
            <button onClick={() => { if (confirm('همه داده‌های نمایشی بازنشانی شود؟')) reset(); }} className="flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1.5 hover:bg-brand-50"><RotateCcw size={13} /> بازنشانی</button>
            {actions}
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
          <nav className="flex gap-1 overflow-x-auto lg:flex-col" aria-label="مدیریت">
            {NAV.map((n) => {
              const active = pathname === n.href;
              return (
                <Link prefetch={false} key={n.href} href={n.href} className={cn('flex shrink-0 items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2.5 text-[13.5px] transition-colors', active ? 'bg-ink text-on-brand' : 'text-ink-2 hover:bg-brand-50')}>
                  <n.icon size={16} /> {n.label}
                  {n.badge && pending > 0 && <span className={cn('ms-auto rounded-full px-1.5 text-[11px] tabular', active ? 'bg-brand-300 text-ink' : 'bg-warning/20 text-[#9A6F1E]')}>{f.s(pending)}</span>}
                </Link>
              );
            })}
          </nav>
          <div className="min-w-0">{children}</div>
        </div>
      </section>
    </RoleGuard>
  );
}

export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-[13.5px]">
        <thead className="bg-surface-2 text-[12px] text-muted"><tr>{head.map((h) => <th key={h} className="px-4 py-3 text-start font-medium">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}
