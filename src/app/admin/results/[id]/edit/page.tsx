'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../../../admin.module.css';

interface ResultItem {
  id: string;
  thumbnail_url: string;
  thumbnail_path: string;
  project_url: string;
  sort_order: number;
  is_published: boolean;
}

export default function EditResultPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const fileRef = useRef<HTMLInputElement>(null);

  const [item, setItem] = useState<ResultItem | null>(null);
  const [projectUrl, setProjectUrl] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [newThumbUrl, setNewThumbUrl] = useState('');
  const [newThumbPath, setNewThumbPath] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchItem = useCallback(async () => {
    const res = await fetch('/api/admin/results');
    const data: ResultItem[] = await res.json();
    const found = data.find((i) => i.id === id);
    if (found) {
      setItem(found);
      setProjectUrl(found.project_url);
      setIsPublished(found.is_published);
      setPreviewUrl(found.thumbnail_url);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchItem(); }, [fetchItem]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setNewThumbUrl(data.url);
      setNewThumbPath(data.path);
    } catch {
      setError('Upload gagal.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const updateBody: Record<string, unknown> = {
      project_url: projectUrl,
      is_published: isPublished,
    };

    if (newThumbUrl && newThumbPath) {
      // Delete old thumbnail from storage (server handles this)
      updateBody.thumbnail_url = newThumbUrl;
      updateBody.thumbnail_path = newThumbPath;
      updateBody.old_thumbnail_path = item?.thumbnail_path; // server will clean up
    }

    try {
      const res = await fetch(`/api/admin/results/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateBody),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push('/admin/results');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className={styles.adminLayout}>
      <main className={styles.adminContent}>
        <p style={{ color: 'var(--text-faint)' }}>Memuat...</p>
      </main>
    </div>
  );

  if (!item) return (
    <div className={styles.adminLayout}>
      <main className={styles.adminContent}>
        <p className={styles.error}>Result tidak ditemukan.</p>
        <Link href="/admin/results" className={styles.secondaryBtn} style={{ marginTop: 'var(--space-4)' }}>
          Kembali
        </Link>
      </main>
    </div>
  );

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.adminSidebar}>
        <div className={styles.adminSidebarBrand}>RDN Admin</div>
        <nav className={styles.adminNav}>
          <Link href="/admin" className={styles.adminNavLink}>Overview</Link>
          <Link href="/admin/results" className={`${styles.adminNavLink} ${styles.adminNavLinkActive}`}>Results</Link>
          <Link href="/admin/pricing" className={styles.adminNavLink}>Pricing</Link>
          <Link href="/admin/instagram" className={styles.adminNavLink}>Instagram</Link>
          <Link href="/admin/settings" className={styles.adminNavLink}>Settings</Link>
        </nav>
      </aside>

      <main className={styles.adminContent}>
        <h1 className={styles.adminPageTitle}>Edit Result</h1>

        <form onSubmit={handleSave} className={styles.form} noValidate>
          <div className={styles.field}>
            <span className={styles.label}>Thumbnail</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Thumbnail saat ini"
              style={{ width: 160, height: 160, objectFit: 'cover', borderRadius: 'var(--radius-md)', background: 'var(--surface-2)' }}
            />
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{ alignSelf: 'flex-start', marginTop: 'var(--space-2)' }}
            >
              {uploading ? 'Mengupload...' : 'Ganti Thumbnail'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              className="sr-only"
              aria-label="Ganti thumbnail"
            />
            {newThumbUrl && (
              <p style={{ fontSize: 'var(--font-size-xs)', color: '#81c784' }}>Thumbnail baru siap.</p>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="edit-url" className={styles.label}>URL Project</label>
            <input
              id="edit-url"
              type="url"
              className={styles.input}
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                style={{ width: 18, height: 18 }}
              />
              <span className={styles.label} style={{ marginBottom: 0 }}>Published</span>
            </label>
          </div>

          {error && <p className={styles.error} role="alert">{error}</p>}

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button type="submit" className={styles.submitBtn} disabled={saving || uploading}>
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
            <Link href="/admin/results" className={styles.secondaryBtn}>
              Batal
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
