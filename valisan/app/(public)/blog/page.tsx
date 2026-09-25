import type { Metadata } from 'next';
import { BlogIndex } from './BlogIndex';

export const metadata: Metadata = { title: 'مجله سلامت' };
export default function BlogPage() { return <BlogIndex />; }
