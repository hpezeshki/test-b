'use client';
import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/data/store';
import { digits, formatDateTime, formatJalali, formatNumber, formatTime, formatToman, relativeLabel, type DateStyle } from '@/domain/jalali';

/** Numeral-aware formatters bound to the user's preference. */
export function useFmt() {
  const numerals = useStore((s) => s.numerals);
  return useMemo(() => ({
    numerals,
    n: (v: number) => formatNumber(v, numerals),
    s: (v: string | number) => digits(v, numerals),
    d: (v: Date | string, style: DateStyle = 'long') => formatJalali(new Date(v), style, numerals),
    t: (v: Date | string) => formatTime(new Date(v), numerals),
    dt: (v: Date | string) => formatDateTime(new Date(v), numerals),
    toman: (v: number) => formatToman(v, numerals),
    rel: (v: Date | string, now: Date) => relativeLabel(new Date(v), now, numerals),
  }), [numerals]);
}

/** Simulated "now" (real clock + demo offset), re-evaluated every 30 s and on fast-forward. */
export function useNow(intervalMs = 30_000) {
  const offset = useStore((s) => s.clockOffsetMs);
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick((t) => t + 1), intervalMs); return () => clearInterval(id); }, [intervalMs]);
  return useMemo(() => new Date(Date.now() + offset), [offset, tick]);
}

export function useSessionUser() {
  const id = useStore((s) => s.sessionUserId);
  const users = useStore((s) => s.users);
  return useMemo(() => users.find((u) => u.id === id) ?? null, [users, id]);
}

/** Reads a query-string value on the client (static export has no server-side search params). */
export function useQueryParam(key: string) {
  const [v, setV] = useState<string | null>(null);
  useEffect(() => { setV(new URLSearchParams(window.location.search).get(key)); }, [key]);
  return v;
}

export function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (text: string, key = text) => {
    try { await navigator.clipboard.writeText(text); } catch { /* clipboard blocked → still show feedback */ }
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1600);
  };
  return { copied, copy };
}
