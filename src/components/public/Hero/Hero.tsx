'use client';

import { useEffect, useRef } from 'react';
import styles from './Hero.module.css';

export default function Hero() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const els = [labelRef.current, headingRef.current];
    els.forEach((el, i) => {
      if (!el) return;
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = `opacity 520ms var(--ease-out) ${i * 90}ms, transform 520ms var(--ease-out) ${i * 90}ms`;
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        })
      );
    });
  }, []);

  return (
    <section id="home" className={styles.section} aria-label="RDN — Videografi &amp; Video Editing">
      <div className={`container ${styles.inner}`}>
        <h1 ref={headingRef} className={styles.heading}>
          RDN
        </h1>

        <span ref={labelRef} className={`label ${styles.label}`}>
          Videografi &amp; Video Editing
        </span>
      </div>

      {/* Vertical scroll hint right side */}
      <div className={styles.sideHint} aria-hidden="true">
        <div className={styles.sideHintLine} />
        <span className={styles.sideHintLabel}>Scroll</span>
      </div>
    </section>
  );
}
