'use client';
import Link from 'next/link';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'gold' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const base = 'press inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 ease-[var(--ease-out)] disabled:opacity-40 disabled:pointer-events-none select-none whitespace-nowrap';
const variants: Record<Variant, string> = {
  primary: 'bg-ink text-on-brand shadow-[0_8px_24px_-10px_rgba(30,30,30,0.5)] hover:bg-[#2A2A2A] hover:shadow-md active:bg-[#141414]',
  secondary: 'bg-gradient-to-br from-brand-100 to-lilac-100 text-brand-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_6px_18px_-10px_rgba(212,119,207,0.5)] hover:from-brand-300 hover:to-brand-100 hover:text-ink',
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
  if (href) return <Link href={href} className={cls} aria-disabled={rest.disabled}>{children}</Link>;
  return (
    <button className={cls} disabled={rest.disabled || loading} {...rest}>
      {loading ? <span className="dots" aria-label="در حال انجام"><span /><span /><span /></span> : children}
    </button>
  );
}
