// Server component — fetches results + settings, renders carousel
// Falls back to empty state if Supabase not configured yet

import ResultCarousel from './ResultCarousel';
import { getSoftwareSkills } from '@/lib/softwareSkills';
import { createServerClient } from '@/lib/supabase/server';

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
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey || supabaseUrl.includes('your-project')) {
    const skills = await getSoftwareSkills();
    return { items: FALLBACK_ITEMS, ig: FALLBACK_IG, skills };
  }

  try {
    const supabase = createServerClient();
    const [resultsQuery, settingsQuery, skills] = await Promise.all([
      supabase
        .from('portfolio_results')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('site_settings')
        .select('instagram_username, instagram_url')
        .single(),
      getSoftwareSkills(),
    ]);

    const items = (resultsQuery.data ?? []).map((row) => ({
      id: row.id,
      thumbnail_url: row.thumbnail_url,
      project_url: row.project_url,
      title: row.title || 'Untitled Project',
      is_pinned: row.is_pinned !== false,
      sort_order: row.sort_order,
    }));

    const settings = settingsQuery.data;

    return {
      items: items.length > 0 ? items : FALLBACK_ITEMS,
      ig: settings
        ? { username: settings.instagram_username, url: settings.instagram_url }
        : FALLBACK_IG,
      skills: skills ?? [],
    };
  } catch {
    const skills = await getSoftwareSkills();
    return { items: FALLBACK_ITEMS, ig: FALLBACK_IG, skills };
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
