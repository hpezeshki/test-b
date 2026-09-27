'use client';
import { Check } from 'lucide-react';
import type { Package } from '@/domain/types';
import { useFmt } from '@/lib/hooks';
import { RoleGuard } from '@/lib/rbac';
import { cn } from '@/lib/cn';

const STEPS = ['ارزیابی سلامت', 'انتخاب زمان', 'پرداخت', 'تأیید'];

export function FunnelShell({ pkg, step, children, aside }: { pkg: Package; step: 1 | 2 | 3 | 4; children: React.ReactNode; aside?: React.ReactNode }) {
  const f = useFmt();
  return (
    <RoleGuard allow={['student', 'super_admin']} next={`/join/${pkg.slug}/${['assessment', 'schedule', 'checkout', 'done'][step - 1]}`}>
      <section className="container-x py-10 md:py-14">
        <ol className="mx-auto mb-10 flex max-w-2xl items-center gap-2" aria-label="مراحل ثبت‌نام">
          {STEPS.map((s, i) => {
            const n = i + 1;
            const state = n < step ? 'done' : n === step ? 'current' : 'todo';
            return (
              <li key={s} className="flex flex-1 items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className={cn('grid size-7 shrink-0 place-items-center rounded-full text-[12px] tabular transition-colors', state === 'done' && 'bg-gradient-to-br from-brand-300 to-brand-100 text-ink shadow-brand', state === 'current' && 'bg-ink text-on-brand ring-2 ring-brand-300 ring-offset-2 ring-offset-bg', state === 'todo' && 'border border-border-strong text-muted')}>{state === 'done' ? <Check size={14} /> : f.s(n)}</span>
                  <span className={cn('hidden text-[13px] sm:block', state === 'current' ? 'font-medium' : 'text-muted')}>{s}</span>
                </div>
                {i < STEPS.length - 1 && <span className={cn('h-px flex-1', n < step ? 'bg-brand-300' : 'bg-border-strong')} />}
              </li>
            );
          })}
        </ol>
        <div className={cn('grid gap-8', !!aside && 'lg:grid-cols-[1fr_320px]')}>
          <div>{children}</div>
          {aside && <aside className="h-fit lg:sticky lg:top-24">{aside}</aside>}
        </div>
      </section>
    </RoleGuard>
  );
}

export function PackageSummary({ pkg, slotLine }: { pkg: Package; slotLine?: React.ReactNode }) {
  const f = useFmt();
  return (
    <div className="card p-6">
      <div className="text-[12px] text-muted">بسته انتخابی</div>
      <div className="mt-1 text-[18px] font-medium">{pkg.title}</div>
      <div className="mt-1 text-[13px] text-ink-2">{f.s(pkg.sessionQuota)} جلسه · اعتبار {f.s(pkg.validityDays)} روز</div>
      {slotLine && <div className="mt-4 rounded-[var(--radius-sm)] bg-brand-50 p-3 text-[13px]">{slotLine}</div>}
      <div className="mt-5 flex items-baseline justify-between border-t border-border pt-4">
        <span className="text-[13px] text-muted">مبلغ قابل پرداخت</span>
        <span className="text-[20px] font-medium tabular">{f.toman(pkg.priceToman)}</span>
      </div>
    </div>
  );
}
