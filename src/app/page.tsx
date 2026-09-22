import Navbar from '@/components/public/Navbar/Navbar';
import Hero from '@/components/public/Hero/Hero';
import ResultSection from '@/components/public/ResultCarousel/ResultSection';
import PricingSection from '@/components/public/Pricing/PricingSection';
import Footer from '@/components/public/Footer/Footer';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <ResultSection />
      <PricingSection />
      <Footer />
    </>
  );
}
