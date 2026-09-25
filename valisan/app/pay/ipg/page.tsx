import type { Metadata } from 'next';
import { IpgSimulator } from '@/components/payment/IpgSimulator';
export const metadata: Metadata = { title: 'درگاه پرداخت' };
export default function IpgPage() { return <IpgSimulator />; }
