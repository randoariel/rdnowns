import Navbar from '@/components/public/Navbar/Navbar';
import Hero from '@/components/public/Hero/Hero';
import ResultSection from '@/components/public/ResultCarousel/ResultSection';
import PricingSection from '@/components/public/Pricing/PricingSection';
import Footer from '@/components/public/Footer/Footer';
import SectionTransitionBlur from '@/components/public/SectionTransitionBlur/SectionTransitionBlur';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <SectionTransitionBlur variant="hero-result" />
      <ResultSection />
      <SectionTransitionBlur variant="result-pricing" />
      <PricingSection />
      <SectionTransitionBlur variant="pricing-footer" />
      <Footer />
    </>
  );
}
