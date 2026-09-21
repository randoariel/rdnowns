import styles from './Footer.module.css';

const NAV_LINKS = [
  { href: '#home',   label: 'HOME' },
  { href: '#result', label: 'RESULT' },
  { href: '#get',    label: 'GET' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <span className={styles.brandName}>RDN</span>
            <p className={styles.brandDesc}>Videografi &amp; Video Editing</p>
          </div>

          <nav aria-label="Footer navigation" className={styles.nav}>
            {NAV_LINKS.map(({ href, label }) => (
              <a key={href} href={href} className={styles.navLink}>
                {label}
              </a>
            ))}
          </nav>
        </div>

        <div className={styles.divider} aria-hidden="true" />

        <div className={styles.bottom}>
          {/* Instagram handled as plain text link — per PRD section 7 */}
          <a
            href="https://instagram.com/rdn_riifin_cam"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.instagram}
            aria-label="Instagram @rdn_riifin_cam (opens in new tab)"
          >
            @rdn_riifin_cam
          </a>

          <p className={styles.copy}>
            &copy; {year} RDN. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
