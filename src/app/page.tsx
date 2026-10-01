import Navbar from '@/components/public/Navbar/Navbar';
import Hero from '@/components/public/Hero/Hero';
import AboutMeSection from '@/components/public/AboutMe/AboutMeSection';
import ResultSection from '@/components/public/ResultCarousel/ResultSection';
import Footer from '@/components/public/Footer/Footer';
import SectionTransitionBlur from '@/components/public/SectionTransitionBlur/SectionTransitionBlur';
import InteractiveBackground from '@/components/public/InteractiveBackground/InteractiveBackground';
import { getSoftwareSkills } from '@/lib/softwareSkills';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const softwareSkills = await getSoftwareSkills();

  return (
    <>
      <InteractiveBackground />
      <Navbar />
      <Hero />
      <SectionTransitionBlur variant="hero-result" />
      <AboutMeSection softwareSkills={softwareSkills} />
      <SectionTransitionBlur variant="result-pricing" />
      <ResultSection />
      <SectionTransitionBlur variant="pricing-footer" />
      <Footer />
    </>
  );
}
