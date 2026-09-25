import type { Metadata } from 'next';
import { CardToCard } from '@/components/payment/CardToCard';
export const metadata: Metadata = { title: 'کارت به کارت' };
export default function CardPage() { return <CardToCard />; }
