import { createServerClient } from '@/lib/supabase/server';

export const DEFAULT_PRICING_FEATURES: Record<number, string[]> = {
  1: [
    'Editing dari footage yang ada',
    'Color grading dasar',
    'Subtitle / teks',
    'Export 1080p',
    'Revisi 1x',
  ],
  2: [
    'Pengambilan gambar di lokasi',
    'Full editing + color grading',
    'Subtitle / teks / grafis',
    'Export 1080p',
    'Revisi 2x',
  ],
  3: [
    'Shooting multi-angle',
    'Editing + motion graphics',
    'Sound design & mixing',
    'Export 1080p / 4K',
    'Revisi tidak terbatas',
  ],
};

const PRICING_CONFIG_ROW_ID = '00000000-0000-0000-0000-000000000002';

export interface PricingFeatureData {
  live: Record<number, string[]>;
  draft: Record<number, string[]>;
}

export async function getPricingFeaturesData(): Promise<PricingFeatureData> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from('portfolio_results')
      .select('title')
      .eq('id', PRICING_CONFIG_ROW_ID)
      .single();

    if (data?.title) {
      const parsed = JSON.parse(data.title);
      return {
        live: parsed.live || DEFAULT_PRICING_FEATURES,
        draft: parsed.draft || parsed.live || DEFAULT_PRICING_FEATURES,
      };
    }
  } catch {
    // fallback
  }

  return {
    live: DEFAULT_PRICING_FEATURES,
    draft: DEFAULT_PRICING_FEATURES,
  };
}

export async function saveDraftPricingFeatures(draftFeatures: Record<number, string[]>): Promise<void> {
  try {
    const current = await getPricingFeaturesData();
    current.draft = { ...current.draft, ...draftFeatures };

    const supabase = createServerClient();
    await supabase.from('portfolio_results').upsert({
      id: PRICING_CONFIG_ROW_ID,
      thumbnail_path: 'app_config/pricing_features',
      thumbnail_url: 'app_config',
      project_url: 'https://config.internal',
      title: JSON.stringify(current),
      is_published: false,
      is_pinned: false,
      sort_order: -9998,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to save draft pricing features:', err);
  }
}

export async function publishPricingFeatures(): Promise<void> {
  try {
    const current = await getPricingFeaturesData();
    current.live = { ...current.draft };

    const supabase = createServerClient();
    await supabase.from('portfolio_results').upsert({
      id: PRICING_CONFIG_ROW_ID,
      thumbnail_path: 'app_config/pricing_features',
      thumbnail_url: 'app_config',
      project_url: 'https://config.internal',
      title: JSON.stringify(current),
      is_published: false,
      is_pinned: false,
      sort_order: -9998,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to publish pricing features:', err);
  }
}
