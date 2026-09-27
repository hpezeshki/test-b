'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck } from 'lucide-react';
import { useStore } from '@/data/store';
import { useFmt, useNow } from '@/lib/hooks';
import { NOTIFICATION_KIND_LABEL } from '@/domain/labels';
import { cn } from '@/lib/cn';

export function NotificationBell() {
  const userId = useStore((s) => s.sessionUserId);
  const all = useStore((s) => s.notifications);
  const markRead = useStore((s) => s.markNotificationsRead);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const f = useFmt();
  const now = useNow();
  const mine = useMemo(() => all.filter((n) => n.userId === userId && n.channel === 'in_app').slice(0, 12), [all, userId]);
  const unread = mine.filter((n) => !n.readAt).length;
  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  if (!userId) return null;
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="press relative grid size-11 place-items-center rounded-full hover:bg-brand-50 md:size-10" aria-label="اعلان‌ها">
        <Bell size={19} />
        {unread > 0 && <span className="absolute -top-0.5 -end-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-lilac-500 px-1 text-[11px] font-medium text-on-brand shadow-brand">{f.s(unread)}</span>}
      </button>
      {open && (
        <div className="fade-up glass-strong absolute end-0 top-12 z-40 w-[min(92vw,360px)] overflow-hidden rounded-[var(--radius-lg)]">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="font-medium">اعلان‌ها</div>
            {unread > 0 && <button onClick={markRead} className="flex items-center gap-1 text-[12px] text-brand-700 hover:underline"><CheckCheck size={14} /> خواندن همه</button>}
          </div>
          <ul className="max-h-[60vh] overflow-y-auto">
            {mine.length === 0 && <li className="p-6 text-center text-[13px] text-muted">اعلانی ندارید.</li>}
            {mine.map((n) => (
              <li key={n.id} className={cn('border-b border-border/70 px-4 py-3 last:border-0', !n.readAt && 'bg-brand-50/50')}>
                <Link prefetch={false} href={n.deepLink ?? '#'} onClick={() => setOpen(false)} className="block">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] text-brand-700">{NOTIFICATION_KIND_LABEL[n.kind]}</span>
                    <span className="text-[11px] text-muted">{f.rel(n.createdAt, now)}</span>
                  </div>
                  <div className="mt-0.5 text-[14px] font-medium">{n.title}</div>
                  <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-5 text-ink-2">{f.s(n.body)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
