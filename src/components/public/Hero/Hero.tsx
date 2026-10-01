'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './Hero.module.css';

const SCRAMBLE_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const TARGET_TEXT = 'RDN';
const SCRAMBLE_DURATION = 1200;

function useTextScramble(target: string, duration: number) {
  const [text, setText] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setText(target);
      setDone(true);
      return;
    }

    const start = performance.now();
    let raf: number;

    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);

      const result = target
        .split('')
        .map((char, i) => {
          const charThreshold = i / target.length;
          if (progress > charThreshold + 0.3) return char;
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        })
        .join('');

      setText(result);

      if (progress < 1) {
        raf = requestAnimationFrame(step);
      } else {
        setText(target);
        setDone(true);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return { text, done };
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const { text: scrambledText } = useTextScramble(TARGET_TEXT, SCRAMBLE_DURATION);

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
    <section ref={sectionRef} id="home" className={styles.section} aria-label="RDN — Videografi &amp; Video Editing">
      <div ref={innerRef} className={`container ${styles.inner}`}>
        <h1 className={styles.heading} aria-label="RDN">
          {scrambledText}
        </h1>

        <span ref={labelRef} className={`label ${styles.label}`}>
          Videografi &amp; Video Editing
        </span>
      </div>

      <div className={styles.sideHint} aria-hidden="true">
        <div className={styles.sideHintLine} />
        <span className={styles.sideHintLabel}>Scroll</span>
      </div>
    </section>
  );
}
