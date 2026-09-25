import Pricing from './Pricing';
import { createServerClient } from '@/lib/supabase/server';
import { getPricingFeaturesData, DEFAULT_PRICING_FEATURES } from '@/lib/pricingFeatures';

const FALLBACK_PACKAGES = [
  {
    id: '1',
    package_number: 1,
    name: 'Edit Only',
    price: 30000,
    description: 'Editing video dari footage yang sudah ada. Cut, color grading, subtitle.',
    estimated_time: '1–2 hari',
  },
  {
    id: '2',
    package_number: 2,
    name: 'Shoot + Edit',
    price: 70000,
    description: 'Pengambilan gambar dan editing lengkap untuk tugas sekolah atau project.',
    estimated_time: '2–3 hari',
  },
  {
    id: '3',
    package_number: 3,
    name: 'Full Production',
    price: 100000,
    description: 'Shooting, editing, motion graphics, dan sound design. Hasil premium.',
    estimated_time: '3–5 hari',
  },
];

const FALLBACK_IG = { username: 'rdn_riifin_cam', url: 'https://instagram.com/rdn_riifin_cam' };

async function getData() {
  const featuresData = await getPricingFeaturesData();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const fallbackWithFeatures = FALLBACK_PACKAGES.map(pkg => ({
    ...pkg,
    features: featuresData.live[pkg.package_number] ?? DEFAULT_PRICING_FEATURES[pkg.package_number] ?? [],
  }));

  if (!supabaseUrl || !serviceKey || supabaseUrl.includes('your-project')) {
    return { packages: fallbackWithFeatures, ig: FALLBACK_IG };
  }

  try {
    const supabase = createServerClient();
    const [pkgQuery, settingsQuery] = await Promise.all([
      supabase
        .from('pricing_packages')
        .select('id, package_number, name, price, description, estimated_time')
        .eq('is_published', true)
        .order('package_number', { ascending: true }),
      supabase
        .from('site_settings')
        .select('instagram_username, instagram_url')
        .single(),
    ]);

    const packages = (pkgQuery.data ?? []).map(pkg => ({
      ...pkg,
      features: featuresData.live[pkg.package_number] ?? DEFAULT_PRICING_FEATURES[pkg.package_number] ?? [],
    }));

    const settings = settingsQuery.data;

    return {
      packages: packages.length > 0 ? packages : fallbackWithFeatures,
      ig: settings
        ? { username: settings.instagram_username, url: settings.instagram_url }
        : FALLBACK_IG,
    };
  } catch {
    return { packages: fallbackWithFeatures, ig: FALLBACK_IG };
  }
}

export default async function PricingSection() {
  const { packages, ig } = await getData();

  return (
    <Pricing
      packages={packages}
      instagramUrl={ig.url}
      instagramUsername={ig.username}
    />
  );
}
