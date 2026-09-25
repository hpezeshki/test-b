'use client';
import { useState } from 'react';
import { POSTS } from '@/data/seed/content';
import { BLOG_CATEGORY_LABEL } from '@/domain/labels';
import type { BlogCategory } from '@/domain/types';
import { useFmt } from '@/lib/hooks';
import { Chip } from '@/components/ui';
import { PostCard } from '@/components/marketing/Sections';

export function BlogIndex() {
  const f = useFmt();
  const [cat, setCat] = useState<BlogCategory | 'all'>('all');
  const list = POSTS.filter((p) => cat === 'all' || p.category === cat);
  return (
    <section className="container-x py-16">
      <div className="text-center">
        <div className="eyebrow">Journal</div>
        <h1 className="mt-3 text-[36px] font-light md:text-[44px]">مجله سلامت والیسان</h1>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Chip selected={cat === 'all'} onClick={() => setCat('all')}>همه</Chip>
        {(Object.keys(BLOG_CATEGORY_LABEL) as BlogCategory[]).map((c) => <Chip key={c} selected={cat === c} onClick={() => setCat(c)}>{BLOG_CATEGORY_LABEL[c]}</Chip>)}
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{list.map((p) => <PostCard key={p.slug} post={p} f={f} />)}</div>
    </section>
  );
}
