'use client';

import { useState } from 'react';
import styles from './Pricing.module.css';

export interface PricingPackage {
  id: string;
  package_number: number;
  name: string;
  price: number;
  description: string;
  estimated_time: string;
}

interface Props {
  packages: PricingPackage[];
  instagramUrl: string;
  instagramUsername: string;
}

// Format Rp price with dot separator (Indonesian format)
function formatRp(amount: number): string {
  return 'Rp' + amount.toLocaleString('id-ID');
}

type ToastState =
  | { type: 'success' }
  | { type: 'fallback'; message: string }
  | null;

export default function Pricing({ packages, instagramUrl, instagramUsername }: Props) {
  const [toast, setToast] = useState<ToastState>(null);
  const [activeToastPkg, setActiveToastPkg] = useState<string | null>(null);

  async function handleGet(pkg: PricingPackage) {
    const dm = `Halo, kak. Saya mau pesan ${pkg.name} dengan harga ${formatRp(pkg.price)}.`;

    // Open Instagram in new tab
    window.open(instagramUrl, '_blank', 'noopener noreferrer');

    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(dm);
      setToast({ type: 'success' });
      setActiveToastPkg(pkg.id);
      setTimeout(() => setToast(null), 4000);
    } catch {
      // Clipboard permission denied — show fallback with message to copy manually
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
          {packages.map((pkg) => (
            <article key={pkg.id} className={styles.pkg}>
              <div className={styles.pkgTop}>
                <span className={`label ${styles.pkgNumber}`}>
                  {String(pkg.package_number).padStart(2, '0')}
                </span>
                <h2 className={styles.pkgName}>{pkg.name}</h2>
              </div>

              <div className={styles.pkgDivider} aria-hidden="true" />

              <p className={styles.pkgPrice}>{formatRp(pkg.price)}</p>

              <p className={styles.pkgDesc}>{pkg.description}</p>

              <div className={styles.pkgMeta}>
                <span className="label">Estimasi</span>
                <span className={styles.pkgTime}>{pkg.estimated_time}</span>
              </div>

              <button
                className={styles.pkgCta}
                onClick={() => handleGet(pkg)}
                type="button"
                aria-label={`Pesan paket ${pkg.name}`}
              >
                GET
              </button>

              {/* Toast: success */}
              {toast?.type === 'success' && activeToastPkg === pkg.id && (
                <div
                  className={styles.toast}
                  role="status"
                  aria-live="polite"
                  aria-label="Pesan berhasil disalin"
                >
                  <p className={styles.toastText}>Pesan sudah disalin.</p>
                  <p className={styles.toastSub}>Tinggal paste di DM Instagram.</p>
                </div>
              )}

              {/* Toast: fallback — clipboard denied */}
              {toast?.type === 'fallback' && activeToastPkg === pkg.id && (
                <div
                  className={`${styles.toast} ${styles.toastFallback}`}
                  role="alert"
                  aria-live="assertive"
                >
                  <p className={styles.toastText}>Salin pesan berikut:</p>
                  <p className={styles.toastMessage}>
                    {(toast as { type: 'fallback'; message: string }).message}
                  </p>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
