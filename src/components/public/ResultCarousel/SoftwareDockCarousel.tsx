import styles from './SoftwareDockCarousel.module.css';

export interface SoftwareSkillItem {
  id: string;
  name: string;
  svg_content: string;
}

interface Props {
  skills: SoftwareSkillItem[];
}

export default function SoftwareDockCarousel({ skills }: Props) {
  if (!skills || skills.length === 0) {
    return null;
  }

  // To guarantee seamless continuous infinite marquee regardless of how few items exist,
  // we repeat the sequence so track width exceeds container width
  const repeatCount = skills.length < 5 ? 4 : 2;
  const items = Array.from({ length: repeatCount }, () => skills).flat();

  return (
    <div className={styles.dockContainer} aria-hidden="true">
      <div className={styles.dockHeader}>
        <span className={styles.dockLabel}>Workflow & Tools</span>
      </div>

      <div className={styles.macDock}>
        <div className={styles.marqueeTrack}>
          {/* First loop track */}
          <div className={styles.iconGroup}>
            {items.map((skill, index) => (
              <div
                key={`group1-${skill.id}-${index}`}
                className={styles.macAppIcon}
                dangerouslySetInnerHTML={{ __html: skill.svg_content }}
              />
            ))}
          </div>

          {/* Exact duplicate loop track to make seamless infinity looping */}
          <div className={styles.iconGroup}>
            {items.map((skill, index) => (
              <div
                key={`group2-${skill.id}-${index}`}
                className={styles.macAppIcon}
                dangerouslySetInnerHTML={{ __html: skill.svg_content }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
