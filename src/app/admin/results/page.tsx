'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import styles from '../admin.module.css';

interface ResultItem {
  id: string;
  thumbnail_url: string;
  project_url: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
}

export default function ResultsPage() {
  const [items, setItems] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/results');
      const data = await res.json();
      setItems(data);
    } catch {
      setError('Gagal memuat data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  async function togglePublish(id: string, current: boolean) {
    await fetch(`/api/admin/results/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !current }),
    });
    fetchItems();
  }

  async function moveOrder(id: string, direction: 'up' | 'down') {
    const idx = items.findIndex((i) => i.id === id);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === items.length - 1) return;

    const newItems = [...items];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newItems[idx], newItems[swapIdx]] = [newItems[swapIdx], newItems[idx]];

    const order = newItems.map((item, i) => ({ id: item.id, sort_order: i }));
    await fetch('/api/admin/results', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order }),
    });
    fetchItems();
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/results/${deleteId}`, { method: 'DELETE' });
      setDeleteId(null);
      fetchItems();
    } finally {
      setDeleting(false);
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
        <LogoutBtn />
      </aside>

      <main className={styles.adminContent}>
        <h1 className={styles.adminPageTitle}>Results</h1>

        <div style={{ marginBottom: 'var(--space-5)' }}>
          <Link href="/admin/results/new" className={styles.submitBtn}>
            + Tambah Result
          </Link>
        </div>

        {error && <p className={styles.error} role="alert">{error}</p>}

        {loading ? (
          <p style={{ color: 'var(--text-faint)' }}>Memuat...</p>
        ) : items.length === 0 ? (
          <p style={{ color: 'var(--text-faint)' }}>Belum ada result. Tambah yang pertama.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Thumbnail</th>
                <th>URL</th>
                <th>Status</th>
                <th>Urutan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id}>
                  <td>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.thumbnail_url}
                      alt="thumbnail"
                      className={styles.thumbPreview}
                    />
                  </td>
                  <td>
                    <a
                      href={item.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--text-dim)', textDecoration: 'underline', fontSize: 'var(--font-size-xs)' }}
                    >
                      {item.project_url.length > 40 ? item.project_url.slice(0, 40) + '...' : item.project_url}
                    </a>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${item.is_published ? styles.badgePublished : styles.badgeDraft}`}>
                      {item.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <button
                        className={styles.secondaryBtn}
                        onClick={() => moveOrder(item.id, 'up')}
                        disabled={idx === 0}
                        aria-label="Geser ke atas"
                      >
                        ↑
                      </button>
                      <button
                        className={styles.secondaryBtn}
                        onClick={() => moveOrder(item.id, 'down')}
                        disabled={idx === items.length - 1}
                        aria-label="Geser ke bawah"
                      >
                        ↓
                      </button>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                      <button
                        className={styles.secondaryBtn}
                        onClick={() => togglePublish(item.id, item.is_published)}
                      >
                        {item.is_published ? 'Unpublish' : 'Publish'}
                      </button>
                      <Link
                        href={`/admin/results/${item.id}/edit`}
                        className={styles.secondaryBtn}
                      >
                        Edit
                      </Link>
                      <button
                        className={styles.dangerBtn}
                        onClick={() => setDeleteId(item.id)}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Delete confirmation dialog (R-26: closable with Escape) */}
        {deleteId && (
          <DeleteDialog
            onCancel={() => setDeleteId(null)}
            onConfirm={confirmDelete}
            loading={deleting}
          />
        )}
      </main>
    </div>
  );
}

function DeleteDialog({
  onCancel,
  onConfirm,
  loading,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onCancel]);

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className={styles.dialog}>
        <h2 id="delete-dialog-title" className={styles.dialogTitle}>Hapus result?</h2>
        <p className={styles.dialogText}>Tindakan ini tidak bisa dibatalkan. Thumbnail akan dihapus dari storage.</p>
        <div className={styles.dialogActions}>
          <button className={styles.secondaryBtn} onClick={onCancel} disabled={loading}>
            Batal
          </button>
          <button className={styles.dangerBtn} onClick={onConfirm} disabled={loading}>
            {loading ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
}

function LogoutBtn() {
  const router = useRouter();
  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  }
  return (
    <button type="button" onClick={handleLogout} className={styles.linkBtn}>
      Keluar
    </button>
  );
}

import { useRouter } from 'next/navigation';
