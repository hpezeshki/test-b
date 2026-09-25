import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { POSTS } from '@/data/seed/content';
import { Article } from './Article';

export function generateStaticParams() { return POSTS.map((p) => ({ slug: p.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = POSTS.find((x) => x.slug === slug);
  return { title: p?.title ?? 'مقاله', description: p?.excerpt };
}
export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) notFound();
  return <Article post={post} />;
}
