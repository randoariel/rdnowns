'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../../admin.module.css';

export default function NewResultPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadedPath, setUploadedPath] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [title, setTitle] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client preview
    setPreviewUrl(URL.createObjectURL(file));
    setError('');

    // Upload
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setUploadedPath(data.path);
      setUploadedUrl(data.url);
    } catch {
      setError('Upload gagal. Coba lagi.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!uploadedUrl || !uploadedPath) {
      setError('Upload thumbnail terlebih dahulu.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thumbnail_url: uploadedUrl,
          thumbnail_path: uploadedPath,
          title: title.trim(),
          project_url: projectUrl,
          is_pinned: isPinned,
          is_published: isPublished,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push('/admin/results');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.adminSidebar}>
        <div className={styles.adminSidebarBrand}>RDN Admin</div>
        <nav className={styles.adminNav} aria-label="Admin navigation">
          <Link href="/admin" className={styles.adminNavLink}>Overview</Link>
          <Link href="/admin/results" className={`${styles.adminNavLink} ${styles.adminNavLinkActive}`}>Results</Link>
          <Link href="/admin/pricing" className={styles.adminNavLink}>Pricing</Link>
          <Link href="/admin/instagram" className={styles.adminNavLink}>Instagram</Link>
          <Link href="/admin/settings" className={styles.adminNavLink}>Settings</Link>
        </nav>
      </aside>

      <main className={styles.adminContent}>
        <h1 className={styles.adminPageTitle}>Tambah Result</h1>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* Thumbnail upload */}
          <div className={styles.field}>
            <span className={styles.label}>Thumbnail</span>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{ alignSelf: 'flex-start' }}
            >
              {uploading ? 'Mengupload...' : 'Pilih Gambar'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              className="sr-only"
              aria-label="Pilih thumbnail"
            />
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-faint)' }}>
              JPG, PNG, WebP. Maksimal 5MB.
            </p>
          </div>

          {previewUrl && (
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Preview thumbnail"
                style={{ width: 160, height: 160, objectFit: 'cover', borderRadius: 'var(--radius-md)', background: 'var(--surface-2)' }}
              />
              {uploadedUrl && (
                <p style={{ fontSize: 'var(--font-size-xs)', color: '#81c784', marginTop: 'var(--space-2)' }}>
                  Upload berhasil.
                </p>
              )}
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="project-title" className={styles.label}>Judul Video / Project</label>
            <input
              id="project-title"
              type="text"
              className={styles.input}
              placeholder="Contoh: Cinematic School Project 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="project-url" className={styles.label}>URL Project</label>
            <input
              id="project-url"
              type="url"
              className={styles.input}
              placeholder="https://instagram.com/... atau https://youtube.com/..."
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              required
            />
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-faint)' }}>
              Instagram, YouTube, TikTok, Google Drive, atau URL lainnya.
            </p>
          </div>

          <div className={styles.field} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                style={{ width: 18, height: 18 }}
              />
              <span className={styles.label} style={{ marginBottom: 0 }}>
                ⭐ Tampilkan di Carousel Result (Pin / Show Off — Max 5)
              </span>
            </label>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-faint)', marginLeft: '26px' }}>
              Jika dicentang, akan masuk ke 5 video terbaik di halaman depan.
            </p>
          </div>

          <div className={styles.field}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                style={{ width: 18, height: 18 }}
              />
              <span className={styles.label} style={{ marginBottom: 0 }}>Publish sekarang</span>
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
