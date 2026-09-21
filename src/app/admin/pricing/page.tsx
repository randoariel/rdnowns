'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../admin.module.css';

interface PricingPkg {
  id: string;
  package_number: number;
  name: string;
  price: number;
  description: string;
  estimated_time: string;
  is_published: boolean;
  draft_name: string | null;
  draft_price: number | null;
  draft_description: string | null;
  draft_estimated_time: string | null;
}

type DraftForm = {
  name: string;
  price: string;
  description: string;
  estimated_time: string;
};

export default function PricingAdminPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<PricingPkg[]>([]);
  const [drafts, setDrafts] = useState<Record<string, DraftForm>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    fetch('/api/admin/pricing')
      .then((r) => r.json())
      .then((data: PricingPkg[]) => {
        setPackages(data);
        const d: Record<string, DraftForm> = {};
        data.forEach((pkg) => {
          d[pkg.id] = {
            name: pkg.draft_name ?? pkg.name,
            price: String(pkg.draft_price ?? pkg.price),
            description: pkg.draft_description ?? pkg.description,
            estimated_time: pkg.draft_estimated_time ?? pkg.estimated_time,
          };
        });
        setDrafts(d);
      })
      .finally(() => setLoading(false));
  }, []);

  function updateDraft(id: string, field: keyof DraftForm, value: string) {
    setDrafts((d) => ({ ...d, [id]: { ...d[id], [field]: value } }));
  }

  async function saveDrafts() {
    setSaving(true);
    setError('');
    try {
      const body = packages.map((pkg) => ({
        id: pkg.id,
        draft_name: drafts[pkg.id]?.name ?? '',
        draft_price: Number(drafts[pkg.id]?.price ?? 0),
        draft_description: drafts[pkg.id]?.description ?? '',
        draft_estimated_time: drafts[pkg.id]?.estimated_time ?? '',
      }));
      const res = await fetch('/api/admin/pricing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) { setError('Gagal menyimpan draft.'); return; }
      setSuccess('Draft disimpan.');
      setTimeout(() => setSuccess(''), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    setPublishing(true);
    setError('');
    try {
      await saveDrafts();
      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: packages.map((p) => p.id) }),
      });
      if (!res.ok) { setError('Gagal publish.'); return; }
      setSuccess('Pricing berhasil dipublish!');
      setPreviewMode(false);
      setTimeout(() => { setSuccess(''); router.refresh(); }, 2000);
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.adminSidebar}>
        <div className={styles.adminSidebarBrand}>RDN Admin</div>
        <nav className={styles.adminNav}>
          <Link href="/admin" className={styles.adminNavLink}>Overview</Link>
          <Link href="/admin/results" className={styles.adminNavLink}>Results</Link>
          <Link href="/admin/pricing" className={`${styles.adminNavLink} ${styles.adminNavLinkActive}`}>Pricing</Link>
          <Link href="/admin/instagram" className={styles.adminNavLink}>Instagram</Link>
          <Link href="/admin/settings" className={styles.adminNavLink}>Settings</Link>
        </nav>
      </aside>

      <main className={styles.adminContent}>
        <h1 className={styles.adminPageTitle}>Pricing</h1>

        {loading ? (
          <p style={{ color: 'var(--text-faint)' }}>Memuat...</p>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
              <button className={styles.secondaryBtn} onClick={() => setPreviewMode((p) => !p)}>
                {previewMode ? 'Edit' : 'Preview'}
              </button>
              <button className={styles.submitBtn} onClick={saveDrafts} disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan Draft'}
              </button>
              <button
                className={styles.submitBtn}
                onClick={publish}
                disabled={publishing || saving}
                style={{ background: '#81c784', color: '#1a2e1a' }}
              >
                {publishing ? 'Publishing...' : 'Publish'}
              </button>
            </div>

            {success && <p className={styles.success} role="status">{success}</p>}
            {error && <p className={styles.error} role="alert">{error}</p>}

            {previewMode ? (
              /* Preview mode: show how it looks publicly */
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-5)' }}>
                <p style={{ color: 'var(--text-faint)', fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-4)' }}>PREVIEW — tampilan di website</p>
                {packages.map((pkg) => {
                  const d = drafts[pkg.id] || {};
                  return (
                    <div key={pkg.id} style={{ borderBottom: '1px solid var(--border)', padding: 'var(--space-5) 0', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                        {String(pkg.package_number).padStart(2, '0')}
                      </span>
                      <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--text)' }}>{d.name || pkg.name}</p>
                      <p style={{ fontSize: 'var(--font-size-xl)', color: 'var(--text)' }}>Rp{Number(d.price || pkg.price).toLocaleString('id-ID')}</p>
                      <p style={{ color: 'var(--text-dim)' }}>{d.description || pkg.description}</p>
                      <p style={{ color: 'var(--text-faint)', fontSize: 'var(--font-size-sm)' }}>{d.estimated_time || pkg.estimated_time}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
                {packages.map((pkg) => (
                  <fieldset key={pkg.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <legend style={{ color: 'var(--text-faint)', fontSize: 'var(--font-size-xs)', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0 var(--space-2)' }}>
                      Paket {String(pkg.package_number).padStart(2, '0')}
                    </legend>

                    <div className={styles.field}>
                      <label htmlFor={`name-${pkg.id}`} className={styles.label}>Nama Paket</label>
                      <input
                        id={`name-${pkg.id}`}
                        type="text"
                        className={styles.input}
                        value={drafts[pkg.id]?.name ?? ''}
                        onChange={(e) => updateDraft(pkg.id, 'name', e.target.value)}
                      />
                    </div>

                    <div className={styles.field}>
                      <label htmlFor={`price-${pkg.id}`} className={styles.label}>Harga (Rp)</label>
                      <input
                        id={`price-${pkg.id}`}
                        type="number"
                        className={styles.input}
                        value={drafts[pkg.id]?.price ?? ''}
                        onChange={(e) => updateDraft(pkg.id, 'price', e.target.value)}
                        min={0}
                      />
                    </div>

                    <div className={styles.field}>
                      <label htmlFor={`desc-${pkg.id}`} className={styles.label}>Deskripsi</label>
                      <textarea
                        id={`desc-${pkg.id}`}
                        className={styles.textarea}
                        value={drafts[pkg.id]?.description ?? ''}
                        onChange={(e) => updateDraft(pkg.id, 'description', e.target.value)}
                      />
                    </div>

                    <div className={styles.field}>
                      <label htmlFor={`time-${pkg.id}`} className={styles.label}>Estimasi Waktu</label>
                      <input
                        id={`time-${pkg.id}`}
                        type="text"
                        className={styles.input}
                        placeholder="Contoh: 1-2 hari"
                        value={drafts[pkg.id]?.estimated_time ?? ''}
                        onChange={(e) => updateDraft(pkg.id, 'estimated_time', e.target.value)}
                      />
                    </div>
                  </fieldset>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
