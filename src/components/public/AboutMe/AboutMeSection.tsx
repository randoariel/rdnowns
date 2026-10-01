'use client';

import { useRef, useCallback } from 'react';
import styles from './AboutMe.module.css';
import SoftwareDockCarousel, { type SoftwareSkillItem } from '../ResultCarousel/SoftwareDockCarousel';
import LiquidGlassButton from '../LiquidGlassButton/LiquidGlassButton';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export interface AboutMeData {
  name: string;
  tagline: string;
  bio: string;
  skills: string[];
  dmInquiryUrl: string;
  graphicUrl: string;
  videoUrl: string;
}

// ============================================================================
// TEMPAT EDIT TEKS & LINK TOMBOL DI ABOUT ME (Silakan edit data di bawah ini):
// ============================================================================
export const ABOUT_ME_PLACEHOLDER: AboutMeData = {
  name: 'RDN',
  tagline: 'Graphic Designer & Video Editor',
  bio: 'Visual artist berfokus pada graphic design editorial, motion treatment, dan cinematic video editing untuk kebutuhan tugas sekolah, personal branding, maupun komersial dengan eksekusi minimalis, tajam, dan berkarakter.',
  skills: [
    'Video Editing',
    'Graphic Design',
    'Motion Graphics',
    'Color Grading',
    'Visual Identity',
    'Poster & Editorial',
  ],
  // Link masing-masing tombol:
  dmInquiryUrl: 'https://instagram.com/rdn_riifin',
  graphicUrl: 'https://instagram.com/rdn_riifin_graph',
  videoUrl: 'https://instagram.com/rdn_riifin_cam',
};
// ============================================================================

interface Props {
  data?: Partial<AboutMeData>;
  softwareSkills?: SoftwareSkillItem[];
}

export default function AboutMeSection({ data, softwareSkills = [] }: Props) {
  const profile = { ...ABOUT_ME_PLACEHOLDER, ...data };

  // Scroll reveal for the whole section
  const sectionRef = useScrollReveal<HTMLElement>({ threshold: 0.1 });

  // Scroll reveal with stagger for skills
  const skillsRef = useScrollReveal<HTMLDivElement>({
    threshold: 0.2,
    staggerMs: 60,
    staggerSelector: `.${styles.skillItem}`,
  });

  // 3D tilt on card
  const cardRef = useRef<HTMLDivElement>(null);

  const handleCardMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    cardRef.current.style.transform = `perspective(800px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
  }, []);

  const handleCardMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className={`${styles.section} reveal-fade-up`}
      aria-label="About Me"
    >
      <div className="container">
        <span className={`label ${styles.sectionLabel}`}>About Me</span>

        <div
          ref={cardRef}
          className={styles.aboutCard}
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
          style={{ transition: 'transform 0.15s ease-out', willChange: 'transform' }}
        >
          <div className={styles.profileHeader}>
            <div className={styles.taglineBadge}>
              <span className={styles.taglineDot} />
              <span>{profile.tagline}</span>
            </div>
            <h2 className={styles.name}>{profile.name}</h2>
            <p className={styles.bio}>{profile.bio}</p>
          </div>

          {/* Liquid Glass Interactive Action Buttons: DM INQUIRY, GRAPHIC, VIDEO */}
          <div className={styles.actionCluster}>
            <a
              href={profile.dmInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={-1}
              style={{ textDecoration: 'none' }}
            >
              <LiquidGlassButton
                featured
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                }
              >
                DM INQUIRY
              </LiquidGlassButton>
            </a>

            <a
              href={profile.graphicUrl}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={-1}
              style={{ textDecoration: 'none' }}
            >
              <LiquidGlassButton
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19l7-7 3 3-7 7-3-3z" />
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                    <path d="M2 2l7.586 7.586" />
                    <circle cx="11" cy="11" r="2" />
                  </svg>
                }
              >
                GRAPHIC
              </LiquidGlassButton>
            </a>

            <a
              href={profile.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={-1}
              style={{ textDecoration: 'none' }}
            >
              <LiquidGlassButton
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                }
              >
                VIDEO
              </LiquidGlassButton>
            </a>
          </div>

          {/* Core Competencies badges — staggered reveal */}
          <div ref={skillsRef} className={`${styles.skillsGroup} reveal-fade-up`}>
            <span className={styles.skillsLabel}>Core Competencies</span>
            <div className={styles.skillsList}>
              {profile.skills.map((skill) => (
                <span key={skill} className={`${styles.skillItem} reveal-stagger-child`}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Workflow Tools Dock (macOS glass dock) */}
          {softwareSkills.length > 0 && (
            <div className={styles.dockContainer}>
              <p className={styles.dockHeading}>My Tools</p>
              <SoftwareDockCarousel skills={softwareSkills} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
