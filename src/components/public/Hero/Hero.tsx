'use client';

import { useEffect, useRef } from 'react';
import styles from './Hero.module.css';

export default function Hero() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // iOS-style entrance: fade + translate, staggered
    const els = [headingRef.current, subRef.current, labelRef.current];
    els.forEach((el, i) => {
      if (!el) return;
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
      el.style.transition = `opacity 480ms var(--ease-out) ${i * 80}ms, transform 480ms var(--ease-out) ${i * 80}ms`;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        });
      });
    });
  }, []);

  return (
    <section id="home" className={styles.section} aria-label="RDN — Videografi &amp; Video Editing">
      <div className={`container ${styles.inner}`}>
        <span ref={labelRef} className={`label ${styles.label}`}>
          Videografi &amp; Video Editing
        </span>

        <h1 ref={headingRef} className={styles.heading}>
          RDN
        </h1>

        <p ref={subRef} className={styles.sub}>
          Tugas sekolah. Project personal.<br />
          Dikerjakan dengan serius.
        </p>

        <a href="#get" className={styles.cta}>
          Lihat paket
        </a>
      </div>

      <div className={styles.divider} aria-hidden="true" />
    </section>
  );
}
