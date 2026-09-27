'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { BlogPost } from '@/domain/types';
import { POSTS } from '@/data/seed/content';
import { BLOG_CATEGORY_LABEL } from '@/domain/labels';
import { useFmt } from '@/lib/hooks';
import { Badge, Photo } from '@/components/ui';
import { blogPhotos } from '@/data/seed/images';
import { PostCard } from '@/components/marketing/Sections';

export function Article({ post }: { post: BlogPost }) {
  const f = useFmt();
  const related = POSTS.filter((p) => p.category === post.category && p.slug !== post.slug).slice(0, 2);
  return (
    <article className="container-x py-14">
      <Link prefetch={false} href="/blog" className="inline-flex items-center gap-1 text-[13px] text-muted hover:text-ink"><ArrowRight size={14} /> مجله سلامت</Link>
      <header className="mx-auto mt-6 max-w-3xl text-center">
        <Badge tone="brand">{BLOG_CATEGORY_LABEL[post.category]}</Badge>
        <h1 className="mt-4 text-[30px] font-light leading-[1.35] md:text-[40px]">{post.title}</h1>
        <div className="mt-4 text-[13px] text-muted">{post.author} · {f.s(post.publishedJalali)} · {f.s(post.readMinutes)} دقیقه مطالعه</div>
      </header>
      <Photo srcs={blogPhotos(post.slug, post.category)} alt={post.title} hue={post.accent} priority hover={false} className="mx-auto mt-10 aspect-[21/9] max-w-4xl rounded-[var(--radius-xl)] ring-1 ring-border" />
      <div className="mx-auto mt-10 max-w-[68ch] space-y-6 text-[17px] leading-[1.95] text-ink-2">
        <p className="text-[19px] text-ink">{post.excerpt}</p>
        {post.paragraphs.map((p, i) => <p key={i}>{f.s(p)}</p>)}
      </div>
      {related.length > 0 && (
        <div className="mx-auto mt-16 max-w-4xl">
          <div className="mb-5 font-medium">مطالب مرتبط</div>
          <div className="grid gap-5 md:grid-cols-2">{related.map((p) => <PostCard key={p.slug} post={p} f={f} />)}</div>
        </div>
      )}
    </article>
  );
}
