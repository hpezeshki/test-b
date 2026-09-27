'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { useHydrated, useStore } from '@/data/store';
import { useSessionUser } from '@/lib/hooks';
import type { Role } from '@/domain/types';
import { ROLE_LABEL } from '@/domain/labels';
import { Button } from '@/components/ui/Button';

/**
 * Client-side role guard (Phase 2). In Phase 3 the same matrix becomes Supabase RLS policies,
 * so the database enforces it server-side as well.
 */
export function RoleGuard({ allow, children, next }: { allow: Role[]; children: React.ReactNode; next: string }) {
  const hydrated = useHydrated();
  const user = useSessionUser();
  const router = useRouter();
  useEffect(() => {
    if (hydrated && !user) router.replace(`/login?next=${encodeURIComponent(next)}`);
  }, [hydrated, user, router, next]);

  if (!hydrated || !user) return <GuardSkeleton />;
  if (!allow.includes(user.role)) return <Forbidden role={user.role} />;
  return <>{children}</>;
}

export function GuardSkeleton() {
  return (
    <div className="container-x py-16 space-y-6" aria-busy="true">
      <div className="skeleton h-8 w-48" />
      <div className="grid gap-4 md:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-36" />)}</div>
      <div className="skeleton h-64" />
    </div>
  );
}

function Forbidden({ role }: { role: Role }) {
  const logout = useStore((s) => s.logout);
  return (
    <div className="container-x py-24">
      <div className="card mx-auto max-w-md p-10 text-center space-y-4 fade-up">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-brand-50 text-brand-700"><ShieldAlert size={26} /></div>
        <h1 className="text-xl font-medium">دسترسی غیرمجاز</h1>
        <p className="text-ink-2">این بخش برای نقش «{ROLE_LABEL[role]}» در دسترس نیست. این تلاش در گزارش امنیتی ثبت شد.</p>
        <div className="flex justify-center gap-3 pt-2">
          <Button href="/" variant="ghost">بازگشت به خانه</Button>
          <Button onClick={() => { void logout(); }} variant="secondary">خروج و ورود با حساب دیگر</Button>
        </div>
      </div>
    </div>
  );
}
