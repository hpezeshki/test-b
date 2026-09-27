'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ShieldCheck, TimerReset } from 'lucide-react';
import { useHydrated, useStore } from '@/data/store';
import { useFmt, useQueryParam } from '@/lib/hooks';
import type { IpgFailure } from '@/domain/types';
import { Button, Input } from '@/components/ui';
import { GuardSkeleton } from '@/lib/rbac';

/** ZarinPal-style gateway simulation. No real network call: the outcome is chosen on screen. */
export function IpgSimulator() {
  const router = useRouter();
  const txId = useQueryParam('tx');
  const pkgSlug = useQueryParam('pkg');
  const hydrated = useHydrated();
  const tx = useStore((s) => s.transactions).find((t) => t.id === txId);
  const complete = useStore((s) => s.completeIpg);
  const f = useFmt();
  const [pan, setPan] = useState('6037 9975 1234 4410');
  const [cvv, setCvv] = useState('123');
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState<'success' | IpgFailure | null>(null);
  const [left, setLeft] = useState(10 * 60);
  useEffect(() => { const id = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000); return () => clearInterval(id); }, []);

  if (!hydrated || txId === null) return <GuardSkeleton />;
  if (!tx) return <div className="container-x py-24 text-center text-muted">تراکنش یافت نشد.<div className="mt-4"><Button href="/pricing" variant="ghost">بازگشت</Button></div></div>;

  const finish = (outcome: 'success' | IpgFailure) => {
    setBusy(outcome);
    setTimeout(() => { complete(tx.id, outcome); router.push(`/join/${pkgSlug ?? 'monthly-12'}/done/`); }, 1400);
  };
  const mm = String(Math.floor(left / 60)).padStart(2, '0'), ss = String(left % 60).padStart(2, '0');

  return (
    <div className="min-h-[80vh] bg-[#F4F6F8] py-10" dir="rtl">
      <div className="mx-auto w-[min(94vw,460px)] overflow-hidden rounded-2xl bg-white shadow-lg" style={{ fontFamily: 'var(--font-fa)' }}>
        <div className="flex items-center justify-between bg-[#FFD400] px-5 py-3">
          <div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-[#1C1C1C] latin text-[13px] font-semibold text-[#FFD400]">ZP</span><span className="text-[15px] font-medium text-[#1C1C1C]">درگاه پرداخت زرین‌پال</span></div>
          <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] text-[#1C1C1C]">شبیه‌سازی</span>
        </div>
        <div className="space-y-4 p-5 text-[14px]">
          <div className="rounded-xl bg-[#F4F6F8] p-4">
            <div className="flex items-center justify-between"><span className="text-[#6B7280]">پذیرنده</span><span className="font-medium">استودیو والیسان</span></div>
            <div className="mt-2 flex items-center justify-between"><span className="text-[#6B7280]">مبلغ</span><span className="font-medium tabular">{f.n(tx.amountToman * 10)} ریال</span></div>
            <div className="mt-2 flex items-center justify-between"><span className="text-[#6B7280]">شناسه پرداخت</span><span className="latin text-[12px] tabular text-[#6B7280]">{tx.ipg?.authority.slice(-12)}</span></div>
          </div>
          <label className="block"><span className="text-[12px] text-[#6B7280]">شماره کارت</span><Input dir="ltr" className="mt-1 latin tabular text-start" value={pan} onChange={(e) => setPan(e.target.value)} /></label>
          <div className="grid grid-cols-3 gap-3">
            <label className="block"><span className="text-[12px] text-[#6B7280]">CVV2</span><Input dir="ltr" className="mt-1 text-start tabular" value={cvv} onChange={(e) => setCvv(e.target.value)} /></label>
            <label className="block"><span className="text-[12px] text-[#6B7280]">تاریخ انقضا</span><Input dir="ltr" className="mt-1 text-start tabular" defaultValue="08/07" /></label>
            <label className="block"><span className="text-[12px] text-[#6B7280]">رمز پویا</span><div className="mt-1 flex gap-1"><Input dir="ltr" className="text-start tabular" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="••••••" /><button type="button" onClick={() => setOtp('482913')} className="shrink-0 rounded-lg border border-[#E5E7EB] px-2 text-[11px] text-[#374151]">دریافت</button></div></label>
          </div>
          <div className="flex items-center justify-between text-[12px] text-[#6B7280]"><span className="flex items-center gap-1"><TimerReset size={14} /> زمان باقی‌مانده <span className="tabular">{f.s(`${mm}:${ss}`)}</span></span><span className="flex items-center gap-1"><Lock size={12} /> SSL</span></div>
          <button onClick={() => finish('success')} disabled={!!busy} className="h-12 w-full rounded-xl bg-[#1C1C1C] text-[15px] font-medium text-white transition hover:bg-black disabled:opacity-60">{busy === 'success' ? 'در حال ارتباط با بانک…' : 'پرداخت'}</button>
          <button onClick={() => finish('user_cancelled')} disabled={!!busy} className="h-11 w-full rounded-xl border border-[#E5E7EB] text-[14px] text-[#374151] hover:bg-[#F9FAFB] disabled:opacity-60">انصراف و بازگشت به پذیرنده</button>
          <details className="rounded-xl border border-dashed border-[#E5E7EB] p-3 text-[12px] text-[#6B7280]">
            <summary className="cursor-pointer">شبیه‌سازی خطا (ابزار نمایشی)</summary>
            <div className="mt-2 flex flex-wrap gap-2">
              <button onClick={() => finish('insufficient_funds')} disabled={!!busy} className="rounded-lg bg-[#FEE2E2] px-3 py-1.5 text-[#991B1B]">موجودی ناکافی</button>
              <button onClick={() => finish('gateway_timeout')} disabled={!!busy} className="rounded-lg bg-[#FEF3C7] px-3 py-1.5 text-[#92400E]">قطع ارتباط درگاه</button>
            </div>
          </details>
          <div className="flex items-center justify-center gap-1 text-[11px] text-[#9CA3AF]"><ShieldCheck size={12} /> این صفحه یک شبیه‌ساز است و هیچ تراکنش واقعی انجام نمی‌دهد.</div>
        </div>
      </div>
    </div>
  );
}
