import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import styles from './admin.module.css';

export const dynamic = 'force-dynamic';

async function getStats() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return { totalResults: 0, publishedResults: 0, draftPricing: 0 };
  }

  try {
    const supabase = createServerClient();
    const [{ count: totalResults }, { count: publishedResults }, { count: draftPricing }] =
      await Promise.all([
        supabase.from('portfolio_results').select('id', { count: 'exact', head: true }),
        supabase
          .from('portfolio_results')
          .select('id', { count: 'exact', head: true })
          .eq('is_published', true),
        supabase
          .from('pricing_packages')
          .select('id', { count: 'exact', head: true })
          .eq('is_published', false),
      ]);

    return {
      totalResults: totalResults ?? 0,
      publishedResults: publishedResults ?? 0,
      draftPricing: draftPricing ?? 0,
    };
  } catch {
    return { totalResults: 0, publishedResults: 0, draftPricing: 0 };
  }
}

export default async function AdminPage() {
  const stats = await getStats();

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.adminSidebar}>
        <div className={styles.adminSidebarBrand}>RDN Admin</div>
        <nav className={styles.adminNav} aria-label="Admin navigation">
          <Link href="/admin" className={`${styles.adminNavLink} ${styles.adminNavLinkActive}`}>Overview</Link>
          <Link href="/admin/results" className={styles.adminNavLink}>Results</Link>
          <Link href="/admin/pricing" className={styles.adminNavLink}>Pricing</Link>
          <Link href="/admin/instagram" className={styles.adminNavLink}>Instagram</Link>
          <Link href="/admin/settings" className={styles.adminNavLink}>Settings</Link>
        </nav>
        <LogoutButton />
      </aside>

      <main className={styles.adminContent}>
        <h1 className={styles.adminPageTitle}>Overview</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <p style={{ color: 'var(--text-dim)', fontSize: 'var(--font-size-md)' }}>
            Portfolio: {stats.publishedResults} published / {stats.totalResults} total
          </p>
          {stats.draftPricing > 0 && (
            <p style={{ color: 'var(--text-dim)', fontSize: 'var(--font-size-md)' }}>
              {stats.draftPricing} paket belum dipublish.{' '}
              <Link href="/admin/pricing" style={{ color: 'var(--text)', textDecoration: 'underline' }}>
                Cek pricing
              </Link>
            </p>
          )}
        </div>

        <div style={{ marginTop: 'var(--space-7)', display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <Link href="/admin/results/new" className={styles.submitBtn}>
            + Tambah Result
          </Link>
          <Link href="/" target="_blank" className={styles.secondaryBtn}>
            Lihat website
          </Link>
        </div>
      </main>
    </div>
  );
}

// Client component just for logout button
import LogoutButton from './LogoutButton';
