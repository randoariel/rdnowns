'use client';

import { useEffect, useState } from 'react';

export default function InteractiveBackground() {
  const [pos, setPos] = useState({ x: -500, y: -500 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let rafId: number;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if ('touches' in e && e.touches.length > 0) {
          setPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        } else if ('clientX' in e) {
          setPos({ x: e.clientX, y: e.clientY });
        }
      });
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {/* Subtle radial glow following cursor / touch position */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 45%, transparent 70%)',
          transform: `translate3d(${pos.x - 250}px, ${pos.y - 250}px, 0)`,
          transition: 'transform 0.12s cubic-bezier(0.2, 0, 0.2, 1)',
          willChange: 'transform',
        }}
      />
    </div>
  );
}
