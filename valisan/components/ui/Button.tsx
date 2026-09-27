'use client';
import Link from 'next/link';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'gold' | 'danger' | 'light';
type Size = 'sm' | 'md' | 'lg';

const base = 'press inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 ease-[var(--ease-out)] disabled:opacity-40 disabled:pointer-events-none select-none whitespace-nowrap';
const variants: Record<Variant, string> = {
  // Luminous orchid glass — deep magenta text keeps ≥7:1 contrast on ivory
  primary: 'bg-[#ffc5fe]/40 backdrop-blur-md border border-[#ffc5fe]/70 text-[#7A2F73] shadow-[inset_0_1px_1px_rgba(255,255,255,0.75),0_8px_24px_-12px_rgba(212,119,207,0.55)] hover:bg-[#ffc5fe]/55 hover:border-[#ffc5fe] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.85),0_14px_36px_-10px_rgba(255,197,254,0.95)] active:bg-[#ffc5fe]/65',
  // Airy lilac-mist glass with charcoal type
  secondary: 'bg-[#e0dff4]/40 backdrop-blur-md border border-[#e0dff4]/70 text-ink shadow-[inset_0_1px_1px_rgba(255,255,255,0.75),0_6px_18px_-12px_rgba(107,103,168,0.45)] hover:bg-[#e0dff4]/65 hover:border-lilac-300 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.85),0_12px_30px_-10px_rgba(201,199,234,0.9)] active:bg-[#e0dff4]/75',
  // For dark backdrops (CTA band): pearl glass with charcoal type
  light: 'bg-white/85 backdrop-blur-md border border-white/80 text-ink shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_10px_28px_-12px_rgba(0,0,0,0.35)] hover:bg-white',
  ghost: 'bg-transparent text-ink hover:bg-brand-50 active:bg-brand-100',
  gold: 'bg-transparent text-ink border border-gold-400 hover:bg-gold-400/10',
  danger: 'bg-transparent text-danger border border-danger/70 hover:bg-danger/8',
};
const sizes: Record<Size, string> = { sm: 'h-10 px-4 text-[13px] md:h-9', md: 'h-12 px-6 text-[14.5px] md:h-10 md:px-5', lg: 'h-13 px-8 text-[15px] md:h-12' };

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant; size?: Size; href?: string; loading?: boolean; full?: boolean;
}

export function Button({ variant = 'primary', size = 'md', href, loading, full, className, children, ...rest }: ButtonProps) {
  const cls = cn(base, variants[variant], sizes[size], full && 'w-full', className);
  if (href) return <Link href={href} prefetch={false} className={cls} aria-disabled={rest.disabled}>{children}</Link>;
  return (
    <button className={cls} disabled={rest.disabled || loading} {...rest}>
      {loading ? <span className="dots" aria-label="در حال انجام"><span /><span /><span /></span> : children}
    </button>
  );
}
