'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, UserRound, Dumbbell, Crown } from 'lucide-react';
import { useHydrated, useStore } from '@/data/store';
import { DEMO_ACCOUNTS } from '@/data/seed/users';
import { useQueryParam, useSessionUser } from '@/lib/hooks';
import { portalHome } from '@/components/layout/Header';
import { Button, Card, Field, Input } from '@/components/ui';
import { useFmt } from '@/lib/hooks';

/** Role gate for the post-login redirect, mirroring the RoleGuard matrix. */
function canOpen(path: string, role: string) {
  if (!path.startsWith('/') || path.startsWith('//')) return false;
  if (path.startsWith('/executive')) return role === 'super_admin';
  if (path.startsWith('/coach')) return role === 'coach' || role === 'super_admin';
  if (path.startsWith('/portal') || path.startsWith('/join') || path.startsWith('/pay')) return role === 'student' || role === 'super_admin';
  return true;
}

export function LoginForm() {
  const router = useRouter();
  const next = useQueryParam('next');
  const login = useStore((s) => s.login);
  const hydrated = useHydrated();
  const user = useSessionUser();
  const f = useFmt();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (hydrated && user) router.replace(next && canOpen(next, user.role) ? next : portalHome(user.role)); }, [hydrated, user, router, next]);

  const submit = (p = phone, pw = password) => {
    setBusy(true); setError(null);
    setTimeout(() => {
      const r = login(p, pw);
      setBusy(false);
      if (!r.ok) setError(r.reason ?? 'خطا');
    }, 450);
  };

  const demos = [
    { key: 'student', icon: UserRound, label: 'هنرجو', name: 'نازنین احمدی', desc: 'پنل هنرجو، رزرو و جابه‌جایی', ...DEMO_ACCOUNTS.student },
    { key: 'coach', icon: Dumbbell, label: 'مربی', name: 'سارا محمدی', desc: 'برنامه هفتگی و لیست حاضرین', ...DEMO_ACCOUNTS.coach },
    { key: 'admin', icon: Crown, label: 'مدیر ارشد', name: 'مدیریت والیسان', desc: 'دفتر مالی، بررسی رسیدها، پرونده‌ها', ...DEMO_ACCOUNTS.admin },
  ];

  return (
    <section className="container-x py-16">
      <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[1fr_1fr]">
        <Card className="p-8">
          <div className="eyebrow">Sign in</div>
          <h1 className="mt-2 text-[26px] font-light">ورود به والیسان</h1>
          <p className="mt-1 text-[13px] text-muted">با شماره موبایل و رمز عبور وارد شوید.</p>
          <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); submit(); }}>
            <Field label="شماره موبایل"><Input inputMode="tel" dir="ltr" className="latin text-start" placeholder="09xxxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="username" /></Field>
            <Field label="رمز عبور" error={error ?? undefined}><Input type="password" dir="ltr" className="text-start" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></Field>
            <Button type="submit" full loading={busy} disabled={!phone || !password}>ورود</Button>
          </form>
          <div className="mt-5 flex items-center gap-2 text-[12px] text-muted"><ShieldCheck size={14} className="text-success" /> ورود در نسخه نمایشی بدون پیامک واقعی انجام می‌شود.</div>
        </Card>
        <div className="space-y-3">
          <div className="text-[14px] font-medium">حساب‌های نمایشی</div>
          <p className="text-[13px] text-muted">برای تجربه هر نقش، یکی را انتخاب کنید؛ فرم به‌صورت خودکار پر و ارسال می‌شود.</p>
          {demos.map((d) => (
            <button key={d.key} onClick={() => { setPhone(d.phone); setPassword(d.password); submit(d.phone, d.password); }} disabled={!hydrated || busy} className="card lift flex w-full items-center gap-4 p-4 text-start disabled:opacity-50">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700"><d.icon size={20} /></span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2"><span className="font-medium">{d.label}</span><span className="text-[12px] text-muted">· {d.name}</span></span>
                <span className="block text-[12px] text-muted">{d.desc}</span>
              </span>
              <span className="latin text-[12px] tabular text-muted">{f.s(d.phone)}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
