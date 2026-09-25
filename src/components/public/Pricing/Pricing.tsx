'use client';

import { useState } from 'react';
import styles from './Pricing.module.css';
import LiquidGlassButton from '@/components/public/LiquidGlassButton/LiquidGlassButton';

export interface PricingPackage {
  id: string;
  package_number: number;
  name: string;
  price: number;
  description: string;
  estimated_time: string;
  features?: string[];
}

interface Props {
  packages: PricingPackage[];
  instagramUrl: string;
  instagramUsername: string;
}

function formatRp(amount: number): string {
  return 'Rp' + amount.toLocaleString('id-ID');
}

type ToastState =
  | { type: 'success' }
  | { type: 'fallback'; message: string }
  | null;

// Default feature lists per package — overrideable from DB in the future
const DEFAULT_FEATURES: Record<number, string[]> = {
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

export default function Pricing({ packages, instagramUrl, instagramUsername }: Props) {
  const [toast, setToast] = useState<ToastState>(null);
  const [activeToastPkg, setActiveToastPkg] = useState<string | null>(null);

  async function handleGet(pkg: PricingPackage) {
    const dm = `Halo kak, saya mau pesan paket ${pkg.name} (${formatRp(pkg.price)}). Boleh minta info lebih lanjut?`;

    window.open(instagramUrl, '_blank', 'noopener noreferrer');

    try {
      await navigator.clipboard.writeText(dm);
      setToast({ type: 'success' });
      setActiveToastPkg(pkg.id);
      setTimeout(() => setToast(null), 4000);
    } catch {
      setToast({ type: 'fallback', message: dm });
      setActiveToastPkg(pkg.id);
    }
  }

  if (packages.length === 0) {
    return (
      <section id="get" className={styles.section} aria-label="Paket layanan">
        <div className="container">
          <span className={`label ${styles.sectionLabel}`}>Get</span>
          <p className={styles.empty}>Paket layanan segera tersedia.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="get" className={styles.section} aria-label="Paket layanan">
      <div className="container">
        <span className={`label ${styles.sectionLabel}`}>Get</span>

        <div className={styles.grid}>
          {packages.map((pkg) => {
            const isFeatured = pkg.package_number === 2;
            const features = pkg.features ?? DEFAULT_FEATURES[pkg.package_number] ?? [];

            return (
              <article
                key={pkg.id}
                className={`${styles.card} ${isFeatured ? styles.cardFeatured : ''}`}
              >
                <div className={styles.cardTop}>
                  <span className={styles.cardLabel}>
                    {String(pkg.package_number).padStart(2, '0')}
                  </span>
                  <p className={styles.cardName}>{pkg.name}</p>
                  <p className={styles.cardPrice}>{formatRp(pkg.price)}</p>
                </div>

                <div className={styles.cardDivider} aria-hidden="true" />

                <p className={styles.cardDesc}>{pkg.description}</p>

                {features.length > 0 && (
                  <ul className={styles.features} aria-label="Termasuk">
                    {features.map((f) => (
                      <li key={f} className={styles.feature}>
                        <span className={styles.featureCheck} aria-hidden="true" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}

                <div className={styles.cardMeta}>
                  <span>Estimasi</span>
                  <span>{pkg.estimated_time}</span>
                </div>

                <div style={{ marginTop: 'var(--space-2)' }}>
                  <LiquidGlassButton
                    onClick={() => handleGet(pkg)}
                    block={true}
                    featured={isFeatured}
                    ariaLabel={`Pesan paket ${pkg.name}`}
                    icon={
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    }
                  >
                    GET <span aria-hidden="true" className={styles.arrowHint}>→</span>
                  </LiquidGlassButton>
                </div>

                {toast?.type === 'success' && activeToastPkg === pkg.id && (
                  <div className={styles.toast} role="status" aria-live="polite">
                    <p className={styles.toastText}>Pesan sudah disalin.</p>
                    <p className={styles.toastSub}>Tinggal paste di DM Instagram.</p>
                  </div>
                )}

                {toast?.type === 'fallback' && activeToastPkg === pkg.id && (
                  <div className={`${styles.toast} ${styles.toastFallback}`} role="alert" aria-live="assertive">
                    <p className={styles.toastText}>Salin pesan berikut:</p>
                    <p className={styles.toastMessage}>
                      {(toast as { type: 'fallback'; message: string }).message}
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
