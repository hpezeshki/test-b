import type { Metadata } from 'next';
import { CoachDashboard } from '@/components/coach/CoachDashboard';
export const metadata: Metadata = { title: 'پنل مربی' };
export default function CoachPage() { return <CoachDashboard />; }
