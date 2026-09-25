'use client';
import { useState } from 'react';
import { cn } from '@/lib/cn';

export interface PhotoProps {
  srcs: string[];
  alt: string;
  className?: string;
  imgClassName?: string;
  hue?: string;          // fallback gradient hue when every candidate fails
  priority?: boolean;    // eager-load above the fold
  hover?: boolean;       // subtle zoom on parent .group hover
  overlay?: 'none' | 'soft' | 'strong';
  sizes?: string;
  children?: React.ReactNode;
}

/**
 * Editorial photo frame: rounded, hairline border, slow zoom on hover, shimmer while loading,
 * and a graceful fall-through (next candidate → brand gradient) so a missing photo never breaks the layout.
 */
export function Photo({ srcs, alt, className, imgClassName, hue = '10', priority, hover = true, overlay = 'none', children }: PhotoProps) {
  const [i, setI] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const src = srcs[i];
  return (
    <div className={cn('group/photo relative overflow-hidden bg-surface-2', className)} style={!src ? { background: `linear-gradient(135deg, hsl(${hue} 60% 94%), hsl(${hue} 55% 80%))` } : undefined}>
      {src && !loaded && <div className="skeleton absolute inset-0 !rounded-none" aria-hidden />}
      {src && (
        <img
          key={src}
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={() => { setLoaded(false); setI((n) => n + 1); }}
          className={cn('h-full w-full object-cover transition-all duration-700 ease-[var(--ease-out)]', loaded ? 'opacity-100' : 'opacity-0', hover && 'group-hover:scale-[1.04] group-hover/photo:scale-[1.03]', imgClassName)}
        />
      )}
      {overlay !== 'none' && <div className={cn('pointer-events-none absolute inset-0', overlay === 'soft' ? 'bg-gradient-to-t from-ink/35 via-ink/5 to-transparent' : 'bg-ink/55')} aria-hidden />}
      {children}
    </div>
  );
}
