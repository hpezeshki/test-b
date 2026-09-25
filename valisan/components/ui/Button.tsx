'use client';
import Link from 'next/link';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'gold' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const base = 'inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] font-medium transition-all duration-200 ease-[var(--ease-out)] disabled:opacity-40 disabled:pointer-events-none select-none whitespace-nowrap';
const variants: Record<Variant, string> = {
  primary: 'bg-ink text-on-brand hover:bg-[#2A2A2A] hover:shadow-md active:bg-[#141414]',
  secondary: 'bg-brand-100 text-brand-700 hover:bg-brand-300 hover:text-ink active:bg-brand-500',
  ghost: 'bg-transparent text-ink hover:bg-brand-50 active:bg-brand-100',
  gold: 'bg-transparent text-ink border border-gold-400 hover:bg-gold-400/10',
  danger: 'bg-transparent text-danger border border-danger hover:bg-danger/8',
};
const sizes: Record<Size, string> = { sm: 'h-9 px-3 text-[13px]', md: 'h-11 md:h-10 px-5 text-[14px]', lg: 'h-12 px-7 text-[15px]' };

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
