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
          <div className={styles.socials}>
            <a
              href="https://instagram.com/rdn_riifin"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.instagram}
              aria-label="Instagram @rdn_riifin (opens in new tab)"
            >
              Instagram @rdn_riifin
            </a>
            <span className={styles.socialSeparator} aria-hidden="true">•</span>
            <a
              href="https://www.tiktok.com/@ean_of"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.instagram}
              aria-label="TikTok @ean_of (opens in new tab)"
            >
              TikTok @ean_of
            </a>
          </div>

          <p className={styles.copy}>
            &copy; {year} RDN. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
