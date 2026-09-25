import type { Metadata } from 'next';
import { Queue } from '@/components/executive/Pages';
export const metadata: Metadata = { title: 'صف بررسی رسیدها' };
export default function Page() { return <Queue />; }
