'use client';

import React, { useRef, useState, useEffect } from 'react';
import styles from './LiquidGlassButton.module.css';

interface Props {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
  block?: boolean;
  featured?: boolean;
  ariaLabel?: string;
  hasPopup?: 'dialog' | 'menu' | boolean;
}

export default function LiquidGlassButton({
  children,
  onClick,
  icon,
  className = '',
  block = false,
  featured = false,
  ariaLabel,
  hasPopup,
}: Props) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ x: '50%', y: '50%', tiltX: 0, tiltY: 0, magX: 0, magY: 0 });

  function handleMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const relativeY = e.clientY - rect.top;

    const xPercent = (relativeX / rect.width) * 100;
    const yPercent = (relativeY / rect.height) * 100;

    // 3D Parallax tilt
    const centerX = relativeX - rect.width / 2;
    const centerY = relativeY - rect.height / 2;
    const tiltX = -(centerY / (rect.height / 2)) * 8;
    const tiltY = (centerX / (rect.width / 2)) * 8;

    // Magnetic pull toward cursor (max 4px)
    const magX = (centerX / (rect.width / 2)) * 4;
    const magY = (centerY / (rect.height / 2)) * 4;

    setCoords({
      x: `${xPercent.toFixed(1)}%`,
      y: `${yPercent.toFixed(1)}%`,
      tiltX,
      tiltY,
      magX,
      magY,
    });
  }

  function handleTouchMove(e: React.TouchEvent<HTMLButtonElement>) {
    if (!btnRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = btnRef.current.getBoundingClientRect();
    const relativeX = touch.clientX - rect.left;
    const relativeY = touch.clientY - rect.top;

    const xPercent = Math.max(0, Math.min(100, (relativeX / rect.width) * 100));
    const yPercent = Math.max(0, Math.min(100, (relativeY / rect.height) * 100));

    setCoords({
      x: `${xPercent.toFixed(1)}%`,
      y: `${yPercent.toFixed(1)}%`,
      tiltX: 0,
      tiltY: 0,
      magX: 0,
      magY: 0,
    });
  }

  function handleReset() {
    setCoords({
      x: '50%',
      y: '50%',
      tiltX: 0,
      tiltY: 0,
      magX: 0,
      magY: 0,
    });
  }

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleReset}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleReset}
      className={`
        ${styles.liquidBtn} 
        ${block ? styles.blockWidth : ''} 
        ${featured ? styles.featuredStyle : ''} 
        ${className}
      `}
      style={{
        ['--mouse-x' as string]: coords.x,
        ['--mouse-y' as string]: coords.y,
        ['--tilt-x' as string]: `${coords.tiltX}deg`,
        ['--tilt-y' as string]: `${coords.tiltY}deg`,
        transform: `translate3d(${coords.magX}px, ${coords.magY}px, 0)`,
        transition: 'transform 0.2s cubic-bezier(0.2, 0, 0.2, 1)',
      } as React.CSSProperties}
      aria-label={ariaLabel}
      aria-haspopup={hasPopup}
    >
      {/* 1. Underlying Deep Ambient Fluid Glow */}
      <div className={styles.ambientGlow} aria-hidden="true" />

      {/* 2. Prismatic Fluid Plasma Blobs (Pink/Violet & Cyan/Electric Blue like the orb image) */}
      <div className={styles.fluidBlob1} aria-hidden="true" />
      <div className={styles.fluidBlob2} aria-hidden="true" />

      {/* 3. Interactive Mouse/Touch-Tracking Core Liquid Orb Light */}
      <div className={styles.mouseMagneticOrb} aria-hidden="true" />

      {/* 4. Frosted Glass Layer with Heavy Backdrop Blur */}
      <div className={styles.glassFrost} aria-hidden="true" />

      {/* 5. 3D Curved Specular Rim Highlight */}
      <div className={styles.specularRim} aria-hidden="true" />

      {/* 6. Chromatic Iridescent Outer Edge Lens Glow */}
      <div className={styles.chromaticBorderGlow} aria-hidden="true" />

      {/* 7. Button Content / Label Centered */}
      <span className={styles.textContent}>
        {icon && icon}
        {children}
      </span>
    </button>
  );
}

