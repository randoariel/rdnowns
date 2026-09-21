import Navbar from '@/components/public/Navbar/Navbar';
import Hero from '@/components/public/Hero/Hero';
import ResultCarousel, { type PortfolioItem } from '@/components/public/ResultCarousel/ResultCarousel';
import Pricing, { type PricingPackage } from '@/components/public/Pricing/Pricing';
import Footer from '@/components/public/Footer/Footer';

// Mock data — replaced by Supabase in Sprint 5
const MOCK_ITEMS: PortfolioItem[] = [
  {
    id: '1',
    thumbnail_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=480&q=80',
    project_url: 'https://instagram.com/rdn_riifin_cam',
  },
  {
    id: '2',
    thumbnail_url: 'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=480&q=80',
    project_url: 'https://instagram.com/rdn_riifin_cam',
  },
  {
    id: '3',
    thumbnail_url: 'https://images.unsplash.com/photo-1574717024453-54d16daf60b5?w=480&q=80',
    project_url: 'https://instagram.com/rdn_riifin_cam',
  },
];

const MOCK_PACKAGES: PricingPackage[] = [
  {
    id: '1',
    package_number: 1,
    name: 'Edit Only',
    price: 30000,
    description: 'Editing video tugas sekolah dari footage yang sudah ada. Cut, color, subtitle.',
    estimated_time: '1-2 hari',
  },
  {
    id: '2',
    package_number: 2,
    name: 'Shoot + Edit',
    price: 70000,
    description: 'Pengambilan gambar dan editing lengkap. Cocok untuk presentasi dan tugas wajib.',
    estimated_time: '2-3 hari',
  },
  {
    id: '3',
    package_number: 3,
    name: 'Full Production',
    price: 100000,
    description: 'Shooting, editing, motion graphics, dan sound design. Hasil premium.',
    estimated_time: '3-5 hari',
  },
];

const MOCK_IG = {
  username: 'rdn_riifin_cam',
  url: 'https://instagram.com/rdn_riifin_cam',
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <ResultCarousel
        items={MOCK_ITEMS}
        instagramUsername={MOCK_IG.username}
        instagramUrl={MOCK_IG.url}
      />
      <Pricing
        packages={MOCK_PACKAGES}
        instagramUrl={MOCK_IG.url}
        instagramUsername={MOCK_IG.username}
      />
      <Footer />
    </>
  );
}
