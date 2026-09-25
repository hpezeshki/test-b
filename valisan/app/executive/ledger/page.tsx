import type { Metadata } from 'next';
import { Ledger } from '@/components/executive/Pages';
export const metadata: Metadata = { title: 'دفتر مالی' };
export default function Page() { return <Ledger />; }
