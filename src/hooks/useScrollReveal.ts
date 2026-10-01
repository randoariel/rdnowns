'use client';

import { useEffect, useRef } from 'react';

interface Options {
  threshold?: number;
  rootMargin?: string;
  /** Stagger delay in ms between children (if selector provided) */
  staggerMs?: number;
  staggerSelector?: string;
}

/**
 * Adds `.revealed` class when element enters viewport.
 * Optionally staggers children matching `staggerSelector`.
 */
export function useScrollReveal<T extends HTMLElement = HTMLElement>(opts: Options = {}) {
  const ref = useRef<T>(null);
  const { threshold = 0.15, rootMargin = '0px 0px -60px 0px', staggerMs, staggerSelector } = opts;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('revealed');
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (staggerMs && staggerSelector) {
            const children = el.querySelectorAll(staggerSelector);
            children.forEach((child, i) => {
              (child as HTMLElement).style.transitionDelay = `${i * staggerMs}ms`;
            });
          }
          el.classList.add('revealed');
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, staggerMs, staggerSelector]);

  return ref;
}
