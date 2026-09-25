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
  features?: string[];
  draft_features?: string[];
}

type DraftForm = {
  name: string;
  price: string;
  description: string;
  estimated_time: string;
  featuresText: string;
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
          const feats = pkg.draft_features ?? pkg.features ?? [];
          d[pkg.id] = {
            name: pkg.draft_name ?? pkg.name,
            price: String(pkg.draft_price ?? pkg.price),
            description: pkg.draft_description ?? pkg.description,
            estimated_time: pkg.draft_estimated_time ?? pkg.estimated_time,
            featuresText: Array.isArray(feats) ? feats.join('\n') : '',
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
        package_number: pkg.package_number,
        draft_name: drafts[pkg.id]?.name ?? '',
        draft_price: Number(drafts[pkg.id]?.price ?? 0),
        draft_description: drafts[pkg.id]?.description ?? '',
        draft_estimated_time: drafts[pkg.id]?.estimated_time ?? '',
        draft_features: (drafts[pkg.id]?.featuresText ?? '')
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
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
      setSuccess('Pricing dan fitur checklist berhasil dipublish!');
      setPreviewMode(false);
      setTimeout(() => { setSuccess(''); router.refresh(); }, 2000);
    } catch {
      setError('Terjadi kendala saat publish.');
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.adminSidebar}>
        <div className={styles.adminSidebarBrand}>RDN Admin</div>
        <nav className={styles.adminNav} aria-label="Admin navigation">
          <Link href="/admin" className={styles.adminNavLink}>Overview</Link>
          <Link href="/admin/results" className={styles.adminNavLink}>Results</Link>
          <Link href="/admin/skills" className={styles.adminNavLink}>Software Skills</Link>
          <Link href="/admin/pricing" className={`${styles.adminNavLink} ${styles.adminNavLinkActive}`}>Pricing</Link>
          <Link href="/admin/instagram" className={styles.adminNavLink}>Instagram</Link>
          <Link href="/admin/settings" className={styles.adminNavLink}>Settings</Link>
        </nav>
        <button
          type="button"
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/admin/login');
          }}
          className={styles.linkBtn}
        >
          Keluar
        </button>
      </aside>

      <main className={styles.adminContent}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div>
            <h1 className={styles.adminPageTitle} style={{ marginBottom: 'var(--space-1)' }}>Kelola Paket Pricing</h1>
            <p style={{ color: 'var(--text-dim)', fontSize: 'var(--font-size-sm)' }}>
              Edit informasi paket, harga, deskripsi, dan fitur checklist yang tertera di website.
            </p>
          </div>
          <Link href="/" target="_blank" className={styles.linkBtn} style={{ fontSize: 'var(--font-size-sm)' }}>
            Lihat Website ↗
          </Link>
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-faint)' }}>Memuat data pricing...</div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={styles.linkBtn}
                style={{ padding: 'var(--space-2) var(--space-4)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)' }}
                onClick={saveDrafts}
                disabled={saving || publishing}
              >
                {saving ? 'Menyimpan...' : 'Simpan Draft'}
              </button>
              <button
                type="button"
                className={styles.submitBtn}
                onClick={publish}
                disabled={saving || publishing}
              >
                {publishing ? 'Memproses...' : 'Publish ke Publik'}
              </button>
              <button
                type="button"
                className={styles.linkBtn}
                style={{ padding: 'var(--space-2) var(--space-4)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? 'Mode Edit' : 'Preview Tampilan'}
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
                  const previewFeatures = (d.featuresText || '')
                    .split('\n')
                    .map((s) => s.trim())
                    .filter(Boolean);

                  return (
                    <div key={pkg.id} style={{ borderBottom: '1px solid var(--border)', padding: 'var(--space-5) 0', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                        {String(pkg.package_number).padStart(2, '0')}
                      </span>
                      <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--text)' }}>{d.name || pkg.name}</p>
                      <p style={{ fontSize: 'var(--font-size-xl)', color: 'var(--text)' }}>Rp{Number(d.price || pkg.price).toLocaleString('id-ID')}</p>
                      <p style={{ color: 'var(--text-dim)' }}>{d.description || pkg.description}</p>
                      
                      {previewFeatures.length > 0 && (
                        <div style={{ margin: 'var(--space-2) 0' }}>
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-faint)' }}>Fitur Checklist:</span>
                          <ul style={{ listStyle: 'none', padding: 0, marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {previewFeatures.map((f, idx) => (
                              <li key={idx} style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ color: '#22c55e' }}>✓</span> {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

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
                      <label htmlFor={`desc-${pkg.id}`} className={styles.label}>Deskripsi Singkat</label>
                      <textarea
                        id={`desc-${pkg.id}`}
                        className={styles.textarea}
                        value={drafts[pkg.id]?.description ?? ''}
                        onChange={(e) => updateDraft(pkg.id, 'description', e.target.value)}
                      />
                    </div>

                    <div className={styles.field}>
                      <label htmlFor={`features-${pkg.id}`} className={styles.label}>
                        Fitur Checklist (1 baris per item)
                      </label>
                      <textarea
                        id={`features-${pkg.id}`}
                        className={styles.textarea}
                        rows={5}
                        placeholder="Contoh:&#10;Editing dari footage yang ada&#10;Color grading dasar&#10;Subtitle / teks&#10;Export 1080p&#10;Revisi 1x"
                        value={drafts[pkg.id]?.featuresText ?? ''}
                        onChange={(e) => updateDraft(pkg.id, 'featuresText', e.target.value)}
                      />
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-faint)' }}>
                        Setiap baris baru akan otomatis menjadi poin checklist bertanda centang di website publik.
                      </span>
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
