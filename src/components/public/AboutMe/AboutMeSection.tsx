'use client';

import styles from './AboutMe.module.css';
import SoftwareDockCarousel, { type SoftwareSkillItem } from '../ResultCarousel/SoftwareDockCarousel';
import LiquidGlassButton from '../LiquidGlassButton/LiquidGlassButton';

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

  return (
    <section id="about" className={styles.section} aria-label="About Me">
      <div className="container">
        <span className={`label ${styles.sectionLabel}`}>About Me</span>

        <div className={styles.aboutCard}>
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

          {/* Core Competencies badges */}
          <div className={styles.skillsGroup}>
            <span className={styles.skillsLabel}>Core Competencies</span>
            <div className={styles.skillsList}>
              {profile.skills.map((skill) => (
                <span key={skill} className={styles.skillItem}>
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
