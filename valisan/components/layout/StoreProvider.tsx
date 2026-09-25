'use client';
import { useEffect } from 'react';
import { bootstrapStore, useStore } from '@/data/store';
import { Toasts } from './Toasts';

/** Boots the persisted mock engine on the client and runs the reminder scheduler. */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void bootstrapStore();
    const id = setInterval(() => useStore.getState().tickReminders(), 30_000);
    return () => clearInterval(id);
  }, []);
  return (
    <>
      {children}
      <Toasts />
    </>
  );
}
