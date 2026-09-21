'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../admin.module.css';

export default function InstagramAdminPage() {
  const [username, setUsername] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/instagram')
      .then((r) => r.json())
      .then((data) => {
        setUsername(data?.instagram_username ?? '');
        setUrl(data?.instagram_url ?? '');
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch('/api/admin/instagram', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instagram_username: username.replace(/^@/, ''),
          instagram_url: url,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSuccess('Tersimpan!');
      setTimeout(() => setSuccess(''), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.adminSidebar}>
        <div className={styles.adminSidebarBrand}>RDN Admin</div>
        <nav className={styles.adminNav}>
          <Link href="/admin" className={styles.adminNavLink}>Overview</Link>
          <Link href="/admin/results" className={styles.adminNavLink}>Results</Link>
          <Link href="/admin/pricing" className={styles.adminNavLink}>Pricing</Link>
          <Link href="/admin/instagram" className={`${styles.adminNavLink} ${styles.adminNavLinkActive}`}>Instagram</Link>
          <Link href="/admin/settings" className={styles.adminNavLink}>Settings</Link>
        </nav>
      </aside>

      <main className={styles.adminContent}>
        <h1 className={styles.adminPageTitle}>Instagram</h1>

        {loading ? (
          <p style={{ color: 'var(--text-faint)' }}>Memuat...</p>
        ) : (
          <form onSubmit={handleSave} className={styles.form} noValidate style={{ maxWidth: 480 }}>
            <div className={styles.field}>
              <label htmlFor="ig-username" className={styles.label}>Username</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ color: 'var(--text-faint)', fontSize: 'var(--font-size-md)' }}>@</span>
                <input
                  id="ig-username"
                  type="text"
                  className={styles.input}
                  value={username}
                  onChange={(e) => {
                    const val = e.target.value.replace(/^@/, '');
                    setUsername(val);
                    setUrl(`https://instagram.com/${val}`);
                  }}
                  placeholder="rdn_riifin_cam"
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="ig-url" className={styles.label}>URL Instagram</label>
              <input
                id="ig-url"
                type="url"
                className={styles.input}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>

            {/* Preview */}
            {username && (
              <div style={{ padding: 'var(--space-4)', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-faint)', marginBottom: 'var(--space-2)' }}>Preview di website:</p>
                <span style={{ color: 'var(--text-dim)', fontSize: 'var(--font-size-sm)', textDecoration: 'underline', textDecorationColor: 'transparent' }}>
                  @{username}
                </span>
              </div>
            )}

            {success && <p className={styles.success} role="status">{success}</p>}
            {error && <p className={styles.error} role="alert">{error}</p>}

            <button type="submit" className={styles.submitBtn} disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
