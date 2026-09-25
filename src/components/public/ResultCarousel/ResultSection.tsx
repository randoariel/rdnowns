// Server component — fetches results + settings, renders carousel
// Falls back to empty state if Supabase not configured yet

import ResultCarousel from './ResultCarousel';
import { getSoftwareSkills } from '@/lib/softwareSkills';

const FALLBACK_ITEMS = [
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

const FALLBACK_IG = { username: 'rdn_riifin_cam', url: 'https://instagram.com/rdn_riifin_cam' };

async function getData() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('your-project')) {
    const skills = await getSoftwareSkills();
    return { items: FALLBACK_ITEMS, ig: FALLBACK_IG, skills };
  }

  try {
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    const [resultsRes, settingsRes, skills] = await Promise.all([
      fetch(`${base}/api/results`, { cache: 'no-store' }),
      fetch(`${base}/api/settings`, { cache: 'no-store' }),
      getSoftwareSkills(),
    ]);

    const items = resultsRes.ok ? await resultsRes.json() : [];
    const settings = settingsRes.ok ? await settingsRes.json() : null;

    return {
      items: items ?? [],
      ig: settings
        ? { username: settings.instagram_username, url: settings.instagram_url }
        : FALLBACK_IG,
      skills: skills ?? [],
    };
  } catch {
    const skills = await getSoftwareSkills();
    return { items: [], ig: FALLBACK_IG, skills };
  }
}

export default async function ResultSection() {
  const { items, ig, skills } = await getData();

  return (
    <ResultCarousel
      items={items}
      instagramUsername={ig.username}
      instagramUrl={ig.url}
      skills={skills}
    />
  );
}
