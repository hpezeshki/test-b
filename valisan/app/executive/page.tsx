import type { Metadata } from 'next';
import { Overview } from '@/components/executive/Pages';
export const metadata: Metadata = { title: 'نمای کلی مدیریت' };
export default function Page() { return <Overview />; }
