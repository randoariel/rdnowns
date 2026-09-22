// Server component — fetches pricing + settings, renders Pricing client component

import Pricing from './Pricing';

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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('your-project')) {
    return { packages: FALLBACK_PACKAGES, ig: FALLBACK_IG };
  }

  try {
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    const res = await fetch(`${base}/api/pricing`, { next: { revalidate: 60 } });
    if (!res.ok) return { packages: FALLBACK_PACKAGES, ig: FALLBACK_IG };

    const data = await res.json();
    return {
      packages: data.packages?.length > 0 ? data.packages : FALLBACK_PACKAGES,
      ig: data.instagram
        ? { username: data.instagram.instagram_username, url: data.instagram.instagram_url }
        : FALLBACK_IG,
    };
  } catch {
    return { packages: FALLBACK_PACKAGES, ig: FALLBACK_IG };
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
