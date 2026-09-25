import type { Metadata } from 'next';
import { AuditPage } from '@/components/executive/Pages';
export const metadata: Metadata = { title: 'گزارش فعالیت' };
export default function Page() { return <AuditPage />; }
