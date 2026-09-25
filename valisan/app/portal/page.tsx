import type { Metadata } from 'next';
import { StudentDashboard } from '@/components/portal/StudentDashboard';
export const metadata: Metadata = { title: 'پنل هنرجو' };
export default function PortalPage() { return <StudentDashboard />; }
