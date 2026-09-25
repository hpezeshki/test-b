import { BlogTeaser, CoachRoster, CtaBand, Hero, Modalities, PricingTable, Testimonials } from '@/components/marketing/Sections';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Modalities limit={4} />
      <CoachRoster />
      <PricingTable compact />
      <Testimonials />
      <BlogTeaser />
      <CtaBand />
    </>
  );
}
