import fs from 'fs';
import path from 'path';

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

const FEATURES_FILE = path.join(process.cwd(), 'data', 'pricing_features.json');

export interface PricingFeatureData {
  live: Record<number, string[]>;
  draft: Record<number, string[]>;
}

export function getPricingFeaturesData(): PricingFeatureData {
  try {
    if (!fs.existsSync(FEATURES_FILE)) {
      const initial: PricingFeatureData = {
        live: DEFAULT_PRICING_FEATURES,
        draft: DEFAULT_PRICING_FEATURES,
      };
      const dir = path.dirname(FEATURES_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(FEATURES_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(FEATURES_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {
      live: DEFAULT_PRICING_FEATURES,
      draft: DEFAULT_PRICING_FEATURES,
    };
  }
}

export function saveDraftPricingFeatures(draftFeatures: Record<number, string[]>): void {
  try {
    const current = getPricingFeaturesData();
    current.draft = { ...current.draft, ...draftFeatures };
    const dir = path.dirname(FEATURES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(FEATURES_FILE, JSON.stringify(current, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save draft pricing features:', err);
  }
}

export function publishPricingFeatures(): void {
  try {
    const current = getPricingFeaturesData();
    current.live = { ...current.draft };
    const dir = path.dirname(FEATURES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(FEATURES_FILE, JSON.stringify(current, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to publish pricing features:', err);
  }
}
