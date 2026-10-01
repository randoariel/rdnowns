'use client';

import { useState, useEffect } from 'react';
import styles from './ResultCarousel.module.css';
import LiquidGlassButton from '@/components/public/LiquidGlassButton/LiquidGlassButton';

export interface PortfolioItem {
  id: string;
  thumbnail_url: string;
  title?: string;
  project_url: string;
  category?: 'graphic' | 'video' | string;
  is_pinned?: boolean;
}

interface Props {
  items: PortfolioItem[];
  instagramUsername: string;
  instagramUrl: string;
}

export default function ResultCarousel({ items, instagramUsername, instagramUrl }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<'graphic' | 'video'>('graphic');
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

  // Reset active index when category changes
  useEffect(() => {
    setActiveIndex(0);
  }, [selectedCategory]);

  // Filter items by category:
  // If item doesn't have category set yet, default video items or split evenly
  const filteredItems = items.filter((item) => {
    const itemCat = item.category || 'video';
    return itemCat === selectedCategory;
  });

  const isFallbackEmpty = filteredItems.length === 0;
  const displayItems: PortfolioItem[] = isFallbackEmpty
    ? [
        {
          id: 'placeholder-1',
          thumbnail_url: '',
          title: selectedCategory === 'graphic' ? 'Karya Graphic Design Segera Hadir' : 'Karya Video Editing Segera Hadir',
          project_url: instagramUrl || '#',
          is_pinned: true,
          category: selectedCategory,
        },
        {
          id: 'placeholder-2',
          thumbnail_url: '',
          title: 'Upcoming Showcase',
          project_url: instagramUrl || '#',
          is_pinned: true,
          category: selectedCategory,
        },
        {
          id: 'placeholder-3',
          thumbnail_url: '',
          title: 'Next Project',
          project_url: instagramUrl || '#',
          is_pinned: true,
          category: selectedCategory,
        },
      ]
    : filteredItems;

  const pinnedItems = displayItems.filter((item) => item.is_pinned === true);
  const carouselItems = (pinnedItems.length > 0 ? pinnedItems : displayItems).slice(0, 5);
  const hasMoreThan5 = filteredItems.length > 5;

  const [aspectRatios, setAspectRatios] = useState<Record<string, number>>({});
  const [mobileZoomOutIndex, setMobileZoomOutIndex] = useState<number | null>(null);
  const [hoveredZoomOutIndex, setHoveredZoomOutIndex] = useState<number | null>(null);

  // Measure loaded images to know if they match 3:4 (0.75 +- 0.05)
  const handleImageLoad = (id: string, e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalHeight > 0) {
      setAspectRatios((prev) => ({
        ...prev,
        [id]: naturalWidth / naturalHeight,
      }));
    }
  };

  const handleItemClick = (e: React.MouseEvent<HTMLAnchorElement>, index: number, item: PortfolioItem) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile) {
      const ratio = aspectRatios[item.id];
      // 3:4 is approx 0.75 (allow 0.70 to 0.80 range)
      const is3by4 = ratio ? ratio >= 0.70 && ratio <= 0.80 : false;

      // STEP 1: Klik 1 untuk buka garis (expand accordion)
      if (activeIndex !== index) {
        e.preventDefault();
        setActiveIndex(index);
        setMobileZoomOutIndex(null);
        return;
      }

      // STEP 2: Jika bukan 3:4 dan belum zoom out -> Klik 2 untuk zoom out (reveal latar blur gelap)
      if (!is3by4 && mobileZoomOutIndex !== index) {
        e.preventDefault();
        setMobileZoomOutIndex(index);
        return;
      }

      // STEP 3 (atau STEP 2 jika sudah 3:4): Buka link project
      // Let standard anchor navigation proceed
    }
  };

  return (
    <section id="result" className={styles.section} aria-label="Portfolio">
      <div className="container">
        <span className={`label ${styles.sectionLabel}`}>Result</span>

        {/* 2 Category Buttons: Graphic Design & Video Editor with Liquid Glass Effect */}
        <div className={styles.filterContainer} role="tablist" aria-label="Kategori karya">
          <LiquidGlassButton
            onClick={() => setSelectedCategory('graphic')}
            featured={selectedCategory === 'graphic'}
            ariaLabel="Kategori Graphic Design"
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                <path d="M2 2l7.586 7.586"/>
                <circle cx="11" cy="11" r="2"/>
              </svg>
            }
          >
            GRAPHIC DESIGN
          </LiquidGlassButton>

          <LiquidGlassButton
            onClick={() => setSelectedCategory('video')}
            featured={selectedCategory === 'video'}
            ariaLabel="Kategori Video Editor"
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
            }
          >
            VIDEO EDITOR
          </LiquidGlassButton>
        </div>

        {/* Vertical/Horizontal Accordion Gallery (Max 5 Pinned Items) */}
        <div
          className={styles.accordion}
          role="list"
          aria-label={`Portfolio karya ${selectedCategory === 'graphic' ? 'Graphic Design' : 'Video Editor'}`}
          onMouseLeave={() => setActiveIndex(0)}
        >
          {carouselItems.map((item, i) => {
            const isActive = activeIndex === i;
            const ratio = aspectRatios[item.id];
            const is3by4 = ratio ? ratio >= 0.70 && ratio <= 0.80 : false;
            const isZoomOut = (!is3by4 && (hoveredZoomOutIndex === i || mobileZoomOutIndex === i));

            return (
              <a
                key={item.id}
                href={item.project_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  ${styles.item} 
                  ${selectedCategory === 'graphic' ? styles.graphicAspect : ''}
                  ${isActive ? styles.active : ''}
                  ${isZoomOut ? styles.zoomOut : ''}
                `}
                role="listitem"
                aria-label={`${item.title || `Portofolio ${i + 1}`} — lihat project`}
                onClick={(e) => handleItemClick(e, i, item)}
                onMouseEnter={() => {
                  setActiveIndex(i);
                  if (!is3by4) setHoveredZoomOutIndex(i);
                }}
                onMouseLeave={() => setHoveredZoomOutIndex(null)}
                onFocus={() => setActiveIndex(i)}
              >
                <div className={styles.imageWrapper}>
                  {item.thumbnail_url ? (
                    <>
                      {/* Dark blurred background duplicate image for non-3:4 or uncrop reveal */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.thumbnail_url}
                        alt=""
                        aria-hidden="true"
                        className={styles.posterBlurredBg}
                      />

                      {/* Main Poster Image */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.thumbnail_url}
                        alt={item.title || `Portofolio ${i + 1}`}
                        className={styles.thumb}
                        loading="lazy"
                        onLoad={(e) => handleImageLoad(item.id, e)}
                      />
                    </>
                  ) : (
                    <div className={styles.emptyPlaceholderThumb}>
                      <span className={styles.emptyPlaceholderIcon}>
                        {selectedCategory === 'graphic' ? (
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                        ) : (
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="23 7 16 12 23 17 23 7"/>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                          </svg>
                        )}
                      </span>
                      <span className={styles.emptyPlaceholderText}>Coming Soon</span>
                    </div>
                  )}
                  <div className={styles.overlay} />
                </div>

                <div className={styles.panelContent}>
                  <span className={styles.indexNumber}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className={styles.viewBadge}>
                    <span>
                      {item.title
                        ? `${item.title} ↗`
                        : isActive
                        ? isZoomOut
                          ? 'Buka Link Project ↗'
                          : !is3by4
                          ? 'Tap untuk Zoom Out'
                          : 'Buka Link Project ↗'
                        : 'Tap untuk Perbesar'}
                    </span>
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
