'use client';
import { useEffect } from 'react';
import { MessageSquareText, Info, X } from 'lucide-react';
import { useStore } from '@/data/store';
import { useFmt } from '@/lib/hooks';

/** Simulated SMS (Kavenegar-style bubble) + system toasts. Bottom-start, 6 s auto-dismiss. */
export function Toasts() {
  const toasts = useStore((s) => s.toasts);
  const dismiss = useStore((s) => s.dismissToast);
  const sender = useStore((s) => s.settings.smsSenderName);
  const f = useFmt();
  useEffect(() => {
    if (!toasts.length) return;
    const id = setTimeout(() => dismiss(toasts[0].id), 6000);
    return () => clearTimeout(id);
  }, [toasts, dismiss]);
  if (!toasts.length) return null;
  return (
    <div className="pointer-events-none fixed bottom-4 start-4 z-[60] flex w-[min(92vw,380px)] flex-col gap-3" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast-in pointer-events-auto glass rounded-[var(--radius-lg)] p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className={`grid size-9 shrink-0 place-items-center rounded-full ${t.kind === 'sms' ? 'bg-success/15 text-success' : 'bg-brand-100 text-brand-700'}`}>
              {t.kind === 'sms' ? <MessageSquareText size={18} /> : <Info size={18} />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[12px] text-muted">{t.kind === 'sms' ? <>پیامک از <span className="latin font-medium text-ink">{sender}</span>{t.to ? <> · به {f.s(t.to)}</> : null}</> : 'اعلان سیستم'}</div>
                <button onClick={() => dismiss(t.id)} className="text-muted hover:text-ink" aria-label="بستن"><X size={14} /></button>
              </div>
              <div className="mt-0.5 text-[14px] font-medium">{t.title}</div>
              <p className="mt-0.5 text-[13px] leading-6 text-ink-2">{f.s(t.body)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
