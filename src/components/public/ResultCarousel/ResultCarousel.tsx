'use client';

import { useRef, useState, useEffect } from 'react';
import styles from './ResultCarousel.module.css';

export interface PortfolioItem {
  id: string;
  thumbnail_url: string;
  project_url: string;
}

interface Props {
  items: PortfolioItem[];
  instagramUsername: string;
  instagramUrl: string;
}

export default function ResultCarousel({ items, instagramUsername, instagramUrl }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, scrollLeft: 0 });

  // Mouse drag support (desktop)
  function onMouseDown(e: React.MouseEvent) {
    if (!trackRef.current) return;
    setIsDragging(false);
    dragStart.current = { x: e.pageX, scrollLeft: trackRef.current.scrollLeft };

    function onMove(ev: MouseEvent) {
      if (!trackRef.current) return;
      const dx = ev.pageX - dragStart.current.x;
      if (Math.abs(dx) > 4) setIsDragging(true);
      trackRef.current.scrollLeft = dragStart.current.scrollLeft - dx;
    }

    function onUp() {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  function onClickCapture(e: React.MouseEvent) {
    // Block click if user was dragging
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

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

  return (
    <section id="result" className={styles.section} aria-label="Portfolio">
      <div className="container">
        <span className={`label ${styles.sectionLabel}`}>Result</span>
      </div>

      {/* Carousel track — full bleed for edge-to-edge feel */}
      <div
        ref={trackRef}
        className={styles.track}
        role="list"
        aria-label="Portfolio karya"
        onMouseDown={onMouseDown}
        onClickCapture={onClickCapture}
      >
        <div className={styles.trackInner}>
          {items.map((item, i) => (
            <a
              key={item.id}
              href={item.project_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.item}
              role="listitem"
              aria-label={`Portofolio ${i + 1} — lihat project`}
              draggable={false}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.thumbnail_url}
                alt={`Portofolio ${i + 1}`}
                className={styles.thumb}
                loading="lazy"
                draggable={false}
              />
            </a>
          ))}
        </div>
      </div>

      <div className="container">
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
