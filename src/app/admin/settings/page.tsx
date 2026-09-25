'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '../admin.module.css';

export default function SettingsPage() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.newPassword !== form.confirmPassword) {
      setError('Password baru tidak cocok.');
      return;
    }

    if (form.newPassword.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }

    setSaving(true);
    try {
      // Login to get a reset token, then reset
      // Simpler: direct password change via a dedicated API endpoint
      // We'll use the existing reset-password flow but require current session
      // For now: call a new endpoint that verifies current password then changes
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSuccess('Password berhasil diubah.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
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
          <Link href="/admin/skills" className={styles.adminNavLink}>Software Skills</Link>
          <Link href="/admin/pricing" className={styles.adminNavLink}>Pricing</Link>
          <Link href="/admin/instagram" className={styles.adminNavLink}>Instagram</Link>
          <Link href="/admin/settings" className={`${styles.adminNavLink} ${styles.adminNavLinkActive}`}>Settings</Link>
        </nav>
      </aside>

      <main className={styles.adminContent}>
        <h1 className={styles.adminPageTitle}>Settings</h1>

        <section style={{ maxWidth: 480 }}>
          <h2 style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text)', marginBottom: 'var(--space-5)' }}>
            Ganti Password
          </h2>

          <form onSubmit={handleChangePassword} className={styles.form} noValidate>
            <div className={styles.field}>
              <label htmlFor="current-pw" className={styles.label}>Password Saat Ini</label>
              <input
                id="current-pw"
                type="password"
                className={styles.input}
                value={form.currentPassword}
                onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
                required
                autoComplete="current-password"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="new-pw" className={styles.label}>Password Baru</label>
              <input
                id="new-pw"
                type="password"
                className={styles.input}
                value={form.newPassword}
                onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="confirm-pw" className={styles.label}>Konfirmasi Password Baru</label>
              <input
                id="confirm-pw"
                type="password"
                className={styles.input}
                value={form.confirmPassword}
                onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                required
                autoComplete="new-password"
              />
            </div>

            {success && <p className={styles.success} role="status">{success}</p>}
            {error && <p className={styles.error} role="alert">{error}</p>}

            <button type="submit" className={styles.submitBtn} disabled={saving}>
              {saving ? 'Menyimpan...' : 'Ganti Password'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
