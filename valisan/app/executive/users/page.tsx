import type { Metadata } from 'next';
import { UsersPage } from '@/components/executive/Pages';
export const metadata: Metadata = { title: 'کاربران' };
export default function Page() { return <UsersPage />; }
