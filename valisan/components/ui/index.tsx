'use client';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

export { Button } from './Button';
export { Photo } from './Photo';

export function Card({ className, children, hover, ...rest }: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return <div className={cn('card', hover && 'lift', className)} {...rest}>{children}</div>;
}

export type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'gold' | 'info';
const tones: Record<Tone, string> = {
  neutral: 'bg-lilac-100 text-lilac-700', brand: 'bg-brand-100 text-brand-700', success: 'bg-success/12 text-success', warning: 'bg-warning/14 text-[#9A6F1E]',
  danger: 'bg-danger/10 text-danger', gold: 'bg-gold-400/15 text-gold-600', info: 'bg-surface-2 text-ink-2',
};
export function Badge({ tone = 'neutral', className, children, dot }: { tone?: Tone; className?: string; children: React.ReactNode; dot?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-medium leading-6', tones[tone], className)}>
      {dot && <span className="size-1.5 rounded-full bg-current" />}{children}
    </span>
  );
}

export function Field({ label, hint, error, children, className }: { label: string; hint?: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn('block space-y-1.5', className)}>
      <span className="text-[13px] font-medium text-ink-2">{label}</span>
      {children}
      {error ? <span className="block text-[12px] text-danger">{error}</span> : hint ? <span className="block text-[12px] text-muted">{hint}</span> : null}
    </label>
  );
}

export const inputCls = 'w-full h-12 md:h-11 rounded-[var(--radius-sm)] border border-border-strong bg-white/80 px-4 text-[15px] text-ink placeholder:text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-all focus:border-brand-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-300/35 disabled:bg-surface-2';
export function Input({ className, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputCls, className)} {...rest} />;
}
export function Textarea({ className, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(inputCls, 'h-auto min-h-24 py-2.5', className)} {...rest} />;
}
export function Select({ className, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(inputCls, 'appearance-none', className)} {...rest}>{children}</select>;
}

export function Chip({ selected, onClick, children, disabled, className }: { selected?: boolean; onClick?: () => void; children: React.ReactNode; disabled?: boolean; className?: string }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-pressed={selected}
      className={cn('press inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-[14px] transition-all duration-200 md:min-h-10', selected ? 'border-brand-300 bg-gradient-to-br from-brand-100 to-brand-50 text-brand-700 shadow-brand' : 'border-border-strong bg-white/70 text-ink hover:border-brand-300 hover:bg-brand-50', disabled && 'opacity-40 pointer-events-none', className)}>
      {children}
    </button>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={cn('press flex w-full items-center justify-between gap-4 rounded-[var(--radius-sm)] border px-4 py-3.5 text-start transition-colors', checked ? 'border-brand-300 bg-brand-50' : 'border-border bg-white/70 hover:bg-brand-50/60')}>
      <span className="text-[14px]">{label}</span>
      <span className="flex items-center gap-2 text-[12px] text-muted"><span>{checked ? 'بله' : 'خیر'}</span>
        <span className={cn('relative inline-block h-6 w-11 rounded-full transition-colors', checked ? 'bg-gradient-to-r from-brand-300 to-brand-500 shadow-brand' : 'bg-border-strong')}>
          <span className={cn('absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-all', checked ? 'start-[22px]' : 'start-0.5')} />
        </span>
      </span>
    </button>
  );
}

export function Progress({ value, className }: { value: number; className?: string }) {
  return <div className={cn('h-2 w-full overflow-hidden rounded-full bg-lilac-100', className)}><div className="h-full rounded-full bg-gradient-to-r from-brand-300 via-brand-500 to-lilac-300 shadow-brand transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>;
}

export function Modal({ open, onClose, title, children, width = 'max-w-lg' }: { open: boolean; onClose: () => void; title?: string; children: React.ReactNode; width?: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#2A1F33]/35 p-0 backdrop-blur-md sm:items-center sm:p-6" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div className={cn('fade-up glass-strong w-full rounded-t-[var(--radius-xl)] p-5 pt-3 sm:rounded-[var(--radius-xl)] sm:p-6 max-h-[92vh] overflow-y-auto', width)} onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-lilac-300 sm:hidden" aria-hidden />
        <div className="mb-4 flex items-center justify-between">
          {title && <h3 className="text-lg font-medium">{title}</h3>}
          <button onClick={onClose} className="grid size-9 place-items-center rounded-full hover:bg-brand-50" aria-label="بستن"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Avatar({ name, hue = '10', size = 44, className, srcs }: { name: string; hue?: string; size?: number; className?: string; srcs?: string[] }) {
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('');
  const [i, setI] = useState(0);
  const src = srcs?.[i];
  return (
    <span className={cn('relative grid shrink-0 place-items-center overflow-hidden rounded-full font-medium text-ink ring-2 ring-white/80 shadow-[0_0_0_1px_rgba(255,197,254,0.6)]', className)} style={{ width: size, height: size, fontSize: size * 0.36, background: `linear-gradient(135deg, hsl(${hue} 60% 92%), hsl(${hue} 55% 78%))` }} aria-hidden>
      {initials}
      {src && <img src={src} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setI((n) => n + 1)} className="absolute inset-0 h-full w-full object-cover" />}
    </span>
  );
}

export function SectionHeading({ eyebrow, title, desc, align = 'center', className }: { eyebrow?: string; title: string; desc?: string; align?: 'center' | 'start'; className?: string }) {
  return (
    <div className={cn('mb-10 space-y-3', align === 'center' ? 'text-center mx-auto max-w-2xl' : 'text-start max-w-2xl', className)}>
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h2 className="text-[26px] md:text-[32px] font-light leading-[1.3]">{title}</h2>
      {desc && <p className="text-ink-2 leading-[1.9]">{desc}</p>}
    </div>
  );
}

export function Stat({ label, value, sub, tone = 'neutral' }: { label: string; value: string; sub?: string; tone?: Tone }) {
  return (
    <div className="card p-5">
      <div className="text-[13px] text-muted">{label}</div>
      <div className={cn('mt-1 text-2xl font-medium tabular', tone === 'brand' && 'text-brand-700', tone === 'success' && 'text-success', tone === 'warning' && 'text-[#9A6F1E]')}>{value}</div>
      {sub && <div className="mt-1 text-[12px] text-muted">{sub}</div>}
    </div>
  );
}

export function Empty({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="card-lilac p-10 text-center space-y-2 border-dashed">
      <div className="mx-auto mb-2 size-10 rounded-full bg-gradient-to-br from-brand-100 to-lilac-100" />
      <div className="font-medium">{title}</div>
      {desc && <p className="text-[14px] text-muted">{desc}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn('h-px w-full bg-border', className)} />;
}
