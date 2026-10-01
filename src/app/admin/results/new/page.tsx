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
  const [category, setCategory] = useState('graphic');
  const [projectUrl, setProjectUrl] = useState('');
  const [isPinned, setIsPinned] = useState(true);
  const [isPublished, setIsPublished] = useState(true);
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
          category,
          project_url: projectUrl,
          is_pinned: isPinned,
          is_published: isPublished,
        }),
      });
      const data = await res.json();
      if (!res.ok) { 
        setError(data.error || 'Gagal menyimpan karya.'); 
        return; 
      }
      router.push('/admin/results');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan data.');
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
          <Link href="/admin/skills" className={styles.adminNavLink}>Software Skills</Link>
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
              JPG, PNG, WebP. Maksimal 5MB. Rekomendasi ratio Graphic Design: <strong>3:4 (Portrait Poster)</strong>.
            </p>
          </div>

          {previewUrl && (
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Preview thumbnail"
                style={{ 
                  width: category === 'graphic' ? 150 : 200, 
                  height: category === 'graphic' ? 200 : 120, 
                  objectFit: 'cover', 
                  borderRadius: 'var(--radius-md)', 
                  background: 'var(--surface-2)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              />
              {uploadedUrl && (
                <p style={{ fontSize: 'var(--font-size-xs)', color: '#81c784', marginTop: 'var(--space-2)' }}>
                  Upload berhasil.
                </p>
              )}
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="project-category" className={styles.label}>Kategori Karya</label>
            <select
              id="project-category"
              className={styles.input}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ background: 'var(--surface-2)', color: 'var(--text)' }}
            >
              <option value="graphic">Graphic Design</option>
              <option value="video">Video Editor</option>
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="project-title" className={styles.label}>Judul Video / Desain</label>
            <input
              id="project-title"
              type="text"
              className={styles.input}
              placeholder="Contoh: Poster Event Sekolah / Cinematic Video 2026"
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
