import { PACKAGES } from '@/data/seed/packages';

export function generateStaticParams() { return PACKAGES.map((p) => ({ packageSlug: p.slug })); }
export default function JoinLayout({ children }: { children: React.ReactNode }) { return children; }
