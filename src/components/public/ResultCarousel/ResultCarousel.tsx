'use client';

import { useState, useEffect } from 'react';
import styles from './ResultCarousel.module.css';
import SoftwareDockCarousel, { type SoftwareSkillItem } from './SoftwareDockCarousel';
import LiquidGlassButton from '@/components/public/LiquidGlassButton/LiquidGlassButton';

export interface PortfolioItem {
  id: string;
  thumbnail_url: string;
  title?: string;
  project_url: string;
  is_pinned?: boolean;
}

interface Props {
  items: PortfolioItem[];
  instagramUsername: string;
  instagramUrl: string;
  skills?: SoftwareSkillItem[];
}

export default function ResultCarousel({ items, instagramUsername, instagramUrl, skills = [] }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const [showAllModal, setShowAllModal] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowAllModal(false);
    }
    if (showAllModal) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showAllModal]);

  if (items.length === 0) {
    return (
      <section id="result" className={styles.section} aria-label="Portfolio">
        <div className="container">
          <span className={`label ${styles.sectionLabel}`}>Result</span>
          <p className={styles.empty}>Karya lain segera hadir.</p>

          {instagramUsername && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.instagram}
              aria-label={`Instagram ${instagramUsername} (opens in new tab)`}
            >
              @{instagramUsername}
            </a>
          )}
        </div>
      </section>
    );
  }

  // Filter pinned items for the featured carousel (max 5)
  // If no items are explicitly pinned, take the first 5 published items
  const pinnedItems = items.filter((item) => item.is_pinned !== false);
  const carouselItems = (pinnedItems.length > 0 ? pinnedItems : items).slice(0, 5);
  const hasMoreThan5 = items.length > 5;

  return (
    <section id="result" className={styles.section} aria-label="Portfolio">
      <div className="container">
        <span className={`label ${styles.sectionLabel}`}>Result</span>

        {/* Vertical/Horizontal Accordion Gallery (Max 5 Pinned Items) */}
        <div
          className={styles.accordion}
          role="list"
          aria-label="Portfolio karya"
          onMouseLeave={() => setActiveIndex(0)}
        >
          {carouselItems.map((item, i) => {
            const isActive = activeIndex === i;

            return (
              <a
                key={item.id}
                href={item.project_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.item} ${isActive ? styles.active : ''}`}
                role="listitem"
                aria-label={`${item.title || `Portofolio ${i + 1}`} — lihat project`}
                onMouseEnter={() => setActiveIndex(i)}
                onFocus={() => setActiveIndex(i)}
              >
                <div className={styles.imageWrapper}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.thumbnail_url}
                    alt={item.title || `Portofolio ${i + 1}`}
                    className={styles.thumb}
                    loading="lazy"
                  />
                  <div className={styles.overlay} />
                </div>

                <div className={styles.panelContent}>
                  <span className={styles.indexNumber}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className={styles.viewBadge}>
                    <span>{item.title ? `${item.title} ↗` : 'Lihat Project ↗'}</span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        {/* "Lihat Semua" button if more than 5 results */}
        {hasMoreThan5 && (
          <div className={styles.viewAllWrapper}>
            <LiquidGlassButton
              onClick={() => setShowAllModal(true)}
              hasPopup="dialog"
              ariaLabel={`Lihat semua ${items.length} karya video`}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                  <line x1="7" y1="2" x2="7" y2="22"/>
                  <line x1="17" y1="2" x2="17" y2="22"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <line x1="2" y1="7" x2="7" y2="7"/>
                  <line x1="2" y1="17" x2="7" y2="17"/>
                  <line x1="17" y1="17" x2="22" y2="17"/>
                  <line x1="17" y1="7" x2="22" y2="7"/>
                </svg>
              }
            >
              Lihat Semua Karya ({items.length}) <span aria-hidden="true">→</span>
            </LiquidGlassButton>
          </div>
        )}

        {instagramUsername && (
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.instagram}
            aria-label={`Instagram ${instagramUsername} (opens in new tab)`}
          >
            @{instagramUsername}
          </a>
        )}

        {/* Software skills macOS-style infinite loop dock */}
        <SoftwareDockCarousel skills={skills} />
      </div>

      {/* YouTube-like Pop-up Modal */}
      {showAllModal && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-results-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAllModal(false);
          }}
        >
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 id="modal-results-title" className={styles.modalTitle}>
                Semua Karya Video ({items.length})
              </h2>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setShowAllModal(false)}
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.youtubeGrid}>
                {items.map((item, idx) => (
                  <a
                    key={item.id}
                    href={item.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.youtubeCard}
                    aria-label={`Buka video ${item.title || `Project ${idx + 1}`}`}
                  >
                    <div className={styles.youtubeThumbWrapper}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.thumbnail_url}
                        alt={item.title || `Thumbnail ${idx + 1}`}
                        className={styles.youtubeThumb}
                        loading="lazy"
                      />
                      <div className={styles.playBadge}>
                        <span>▶ Tonton</span>
                      </div>
                    </div>

                    <div className={styles.youtubeMeta}>
                      <h3 className={styles.youtubeTitle}>
                        {item.title || `Project Video #${idx + 1}`}
                      </h3>
                      <p className={styles.youtubeSub}>
                        <span>RDN Showcase</span>
                        <span aria-hidden="true">•</span>
                        <span>Buka Link ↗</span>
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
