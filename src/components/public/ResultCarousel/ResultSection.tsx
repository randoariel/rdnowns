// Server component — fetches results + settings, renders carousel
// Falls back to empty state if Supabase not configured yet

import ResultCarousel from './ResultCarousel';
import { createServerClient } from '@/lib/supabase/server';

const FALLBACK_ITEMS = [
  {
    id: '1',
    thumbnail_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=480&q=80',
    project_url: 'https://instagram.com/rdn_riifin_cam',
    category: 'graphic',
    title: 'Editorial Poster Design',
  },
  {
    id: '2',
    thumbnail_url: 'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=480&q=80',
    project_url: 'https://instagram.com/rdn_riifin_cam',
    category: 'video',
    title: 'Cinematic Reel 2026',
  },
  {
    id: '3',
    thumbnail_url: 'https://images.unsplash.com/photo-1574717024453-54d16daf60b5?w=480&q=80',
    project_url: 'https://instagram.com/rdn_riifin_cam',
    category: 'graphic',
    title: 'Visual Identity Showcase',
  },
];

const FALLBACK_IG = { username: 'rdn_riifin_cam', url: 'https://instagram.com/rdn_riifin_cam' };

async function getData() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey || supabaseUrl.includes('your-project')) {
    return { items: FALLBACK_ITEMS, ig: FALLBACK_IG };
  }

  try {
    const supabase = createServerClient();
    const [resultsQuery, settingsQuery] = await Promise.all([
      supabase
        .from('portfolio_results')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('site_settings')
        .select('instagram_username, instagram_url')
        .single(),
    ]);

    const items = (resultsQuery.data ?? []).map((row: {
      id: string;
      thumbnail_url: string;
      project_url: string;
      title?: string;
      category?: string;
      is_pinned?: boolean;
      sort_order: number;
    }) => {
      let resolvedCategory = row.category;
      let cleanTitle = row.title || 'Untitled Project';

      if (!resolvedCategory) {
        if (cleanTitle.startsWith('[GRAPHIC]')) {
          resolvedCategory = 'graphic';
          cleanTitle = cleanTitle.replace(/^\[GRAPHIC\]\s*/, '');
        } else if (cleanTitle.startsWith('[VIDEO]')) {
          resolvedCategory = 'video';
          cleanTitle = cleanTitle.replace(/^\[VIDEO\]\s*/, '');
        } else {
          resolvedCategory = 'video';
        }
      }

      return {
        id: row.id,
        thumbnail_url: row.thumbnail_url,
        project_url: row.project_url,
        title: cleanTitle,
        category: resolvedCategory,
        is_pinned: Boolean(row.is_pinned),
        sort_order: row.sort_order,
      };
    });

    const settings = settingsQuery.data;

    return {
      items,
      ig: settings
        ? { username: settings.instagram_username, url: settings.instagram_url }
        : FALLBACK_IG,
    };
  } catch {
    return { items: [], ig: FALLBACK_IG };
  }
}

export default async function ResultSection() {
  const { items, ig } = await getData();

  return (
    <ResultCarousel
      items={items}
      instagramUsername={ig.username}
      instagramUrl={ig.url}
    />
  );
}
