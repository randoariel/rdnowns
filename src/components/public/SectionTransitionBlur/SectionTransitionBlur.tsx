import styles from './SectionTransitionBlur.module.css';

interface Props {
  variant?: 'hero-result' | 'result-pricing' | 'pricing-footer';
}

export default function SectionTransitionBlur({ variant = 'hero-result' }: Props) {
  return (
    <div className={`${styles.transitionWrapper} ${styles[variant]}`} aria-hidden="true">
      {/* Horizontal Ambient glowing light beam */}
      <div className={styles.ambientBeam} />
      {/* Frosted glass backdrop blur zone */}
      <div className={styles.blurGlass} />
      {/* Atmospheric center lens orb */}
      <div className={styles.lightOrb} />
    </div>
  );
}
