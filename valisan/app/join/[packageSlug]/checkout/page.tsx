import { CheckoutStep } from '@/components/funnel/JoinSteps';

export default async function Page({ params }: { params: Promise<{ packageSlug: string }> }) {
  const { packageSlug } = await params;
  return <CheckoutStep slug={packageSlug} />;
}
