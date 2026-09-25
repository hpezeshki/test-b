import { BlogTeaser, CoachRoster, CtaBand, Hero, Modalities, PricingTable, StudioGallery, Testimonials } from '@/components/marketing/Sections';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Modalities limit={4} />
      <StudioGallery />
      <CoachRoster />
      <PricingTable compact />
      <Testimonials />
      <BlogTeaser />
      <CtaBand />
    </>
  );
}
