import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { COACHES } from '@/data/seed/coaches';
import { CoachDetail } from './CoachDetail';

export function generateStaticParams() { return COACHES.map((c) => ({ slug: c.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = COACHES.find((x) => x.slug === slug);
  return { title: c ? c.displayName : 'مربی' };
}

export default async function CoachPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const coach = COACHES.find((c) => c.slug === slug);
  if (!coach) notFound();
  return <CoachDetail coach={coach} />;
}
