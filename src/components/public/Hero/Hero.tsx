'use client';

import { useEffect, useRef } from 'react';
import styles from './Hero.module.css';

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  // Parallax: heading moves slower than scroll
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf: number;
    const handleScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!innerRef.current) return;
        const y = window.scrollY;
        innerRef.current.style.transform = `translate3d(0, ${y * 0.35}px, 0)`;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Label entrance
  useEffect(() => {
    const el = labelRef.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 520ms var(--ease-out) 200ms, transform 520ms var(--ease-out) 200ms';
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      })
    );
  }, []);

  return (
    <section ref={sectionRef} id="home" className={styles.section} aria-label="RDN — own portofolio">
      <div ref={innerRef} className={`container ${styles.inner}`}>
        <h1 className={styles.heading} aria-label="RDN">
          RDN
        </h1>

        <span ref={labelRef} className={`label ${styles.label}`}>
          own portofolio
        </span>
      </div>

      <div className={styles.sideHint} aria-hidden="true">
        <div className={styles.sideHintLine} />
        <span className={styles.sideHintLabel}>Scroll</span>
      </div>
    </section>
  );
}
