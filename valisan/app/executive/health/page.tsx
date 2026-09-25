import type { Metadata } from 'next';
import { HealthRecords } from '@/components/executive/Pages';
export const metadata: Metadata = { title: 'پرونده‌های سلامت' };
export default function Page() { return <HealthRecords />; }
